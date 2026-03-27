import type { AttentionMenuKey } from "@/types/mypage-hub";
import { GUARDIAN_WORKSPACE_NAV_BADGE_KEYS, TRAVELER_NAV_BADGE_KEYS } from "@/types/mypage-hub";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

const ALL_MENU_KEYS = [...TRAVELER_NAV_BADGE_KEYS, ...GUARDIAN_WORKSPACE_NAV_BADGE_KEYS] as const;

export function isAttentionMenuKey(k: string): k is AttentionMenuKey {
  return (ALL_MENU_KEYS as readonly string[]).includes(k);
}

export async function getSeenMapForUser(userId: string): Promise<Partial<Record<AttentionMenuKey, string>>> {
  const sb = createServiceRoleSupabase();
  if (!sb) return {};

  const { data, error } = await sb
    .from("mypage_menu_attention_seen")
    .select("menu_key, seen_signature")
    .eq("user_id", userId);

  if (error) {
    console.error("[mypage-attention-seen]", error);
    return {};
  }

  const out: Partial<Record<AttentionMenuKey, string>> = {};
  for (const row of data ?? []) {
    const mk = row.menu_key;
    if (typeof mk === "string" && isAttentionMenuKey(mk) && typeof row.seen_signature === "string") {
      out[mk] = row.seen_signature;
    }
  }
  return out;
}

export async function upsertSeenSignature(userId: string, menuKey: AttentionMenuKey, signature: string): Promise<void> {
  const sb = createServiceRoleSupabase();
  if (!sb) return;

  const { error } = await sb.from("mypage_menu_attention_seen").upsert(
    {
      user_id: userId,
      menu_key: menuKey,
      seen_signature: signature,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,menu_key" },
  );

  if (error) {
    console.error("[mypage-attention-seen upsert]", error);
  }
}
