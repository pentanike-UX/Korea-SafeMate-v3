"use client";

import { useTranslations } from "next-intl";
import { BlockAttentionBadge } from "@/components/mypage/mypage-attention-primitives";
import { useMypageHubContext } from "@/components/mypage/mypage-hub-context";

export function PointsHistoryHeading() {
  const t = useTranslations("TravelerPoints");
  const th = useTranslations("TravelerHub");
  const ctx = useMypageHubContext();
  const raw = ctx?.snapshot.travelerBlockAttention.pointsRecentLedgerCount ?? 0;
  const n = (ctx?.attention.unreadTravelerNavBadges.navPoints ?? 0) > 0 ? raw : 0;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <h3 className="text-text-strong text-base font-semibold tracking-tight">{t("historyTitle")}</h3>
      <BlockAttentionBadge count={n} ariaLabel={th("attentionBlockPointsRecent")} />
    </div>
  );
}
