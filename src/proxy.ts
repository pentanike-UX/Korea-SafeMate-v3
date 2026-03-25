import createMiddleware from "next-intl/middleware";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { AppAccountRole } from "@/lib/auth/app-role";
import {
  guardianPathIsAlwaysAllowed,
  guardianPathRequiresApproved,
  type GuardianProfileStatus,
} from "@/lib/auth/guardian-profile-status";
import { isPrivilegedAppRole } from "@/lib/auth/app-role";
import { loginPathForLocale, stripLocaleFromPathname, withLocalePath } from "@/lib/auth/route-path";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

type AccessCtx = {
  user: { id: string } | null;
  appRole: AppAccountRole | null;
  guardianStatus: GuardianProfileStatus;
};

function createSupabaseForResponse(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll: ((cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }) satisfies SetAllCookies,
    },
  });
}

async function loadAccessContext(request: NextRequest, response: NextResponse): Promise<AccessCtx> {
  const sb = createSupabaseForResponse(request, response);
  if (!sb) return { user: null, appRole: null, guardianStatus: "none" };

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { user: null, appRole: null, guardianStatus: "none" };

  const { data: urow } = await sb.from("users").select("app_role").eq("id", user.id).maybeSingle();
  const appRole = (urow?.app_role as AppAccountRole | null) ?? null;

  const { data: gp } = await sb
    .from("guardian_profiles")
    .select("profile_status, approval_status")
    .eq("user_id", user.id)
    .maybeSingle();

  let guardianStatus: GuardianProfileStatus = "none";
  if (gp) {
    const ps = gp.profile_status as string | null | undefined;
    if (ps === "draft" || ps === "submitted" || ps === "approved" || ps === "rejected" || ps === "suspended") {
      guardianStatus = ps;
    } else {
      const a = gp.approval_status as string | undefined;
      if (a === "approved") guardianStatus = "approved";
      else if (a === "rejected") guardianStatus = "rejected";
      else if (a === "paused") guardianStatus = "suspended";
      else if (a === "under_review") guardianStatus = "submitted";
      else guardianStatus = "submitted";
    }
  }

  return { user, appRole, guardianStatus };
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

function redirectWithSession(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const red = NextResponse.redirect(url);
  copyCookies(from, red);
  return red;
}

function isConsumerAuthedPath(pathWithoutLocale: string) {
  return (
    pathWithoutLocale === "/mypage" ||
    pathWithoutLocale.startsWith("/mypage/") ||
    pathWithoutLocale === "/matches" ||
    pathWithoutLocale.startsWith("/matches/")
  );
}

function isSuperAdminOnlyPath(pathWithoutLocale: string) {
  return (
    pathWithoutLocale.startsWith("/admin/managers") ||
    pathWithoutLocale.startsWith("/admin/settings")
  );
}

/** Next.js 16+: `middleware` convention renamed to `proxy` (same behavior at the edge). */
export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { locale, pathname: pathWo } = stripLocaleFromPathname(pathname);

  if (pathname.startsWith("/auth")) {
    const res = NextResponse.next();
    await loadAccessContext(request, res);
    return res;
  }

  if (pathWo.startsWith("/admin")) {
    const res = NextResponse.next();
    const ctx = await loadAccessContext(request, res);

    if (!ctx.user) {
      return redirectWithSession(request, res, loginPathForLocale(locale));
    }
    if (!isPrivilegedAppRole(ctx.appRole ?? undefined)) {
      return redirectWithSession(request, res, withLocalePath(locale, "/mypage"));
    }
    if (isSuperAdminOnlyPath(pathWo) && ctx.appRole !== "super_admin") {
      return redirectWithSession(request, res, "/admin/dashboard");
    }
    return res;
  }

  const intlResponse = intlMiddleware(request);
  const ctx = await loadAccessContext(request, intlResponse);

  if (pathWo.startsWith("/guardian")) {
    if (!ctx.user) {
      return redirectWithSession(request, intlResponse, loginPathForLocale(locale));
    }
    if (isPrivilegedAppRole(ctx.appRole ?? undefined)) {
      return redirectWithSession(request, intlResponse, "/admin/dashboard");
    }
    if (ctx.appRole !== "guardian") {
      return redirectWithSession(request, intlResponse, withLocalePath(locale, "/guardians/apply"));
    }

    if (guardianPathRequiresApproved(pathWo)) {
      if (ctx.guardianStatus !== "approved") {
        const fallback =
          ctx.guardianStatus === "rejected" || ctx.guardianStatus === "suspended"
            ? withLocalePath(locale, "/guardian/profile")
            : withLocalePath(locale, "/guardian");
        return redirectWithSession(request, intlResponse, fallback);
      }
    } else if (!guardianPathIsAlwaysAllowed(pathWo)) {
      if (ctx.guardianStatus !== "approved") {
        return redirectWithSession(request, intlResponse, withLocalePath(locale, "/guardian"));
      }
    }
  }

  if (isConsumerAuthedPath(pathWo)) {
    if (!ctx.user) {
      return redirectWithSession(request, intlResponse, loginPathForLocale(locale));
    }
    if (isPrivilegedAppRole(ctx.appRole ?? undefined)) {
      return redirectWithSession(request, intlResponse, "/admin/dashboard");
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
