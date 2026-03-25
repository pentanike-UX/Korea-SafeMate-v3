import { randomUUID } from "crypto";

export const TRAVELER_MATCH_REQUESTS_COOKIE = "fg_traveler_match_requests";
const MAX = 50;

export type MatchRequestStatus = "requested" | "accepted" | "completed";

export type StoredMatchRequest = {
  id: string;
  traveler_user_id: string;
  guardian_user_id: string;
  guardian_display_name: string | null;
  status: MatchRequestStatus;
  created_at: string;
  updated_at: string;
};

export function parseMatchRequests(raw: string | undefined): StoredMatchRequest[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: StoredMatchRequest[] = [];
    for (const row of v) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : "";
      const traveler_user_id = typeof o.traveler_user_id === "string" ? o.traveler_user_id : "";
      const guardian_user_id = typeof o.guardian_user_id === "string" ? o.guardian_user_id : "";
      const status = o.status === "accepted" || o.status === "completed" ? o.status : "requested";
      const created_at = typeof o.created_at === "string" ? o.created_at : new Date().toISOString();
      const updated_at = typeof o.updated_at === "string" ? o.updated_at : created_at;
      const guardian_display_name = typeof o.guardian_display_name === "string" ? o.guardian_display_name : null;
      if (!id || !traveler_user_id || !guardian_user_id) continue;
      out.push({
        id,
        traveler_user_id,
        guardian_user_id,
        guardian_display_name,
        status,
        created_at,
        updated_at,
      });
    }
    return out.slice(0, MAX);
  } catch {
    return [];
  }
}

export function serializeMatchRequests(rows: StoredMatchRequest[]): string {
  return JSON.stringify(rows.slice(0, MAX));
}

export function newMatchRequestRow(
  travelerUserId: string,
  guardianUserId: string,
  guardianDisplayName: string | null,
): StoredMatchRequest {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    traveler_user_id: travelerUserId,
    guardian_user_id: guardianUserId,
    guardian_display_name: guardianDisplayName,
    status: "requested",
    created_at: now,
    updated_at: now,
  };
}
