"use client";

import { useTranslations } from "next-intl";
import { BlockAttentionBadge } from "@/components/mypage/mypage-attention-primitives";
import { useMypageHubContext } from "@/components/mypage/mypage-hub-context";

export function GuardianMatchesPendingBadge({ count }: { count: number }) {
  const t = useTranslations("TravelerHub");
  const ctx = useMypageHubContext();
  const unread = ctx?.attention.unreadGuardianWorkspaceNavBadges.guardianNavMatches ?? 0;
  if (count < 1 || unread < 1) return null;
  return <BlockAttentionBadge count={count} ariaLabel={t("attentionGuardianMatchIncoming")} />;
}

export function GuardianMatchesActiveBadge({ count }: { count: number }) {
  const t = useTranslations("TravelerHub");
  const ctx = useMypageHubContext();
  const unread = ctx?.attention.unreadGuardianWorkspaceNavBadges.guardianNavMatches ?? 0;
  if (count < 1 || unread < 1) return null;
  return <BlockAttentionBadge count={count} ariaLabel={t("attentionBlockMatchesActive")} />;
}
