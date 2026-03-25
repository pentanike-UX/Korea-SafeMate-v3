import { NextResponse } from "next/server";
import { fetchBalanceSnapshot, fetchLedgerForUser } from "@/lib/points/point-ledger-service";
import { getSessionUserId } from "@/lib/supabase/server-user";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [balance, ledger] = await Promise.all([fetchBalanceSnapshot(userId), fetchLedgerForUser(userId, 80)]);

  return NextResponse.json({
    balance: balance ?? { user_id: userId, balance: 0, lifetime_earned: 0, lifetime_revoked: 0, updated_at: null },
    ledger,
  });
}
