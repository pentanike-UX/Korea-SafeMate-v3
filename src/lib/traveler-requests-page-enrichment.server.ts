import type {
  BookingInterestId,
  BookingRequestPayload,
  BookingSupportNeedId,
  ServiceTypeCode,
} from "@/types/domain";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import type { StoredMatchRequest } from "@/lib/traveler-match-requests";
import type { PublicGuardian } from "@/lib/guardian-public";

export type RequestPageRequestType = "half_day" | "day" | "consult";

export type MatchRequestRowEnrichment = {
  region_label_key: "gwanghwamun" | "gangnam" | null;
  /** TravelerHub `region.*`에 없을 때 카드에 그대로 노출 */
  region_display: string;
  theme_slug: string;
  /** ExperienceThemes에 없을 때 카드 제목 대용 */
  theme_fallback_title: string | null;
  mood_interests: BookingInterestId[];
  mood_supports: BookingSupportNeedId[];
  note_summary: string;
  request_type: RequestPageRequestType;
  service_code: ServiceTypeCode | null;
  requested_at: string;
  status_changed_at: string;
};

const INTEREST_ORDER: BookingInterestId[] = ["k_pop", "k_drama", "k_movie", "food", "shopping", "local_support"];

const THEME_BY_INTEREST: Record<BookingInterestId, string> = {
  k_pop: "k_pop_day",
  k_drama: "k_drama_romance",
  k_movie: "movie_location",
  food: "photo_route",
  shopping: "k_pop_day",
  local_support: "safe_solo",
};

function pickLatestIso(...candidates: (string | null | undefined)[]): string {
  let best: string | null = null;
  let t = -Infinity;
  for (const c of candidates) {
    if (!c) continue;
    const n = Date.parse(c);
    if (!Number.isFinite(n)) continue;
    if (n >= t) {
      t = n;
      best = c;
    }
  }
  return best ?? "";
}

function regionKeyFromSlug(slug: string): "gwanghwamun" | "gangnam" | null {
  const s = slug.toLowerCase();
  if (
    s.includes("gwanghwamun") ||
    s.includes("gyeongbok") ||
    s.includes("jongno") ||
    s.includes("bukchon") ||
    s.includes("광화문") ||
    s.includes("북촌")
  ) {
    return "gwanghwamun";
  }
  if (s.includes("gangnam") || s.includes("강남") || s.includes("nonhyeon") || s.includes("논현")) {
    return "gangnam";
  }
  return null;
}

function formatRegionSlugForDisplay(slug: string) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" · ");
}

function requestTypeFromServiceCode(code: ServiceTypeCode): RequestPageRequestType {
  if (code === "arrival") return "consult";
  if (code === "k_route") return "half_day";
  return "day";
}

function requestTypeFromDurationHours(h: number | null | undefined, code: ServiceTypeCode): RequestPageRequestType {
  if (h == null || !Number.isFinite(h)) return requestTypeFromServiceCode(code);
  if (h <= 5) return "half_day";
  if (h >= 18) return "day";
  return "consult";
}

function parseBookingPayload(raw: unknown): BookingRequestPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<BookingRequestPayload>;
  if (typeof p.region_slug !== "string" || !p.region_slug.trim()) return null;
  return p as BookingRequestPayload;
}

function regionSlugFromNotes(notes: string): string {
  const m = notes.match(/Region:\s*([^\n]+)/i);
  return m?.[1]?.trim() ?? "";
}

function themeSlugFromPayload(p: BookingRequestPayload): string {
  for (const id of INTEREST_ORDER) {
    if (p.interests?.includes(id)) return THEME_BY_INTEREST[id];
  }
  return "safe_solo";
}

function fallbackFromGuardian(g: PublicGuardian | undefined): Pick<
  MatchRequestRowEnrichment,
  "region_label_key" | "region_display" | "theme_slug" | "theme_fallback_title" | "note_summary" | "request_type"
> {
  const slug = g?.primary_region_slug?.trim() || "";
  const key = slug ? regionKeyFromSlug(slug) : null;
  const region_display = key ? "" : formatRegionSlugForDisplay(slug || "Seoul");
  const tag = g?.expertise_tags?.[0]?.trim();
  const headline = g?.headline?.trim();
  return {
    region_label_key: key,
    region_display: key ? "" : region_display || "Seoul",
    theme_slug: "safe_solo",
    theme_fallback_title: tag || headline || null,
    note_summary: "",
    request_type: "consult",
  };
}

/**
 * 매칭 행 + 연결 예약(`booking_id`)·서비스 타입으로 요청 카드용 메타를 채운다.
 * 예약이 없으면 빈 맵 엔트리를 두고 호출측에서 가디언 프로필로 보강한다.
 */
export async function enrichMatchRowsForRequestsPage(
  rows: StoredMatchRequest[],
): Promise<Map<string, Partial<MatchRequestRowEnrichment>>> {
  const out = new Map<string, Partial<MatchRequestRowEnrichment>>();
  const sb = createServiceRoleSupabase();
  if (!sb || rows.length === 0) return out;

  const bookingIds = [...new Set(rows.map((r) => r.booking_id).filter((id): id is string => Boolean(id)))];
  if (bookingIds.length === 0) return out;

  const [bookingRes, histRes, svcRes] = await Promise.all([
    sb
      .from("bookings")
      .select("id, service_code, notes, request_payload, requested_start, updated_at, status, pickup_hint")
      .in("id", bookingIds),
    sb.from("booking_status_history").select("booking_id, changed_at").in("booking_id", bookingIds),
    sb.from("service_types").select("code, duration_hours, name, short_description"),
  ]);

  const bookingRows = bookingRes.data;
  const be = bookingRes.error;
  const histRows = histRes.data;
  const svcRows = svcRes.error ? [] : svcRes.data;

  if (be || !bookingRows) return out;

  const lastHistByBooking = new Map<string, string>();
  for (const h of histRows ?? []) {
    const bid = h.booking_id as string;
    const ch = h.changed_at as string;
    if (!lastHistByBooking.has(bid)) lastHistByBooking.set(bid, ch);
  }

  const durationByCode = new Map<string, number>();
  const nameByCode = new Map<string, string>();
  for (const s of svcRows ?? []) {
    const code = s.code as string;
    if (typeof s.duration_hours === "number") durationByCode.set(code, s.duration_hours);
    if (typeof s.name === "string" && s.name.trim()) nameByCode.set(code, s.name.trim());
  }

  const bookingById = new Map((bookingRows as Record<string, unknown>[]).map((b) => [b.id as string, b]));

  for (const row of rows) {
    const bid = row.booking_id;
    if (!bid) continue;
    const b = bookingById.get(bid);
    if (!b) continue;

    const service_code = b.service_code as ServiceTypeCode;
    const notes = typeof b.notes === "string" ? b.notes : "";
    const requested_start = typeof b.requested_start === "string" ? b.requested_start : row.created_at;
    const booking_updated = typeof b.updated_at === "string" ? b.updated_at : null;
    const payload = parseBookingPayload(b.request_payload);

    const regionSlug =
      payload?.region_slug?.trim() || regionSlugFromNotes(notes) || (typeof b.pickup_hint === "string" ? b.pickup_hint.trim() : "");
    const regionKey = regionSlug ? regionKeyFromSlug(regionSlug) : null;
    const region_display = regionKey ? "" : (regionSlug ? formatRegionSlugForDisplay(regionSlug) : "");

    const interests = (payload?.interests?.filter(Boolean) ?? []) as BookingInterestId[];
    const supports = (payload?.support_needs?.filter(Boolean) ?? []) as BookingSupportNeedId[];
    const theme_slug = payload ? themeSlugFromPayload(payload) : "safe_solo";
    const svcDur = durationByCode.get(service_code);
    const request_type = requestTypeFromDurationHours(svcDur ?? null, service_code);

    const noteFromPayload = payload?.special_requests?.trim() || "";
    const note_summary = noteFromPayload || notes.split("\n").find((line) => line.trim().startsWith("Notes:"))?.replace(/^Notes:\s*/i, "").trim() || notes.trim();

    const status_changed_at = pickLatestIso(
      lastHistByBooking.get(bid),
      booking_updated,
      row.completion_confirmed_at,
      row.traveler_confirmed_at,
      row.guardian_confirmed_at,
      row.created_at,
    );

    const requested_at = pickLatestIso(requested_start, row.created_at) || row.created_at;

    const svcName = nameByCode.get(service_code);
    const theme_fallback_title = svcName || null;

    out.set(row.id, {
      region_label_key: regionKey,
      region_display,
      theme_slug,
      theme_fallback_title,
      mood_interests: interests,
      mood_supports: supports,
      note_summary,
      request_type,
      service_code,
      requested_at,
      status_changed_at: status_changed_at || row.created_at,
    });
  }

  return out;
}

export function mergeEnrichmentWithGuardianFallback(
  row: StoredMatchRequest,
  partial: Partial<MatchRequestRowEnrichment> | undefined,
  guardian: PublicGuardian | undefined,
  fallbackCopy: { matchContext: string },
): MatchRequestRowEnrichment {
  const fb = fallbackFromGuardian(guardian);
  const status_changed_at = pickLatestIso(
    partial?.status_changed_at,
    row.completion_confirmed_at,
    row.traveler_confirmed_at,
    row.guardian_confirmed_at,
    row.created_at,
  );

  const region_label_key = partial?.region_label_key ?? fb.region_label_key;
  const region_display =
    partial?.region_display?.trim() ||
    fb.region_display ||
    (guardian?.primary_region_slug ? formatRegionSlugForDisplay(guardian.primary_region_slug) : "Seoul");

  const theme_slug = partial?.theme_slug ?? fb.theme_slug;
  const theme_fallback_title = partial?.theme_fallback_title ?? fb.theme_fallback_title;

  const mood_interests = partial?.mood_interests ?? [];
  const mood_supports = partial?.mood_supports ?? [];

  let note_summary = partial?.note_summary?.trim() || fb.note_summary;
  if (!note_summary) {
    note_summary = `${fallbackCopy.matchContext} · ${guardian?.display_name ?? row.guardian_display_name ?? "—"}`;
  }
  if (note_summary.length > 220) note_summary = `${note_summary.slice(0, 217)}…`;

  return {
    region_label_key,
    region_display: region_label_key ? "" : region_display,
    theme_slug,
    theme_fallback_title,
    mood_interests,
    mood_supports,
    note_summary,
    request_type: partial?.request_type ?? fb.request_type,
    service_code: partial?.service_code ?? null,
    requested_at: partial?.requested_at ?? row.created_at,
    status_changed_at: status_changed_at || row.created_at,
  };
}

export function matchToTimelineStatus(status: StoredMatchRequest["status"]): "requested" | "matched" | "completed" {
  if (status === "accepted") return "matched";
  if (status === "completed") return "completed";
  return "requested";
}
