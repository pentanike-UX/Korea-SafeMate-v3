import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";

type Props = { params: Promise<{ matchId: string }> };

export default async function MypageMatchDetailPage({ params }: Props) {
  const { matchId } = await params;
  const t = await getTranslations("TravelerHub");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-text-strong text-xl font-semibold tracking-tight sm:text-2xl">{t("matchesPageTitle")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{matchId}</p>
      </div>
      <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
        <CardContent className="space-y-2 p-6 text-sm">
          <p className="text-muted-foreground leading-relaxed">{t("matchDetailPlaceholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
