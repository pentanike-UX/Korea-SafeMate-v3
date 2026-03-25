import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRAND } from "@/lib/constants";
import { getServerSupabaseForUser, getSessionUserId } from "@/lib/supabase/server-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TravelerAccountForm } from "@/components/traveler/traveler-account-form";

export async function generateMetadata() {
  const t = await getTranslations("TravelerAccount");
  return {
    title: `${t("metaTitle")} | ${BRAND.name}`,
    description: t("metaDescription"),
  };
}

export default async function TravelerAccountPage() {
  const t = await getTranslations("TravelerAccount");
  const locale = await getLocale();
  const userId = await getSessionUserId();

  if (!userId) {
    return (
      <div className="space-y-6">
        <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle className="text-lg">{t("needLoginTitle")}</CardTitle>
            <CardDescription>{t("needLoginLead")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-xl font-semibold">
              <Link href="/login">{t("goLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sb = await getServerSupabaseForUser();
  if (!sb) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("error")}
      </p>
    );
  }

  const [{ data: appUser }, { data: profile }] = await Promise.all([
    sb.from("users").select("email, created_at, last_login_at, auth_provider").eq("id", userId).maybeSingle(),
    sb.from("user_profiles").select("display_name, intro, locale, profile_image_url, login_provider").eq("user_id", userId).maybeSingle(),
  ]);

  const email = appUser?.email ?? "";
  const initial = {
    display_name: profile?.display_name?.trim() ?? "",
    intro: profile?.intro?.trim() ?? "",
    locale: profile?.locale?.trim() ?? "",
    profile_image_url: profile?.profile_image_url?.trim() ?? "",
    email,
    login_provider: profile?.login_provider ?? appUser?.auth_provider ?? "google",
    created_at: appUser?.created_at ?? null,
    last_login_at: appUser?.last_login_at ?? null,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-text-strong text-xl font-semibold tracking-tight sm:text-2xl">{t("pageTitle")}</h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-[15px] leading-relaxed">{t("pageLead")}</p>
      </div>
      <TravelerAccountForm initial={initial} locale={locale} />
    </div>
  );
}
