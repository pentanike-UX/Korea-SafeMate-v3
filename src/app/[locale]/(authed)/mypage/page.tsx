import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockTravelerSavedPostIds, mockTravelerTripRequests } from "@/data/mock";
import { getTravelerSavedGuardianIds } from "@/lib/traveler-saved-guardians-cookie";
import { mockGuardians } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";
import { getServerSupabaseForUser, getSessionUserId } from "@/lib/supabase/server-user";
import { ArrowRight, Sparkles } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("TravelerHub");
  return {
    title: `${t("metaTitle")} | ${BRAND.name}`,
    description: t("metaDescription"),
  };
}

export default async function TravelerOverviewPage() {
  const t = await getTranslations("TravelerHub");
  const userId = await getSessionUserId();
  let welcomeSubtitle = t("welcomeName");
  if (userId) {
    const sb = await getServerSupabaseForUser();
    if (sb) {
      const [{ data: prof }, { data: u }] = await Promise.all([
        sb.from("user_profiles").select("display_name").eq("user_id", userId).maybeSingle(),
        sb.from("users").select("legal_name, email").eq("id", userId).maybeSingle(),
      ]);
      const derived =
        prof?.display_name?.trim() || u?.legal_name?.trim() || (u?.email ? u.email.split("@")[0] : "") || "";
      if (derived) welcomeSubtitle = derived;
    }
  }

  const openRequests = mockTravelerTripRequests.filter((r) => r.status === "requested" || r.status === "reviewing");
  const savedGuardianIds = await getTravelerSavedGuardianIds();
  const savedG = savedGuardianIds.length;
  const savedP = mockTravelerSavedPostIds.length;

  return (
    <div className="space-y-8">
      <div className="border-border/60 bg-card rounded-2xl border p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{t("welcomeLine")}</p>
            <p className="text-foreground mt-1 text-lg font-semibold">{welcomeSubtitle}</p>
          </div>
          <Button asChild className="rounded-xl">
            <Link href="/explore">
              {t("ctaExplore")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/60 py-0 shadow-[var(--shadow-sm)]">
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{t("statRequests")}</p>
            <p className="text-text-strong mt-2 text-3xl font-semibold tabular-nums">{openRequests.length}</p>
            <Button asChild variant="link" className="mt-2 h-auto px-0 text-sm font-semibold">
              <Link href="/mypage/requests">{t("viewAll")}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 py-0 shadow-[var(--shadow-sm)]">
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{t("statSavedGuardians")}</p>
            <p className="text-text-strong mt-2 text-3xl font-semibold tabular-nums">{savedG}</p>
            <Button asChild variant="link" className="mt-2 h-auto px-0 text-sm font-semibold">
              <Link href="/mypage/saved-guardians">{t("viewAll")}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 py-0 shadow-[var(--shadow-sm)]">
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{t("statSavedPosts")}</p>
            <p className="text-text-strong mt-2 text-3xl font-semibold tabular-nums">{savedP}</p>
            <Button asChild variant="link" className="mt-2 h-auto px-0 text-sm font-semibold">
              <Link href="/mypage/saved-posts">{t("viewAll")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-primary size-4" aria-hidden />
          <h2 className="text-lg font-semibold">{t("snapshotTitle")}</h2>
        </div>
        <ul className="space-y-3">
          {mockTravelerTripRequests.slice(0, 2).map((r) => {
            const g = r.guardian_user_id ? mockGuardians.find((x) => x.user_id === r.guardian_user_id) : null;
            return (
              <li key={r.id}>
                <Card className="rounded-2xl border-border/60 py-0 shadow-none">
                  <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{t(`status.${r.status}`)}</p>
                      <p className="text-muted-foreground text-sm">{r.note}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {g?.display_name ?? t("noGuardianYet")} · {t(`region.${r.region_label_key}`)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl shrink-0">
                      <Link href="/mypage/requests">{t("details")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-muted-foreground text-xs leading-relaxed">{t("mvpNote")}</p>
    </div>
  );
}
