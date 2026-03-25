"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppAccountRole } from "@/lib/auth/app-role";
import type { GuardianProfileStatus } from "@/lib/auth/guardian-profile-status";
import { MypageGuardianDashboard } from "@/components/mypage/mypage-guardian-dashboard";
import { MypageAvatarEditTrigger } from "@/components/mypage/mypage-avatar-edit-trigger";
import { MypageHubProvider } from "@/components/mypage/mypage-hub-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, FileText, Heart, LayoutDashboard, Plane, Settings, Shield, Users } from "lucide-react";

const MYPAGE_MODE_KEY = "safemate-mypage-mode";

type HubMode = "traveler" | "guardian";

const CORE_NAV: {
  href: string;
  labelKey: "navOverview" | "navJourneys" | "navProfile" | "navPoints" | "navMatches";
  Icon: typeof Plane;
}[] = [
  { href: "/mypage", labelKey: "navOverview", Icon: LayoutDashboard },
  { href: "/mypage/journeys", labelKey: "navJourneys", Icon: Plane },
  { href: "/mypage/profile", labelKey: "navProfile", Icon: Settings },
  { href: "/mypage/points", labelKey: "navPoints", Icon: Coins },
  { href: "/mypage/matches", labelKey: "navMatches", Icon: Users },
];

type GuardianCtaLabel =
  | "guardianCtaNone"
  | "guardianCtaDraft"
  | "guardianCtaSubmitted"
  | "guardianCtaApproved"
  | "guardianCtaRejected"
  | "guardianCtaSuspended";

function formatMemberSince(iso: string | null, locale: string) {
  if (!iso) return null;
  try {
    const tag = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
    return new Date(iso).toLocaleDateString(tag, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return null;
  }
}

export function MypageHubShell({
  children,
  appRole,
  guardianStatus,
  accountDisplayName,
  accountEmail,
  accountAvatarUrl,
  memberSinceIso,
  accountUserId = null,
}: {
  children: React.ReactNode;
  appRole: AppAccountRole;
  guardianStatus: GuardianProfileStatus;
  accountDisplayName: string;
  accountEmail: string | null;
  accountAvatarUrl: string | null;
  memberSinceIso: string | null;
  accountUserId?: string | null;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("TravelerHub");
  const [hubMode, setHubMode] = useState<HubMode>("traveler");
  const [modeReady, setModeReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MYPAGE_MODE_KEY);
      if (raw === "guardian" || raw === "traveler") setHubMode(raw);
    } catch {
      /* ignore */
    }
    setModeReady(true);
  }, []);

  useEffect(() => {
    if (!modeReady) return;
    try {
      localStorage.setItem(MYPAGE_MODE_KEY, hubMode);
    } catch {
      /* ignore */
    }
  }, [hubMode, modeReady]);

  const coreActive = (href: string) => {
    if (href === "/mypage") return pathname === "/mypage" || pathname === "/mypage/";
    if (href === "/mypage/journeys") return pathname === "/mypage/journeys" || pathname.startsWith("/mypage/journeys/");
    if (href === "/mypage/profile") return pathname === "/mypage/profile" || pathname.startsWith("/mypage/profile/");
    if (href === "/mypage/points") return pathname === "/mypage/points" || pathname.startsWith("/mypage/points/");
    if (href === "/mypage/matches")
      return pathname === "/mypage/matches" || pathname.startsWith("/mypage/matches/");
    return false;
  };

  const gActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const guardianPrimaryCta = (): { href: string; labelKey: GuardianCtaLabel } => {
    switch (guardianStatus) {
      case "none":
        return { href: "/guardians/apply", labelKey: "guardianCtaNone" };
      case "draft":
        return { href: "/guardian/onboarding", labelKey: "guardianCtaDraft" };
      case "submitted":
        return { href: "/guardian/profile", labelKey: "guardianCtaSubmitted" };
      case "approved":
        return { href: "/guardian", labelKey: "guardianCtaApproved" };
      case "rejected":
        return { href: "/guardian/profile", labelKey: "guardianCtaRejected" };
      case "suspended":
        return { href: "/guardian/profile", labelKey: "guardianCtaSuspended" };
      default:
        return { href: "/guardians/apply", labelKey: "guardianCtaNone" };
    }
  };

  const approved = guardianStatus === "approved";
  const primary = guardianPrimaryCta();
  const memberSince = formatMemberSince(memberSinceIso, locale);
  const showGuardianDashboard = hubMode === "guardian" && (pathname === "/mypage" || pathname === "/mypage/");
  const initial = (accountDisplayName || accountEmail || "?").slice(0, 1).toUpperCase();

  return (
    <MypageHubProvider value={{ appRole, guardianStatus }}>
      <div className="bg-[var(--bg-page)] min-h-screen">
        <div className="page-container pt-6 pb-2 sm:pt-8 sm:pb-3 md:pt-10">
          <Card className="border-border/60 overflow-hidden rounded-[1.25rem] shadow-[var(--shadow-md)] ring-1 ring-border/40">
            <CardContent className="space-y-6 p-5 sm:p-7 md:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8" aria-label={t("hubIdentityCardAria")}>
                <div className="flex items-end gap-3 sm:flex-col sm:items-center sm:gap-2">
                  <Avatar size="lg" className="size-20 ring-2 ring-border/60 sm:size-24">
                    {accountAvatarUrl ? <AvatarImage src={accountAvatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-xl font-semibold sm:text-2xl">{initial}</AvatarFallback>
                  </Avatar>
                  <MypageAvatarEditTrigger className="sm:mt-0" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-text-strong text-xl font-semibold tracking-tight sm:text-2xl">
                      {accountDisplayName || t("hubProfileFallbackName")}
                    </h1>
                    <Badge variant={hubMode === "traveler" ? "secondary" : "featured"} className="font-semibold">
                      {hubMode === "traveler" ? t("hubProfileModeTravelerBadge") : t("hubProfileModeGuardianBadge")}
                    </Badge>
                    {hubMode === "guardian" ? (
                      <Badge variant="outline" className="font-medium">
                        {t(`guardianStatus.${guardianStatus}`)}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-sm break-all">
                    {accountEmail || t("hubEmailPlaceholder")}
                  </p>
                  {accountUserId ? (
                    <p className="text-muted-foreground font-mono text-[11px] break-all opacity-80">
                      {t("hubUserIdLine", { id: accountUserId })}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {memberSince ? t("hubProfileMemberSince", { date: memberSince }) : t("hubProfileMemberSinceUnknown")}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button asChild variant="default" size="default" className="h-11 rounded-xl font-semibold">
                      <Link href="/mypage/profile">{t("hubEditProfile")}</Link>
                    </Button>
                    <Button asChild variant="outline" size="default" className="h-11 rounded-xl font-medium">
                      <Link href="/mypage/profile#profile-image-field">{t("hubChangePhotoShort")}</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-border/50 border-t pt-6">
                <div
                  className="flex max-w-lg rounded-[var(--radius-md)] bg-muted/90 p-1.5 ring-1 ring-border/70"
                  role="tablist"
                  aria-label={t("modeSegmentAria")}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={hubMode === "traveler"}
                    onClick={() => setHubMode("traveler")}
                    className={cn(
                      "min-h-[3.25rem] flex-1 rounded-[calc(var(--radius-md)-2px)] px-4 text-sm font-semibold transition-colors",
                      hubMode === "traveler"
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t("modeSegmentTraveler")}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={hubMode === "guardian"}
                    onClick={() => setHubMode("guardian")}
                    className={cn(
                      "min-h-[3.25rem] flex-1 rounded-[calc(var(--radius-md)-2px)] px-4 text-sm font-semibold transition-colors",
                      hubMode === "guardian"
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t("modeSegmentGuardian")}
                  </button>
                </div>
                <p className="text-muted-foreground mt-3 max-w-lg text-xs leading-relaxed">{t("modeSegmentHint")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="page-container flex flex-col gap-10 py-8 sm:py-10 md:gap-12 lg:flex-row lg:gap-14">
        <div className="lg:w-60 lg:shrink-0">
          {hubMode === "traveler" ? (
            <>
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
              <div className="border-border/60 mt-6 rounded-xl border border-dashed bg-muted/20 p-4 lg:mt-8">
                <p className="text-muted-foreground text-xs leading-relaxed">{t("guardianApplyTeaser")}</p>
                <button
                  type="button"
                  onClick={() => setHubMode("guardian")}
                  className="text-primary mt-3 inline-flex min-h-11 items-center text-sm font-semibold"
                >
                  {t("guardianApplyCta")}
                </button>
              </div>
            </>
          ) : (
            <div className="border-border/60 lg:border-r lg:pr-8">
              <nav className="rounded-xl border border-border/70 bg-card/70 p-4" aria-label={t("guardianModeNavAria")}>
                <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">{t("guardianStripTitle")}</p>
                <p className="text-muted-foreground mt-2 text-xs leading-snug">{t(`guardianStatus.${guardianStatus}`)}</p>

                <Button asChild className="mt-4 h-12 w-full rounded-[var(--radius-md)] font-semibold">
                  <Link href={primary.href}>{t(primary.labelKey)}</Link>
                </Button>

                {guardianStatus === "submitted" ? (
                  <p className="text-muted-foreground mt-3 text-xs leading-relaxed">{t("guardianCtaSubmittedHint")}</p>
                ) : null}
                {guardianStatus === "suspended" ? (
                  <p className="text-muted-foreground mt-3 text-xs leading-relaxed">{t("guardianCtaSuspendedHint")}</p>
                ) : null}

                {approved ? (
                  <ul className="mt-5 flex flex-col gap-1 border-t border-border/60 pt-4">
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
                          gActive("/guardian/profile") ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                          gActive("/guardian/posts") ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                          gActive("/guardian/matches") ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Heart className="size-4 shrink-0 opacity-80" aria-hidden />
                        {t("guardianNavMatches")}
                      </Link>
                    </li>
                  </ul>
                ) : null}
              </nav>
              <button
                type="button"
                onClick={() => setHubMode("traveler")}
                className="text-muted-foreground hover:text-foreground mt-6 inline-flex min-h-11 items-center text-sm font-medium"
              >
                ← {t("backToTravelerMode")}
              </button>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pb-24 lg:pb-12">
          {showGuardianDashboard ? <MypageGuardianDashboard status={guardianStatus} /> : children}
        </div>
      </div>
      </div>
    </MypageHubProvider>
  );
}
