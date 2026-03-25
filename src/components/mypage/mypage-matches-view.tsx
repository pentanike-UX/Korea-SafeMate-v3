import { getTranslations } from "next-intl/server";
import type { AppAccountRole } from "@/lib/auth/app-role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MypageMatchesEmpty } from "@/components/mypage/mypage-matches-empty";

/** MVP: 실제 매칭 API 연동 전 요약·빈 상태 UI */
export async function MypageMatchesView({ appRole }: { appRole: AppAccountRole }) {
  const t = await getTranslations("TravelerHub");

  const active = 0;
  const completed = 0;
  const pending = 0;
  const total = active + completed + pending;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-text-strong text-xl font-semibold tracking-tight sm:text-2xl">{t("matchesPageTitle")}</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-[15px] leading-relaxed">{t("matchesPageLead")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <CardDescription>{t("matchesSummaryActive")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <CardDescription>{t("matchesSummaryCompleted")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <CardDescription>{t("matchesSummaryPending")}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{pending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {total === 0 ? (
        <MypageMatchesEmpty appRole={appRole} />
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-foreground text-sm font-semibold">{t("matchesSectionActive")}</h3>
            <Card className="border-border/60 rounded-2xl border-dashed">
              <CardContent className="text-muted-foreground p-5 text-sm">{t("matchesListComing")}</CardContent>
            </Card>
          </section>
          <section className="space-y-2">
            <h3 className="text-foreground text-sm font-semibold">{t("matchesSectionCompleted")}</h3>
            <Card className="border-border/60 rounded-2xl border-dashed">
              <CardContent className="text-muted-foreground p-5 text-sm">{t("matchesListComing")}</CardContent>
            </Card>
          </section>
          <section className="space-y-2">
            <h3 className="text-foreground text-sm font-semibold">{t("matchesSectionCancelled")}</h3>
            <Card className="border-border/60 rounded-2xl border-dashed">
              <CardContent className="text-muted-foreground p-5 text-sm">{t("matchesListComing")}</CardContent>
            </Card>
          </section>
        </div>
      )}

    </div>
  );
}
