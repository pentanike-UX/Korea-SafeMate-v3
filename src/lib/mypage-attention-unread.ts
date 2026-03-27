import type {
  AttentionMenuKey,
  GuardianWorkspaceNavBadgeKey,
  MypageHubAttentionView,
  MypageHubSnapshot,
  TravelerNavBadgeKey,
} from "@/types/mypage-hub";
import { GUARDIAN_WORKSPACE_NAV_BADGE_KEYS, TRAVELER_NAV_BADGE_KEYS } from "@/types/mypage-hub";

function countUnread(raw: number, sig: string, seenSig: string | undefined) {
  return raw > 0 && seenSig !== sig ? raw : 0;
}

/** 서버·클라이언트 공통: 스냅샷 + 저장된 seen 시그니처로 unread 뷰 계산 */
export function computeMypageAttentionViewFromSnapshot(
  snapshot: MypageHubSnapshot,
  seenMap: Partial<Record<AttentionMenuKey, string>>,
): MypageHubAttentionView {
  const unreadTravelerNavBadges = {} as Record<TravelerNavBadgeKey, number>;
  for (const k of TRAVELER_NAV_BADGE_KEYS) {
    unreadTravelerNavBadges[k] = countUnread(
      snapshot.travelerNavBadges[k],
      snapshot.travelerNavSignatures[k],
      seenMap[k],
    );
  }

  const unreadGuardianWorkspaceNavBadges = {} as Record<GuardianWorkspaceNavBadgeKey, number>;
  for (const k of GUARDIAN_WORKSPACE_NAV_BADGE_KEYS) {
    unreadGuardianWorkspaceNavBadges[k] = countUnread(
      snapshot.guardianWorkspaceNavBadges[k],
      snapshot.guardianWorkspaceNavSignatures[k],
      seenMap[k],
    );
  }

  const unreadTravelerBadgeCount = TRAVELER_NAV_BADGE_KEYS.reduce((s, k) => s + unreadTravelerNavBadges[k], 0);
  const unreadGuardianBadgeCount = GUARDIAN_WORKSPACE_NAV_BADGE_KEYS.reduce(
    (s, k) => s + unreadGuardianWorkspaceNavBadges[k],
    0,
  );

  return {
    unreadTravelerNavBadges,
    unreadGuardianWorkspaceNavBadges,
    unreadTravelerBadgeCount,
    unreadGuardianBadgeCount,
    unreadGlobalAttentionDot: unreadTravelerBadgeCount > 0 || unreadGuardianBadgeCount > 0,
  };
}
