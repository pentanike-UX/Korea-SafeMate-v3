"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

/**
 * Footer-only: reads as a real switch (not a lone icon) on dark surfaces.
 */
export function FooterThemeSwitch({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const tFooter = useTranslations("Footer");
  const { resolved, mounted, toggleTheme } = useTheme();
  const dark = resolved === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      disabled={!mounted}
      aria-label={dark ? t("themeSwitchToLight") : t("themeSwitchToDark")}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-11 w-[6.1rem] shrink-0 items-center rounded-[var(--radius-md)] border border-white/25 bg-white/10 px-1 shadow-inner outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "disabled:opacity-60",
        className,
      )}
    >
      <span className="pointer-events-none flex w-full items-center justify-between px-1.5">
        <Sun
          className={cn("size-4 transition-colors", dark ? "text-amber-200/45" : "text-amber-200")}
          strokeWidth={1.9}
          aria-hidden
        />
        <Moon
          className={cn("size-4 transition-colors", dark ? "text-sky-100" : "text-sky-100/45")}
          strokeWidth={1.9}
          aria-hidden
        />
      </span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 w-8 rounded-[calc(var(--radius-md)-4px)] bg-white shadow-md ring-1 ring-black/10 transition-[left] duration-200 ease-out",
          dark ? "left-[calc(100%-2.25rem)]" : "left-1",
        )}
      />
      <span className="sr-only">{dark ? tFooter("themeDark") : tFooter("themeLight")}</span>
    </button>
  );
}
