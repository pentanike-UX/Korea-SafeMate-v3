import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GuardianMatchAcceptButton } from "@/components/mypage/match-request-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";
import { getSessionUserId } from "@/lib/supabase/server-user";
import type { StoredMatchRequest } from "@/lib/traveler-match-requests";
import { getMatchRequestsForGuardian } from "@/lib/traveler-match-requests.server";

export async function generateMetadata() {
  const t = await getTranslations("TravelerHub");
  return {
    title: `${t("guardianMatchesPageTitle")} | ${BRAND.name}`,
  };
}

function statusVariant(s: StoredMatchRequest["status"]): "default" | "secondary" | "outline" {
  if (s === "completed") return "secondary";
  if (s === "accepted") return "default";
  return "outline";
}

export default async function GuardianMatchesPage() {
  const t = await getTranslations("TravelerHub");
  const guardianId = await getSessionUserId();
  const items = guardianId ? await getMatchRequestsForGuardian(guardianId) : [];

  if (!guardianId) {
    return (
      <div className="page-container space-y-6 py-8 sm:py-10">
        <div>
          <h1 className="text-text-strong text-2xl font-semibold tracking-tight">{t("guardianMatchesPageTitle")}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{t("guardianMatchesNeedSession")}</p>
        </div>
        <Button asChild className="h-11 rounded-xl font-semibold">
          <Link href="/login">{t("goLogin")}</Link>
        </Button>
      </div>
    );
  }

  const pending = items.filter((r) => r.status === "requested");
  const active = items.filter((r) => r.status === "accepted");
  const done = items.filter((r) => r.status === "completed");

  return (
    <div className="page-container space-y-8 py-8 sm:py-10">
      <div>
        <h1 className="text-text-strong text-2xl font-semibold tracking-tight">{t("guardianMatchesPageTitle")}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{t("guardianMatchesPageLead")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardContent className="p-5 pt-6">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{t("matchesSummaryPending")}</p>
            <p className="text-text-strong mt-2 text-2xl font-semibold tabular-nums">{pending.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardContent className="p-5 pt-6">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{t("matchesSummaryActive")}</p>
            <p className="text-text-strong mt-2 text-2xl font-semibold tabular-nums">{active.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardContent className="p-5 pt-6">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{t("matchesSummaryCompleted")}</p>
            <p className="text-text-strong mt-2 text-2xl font-semibold tabular-nums">{done.length}</p>
          </CardContent>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card className="border-border/60 rounded-2xl border-dashed">
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground text-sm leading-relaxed">{t("guardianMatchesEmpty")}</p>
            <Button asChild variant="outline" className="rounded-xl font-semibold">
              <Link href="/guardian/posts">{t("emptyMatchesGuardianCtaPosts")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id}>
              <Card className="border-border/60 rounded-2xl py-0 shadow-[var(--shadow-sm)]">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground text-sm font-medium">
                        {t("guardianMatchesTravelerLabel")} ·{" "}
                        <span className="font-mono text-xs break-all">{r.traveler_user_id}</span>
                      </p>
                      <Badge variant={statusVariant(r.status)} className="text-[10px] font-semibold">
                        {t(`matchStatus.${r.status}`)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-[11px] break-all">{r.id}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {r.status === "requested" ? <GuardianMatchAcceptButton matchId={r.id} /> : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
