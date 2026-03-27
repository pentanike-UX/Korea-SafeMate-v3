import { NextResponse } from "next/server";
import { isAttentionMenuKey, getSeenMapForUser, upsertSeenSignature } from "@/lib/mypage-attention-seen.server";
import { getSessionUserId } from "@/lib/supabase/server-user";

/** GET — 현재 세션 사용자의 메뉴별 seen 시그니처 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const seen = await getSeenMapForUser(userId);
  return NextResponse.json({ seen });
}

/** POST — 메뉴 이탈 시 seen 시그니처 저장 */
export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { menuKey?: string; signature?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const menuKey = typeof body.menuKey === "string" ? body.menuKey.trim() : "";
  const signature = typeof body.signature === "string" ? body.signature : "";
  if (!menuKey || !isAttentionMenuKey(menuKey)) {
    return NextResponse.json({ error: "Invalid menuKey" }, { status: 400 });
  }
  if (!signature) {
    return NextResponse.json({ error: "signature required" }, { status: 400 });
  }

  await upsertSeenSignature(userId, menuKey, signature);
  return NextResponse.json({ ok: true });
}
