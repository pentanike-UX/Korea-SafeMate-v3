import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FooterPreferences } from "@/components/layout/footer-preferences";
import { BRAND } from "@/lib/constants";
import { Compass, Scale, Users } from "lucide-react";

export async function SiteFooter() {
  const tFooter = await getTranslations("Footer");
  const tBrand = await getTranslations("Brand");
  const tNav = await getTranslations("Nav");
  const tHeader = await getTranslations("Header");

  const service = [
    { href: "/explore" as const, label: tNav("explore") },
    { href: "/posts" as const, label: tNav("posts") },
    { href: "/guardians" as const, label: tNav("guardians") },
    { href: "/mypage" as const, label: tHeader("myJourney") },
    { href: "/about" as const, label: tNav("about") },
  ];

  const guardians: { href: string; label: string }[] = [
    { href: "/guardians", label: tFooter("guardianBrowse") },
    { href: "/guardians/apply", label: tFooter("apply") },
  ];

  const operations: { href: string; label: string; hash?: string; native?: boolean }[] = [
    { href: "/about", label: tFooter("termsLink"), hash: "terms" },
    { href: "/about", label: tFooter("privacyLink"), hash: "privacy" },
  ];

  const linkRow =
    "inline-flex min-h-9 items-center rounded-[var(--radius-md)] py-0.5 pr-1 text-[14px] leading-6 font-medium text-white/72 transition-colors hover:text-white/95";

  return (
    <footer className="border-t border-white/10 bg-[#131a2a] text-white dark:bg-[#05070d]">
      <div className="w-full px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 xl:px-10">
        <div className="border-b border-white/12 pb-8 sm:pb-10">
          <div className="grid gap-8 md:gap-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(15.75rem,17.5rem)] lg:items-start lg:gap-8">
            <section className="max-w-2xl">
                <p className="text-base font-semibold tracking-tight text-white">{BRAND.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-[15px]">{tBrand("tagline")}</p>
                <p className="mt-4 text-xs leading-relaxed text-white/58 sm:text-sm">{tFooter("disclaimerShort")}</p>
            </section>

            <nav className="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1 lg:gap-5" aria-label="Footer">
              <div>
                <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-white/55 uppercase">
                  <Compass className="size-3.5 shrink-0 text-white/45" strokeWidth={1.75} aria-hidden />
                  {tFooter("product")}
                </p>
                <ul className="flex flex-col gap-0">
                  {service.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className={linkRow}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
                <div>
                  <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-white/55 uppercase">
                    <Users className="size-3.5 shrink-0 text-white/45" strokeWidth={1.75} aria-hidden />
                    {tFooter("guardians")}
                  </p>
                  <ul className="flex flex-col gap-0">
                    {guardians.map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href} className={linkRow}>
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-white/55 uppercase">
                    <Scale className="size-3.5 shrink-0 text-white/45" strokeWidth={1.75} aria-hidden />
                    {tFooter("operations")}
                  </p>
                  <ul className="flex flex-col gap-0">
                    {operations.map((item) => (
                      <li key={item.native ? item.href : `${item.href}#${item.hash ?? ""}`}>
                        {item.native ? (
                          <NextLink href={item.href} className={linkRow}>
                            {item.label}
                          </NextLink>
                        ) : (
                          <Link href={`${item.href}#${item.hash}`} className={linkRow}>
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>

            <div className="space-y-3 rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
              <FooterPreferences className="justify-start" />
              <NextLink
                href="/admin/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-white/20 bg-white/[0.06] px-3.5 text-sm font-medium text-white/86 transition-colors hover:border-white/35 hover:bg-white/[0.11] hover:text-white"
              >
                {tFooter("adminConsoleLink")}
              </NextLink>
            </div>
          </div>
        </div>

        <div className="pt-5 sm:pt-6">
          <div className="flex flex-col gap-1.5 text-xs leading-relaxed text-white/50 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <p>{tFooter("copyright", { year: new Date().getFullYear() })}</p>
            <p>Headquartered in Seoul, South Korea.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
