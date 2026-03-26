import { mockBookings } from "@/data/mock/bookings";
import { getGuardianSeedBundle } from "@/data/mock/guardian-seed-bundle";
import { mockTravelerTripRequests } from "@/data/mock/traveler-hub";
import type { AppAccountRole } from "@/lib/auth/app-role";
import type { GuardianProfileStatus } from "@/lib/auth/guardian-profile-status";
import { getMatchRequestsForTraveler } from "@/lib/traveler-match-requests.server";
import type { MypageHubSnapshot } from "@/types/mypage-hub";

export async function getMypageHubSnapshot(
  userId: string | null,
  appRole: AppAccountRole,
  guardianStatus: GuardianProfileStatus,
): Promise<MypageHubSnapshot> {
  const openTrip = mockTravelerTripRequests.filter(
    (r) => r.status === "requested" || r.status === "reviewing",
  ).length;
  const matchPending =
    userId != null
      ? (await getMatchRequestsForTraveler(userId)).filter((m) => m.status === "requested").length
      : 0;
  const travelerBadgeCount = openTrip + matchPending;

  const guardianSegmentUnlocked = appRole === "guardian" || guardianStatus !== "none";

  if (!guardianSegmentUnlocked) {
    return {
      travelerBadgeCount,
      guardianBadgeCount: 0,
      guardianSegmentUnlocked: false,
      guardianOps: null,
    };
  }

  let guardianBadgeCount = 0;
  let guardianOps: MypageHubSnapshot["guardianOps"] = null;

  if (guardianStatus === "submitted" || guardianStatus === "rejected" || guardianStatus === "suspended") {
    guardianBadgeCount = 1;
  }
  if (guardianStatus === "draft") {
    guardianBadgeCount = 1;
  }

  if (guardianStatus === "approved" && userId) {
    const bundle = getGuardianSeedBundle();
    const posts = bundle.posts.filter((p) => p.author_user_id === userId);
    const pendingPosts = posts.filter((p) => p.status === "pending").length;
    const draftPosts = posts.filter((p) => p.status === "draft").length;
    const reviewingBookings = mockBookings.filter(
      (b) => b.guardian_user_id === userId && b.status === "reviewing",
    ).length;
    const inProgressBookings = mockBookings.filter(
      (b) =>
        b.guardian_user_id === userId &&
        (b.status === "in_progress" || b.status === "matched" || b.status === "confirmed"),
    ).length;
    const completedBookings = mockBookings.filter(
      (b) => b.guardian_user_id === userId && b.status === "completed",
    ).length;
    const openPoolCount = mockBookings.filter((b) => b.guardian_user_id == null && b.status === "reviewing").length;
    const points = bundle.pointsByAuthorId[userId] ?? null;

    guardianOps = {
      pendingPosts,
      draftPosts,
      reviewingBookings,
      inProgressBookings,
      completedBookings,
      openPoolCount,
      points,
    };

    const poolSignal = openPoolCount > 0 ? 1 : 0;
    guardianBadgeCount = Math.min(
      99,
      pendingPosts + reviewingBookings + Math.min(draftPosts, 1) + poolSignal,
    );
  }

  return {
    travelerBadgeCount,
    guardianBadgeCount,
    guardianSegmentUnlocked,
    guardianOps,
  };
}
