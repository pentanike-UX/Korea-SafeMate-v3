import type { AppAccountRole } from "@/lib/auth/app-role";
import type { GuardianProfileStatus } from "@/lib/auth/guardian-profile-status";

export type GuardianOpsSnapshot = {
  pendingPosts: number;
  draftPosts: number;
  reviewingBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  openPoolCount: number;
  points: number | null;
};

export type MypageHubSnapshot = {
  travelerBadgeCount: number;
  guardianBadgeCount: number;
  guardianSegmentUnlocked: boolean;
  guardianOps: GuardianOpsSnapshot | null;
};

export type MypageHubContextValue = {
  appRole: AppAccountRole;
  guardianStatus: GuardianProfileStatus;
  accountUserId: string | null;
  snapshot: MypageHubSnapshot;
};
