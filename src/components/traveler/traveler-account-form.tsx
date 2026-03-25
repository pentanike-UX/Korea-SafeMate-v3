"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type TravelerAccountInitial = {
  display_name: string;
  intro: string;
  locale: string;
  profile_image_url: string;
  email: string;
  login_provider: string;
  created_at: string | null;
  last_login_at: string | null;
};

function formatWhen(iso: string | null, locale: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function TravelerAccountForm({ initial, locale }: { initial: TravelerAccountInitial; locale: string }) {
  const t = useTranslations("TravelerAccount");
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [intro, setIntro] = useState(initial.intro);
  const [loc, setLoc] = useState(initial.locale);
  const [imageUrl, setImageUrl] = useState(initial.profile_image_url);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: displayName,
          intro,
          locale: loc,
          profile_image_url: imageUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
        <CardHeader>
          <CardTitle className="text-lg">{t("sectionAccount")}</CardTitle>
          <CardDescription>{t("pageLead")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="acct-email">{t("fieldEmail")}</Label>
            <Input id="acct-email" value={initial.email} readOnly className="bg-muted/40" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{t("fieldLoginMethod")}</p>
            <p className="text-sm font-medium capitalize">{initial.login_provider || "google"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{t("fieldCreatedAt")}</p>
            <p className="text-sm font-medium">{formatWhen(initial.created_at, locale)}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{t("fieldLastLogin")}</p>
            <p className="text-sm font-medium">{formatWhen(initial.last_login_at, locale)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-2xl shadow-[var(--shadow-sm)]">
        <CardHeader>
          <CardTitle className="text-lg">{t("sectionProfile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">{t("fieldDisplayName")}</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro">{t("fieldIntro")}</Label>
            <Textarea id="intro" value={intro} onChange={(e) => setIntro(e.target.value)} rows={4} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locale">{t("fieldLocale")}</Label>
            <Input id="locale" value={loc} onChange={(e) => setLoc(e.target.value)} className="rounded-xl" />
          </div>
          <div id="profile-image-field" className="scroll-mt-28 space-y-2">
            <Label htmlFor="profile_image_url">{t("fieldProfileImage")}</Label>
            <Input id="profile_image_url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={status === "saving"} className="rounded-xl font-semibold">
              {status === "saving" ? t("saving") : t("save")}
            </Button>
            {status === "saved" ? <span className="text-muted-foreground text-sm">{t("saved")}</span> : null}
            {status === "error" ? <span className="text-destructive text-sm">{t("error")}</span> : null}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
