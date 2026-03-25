import { cookies } from "next/headers";
import {
  parseMatchRequests,
  serializeMatchRequests,
  TRAVELER_MATCH_REQUESTS_COOKIE,
  type StoredMatchRequest,
} from "@/lib/traveler-match-requests";

export async function getStoredMatchRequests(): Promise<StoredMatchRequest[]> {
  const jar = await cookies();
  return parseMatchRequests(jar.get(TRAVELER_MATCH_REQUESTS_COOKIE)?.value);
}

export async function getMatchRequestsForTraveler(travelerUserId: string): Promise<StoredMatchRequest[]> {
  return (await getStoredMatchRequests()).filter((r) => r.traveler_user_id === travelerUserId);
}

export async function getMatchRequestsForGuardian(guardianUserId: string): Promise<StoredMatchRequest[]> {
  return (await getStoredMatchRequests()).filter((r) => r.guardian_user_id === guardianUserId);
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
