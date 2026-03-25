"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppAccountRole } from "@/lib/auth/app-role";
import type { GuardianProfileStatus } from "@/lib/auth/guardian-profile-status";
import { Coins, Heart, LayoutDashboard, Plane, Settings, Shield, FileText, Users } from "lucide-react";

const CORE_NAV: {
  href: string;
  labelKey: "navOverview" | "navJourneys" | "navProfile" | "navPoints" | "navMatches";
  Icon: typeof Plane;
}[] = [
  { href: "/mypage", labelKey: "navOverview", Icon: LayoutDashboard },
  { href: "/mypage/journeys", labelKey: "navJourneys", Icon: Plane },
  { href: "/mypage/profile", labelKey: "navProfile", Icon: Settings },
  { href: "/mypage/points", labelKey: "navPoints", Icon: Coins },
  { href: "/matches", labelKey: "navMatches", Icon: Users },
];

export function MypageHubShell({
  children,
  appRole,
  guardianStatus,
}: {
  children: React.ReactNode;
  appRole: AppAccountRole;
  guardianStatus: GuardianProfileStatus;
}) {
  const pathname = usePathname();
  const t = useTranslations("TravelerHub");

  const showGuardianStrip = appRole === "guardian";

  const coreActive = (href: string) => {
    if (href === "/mypage") return pathname === "/mypage" || pathname === "/mypage/";
    if (href === "/mypage/journeys") return pathname === "/mypage/journeys" || pathname.startsWith("/mypage/journeys/");
    if (href === "/mypage/profile") return pathname === "/mypage/profile" || pathname.startsWith("/mypage/profile/");
    if (href === "/mypage/points") return pathname === "/mypage/points" || pathname.startsWith("/mypage/points/");
    if (href === "/matches") return pathname === "/matches" || pathname.startsWith("/matches/");
    return false;
  };

  const gActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="bg-[var(--bg-page)] min-h-screen">
      <div className="border-border/60 border-b bg-card/95 backdrop-blur-sm">
        <div className="page-container py-10 sm:py-12 md:py-14">
          <p className="text-[var(--brand-trust-blue)] text-[11px] font-semibold tracking-[0.18em] uppercase">42 Guardians</p>
          <h1 className="text-text-strong mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{t("hubTitle")}</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-[15px] leading-relaxed sm:text-base">{t("hubLead")}</p>
        </div>
      </div>

      <div className="page-container flex flex-col gap-10 py-8 sm:py-10 md:gap-12 lg:flex-row lg:gap-14">
        <div className="lg:w-60 lg:shrink-0">
          <nav className="border-border/60 lg:border-r lg:pr-8" aria-label={t("navAria")}>
            <ul className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {CORE_NAV.map(({ href, labelKey, Icon }) => {
                const active = coreActive(href);
                return (
                  <li key={href} className="shrink-0 lg:shrink">
                    <Link
                      href={href}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-[15px] font-medium transition-colors lg:min-h-12 lg:py-3.5",
                        active
                          ? "bg-[var(--brand-trust-blue-soft)] text-[var(--brand-trust-blue)] ring-1 ring-[color-mix(in_srgb,var(--brand-trust-blue)_22%,transparent)]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
                      {t(labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {showGuardianStrip ? (
            <div className="border-border/60 mt-6 rounded-xl border bg-card/60 p-3 lg:mt-8">
              <p className="text-muted-foreground px-1 pb-2 text-[10px] font-bold tracking-widest uppercase">
                {t("guardianStripTitle")}
              </p>
              <p className="text-muted-foreground mb-2 px-1 text-xs leading-snug">{t(`guardianStatus.${guardianStatus}`)}</p>
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/guardian"
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
                      pathname === "/guardian" || pathname === "/guardian/"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Shield className="size-4 shrink-0 opacity-80" aria-hidden />
                    {t("guardianNavHub")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guardian/profile"
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
                      gActive("/guardian/profile")
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Users className="size-4 shrink-0 opacity-80" aria-hidden />
                    {t("guardianNavProfile")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guardian/posts"
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
                      gActive("/guardian/posts")
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <FileText className="size-4 shrink-0 opacity-80" aria-hidden />
                    {t("guardianNavPosts")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guardian/matches"
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
                      gActive("/guardian/matches")
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Heart className="size-4 shrink-0 opacity-80" aria-hidden />
                    {t("guardianNavMatches")}
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div className="border-border/60 mt-6 rounded-xl border border-dashed bg-muted/20 p-4 lg:mt-8">
              <p className="text-muted-foreground text-xs leading-relaxed">{t("guardianApplyTeaser")}</p>
              <Link
                href="/guardians/apply"
                className="text-primary mt-3 inline-flex min-h-11 items-center text-sm font-semibold"
              >
                {t("guardianApplyCta")}
              </Link>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pb-24 lg:pb-12">{children}</div>
      </div>
    </div>
  );
}
