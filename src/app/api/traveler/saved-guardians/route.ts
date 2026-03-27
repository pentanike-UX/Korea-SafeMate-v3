import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  TRAVELER_SAVED_GUARDIANS_COOKIE,
  parseSavedGuardianIds,
  serializeSavedGuardianIds,
} from "@/lib/traveler-saved-guardians-cookie";
import { listPublicGuardiansMerged } from "@/lib/guardian-public-merged.server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  secure: process.env.NODE_ENV === "production",
};

export async function GET() {
  const jar = await cookies();
  const ids = parseSavedGuardianIds(jar.get(TRAVELER_SAVED_GUARDIANS_COOKIE)?.value);
  return NextResponse.json({ ids });
}

export async function POST(req: Request) {
  let body: { guardian_user_id?: string; action?: "add" | "remove" | "toggle" };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.guardian_user_id === "string" ? body.guardian_user_id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "guardian_user_id required" }, { status: 400 });
  }

  const publicGuardians = await listPublicGuardiansMerged();
  const validIds = new Set(publicGuardians.map((g) => g.user_id));
  if (!validIds.has(id)) {
    return NextResponse.json({ error: "Unknown guardian" }, { status: 404 });
  }

  const jar = await cookies();
  let ids = parseSavedGuardianIds(jar.get(TRAVELER_SAVED_GUARDIANS_COOKIE)?.value);
  const action = body.action ?? "toggle";
  const had = ids.includes(id);

  if (action === "remove") {
    ids = ids.filter((x) => x !== id);
  } else if (action === "add") {
    if (!had) ids = [...ids, id];
  } else {
    ids = had ? ids.filter((x) => x !== id) : [...ids, id];
  }

  const saved = ids.includes(id);
  const res = NextResponse.json({ ids, saved });
  res.cookies.set(TRAVELER_SAVED_GUARDIANS_COOKIE, serializeSavedGuardianIds(ids), COOKIE_OPTIONS);
  return res;
}
