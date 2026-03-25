import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function MatchesListPage() {
  const t = await getTranslations("TravelerHub");

  return (
    <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
      <CardContent className="text-muted-foreground p-6 text-sm leading-relaxed">{t("matchesEmpty")}</CardContent>
    </Card>
  );
}
