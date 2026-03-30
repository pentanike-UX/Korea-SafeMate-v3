"use client";

import { MypageBlockSeenBoundary } from "@/components/mypage/mypage-block-seen-boundary";

export function GuardianMatchesPageBlockBoundary({ children }: { children: React.ReactNode }) {
  return (
    <MypageBlockSeenBoundary
      blockKeys={["guardian.matches.newRequests", "guardian.matches.reviewQueue", "guardian.matches.activeProgress"]}
    >
      {children}
    </MypageBlockSeenBoundary>
  );
}
