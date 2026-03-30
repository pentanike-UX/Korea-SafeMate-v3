import { getMockGuardianSeedPoints } from "@/lib/dev/mock-guardian-auth";
import { fetchBalanceSnapshot, fetchLedgerForUser } from "@/lib/points/point-ledger-service";
import { getActivePointPolicy } from "@/lib/points/point-policy-repository";
import { buildMockGuardianLedger } from "@/lib/points/mock-guardian-ledger";
import type { PointLedgerRow } from "@/lib/points/types";

export type MypagePointsData = {
  balance: number;
  earned: number;
  revoked: number;
  ledger: PointLedgerRow[];
  policy: Awaited<ReturnType<typeof getActivePointPolicy>>;
  usesMockLedger: boolean;
};

export async function loadMypagePointsData(userId: string, ledgerLimit = 100): Promise<MypagePointsData> {
  const mockSeedPoints = getMockGuardianSeedPoints(userId);
  const policy = await getActivePointPolicy();

  if (mockSeedPoints !== null) {
    const ledger = buildMockGuardianLedger(userId, policy) as PointLedgerRow[];
    const balance = ledger.reduce((s, r) => s + r.amount, 0);
    const earned = ledger.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
    const revoked = Math.abs(ledger.filter((r) => r.amount < 0).reduce((s, r) => s + r.amount, 0));
    return { balance, earned, revoked, ledger, policy, usesMockLedger: true };
  }

  const [snap, ledgerFromDb] = await Promise.all([
    fetchBalanceSnapshot(userId),
    fetchLedgerForUser(userId, ledgerLimit),
  ]);
  return {
    balance: snap?.balance ?? 0,
    earned: snap?.lifetime_earned ?? 0,
    revoked: snap?.lifetime_revoked ?? 0,
    ledger: ledgerFromDb as PointLedgerRow[],
    policy,
    usesMockLedger: false,
  };
}
