import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockTravelerTripRequests } from "@/data/mock";
import { mockGuardians } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";

export async function generateMetadata() {
  const t = await getTranslations("TravelerHub");
  return { title: `${t("navRequests")} | ${BRAND.name}` };
}

export default async function TravelerRequestsPage() {
  const t = await getTranslations("TravelerHub");
  const tThemes = await getTranslations("ExperienceThemes");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-text-strong text-xl font-semibold">{t("requestsTitle")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t("requestsLead")}</p>
      </div>
      <ul className="space-y-4">
        {mockTravelerTripRequests.map((r) => {
          const g = r.guardian_user_id ? mockGuardians.find((x) => x.user_id === r.guardian_user_id) : null;
          const theme = tThemes.raw(r.theme_slug) as { title: string } | undefined;
          return (
            <li key={r.id}>
              <Card className="rounded-2xl border-border/60 py-0 shadow-[var(--shadow-sm)]">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {t(`status.${r.status}`)}
                      </Badge>
                      <span className="text-muted-foreground text-xs">{t(`region.${r.region_label_key}`)}</span>
                    </div>
                    <p className="font-medium">{theme?.title ?? r.theme_slug}</p>
                    <p className="text-muted-foreground text-sm">{r.note}</p>
                    <p className="text-muted-foreground text-xs">
                      {t("assignedGuardian")}: {g?.display_name ?? r.guardian_name ?? t("noGuardianYet")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:w-44">
                    {g ? (
                      <Button asChild size="sm" className="rounded-xl">
                        <Link href={`/guardians/${g.user_id}`}>{t("openGuardian")}</Link>
                      </Button>
                    ) : null}
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link href="/guardians">{t("findGuardian")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
