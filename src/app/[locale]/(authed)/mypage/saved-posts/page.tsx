import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockContentPosts, mockTravelerSavedPostIds } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";

export async function generateMetadata() {
  const t = await getTranslations("TravelerHub");
  return { title: `${t("navSavedPosts")} | ${BRAND.name}` };
}

export default async function TravelerSavedPostsPage() {
  const t = await getTranslations("TravelerHub");
  const posts = mockTravelerSavedPostIds
    .map((id) => mockContentPosts.find((p) => p.id === id && p.status === "approved"))
    .filter(Boolean) as typeof mockContentPosts;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-text-strong text-xl font-semibold">{t("savedPostsTitle")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{t("savedPostsLead")}</p>
      </div>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id}>
            <Card className="rounded-2xl border-border/60 py-0 shadow-[var(--shadow-sm)]">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-primary text-[10px] font-bold tracking-widest uppercase">{p.tags.slice(0, 2).join(" · ")}</p>
                  <p className="mt-1 font-semibold leading-snug">{p.title}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{p.summary}</p>
                </div>
                <Button asChild variant="outline" className="shrink-0 rounded-xl">
                  <Link href={`/posts/${p.id}`}>{t("readPost")}</Link>
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <Button asChild variant="ghost" className="rounded-xl px-0">
        <Link href="/posts">{t("browseMorePosts")}</Link>
      </Button>
    </div>
  );
}
