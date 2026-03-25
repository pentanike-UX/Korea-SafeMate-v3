import { NextResponse } from "next/server";
import { getServerSupabaseForUser } from "@/lib/supabase/server-user";

export async function PATCH(req: Request) {
  const sb = await getServerSupabaseForUser();
  if (!sb) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const {
    data: { user },
    error: authErr,
  } = await sb.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { display_name?: string; intro?: string; locale?: string; profile_image_url?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    updated_at: now,
    profile_fields_locked: true,
  };

  if (typeof body.display_name === "string") patch.display_name = body.display_name.trim() || null;
  if (typeof body.intro === "string") patch.intro = body.intro.trim() || null;
  if (typeof body.locale === "string") patch.locale = body.locale.trim() || null;
  if (body.profile_image_url === null || typeof body.profile_image_url === "string") {
    patch.profile_image_url = body.profile_image_url?.trim() || null;
  }

  const { error } = await sb.from("user_profiles").upsert(
    {
      user_id: user.id,
      ...patch,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
