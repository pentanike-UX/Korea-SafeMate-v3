import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { syncOAuthUserFromSession } from "@/lib/auth/sync-oauth-user";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import { resolveOAuthRedirectBase } from "@/lib/site-url";

/**
 * Supabase OAuth (Google 등) PKCE 콜백.
 * Supabase 대시보드 → Authentication → URL configuration:
 * - Site URL: 배포 도메인 (로컬은 http://localhost:3000)
 * - Redirect URLs: `http://localhost:3000/auth/callback` 및 프로덕션 동일 경로
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next")) ?? "/";
  const base = resolveOAuthRedirectBase(request);

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!sbUrl || !sbKey) {
    return NextResponse.redirect(`${base}/login?error=config`);
  }

  if (!code) {
    return NextResponse.redirect(`${base}/login?error=oauth`);
  }

  const cookieStore = await cookies();
  const redirectResponse = NextResponse.redirect(`${base}${next}`);

  const supabase = createServerClient(sbUrl, sbKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll: ((cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      }) satisfies SetAllCookies,
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${base}/login?error=oauth`);
  }

  const { data: userData } = await supabase.auth.getUser();
  const svc = createServiceRoleSupabase();
  if (userData.user && svc) {
    await syncOAuthUserFromSession(userData.user, svc);
  }

  return redirectResponse;
}
