"use client";

import { useTranslations } from "next-intl";
import { BlockAttentionBadge } from "@/components/mypage/mypage-attention-primitives";
import { useMypageHubContext } from "@/components/mypage/mypage-hub-context";

export function GuardianPostsAttentionStrip() {
  const t = useTranslations("TravelerHub");
  const ctx = useMypageHubContext();
  const g = ctx?.snapshot.guardianWorkspaceBlockAttention;
  if (!g) return null;
  const menuUnread = ctx?.attention.unreadGuardianWorkspaceNavBadges.guardianNavPosts ?? 0;
  if (menuUnread < 1) return null;
  const pending = g.postsPendingReview;
  const drafts = g.postsDrafts;
  if (pending < 1 && drafts < 1) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {pending > 0 ? (
        <BlockAttentionBadge count={pending} ariaLabel={t("attentionGuardianPostsPending")} />
      ) : null}
      {drafts > 0 ? (
        <BlockAttentionBadge count={drafts} ariaLabel={t("attentionGuardianPostsDraft")} />
      ) : null}
    </div>
  );
}
