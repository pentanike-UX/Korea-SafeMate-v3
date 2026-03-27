import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FooterPreferences } from "@/components/layout/footer-preferences";
import { BRAND } from "@/lib/constants";

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
    "inline-flex min-h-8 items-center rounded-[var(--radius-md)] py-0.5 pr-1 text-[13px] leading-6 font-medium text-white/72 transition-colors hover:text-white/92";

  return (
    <footer className="border-t border-white/10 bg-[#131a2a] text-white dark:bg-[#05070d]">
      <div className="w-full px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 xl:px-10">
        <div className="border-b border-white/12 pb-8 sm:pb-10">
          <div className="grid gap-8 md:gap-9 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1.05fr)_minmax(14.5rem,16rem)] lg:items-start lg:gap-8">
            <section className="max-w-2xl">
              <p className="text-lg font-semibold tracking-tight text-white">{BRAND.name}</p>
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/85 sm:text-[15px]">{tBrand("tagline")}</p>
              <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/58 sm:text-[13px]">
                Seoul-based guardian matching for practical, safer K-culture journeys.
              </p>
            </section>

            <nav className="grid max-w-xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-5" aria-label="Footer">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-white/55 uppercase">{tFooter("product")}</p>
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
              <div>
                <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-white/55 uppercase">{tFooter("guardians")}</p>
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
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-white/55 uppercase">{tFooter("operations")}</p>
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
            </nav>

            <div className="space-y-3 lg:border-l lg:border-white/12 lg:pl-5">
              <FooterPreferences className="justify-start" />
              <NextLink
                href="/admin/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-white/20 bg-white/[0.04] px-3.5 text-sm font-medium text-white/82 transition-colors hover:border-white/32 hover:bg-white/[0.08] hover:text-white"
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
