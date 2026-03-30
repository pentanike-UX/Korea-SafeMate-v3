import { NextResponse } from "next/server";
import { loadMypagePointsData } from "@/lib/points/mypage-points-data.server";
import { getSessionUserId } from "@/lib/supabase/server-user";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { balance, earned, revoked, ledger, policy } = await loadMypagePointsData(userId, 80);

  return NextResponse.json({
    balance: {
      user_id: userId,
      balance,
      lifetime_earned: earned,
      lifetime_revoked: revoked,
      updated_at: null as string | null,
    },
    ledger,
    policy,
  });
}
