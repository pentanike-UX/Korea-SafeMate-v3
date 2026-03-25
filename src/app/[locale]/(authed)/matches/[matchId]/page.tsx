import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";

type Props = { params: Promise<{ matchId: string }> };

export default async function MatchDetailPage({ params }: Props) {
  const { matchId } = await params;
  const t = await getTranslations("TravelerHub");

  return (
    <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
      <CardContent className="space-y-2 p-6 text-sm">
        <p className="text-foreground font-mono text-xs">{matchId}</p>
        <p className="text-muted-foreground leading-relaxed">{t("matchDetailPlaceholder")}</p>
      </CardContent>
    </Card>
  );
}
