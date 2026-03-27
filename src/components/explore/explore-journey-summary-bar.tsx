"use client";

import { useTranslations } from "next-intl";
import type { LaunchAreaSlug } from "@/types/launch-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { PartySize, SceneMoodId, GuardianStyleId, TripWhenPreset } from "@/components/explore/explore-journey-data";

type Pace = "calm" | "balanced" | "packed";
type LangPref = "en" | "ko" | "ja" | "any";

export function ExploreJourneySummaryBar({
  step,
  region,
  theme,
  days,
  partySize,
  pace,
  langPref,
  tripWhenPreset,
  sceneMoods,
  guardianStylePrefs,
  workTokens,
  artistTokens,
  onEditBasics,
}: {
  step: number;
  region: LaunchAreaSlug | "";
  theme: string;
  days: string;
  partySize: PartySize;
  pace: Pace;
  langPref: LangPref;
  tripWhenPreset: TripWhenPreset | null;
  sceneMoods: SceneMoodId[];
  guardianStylePrefs: GuardianStyleId[];
  workTokens: string[];
  artistTokens: string[];
  onEditBasics?: () => void;
}) {
  const t = useTranslations("ExploreJourney");
  const tLaunch = useTranslations("LaunchAreas");
  const tThemes = useTranslations("ExperienceThemes");

  const hasAnything = Boolean(region) || Boolean(theme) || step >= 2;

  if (!hasAnything) return null;

  const tripKey = days === "1" ? "tripDays1" : days === "2" ? "tripDays2" : "tripDays3";

  return (
    <div
      className={cn(
        "border-border/60 bg-background/88 supports-backdrop-filter:backdrop-blur-md sticky top-0 z-30 -mx-4 mb-6 border-b px-4 py-3 sm:-mx-6 sm:px-6",
      )}
      role="region"
      aria-label={t("summaryBarAria")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase">
          <Sparkles className="text-primary size-3 shrink-0" aria-hidden />
          {t("summaryBarLabel")}
        </span>
        {region ? (
          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {(tLaunch.raw(region) as { name: string }).name}
          </Badge>
        ) : null}
        {theme ? (
          <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {(tThemes.raw(theme) as { title: string }).title}
          </Badge>
        ) : null}
        {step >= 2 ? (
          <>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
              {t(tripKey)}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
              {t(`party_${partySize}` as "party_solo")}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
              {pace === "calm" ? t("paceCalm") : pace === "balanced" ? t("paceBalanced") : t("pacePacked")}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
              {langPref === "any" ? t("langAny") : langPref.toUpperCase()}
            </Badge>
            {tripWhenPreset ? (
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                {t(`tripWhen_${tripWhenPreset}` as "tripWhen_weekend")}
              </Badge>
            ) : null}
          </>
        ) : null}
        {step >= 3 ? (
          <>
            {sceneMoods.slice(0, 3).map((id) => (
              <Badge key={id} variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                {t(`moodScene_${id.replace(/^scene_/, "")}` as "moodScene_neon")}
              </Badge>
            ))}
            {sceneMoods.length > 3 ? (
              <span className="text-muted-foreground text-[11px]">+{sceneMoods.length - 3}</span>
            ) : null}
            {guardianStylePrefs
              .filter((id) => id !== "style_no_match_test")
              .slice(0, 2)
              .map((id) => (
                <Badge key={id} variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                  {t(`moodStyle_${id.replace(/^style_/, "")}` as "moodStyle_calm")}
                </Badge>
              ))}
            {workTokens.slice(0, 2).map((w) => (
              <Badge key={w} variant="secondary" className="max-w-[8rem] truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                {w}
              </Badge>
            ))}
            {artistTokens.slice(0, 2).map((w) => (
              <Badge key={w} variant="secondary" className="max-w-[8rem] truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                {w}
              </Badge>
            ))}
          </>
        ) : null}
        </div>
        {step >= 2 && onEditBasics ? (
          <Button type="button" variant="ghost" size="sm" className="text-primary h-8 shrink-0 rounded-full px-2 text-xs font-semibold" onClick={onEditBasics}>
            {t("editAreaTheme")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
