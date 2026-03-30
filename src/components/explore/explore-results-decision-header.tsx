"use client";

import { useTranslations } from "next-intl";
import type { LaunchAreaSlug } from "@/types/launch-area";

/**
 * 추천 결과(step 4) 상단 — 탐색용 히어로 대신 “결정 화면” 선언 문구.
 */
export function ExploreResultsDecisionHeader({
  region,
  theme,
}: {
  region: LaunchAreaSlug | "";
  theme: string;
}) {
  const t = useTranslations("ExploreJourney");
  const tLaunch = useTranslations("LaunchAreas");
  const tThemes = useTranslations("ExperienceThemes");

  const areaName = region ? (tLaunch.raw(region) as { name: string }).name : "";
  const themeTitle = theme ? (tThemes.raw(theme) as { title: string }).title : "";

  let headline: string;
  if (areaName && themeTitle) {
    headline = t("resultsHeadlineAreaTheme", { area: areaName, theme: themeTitle });
  } else if (themeTitle) {
    headline = t("resultsHeadlineThemeOnly", { theme: themeTitle });
  } else if (areaName) {
    headline = t("resultsHeadlineAreaOnly", { area: areaName });
  } else {
    headline = t("resultsHeadlineGeneric");
  }

  return (
    <header className="text-center sm:text-left">
      <p className="text-primary inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase sm:justify-start">
        {t("resultsEyebrow")}
      </p>
      <h1 className="text-text-strong mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{headline}</h1>
      <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:mx-0">{t("resultsSubLead")}</p>
    </header>
  );
}
