import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function MatchesLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("TravelerHub");

  return (
    <div className="bg-[var(--bg-page)] min-h-screen">
      <div className="page-container py-8 sm:py-10">
        <Link href="/mypage" className="text-muted-foreground hover:text-foreground text-sm font-medium">
          ← {t("backToMypage")}
        </Link>
        <h1 className="text-text-strong mt-4 text-2xl font-semibold tracking-tight">{t("matchesPageTitle")}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{t("matchesPageLead")}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
