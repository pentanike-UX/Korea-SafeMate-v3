/**
 * Canonical public origin for OAuth redirects and post-login navigation.
 * Set `NEXT_PUBLIC_SITE_URL` on Vercel for **all** environments (Preview + Production) to your
 * production hostname so OAuth never defaults to `*.vercel.app` deployment URLs.
 */
export function getCanonicalSiteOrigin(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_OAUTH_REDIRECT_ORIGIN?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/$/, "");
}

/**
 * Browser — OAuth `redirectTo` 호스트. 배포 미리보기 URL을 기본값으로 쓰지 않도록 env를 우선합니다.
 */
export function getOAuthRedirectOriginForClient(): string {
  const fromEnv = getCanonicalSiteOrigin();
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

/**
 * 서버(콜백) — 리다이렉트 베이스. 프로덕션 배포에서만 `VERCEL_PROJECT_PRODUCTION_URL` 폴백.
 */
export function resolveOAuthRedirectBase(request: Request): string {
  const canonical = getCanonicalSiteOrigin();
  if (canonical) return canonical;

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (process.env.VERCEL_ENV === "production" && vercelProd) {
    return vercelProd.startsWith("http") ? vercelProd.replace(/\/$/, "") : `https://${vercelProd}`;
  }

  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  if (!isLocal && forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return origin;
}
