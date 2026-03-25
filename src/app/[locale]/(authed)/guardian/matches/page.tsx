import Link from "next/link";
import { mockBookings } from "@/data/mock";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: `Guardian matches | ${BRAND.name}`,
};

export default function GuardianMatchesPage() {
  const pool = mockBookings.filter((b) => b.status === "reviewing" || b.status === "requested");

  return (
    <div className="page-container space-y-6 py-8 sm:py-10">
      <div>
        <h1 className="text-text-strong text-2xl font-semibold tracking-tight">Matching</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          Mock queue — replace with Supabase matches for your account.
        </p>
      </div>
      <ul className="space-y-3">
        {pool.map((b) => (
          <li key={b.id}>
            <Card className="rounded-2xl border-border/60 py-0 shadow-none">
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{b.status}</p>
                  <p className="text-muted-foreground text-xs">{b.id}</p>
                </div>
                <Link href="/guardian" className="text-primary text-sm font-semibold">
                  Hub
                </Link>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
