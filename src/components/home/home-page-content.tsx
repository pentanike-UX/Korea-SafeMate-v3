import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  mockContentCategories,
  mockContentPosts,
  mockFeaturedGuardians,
  mockGuardians,
  mockRegions,
} from "@/data/mock";
import { BRAND, SERVICE_COPY } from "@/lib/constants";
import { TrustBoundaryCard } from "@/components/trust/trust-boundary-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { guardianTierBadgeVariant } from "@/lib/guardian-tier-ui";
import type { GuardianTier } from "@/types/domain";
import { ArrowRight, ChevronRight, MapPin, Plane, Sparkles, Star, Sun } from "lucide-react";

const icons = {
  arrival: Plane,
  k_route: MapPin,
  first_24h: Sun,
} as const;

type ServiceCode = keyof typeof SERVICE_COPY;

function regionGradient(slug: string) {
  const h = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = 270 + (h % 40);
  return `linear-gradient(135deg, hsl(${hue} 75% 42%) 0%, hsl(${(hue + 35) % 360} 70% 48%) 100%)`;
}

export async function HomePageContent() {
  const t = await getTranslations("Home");
  const tSvc = await getTranslations("Services");
  const tExp = await getTranslations("Explore");
  const tTier = await getTranslations("GuardianTier");
  const locale = await getLocale();

  const categoryChipMap = t.raw("categoryChip") as Record<string, string> | undefined;
  const regionCopy = t.raw("region") as Record<string, { name: string; desc: string }> | undefined;

  function categoryLabel(slug: string, fallback: string) {
    return categoryChipMap?.[slug] ?? fallback;
  }

  function regionTitle(slug: string, fallback: string) {
    return regionCopy?.[slug]?.name ?? fallback;
  }

  function regionDesc(slug: string, fallback: string) {
    return regionCopy?.[slug]?.desc ?? fallback;
  }

  function tierLabel(tier: GuardianTier) {
    return tTier(tier);
  }

  function spotlightHeadline(userId: string, fallback: string) {
    if (userId === "g1") return t("spotlightHeadlineG1");
    if (userId === "g2") return t("spotlightHeadlineG2");
    return fallback;
  }

  function spotlightTagline(userId: string, fallback: string) {
    if (userId === "g1") return t("spotlightTaglineG1");
    if (userId === "g2") return t("spotlightTaglineG2");
    return fallback;
  }

  const approvedPosts = mockContentPosts.filter((p) => p.status === "approved");
  const featuredPosts = [...approvedPosts]
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (b.helpful_rating ?? 0) - (a.helpful_rating ?? 0),
    )
    .slice(0, 3);

  const regionsSorted = [...mockRegions].sort((a, b) => {
    if (a.phase !== b.phase) return a.phase - b.phase;
    return a.name.localeCompare(b.name);
  });
  const heroRegions = regionsSorted.slice(0, 3);

  const verifiedCount = mockGuardians.filter((g) => g.guardian_tier === "verified_guardian").length;
  const ratings = mockGuardians.filter((g) => g.avg_traveler_rating != null).map((g) => g.avg_traveler_rating!);
  const avgRating =
    ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";
  const langCodes = new Set<string>();
  mockGuardians.forEach((g) => g.languages.forEach((l) => langCodes.add(l.language_code.toUpperCase())));
  const languagesLine = Array.from(langCodes).sort().join(" · ");

  const nf = (n: number) => new Intl.NumberFormat(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US").format(n);

  const featuredRows = mockFeaturedGuardians
    .filter((f) => f.active)
    .sort((a, b) => b.priority - a.priority)
    .map((f) => {
      const g = mockGuardians.find((x) => x.user_id === f.guardian_user_id);
      return g ? { f, g } : null;
    })
    .filter(Boolean) as { f: (typeof mockFeaturedGuardians)[0]; g: (typeof mockGuardians)[0] }[];

  const categoryChips = mockContentCategories.slice(0, 6);

  const layers = [
    { titleKey: "layer1Title" as const, bodyKey: "layer1Body" as const },
    { titleKey: "layer2Title" as const, bodyKey: "layer2Body" as const },
    { titleKey: "layer3Title" as const, bodyKey: "layer3Body" as const },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-6">
            <p className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="size-3.5" aria-hidden />
              {t("eyebrow")}
            </p>
            <h1 className="text-text-strong mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.65rem] md:leading-[1.12]">
              {t("heroTitle")}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              {t("heroLead", { brand: BRAND.name })}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className="rounded-xl px-7 shadow-sm">
                <Link href="/book">{t("ctaPrimaryRequest")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-2">
                <Link href="/explore">
                  {t("ctaSecondaryExplore")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-xl text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]">
                <Link href="/guardians/apply">{t("ctaTertiaryGuardian")}</Link>
              </Button>
            </div>
            <p className="text-muted-foreground mt-4">
              <Link href="/services" className="text-sm font-medium text-primary hover:underline">
                {t("viewServicesLink")}
              </Link>
            </p>
            <p className="text-muted-foreground mt-3 max-w-xl text-xs leading-relaxed">{t("scopeNote")}</p>
          </div>

          {/* Product showcase */}
          <div className="lg:col-span-6">
            <div className="border-border/80 bg-card/90 shadow-[var(--shadow-md)] relative overflow-hidden rounded-2xl border p-4 sm:p-5">
              <div
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-[0.12]"
                style={{ background: "var(--gradient-brand)" }}
              />
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                {t("showcaseEyebrow")}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl border border-border/70 bg-[var(--brand-trust-blue-soft)]/50 px-2.5 py-2">
                  <p className="text-text-strong text-lg font-semibold tabular-nums">{nf(verifiedCount)}</p>
                  <p className="text-muted-foreground text-[10px] font-medium leading-tight">{t("statVerified")}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-[var(--brand-primary-soft)]/60 px-2.5 py-2">
                  <p className="text-text-strong text-lg font-semibold tabular-nums">{nf(approvedPosts.length)}</p>
                  <p className="text-muted-foreground text-[10px] font-medium leading-tight">{t("statPosts")}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background px-2.5 py-2">
                  <p className="text-text-strong flex items-baseline gap-0.5 text-lg font-semibold tabular-nums">
                    {avgRating}
                    {avgRating !== "—" ? (
                      <Star className="text-primary size-3.5 fill-current" aria-hidden />
                    ) : null}
                  </p>
                  <p className="text-muted-foreground text-[10px] font-medium leading-tight">{t("statRating")}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background px-2.5 py-2">
                  <p className="text-text-strong line-clamp-2 text-[11px] font-semibold leading-snug">{languagesLine}</p>
                  <p className="text-muted-foreground mt-0.5 text-[10px] font-medium">{t("statLanguages")}</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 border-t border-border/60 pt-3 text-xs leading-relaxed">
                {t("processClarity")}
              </p>

              <p className="text-foreground mt-5 text-[10px] font-bold tracking-widest uppercase">{t("chipsLabel")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoryChips.map((c) => (
                  <Link
                    key={c.id}
                    href="/explore"
                    className="border-border hover:border-primary/40 hover:bg-[var(--brand-primary-soft)]/80 text-foreground rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors"
                  >
                    {categoryLabel(c.slug, c.name)}
                  </Link>
                ))}
              </div>

              <p className="text-foreground mt-5 text-[10px] font-bold tracking-widest uppercase">{t("regionsPreviewLabel")}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {heroRegions.map((r) => (
                  <Link
                    key={r.id}
                    href={`/explore/${r.slug}`}
                    className="group border-border relative overflow-hidden rounded-xl border transition-all hover:border-primary/35 hover:shadow-[var(--shadow-sm)]"
                  >
                    <div className="h-16 w-full" style={{ background: regionGradient(r.slug) }} />
                    <div className="flex items-start gap-2 p-2.5">
                      <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                        <MapPin className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-semibold leading-tight">
                          {regionTitle(r.slug, r.name)}
                        </p>
                        <p className="text-muted-foreground text-[10px]">{tExp("phase", { n: r.phase })}</p>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-primary ml-auto size-4 shrink-0 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>

              <p className="text-foreground mt-5 text-[10px] font-bold tracking-widest uppercase">{t("featuredGuardiansLabel")}</p>
              <div className="mt-2 space-y-2">
                {featuredRows.map(({ f, g }) => (
                  <Link
                    key={g.user_id}
                    href={`/guardians#guardian-${g.user_id}`}
                    className="border-border hover:border-primary/30 flex items-center gap-3 rounded-xl border bg-muted/20 p-2.5 transition-colors hover:bg-[var(--brand-primary-soft)]/40"
                  >
                    <div
                      className="text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                      style={{ background: regionGradient(g.user_id) }}
                      aria-hidden
                    >
                      {g.display_name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-foreground truncate text-sm font-semibold">{g.display_name}</span>
                        <Badge variant={guardianTierBadgeVariant(g.guardian_tier)} className="text-[9px]">
                          {tierLabel(g.guardian_tier)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground truncate text-xs font-medium">
                        {spotlightHeadline(g.user_id, g.headline)}
                      </p>
                      <p className="text-muted-foreground truncate text-[11px] leading-snug">
                        {spotlightTagline(g.user_id, f.tagline)}
                      </p>
                      {g.avg_traveler_rating != null ? (
                        <p className="text-primary mt-0.5 flex items-center gap-1 text-[11px] font-medium">
                          <Star className="size-3 fill-current" aria-hidden />
                          {g.avg_traveler_rating.toFixed(1)} · {t("travelerRatingLabel")}
                        </p>
                      ) : null}
                    </div>
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & scope — elevated, near hero */}
      <section className="border-y border-[var(--brand-trust-blue)]/15 bg-gradient-to-b from-[var(--brand-trust-blue-soft)]/45 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-text-strong text-lg font-semibold tracking-tight">{t("trustBandTitle")}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{t("trustBandLead")}</p>
          </div>
          <TrustBoundaryCard />
        </div>
      </section>

      {/* Discovery — high contrast band */}
      <section className="relative overflow-hidden bg-[#0e1b3d] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(172,0,255,0.35), transparent 55%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(47,124,255,0.25), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl space-y-12 px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[var(--accent-pink)] text-xs font-semibold tracking-widest uppercase">{t("discoverEyebrow")}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t("discoverSectionTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{t("discoverSectionLead")}</p>
            </div>
            <Link
              href="/explore"
              className="text-sm font-semibold text-[var(--accent-pink)] hover:underline sm:mt-8 sm:shrink-0"
            >
              {t("discoverOpenExplore")}
            </Link>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight">{t("featuredRegionsTitle")}</h3>
              <Link href="/explore" className="text-sm font-medium text-[var(--accent-pink)] hover:underline">
                {t("viewAllRegions")}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {regionsSorted.map((r) => (
                <Link
                  key={r.id}
                  href={`/explore/${r.slug}`}
                  className="group rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.14]"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-[var(--accent-pink)]" aria-hidden />
                    <span className="font-semibold">{regionTitle(r.slug, r.name)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/70">{regionDesc(r.slug, r.short_description)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-white/90 group-hover:underline">
                    {tExp("openHub")}
                    <ChevronRight className="size-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold tracking-tight">{t("featuredIntelTitle")}</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {featuredPosts.map((p) => {
                const cat = mockContentCategories.find((c) => c.slug === p.category_slug);
                return (
                  <Link
                    key={p.id}
                    href="/explore#intel"
                    className="group flex h-full flex-col rounded-xl border border-white/12 bg-white/[0.08] p-4 backdrop-blur-sm transition-all hover:border-[var(--accent-pink)]/40 hover:bg-white/[0.12]"
                  >
                    {p.featured ? (
                      <Badge
                        variant="outline"
                        className="border-[var(--accent-pink)]/55 text-[var(--accent-pink)] mb-2 w-fit bg-transparent text-[10px]"
                      >
                        {t("pickBadge")}
                      </Badge>
                    ) : null}
                    {cat ? (
                      <span className="text-[var(--brand-trust-blue)] text-[10px] font-semibold uppercase tracking-wide">
                        {categoryLabel(cat.slug, cat.name)}
                      </span>
                    ) : null}
                    <p className="mt-1 font-semibold leading-snug text-white group-hover:underline">{p.title}</p>
                    <p className="text-muted-foreground mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-white/65">
                      {p.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px] text-white/60">
                      <span>{p.author_display_name}</span>
                      <span className="flex items-center gap-1 text-[var(--accent-pink)]">
                        <Star className="size-3 fill-current" aria-hidden />
                        <span className="tabular-nums">{(p.helpful_rating ?? 0).toFixed(1)}</span>
                        <span className="text-white/50">·</span>
                        <span className="font-normal text-white/55">{t("travelerRatingLabel")}</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight">{t("featuredGuardiansSectionTitle")}</h3>
              <Link href="/guardians" className="text-sm font-medium text-[var(--accent-pink)] hover:underline">
                {t("featuredGuardiansCta")}
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {featuredRows.map(({ f, g }) => (
                <Link
                  key={g.user_id}
                  href={`/guardians#guardian-${g.user_id}`}
                  className="flex gap-4 rounded-xl border border-white/12 bg-white/[0.08] p-4 backdrop-blur-sm transition-colors hover:border-white/25"
                >
                  <div
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-md"
                    style={{ background: regionGradient(g.user_id) }}
                  >
                    {g.display_name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{g.display_name}</p>
                    <p className="text-sm text-white/70">{spotlightHeadline(g.user_id, g.headline)}</p>
                    <p className="mt-1 text-xs text-white/60">{spotlightTagline(g.user_id, f.tagline)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {g.expertise_tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/85"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="from-muted/25 border-y border-border/60 bg-gradient-to-b to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-text-strong text-2xl font-semibold tracking-tight">{t("servicesSectionTitle")}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{t("servicesSectionLead")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(SERVICE_COPY) as ServiceCode[]).map((code) => {
              const bullets = tSvc.raw(`cards.${code}.bullets`) as unknown as string[];
              return (
                <Card
                  key={code}
                  className="border-border/80 bg-card shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                >
                  <CardHeader>
                    <div className="text-primary mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      {(() => {
                        const Icon = icons[code];
                        return <Icon className="size-5" />;
                      })()}
                    </div>
                    <CardTitle className="text-lg">{tSvc(`cards.${code}.title`)}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tSvc(`cards.${code}.shortDescription`)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      {bullets.map((b) => (
                        <li key={b}>• {b}</li>
                      ))}
                    </ul>
                    <Button asChild variant="link" className="mt-4 h-auto px-0">
                      <Link href="/book">{t("startBooking")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works — compact, not the lead story */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-text-strong text-xl font-semibold tracking-tight">{t("howItWorksTitle")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t("howItWorksLead")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {layers.map((layer) => (
            <Card
              key={layer.titleKey}
              className="border-dashed border-primary/20 bg-[var(--brand-primary-soft)]/25"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{t(layer.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs leading-relaxed">{t(layer.bodyKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="bg-cta-brand text-primary-foreground flex flex-col items-start justify-between gap-6 rounded-2xl p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("ctaTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/90">{t("ctaLead")}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-xl border border-white/35 bg-white text-[var(--brand-primary)] shadow-md hover:bg-white/95"
            >
              <Link href="/book">{t("ctaPrimaryRequest")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-xl text-white hover:bg-white/15"
            >
              <Link href="/explore">{t("ctaSecondaryExplore")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
