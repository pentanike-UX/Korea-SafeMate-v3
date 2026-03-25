"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function FooterPreferences({ className }: { className?: string }) {
  const tHeader = useTranslations("Header");

  return (
    <div className={cn("flex flex-wrap items-center gap-3 sm:gap-4", className)}>
      <ThemeToggle variant="default" />
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-muted-foreground text-xs font-medium sm:text-sm">{tHeader("languageLabel")}</span>
        <LanguageSwitcher className="w-fit shrink-0" variant="default" />
      </div>
    </div>
  );
}
