import Link from "next/link";
import { getServerSupabaseForUser } from "@/lib/supabase/server-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: `Guardian profile | ${BRAND.name}`,
};

export default async function GuardianProfilePage() {
  const sb = await getServerSupabaseForUser();
  let display = "—";
  let statusLine = "Connect your guardian application to see live data.";

  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      const { data: gp } = await sb
        .from("guardian_profiles")
        .select("display_name, profile_status, approval_status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (gp) {
        display = gp.display_name ?? user.email ?? "—";
        statusLine = `Status: ${(gp.profile_status as string) ?? gp.approval_status ?? "unknown"}`;
      }
    }
  }

  return (
    <div className="page-container max-w-2xl space-y-6 py-8 sm:py-10">
      <Card className="rounded-2xl border-border/60 shadow-[var(--shadow-sm)]">
        <CardHeader>
          <CardTitle className="text-xl">Guardian profile</CardTitle>
          <CardDescription>{statusLine}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground text-lg font-semibold">{display}</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="rounded-xl">
              <Link href="/guardian/profile/edit">Edit profile</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/guardian">Back to hub</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
