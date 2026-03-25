import { MypageHubShell } from "@/components/mypage/mypage-hub-shell";
import type { AppAccountRole } from "@/lib/auth/app-role";
import { guardianStatusFromRow, type GuardianProfileStatus } from "@/lib/auth/guardian-profile-status";
import { getServerSupabaseForUser } from "@/lib/supabase/server-user";

export default async function MypageLayout({ children }: { children: React.ReactNode }) {
  let appRole: AppAccountRole = "traveler";
  let guardianStatus: GuardianProfileStatus = "none";

  const sb = await getServerSupabaseForUser();
  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      const { data: u } = await sb.from("users").select("app_role").eq("id", user.id).maybeSingle();
      appRole = (u?.app_role as AppAccountRole | undefined) ?? "traveler";
      const { data: gp } = await sb
        .from("guardian_profiles")
        .select("profile_status, approval_status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (gp) {
        guardianStatus = guardianStatusFromRow(
          gp as { profile_status?: string | null; approval_status?: string | null },
        );
      }
    }
  }

  return (
    <MypageHubShell appRole={appRole} guardianStatus={guardianStatus}>
      {children}
    </MypageHubShell>
  );
}
