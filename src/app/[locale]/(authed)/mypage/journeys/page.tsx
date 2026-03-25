import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRAND } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Heart, Plane } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("TravelerHub");
  return { title: `${t("journeysTitle")} | ${BRAND.name}` };
}

export default async function MypageJourneysPage() {
  const t = await getTranslations("TravelerHub");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-text-strong text-xl font-semibold tracking-tight sm:text-2xl">{t("journeysTitle")}</h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-[15px] leading-relaxed">{t("journeysLead")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <Plane className="text-primary size-8" strokeWidth={1.5} aria-hidden />
            <CardTitle className="text-lg">{t("navRequests")}</CardTitle>
            <CardDescription>{t("journeysCardRequests")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full rounded-xl font-semibold">
              <Link href="/mypage/requests">{t("viewAll")}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <Heart className="text-primary size-8" strokeWidth={1.5} aria-hidden />
            <CardTitle className="text-lg">{t("navSavedGuardians")}</CardTitle>
            <CardDescription>{t("journeysCardGuardians")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full rounded-xl font-semibold">
              <Link href="/mypage/saved-guardians">{t("viewAll")}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <Bookmark className="text-primary size-8" strokeWidth={1.5} aria-hidden />
            <CardTitle className="text-lg">{t("navSavedPosts")}</CardTitle>
            <CardDescription>{t("journeysCardPosts")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full rounded-xl font-semibold">
              <Link href="/mypage/saved-posts">{t("viewAll")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
