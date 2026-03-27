"use client";

import { useTranslations } from "next-intl";
import { BlockAttentionBadge } from "@/components/mypage/mypage-attention-primitives";
import { useMypageHubContext } from "@/components/mypage/mypage-hub-context";

export function MypageJourneysOpenTripBadge() {
  const t = useTranslations("TravelerHub");
  const ctx = useMypageHubContext();
  const n = ctx?.snapshot.travelerBlockAttention.openTripRequests ?? 0;
  if (n < 1 || (ctx?.attention.unreadTravelerNavBadges.navJourneys ?? 0) < 1) return null;
  return <BlockAttentionBadge count={n} ariaLabel={t("attentionBlockOpenTrips")} />;
}

export function MypageJourneysMatchHubBadge() {
  const t = useTranslations("TravelerHub");
  const ctx = useMypageHubContext();
  const m = ctx?.snapshot.travelerBlockAttention.matches;
  const matchAttention = (m?.pending ?? 0) + (m?.reviewDue ?? 0);
  if (matchAttention < 1 || (ctx?.attention.unreadTravelerNavBadges.navMatches ?? 0) < 1) return null;
  return (
    <BlockAttentionBadge
      count={matchAttention}
      ariaLabel={`${t("attentionBlockMatchesPending")} / ${t("attentionBlockMatchesReview")}`}
    />
  );
}
