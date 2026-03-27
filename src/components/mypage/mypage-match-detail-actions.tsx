"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StoredMatchRequest } from "@/lib/traveler-match-requests";
import { Button } from "@/components/ui/button";
import { TravelerMatchCompleteButton } from "@/components/mypage/match-request-row-actions";
import { TravelerReviewSubmitSheet } from "@/components/mypage/traveler-review-submit-sheet";

export function MypageMatchDetailActions({
  row,
  canWriteTravelerReview,
  alreadyReviewed,
}: {
  row: StoredMatchRequest;
  canWriteTravelerReview: boolean;
  alreadyReviewed: boolean;
}) {
  const t = useTranslations("TravelerHub");

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button asChild variant="default" size="sm" className="h-10 rounded-xl font-semibold">
        <Link href={`/guardians/${row.guardian_user_id}`}>{t("openGuardian")}</Link>
      </Button>
      {row.status === "accepted" ? <TravelerMatchCompleteButton matchId={row.id} /> : null}
      {row.status === "completed" ? (
        <TravelerReviewSubmitSheet
          matchId={row.id}
          guardianDisplayName={row.guardian_display_name || row.guardian_user_id}
          alreadyReviewed={alreadyReviewed}
          disabled={!canWriteTravelerReview}
          disabledReason={canWriteTravelerReview ? undefined : t("reviewFormDisabled")}
        />
      ) : null}
    </div>
  );
}
