import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: `Edit guardian profile | ${BRAND.name}`,
};

export default function GuardianProfileEditPage() {
  return (
    <div className="page-container max-w-2xl space-y-6 py-8 sm:py-10">
      <Card className="rounded-2xl border-border/60 shadow-[var(--shadow-sm)]">
        <CardHeader>
          <CardTitle className="text-xl">Edit guardian profile</CardTitle>
          <CardDescription>
            Structured onboarding and documents will live here. For now, continue with the onboarding wizard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl font-semibold">
            <Link href="/guardian/onboarding">Open onboarding</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/guardian/profile">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
