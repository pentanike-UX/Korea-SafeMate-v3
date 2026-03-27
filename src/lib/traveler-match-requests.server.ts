import { cookies } from "next/headers";
import {
  parseMatchRequests,
  serializeMatchRequests,
  TRAVELER_MATCH_REQUESTS_COOKIE,
  type StoredMatchRequest,
} from "@/lib/traveler-match-requests";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

export async function getStoredMatchRequests(): Promise<StoredMatchRequest[]> {
  const jar = await cookies();
  return parseMatchRequests(jar.get(TRAVELER_MATCH_REQUESTS_COOKIE)?.value);
}

export async function getMatchRequestsForTraveler(travelerUserId: string): Promise<StoredMatchRequest[]> {
  const cookieRows = (await getStoredMatchRequests()).filter((r) => r.traveler_user_id === travelerUserId);
  const dbRows = await getDbMatchRequests({ travelerUserId });
  return mergeMatchRows(cookieRows, dbRows);
}

export async function getMatchRequestsForGuardian(guardianUserId: string): Promise<StoredMatchRequest[]> {
  const cookieRows = (await getStoredMatchRequests()).filter((r) => r.guardian_user_id === guardianUserId);
  const dbRows = await getDbMatchRequests({ guardianUserId });
  return mergeMatchRows(cookieRows, dbRows);
}

export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  };
}

export function withMatchRequestsCookie(res: import("next/server").NextResponse, rows: StoredMatchRequest[]) {
  res.cookies.set(TRAVELER_MATCH_REQUESTS_COOKIE, serializeMatchRequests(rows), cookieOpts());
  return res;
}

type DbMatchRow = {
  id: string;
  traveler_user_id: string;
  guardian_user_id: string;
  created_at: string;
  updated_at: string | null;
};

async function getDbMatchRequests(params: {
  travelerUserId?: string;
  guardianUserId?: string;
}): Promise<StoredMatchRequest[]> {
  const sb = createServiceRoleSupabase();
  if (!sb) return [];
  const base = sb
    .from("matches")
    .select("id, traveler_user_id, guardian_user_id, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const query = params.travelerUserId
    ? base.eq("traveler_user_id", params.travelerUserId)
    : params.guardianUserId
      ? base.eq("guardian_user_id", params.guardianUserId)
      : null;
  if (!query) return [];

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as DbMatchRow[]).map((r) => ({
    id: r.id,
    traveler_user_id: r.traveler_user_id,
    guardian_user_id: r.guardian_user_id,
    guardian_display_name: null,
    // DB flow currently has no explicit status in this table.
    // Keep it as requested so real actions still surface in MyPage.
    status: "requested",
    created_at: r.created_at,
    updated_at: r.updated_at ?? r.created_at,
  }));
}

function mergeMatchRows(primary: StoredMatchRequest[], secondary: StoredMatchRequest[]): StoredMatchRequest[] {
  const map = new Map<string, StoredMatchRequest>();
  for (const row of [...secondary, ...primary]) {
    const prev = map.get(row.id);
    if (!prev) {
      map.set(row.id, row);
      continue;
    }
    // Cookie row has richer status progression, keep it over DB duplicate.
    if (prev.status === "requested" && row.status !== "requested") {
      map.set(row.id, row);
    }
  }
  return [...map.values()].sort((a, b) => (a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0));
}
