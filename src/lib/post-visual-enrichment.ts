import type { ContentPost, RouteSpot } from "@/types/domain";

/**
 * Curated Unsplash stills (license: https://unsplash.com/license) — stable photo IDs, `w` for CDN sizing.
 * Replace with self-hosted `/public/...` URLs in production if desired; mapping logic stays the same.
 */
function u(photoPath: string, w = 1400) {
  return `https://images.unsplash.com/${photoPath}?w=${w}&q=82`;
}

export const ENRICHMENT_FALLBACK_BY_REGION: Record<string, { hero: string; alt: string }> = {
  seoul: {
    hero: u("photo-1538485399081-7191377e8241"),
    alt: "서울 도심 스카이라인과 한강",
  },
  busan: {
    hero: u("photo-1596422840783-7124f7369a1f"),
    alt: "부산 해안과 도시 풍경",
  },
  jeju: {
    hero: u("photo-1476514525535-07fb3b4ae5f1"),
    alt: "제주 바다와 해안 풍경",
  },
};

const DEFAULT_FALLBACK = {
  hero: u("photo-1517154421773-0529f29ea451"),
  alt: "한국 도시 광장과 산책로",
};

type VisualRule = {
  id: string;
  terms: string[];
  weight: number;
  hero: string;
  secondary?: string;
  alt: string;
  altSecondary?: string;
};

/** Higher weight + more term hits win. Multi-term rules are checked with bonus for full match. */
const RULES: VisualRule[] = [
  {
    id: "gwanghwamun_full",
    terms: ["광화문", "경복궁", "이순신", "세종대왕", "세종로", "광장"],
    weight: 14,
    hero: u("photo-1590559899731-a382839554ff"),
    secondary: u("photo-1583839729043-783a4d1fe361"),
    alt: "광화문·도심 광장과 전통 건축",
    altSecondary: "경복궁 전각과 담장",
  },
  {
    id: "gwanghwamun_core",
    terms: ["광화문", "경복궁"],
    weight: 18,
    hero: u("photo-1590559899731-a382839554ff"),
    secondary: u("photo-1583839729043-783a4d1fe361"),
    alt: "광화문 일대 랜드마크",
    altSecondary: "궁궐 담장과 산책로",
  },
  {
    id: "sejong_statue",
    terms: ["세종대왕", "세종로", "세종"],
    weight: 15,
    hero: u("photo-1517154421773-0529f29ea451"),
    secondary: u("photo-1578469550956-0b16cdfdb495"),
    alt: "광화문광장과 넓은 산책 공간",
    altSecondary: "도심 조형물과 광장",
  },
  {
    id: "yi_sunshin",
    terms: ["이순신"],
    weight: 14,
    hero: u("photo-1578469550956-0b16cdfdb495"),
    secondary: u("photo-1590559899731-a382839554ff"),
    alt: "광장의 기준점이 되는 동상과 도심",
    altSecondary: "광화문 방향 전경",
  },
  {
    id: "gangnam_cafe",
    terms: ["강남", "카페"],
    weight: 22,
    hero: u("photo-1554118811-1e0d58224f24"),
    secondary: u("photo-1495474472287-71871a1f22fe"),
    alt: "강남 일대 카페 외관",
    altSecondary: "카페 실내 좌석과 분위기",
  },
  {
    id: "gangnam_street",
    terms: ["강남역", "강남", "테헤란로"],
    weight: 16,
    hero: u("photo-1548115184-bc6547d06a58"),
    secondary: u("photo-1512486130939-2c4f79635e84"),
    alt: "강남 도심 거리와 보행로",
    altSecondary: "강남 야경과 네온",
  },
  {
    id: "cafe_general",
    terms: ["카페", "커피", "브런치"],
    weight: 11,
    hero: u("photo-1554118811-1e0d58224f24"),
    secondary: u("photo-1495474472287-71871a1f22fe"),
    alt: "카페 외부 파사드",
    altSecondary: "카페 내부 좌석",
  },
  {
    id: "night_city",
    terms: ["야경", "야간", "밤", "네온"],
    weight: 10,
    hero: u("photo-1512486130939-2c4f79635e84"),
    secondary: u("photo-1548115184-bc6547d06a58"),
    alt: "도심 야경",
    altSecondary: "밤 거리 흐름",
  },
  {
    id: "han_river",
    terms: ["한강"],
    weight: 13,
    hero: u("photo-1507525428034-b723cf961d3e"),
    secondary: u("photo-1519046904887-71707b70f783"),
    alt: "한강 공원과 산책로",
    altSecondary: "강변 휴식 공간",
  },
  {
    id: "haeundae",
    terms: ["해운대", "부산"],
    weight: 12,
    hero: u("photo-1596422840783-7124f7369a1f"),
    secondary: u("photo-1559827260-dc66d52bef19"),
    alt: "부산 해안과 보행로",
    altSecondary: "해변가 산책",
  },
  {
    id: "market",
    terms: ["시장", "전통시장", "먹거리"],
    weight: 10,
    hero: u("photo-1555939594-58d7cb561ad1"),
    secondary: u("photo-1563013544-824ae1b704d3"),
    alt: "전통 시장과 먹거리 코너",
    altSecondary: "시장 통로",
  },
  {
    id: "subway",
    terms: ["지하철", "환승", "플랫폼", "노선"],
    weight: 11,
    hero: u("photo-1548115184-bc6547d06a58"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "도시 보행과 지하철 접근",
    altSecondary: "통로와 이동 동선",
  },
  {
    id: "underground_mall",
    terms: ["지하상가"],
    weight: 12,
    hero: u("photo-1441986300917-64674bd600d8"),
    secondary: u("photo-1548115184-bc6547d06a58"),
    alt: "지하 상가와 안내 동선",
    altSecondary: "역·상가 연결 통로",
  },
  {
    id: "convenience_tmoney",
    terms: ["편의점", "교통카드"],
    weight: 14,
    hero: u("photo-1565680018434-b723cf961d3e"),
    secondary: u("photo-1604719314756-9048b615390b"),
    alt: "편의점·매장 계산대",
    altSecondary: "간단 식사·간식 코너",
  },
  {
    id: "kiosk_charge",
    terms: ["키오스크", "충전"],
    weight: 13,
    hero: u("photo-1565680018434-b723cf961d3e"),
    secondary: u("photo-1441986300917-64674bd600d8"),
    alt: "키오스크·셀프 결제",
    altSecondary: "매장 내부 동선",
  },
  {
    id: "meet_exit",
    terms: ["만남", "출구"],
    weight: 13,
    hero: u("photo-1469854523086-cc02fe5d8800"),
    secondary: u("photo-1517154421773-0529f29ea451"),
    alt: "역·광장 출구와 만남 장소",
    altSecondary: "눈에 띄는 광장과 기준점",
  },
  {
    id: "food_queue",
    terms: ["식사", "웨이팅"],
    weight: 12,
    hero: u("photo-1555939594-58d7cb561ad1"),
    secondary: u("photo-1604719314756-9048b615390b"),
    alt: "식당·먹거리 거리",
    altSecondary: "테이블과 주문",
  },
  {
    id: "takeout",
    terms: ["테이크아웃", "포장"],
    weight: 11,
    hero: u("photo-1604719314756-9048b615390b"),
    secondary: u("photo-1555939594-58d7cb561ad1"),
    alt: "테이크아웃·간편 식사",
    altSecondary: "먹거리 코너",
  },
  {
    id: "rain_cafe",
    terms: ["비 오는", "카페"],
    weight: 13,
    hero: u("photo-1501339849922-c21129a094ea"),
    secondary: u("photo-1495474472287-71871a1f22fe"),
    alt: "비 오는 날 창가",
    altSecondary: "카페 실내 좌석",
  },
  {
    id: "family_kids",
    terms: ["가족", "아이"],
    weight: 11,
    hero: u("photo-1519046904887-71707b70f783"),
    secondary: u("photo-1507525428034-b723cf961d3e"),
    alt: "공원·휴게와 산책",
    altSecondary: "한강·넓은 보행 공간",
  },
  {
    id: "airport_first",
    terms: ["공항", "리무진"],
    weight: 13,
    hero: u("photo-1469854523086-cc02fe5d8800"),
    secondary: u("photo-1528164344705-47542687000d"),
    alt: "이동·교통 허브",
    altSecondary: "도시 접근로",
  },
  {
    id: "hanbok",
    terms: ["한복", "대여"],
    weight: 12,
    hero: u("photo-1583839729043-783a4d1fe361"),
    secondary: u("photo-1566988102596-43bb7b84db8f"),
    alt: "전통 건축과 산책로",
    altSecondary: "골목과 한옥",
  },
  {
    id: "kbeauty_kpop",
    terms: ["k뷰티", "k-pop", "굿즈", "앨범"],
    weight: 12,
    hero: u("photo-1441986300917-64674bd600d8"),
    secondary: u("photo-1604719314756-9048b615390b"),
    alt: "쇼핑·매장 동선",
    altSecondary: "제품과 진열",
  },
  {
    id: "filming_spot",
    terms: ["촬영지", "팬덤"],
    weight: 11,
    hero: u("photo-1554118811-1e0d58224f24"),
    secondary: u("photo-1495474472287-71871a1f22fe"),
    alt: "카페·촬영지 인근",
    altSecondary: "실내 휴식",
  },
  {
    id: "popup_event",
    terms: ["팝업", "전시"],
    weight: 11,
    hero: u("photo-1441986300917-64674bd600d8"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "전시·이벤트 공간",
    altSecondary: "도보 접근",
  },
  {
    id: "seafood_order",
    terms: ["해산물", "시푸드"],
    weight: 11,
    hero: u("photo-1555939594-58d7cb561ad1"),
    secondary: u("photo-1563013544-824ae1b704d3"),
    alt: "시장·해산물 코너",
    altSecondary: "먹거리 통로",
  },
  {
    id: "palace_stroll",
    terms: ["궁궐", "산책"],
    weight: 12,
    hero: u("photo-1583839729043-783a4d1fe361"),
    secondary: u("photo-1517154421773-0529f29ea451"),
    alt: "궁궐·담장 산책",
    altSecondary: "광장과 휴게",
  },
  {
    id: "taxi_app",
    terms: ["호출앱", "택시"],
    weight: 12,
    hero: u("photo-1512486130939-2c4f79635e84"),
    secondary: u("photo-1548115184-bc6547d06a58"),
    alt: "야간 도로와 승차",
    altSecondary: "도심 거리",
  },
  {
    id: "taxi_night",
    terms: ["택시", "야간"],
    weight: 12,
    hero: u("photo-1512486130939-2c4f79635e84"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "밤 이동과 조명",
    altSecondary: "횡단·보행",
  },
  {
    id: "parking_walk",
    terms: ["주차", "도보"],
    weight: 10,
    hero: u("photo-1548115184-bc6547d06a58"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "도심 도보 동선",
    altSecondary: "거리와 접근",
  },
  {
    id: "translate_comm",
    terms: ["번역", "소통"],
    weight: 11,
    hero: u("photo-1495474472287-71871a1f22fe"),
    secondary: u("photo-1554118811-1e0d58224f24"),
    alt: "대화·휴식 공간",
    altSecondary: "카페 테이블",
  },
  {
    id: "photo_manner",
    terms: ["사진", "예절"],
    weight: 11,
    hero: u("photo-1566988102596-43bb7b84db8f"),
    secondary: u("photo-1583839729043-783a4d1fe361"),
    alt: "골목·보행과 촬영 매너",
    altSecondary: "전통 배경",
  },
  {
    id: "battery_data",
    terms: ["배터리", "데이터"],
    weight: 10,
    hero: u("photo-1495474472287-71871a1f22fe"),
    secondary: u("photo-1554118811-1e0d58224f24"),
    alt: "카페에서 충전·휴식",
    altSecondary: "실내 좌석",
  },
  {
    id: "locker_luggage",
    terms: ["라커", "짐"],
    weight: 11,
    hero: u("photo-1441986300917-64674bd600d8"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "역·몰 수하물 동선",
    altSecondary: "보행과 안내",
  },
  {
    id: "hotel_station",
    terms: ["숙소", "도보"],
    weight: 10,
    hero: u("photo-1469854523086-cc02fe5d8800"),
    secondary: u("photo-1548115184-bc6547d06a58"),
    alt: "역에서 숙소까지 보행",
    altSecondary: "도심 길",
  },
  {
    id: "convenience_meal",
    terms: ["편의점", "도시락"],
    weight: 12,
    hero: u("photo-1565680018434-b723cf961d3e"),
    secondary: u("photo-1604719314756-9048b615390b"),
    alt: "편의점 간편 식사",
    altSecondary: "포장·취식 공간",
  },
  {
    id: "dessert_cafe",
    terms: ["디저트", "카페인"],
    weight: 11,
    hero: u("photo-1604719314756-9048b615390b"),
    secondary: u("photo-1495474472287-71871a1f22fe"),
    alt: "디저트·음료",
    altSecondary: "카페 실내",
  },
  {
    id: "view_safety",
    terms: ["전망", "난간"],
    weight: 11,
    hero: u("photo-1506905925346-21bda4d32df4"),
    secondary: u("photo-1512486130939-2c4f79635e84"),
    alt: "전망과 바람",
    altSecondary: "야간 조망",
  },
  {
    id: "souvenir_pack",
    terms: ["기념품", "포장"],
    weight: 10,
    hero: u("photo-1441986300917-64674bd600d8"),
    secondary: u("photo-1604719314756-9048b615390b"),
    alt: "쇼핑·기념품",
    altSecondary: "매장 카운터",
  },
  {
    id: "companion_trust",
    terms: ["동행", "커뮤니케이션"],
    weight: 11,
    hero: u("photo-1517154421773-0529f29ea451"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "만남·광장과 동선",
    altSecondary: "함께 걷는 도심",
  },
  {
    id: "plan_b",
    terms: ["플랜", "대체"],
    weight: 9,
    hero: u("photo-1507525428034-b723cf961d3e"),
    secondary: u("photo-1519046904887-71707b70f783"),
    alt: "대체 코스·야외",
    altSecondary: "휴식 공간",
  },
  {
    id: "night_market",
    terms: ["야시장", "혼잡"],
    weight: 12,
    hero: u("photo-1512486130939-2c4f79635e84"),
    secondary: u("photo-1555939594-58d7cb561ad1"),
    alt: "야시장·밀집 행사",
    altSecondary: "먹거리 조명",
  },
  {
    id: "morning_meet",
    terms: ["아침", "첫차"],
    weight: 11,
    hero: u("photo-1517154421773-0529f29ea451"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "이른 아침 광장·역",
    altSecondary: "한산한 보행로",
  },
  {
    id: "walk_manner",
    terms: ["천천히", "비키기"],
    weight: 10,
    hero: u("photo-1469854523086-cc02fe5d8800"),
    secondary: u("photo-1548115184-bc6547d06a58"),
    alt: "보행 매너·도심 길",
    altSecondary: "사람 많은 거리",
  },
  {
    id: "map_offline",
    terms: ["지도", "오프라인"],
    weight: 10,
    hero: u("photo-1495474472287-71871a1f22fe"),
    secondary: u("photo-1554118811-1e0d58224f24"),
    alt: "지도 확인·휴식",
    altSecondary: "카페 테이블",
  },
  {
    id: "stairs_hill",
    terms: ["계단", "언덕"],
    weight: 10,
    hero: u("photo-1566988102596-43bb7b84db8f"),
    secondary: u("photo-1469854523086-cc02fe5d8800"),
    alt: "언덕·골목 보행",
    altSecondary: "도심 길",
  },
  {
    id: "restroom_water",
    terms: ["화장실", "물"],
    weight: 10,
    hero: u("photo-1519046904887-71707b70f783"),
    secondary: u("photo-1507525428034-b723cf961d3e"),
    alt: "공원·휴게 시설",
    altSecondary: "산책로",
  },
  {
    id: "exhibition_camera",
    terms: ["전시", "플래시"],
    weight: 10,
    hero: u("photo-1441986300917-64674bd600d8"),
    secondary: u("photo-1566988102596-43bb7b84db8f"),
    alt: "전시·실내 공간",
    altSecondary: "관람 동선",
  },
  {
    id: "recommend_region",
    terms: ["추천", "지역"],
    weight: 8,
    hero: u("photo-1538485399081-7191377e8241"),
    secondary: u("photo-1517154421773-0529f29ea451"),
    alt: "서울·도심 둘러보기",
    altSecondary: "광장과 산책",
  },
  {
    id: "bukchon_alley",
    terms: ["북촌", "골목", "한옥"],
    weight: 12,
    hero: u("photo-1566988102596-43bb7b84db8f"),
    secondary: u("photo-1583839729043-783a4d1fe361"),
    alt: "골목과 보행로",
    altSecondary: "전통 건축과 담장",
  },
  {
    id: "shopping_tax",
    terms: ["면세", "환급", "쇼핑"],
    weight: 9,
    hero: u("photo-1441986300917-64674bd600d8"),
    secondary: u("photo-1604719314756-9048b615390b"),
    alt: "쇼핑 공간과 동선",
    altSecondary: "매장·아케이드 내부",
  },
  {
    id: "rain_indoor",
    terms: ["우천", "비 오는", "실내"],
    weight: 9,
    hero: u("photo-1501339849922-c21129a094ea"),
    secondary: u("photo-1495474472287-71871a1f22fe"),
    alt: "창가와 실내 휴식",
    altSecondary: "카페 실내",
  },
];

function buildHaystack(post: ContentPost): string {
  const parts = [
    post.title,
    post.summary,
    post.body,
    post.tags.join(" "),
    post.region_slug,
    post.category_slug,
    post.kind,
  ];
  if (post.route_journey?.spots.length) {
    for (const s of post.route_journey.spots) {
      parts.push(
        s.title,
        s.place_name,
        s.address_line ?? "",
        s.short_description,
        s.body,
        s.recommend_reason,
      );
    }
  }
  return parts.join(" ").toLowerCase();
}

function scoreRule(haystack: string, rule: VisualRule): number {
  const matched = rule.terms.filter((t) => haystack.includes(t.toLowerCase()));
  if (matched.length === 0) return 0;
  const fullBonus = matched.length === rule.terms.length ? 6 : 0;
  return rule.weight * matched.length + fullBonus;
}

export type EnrichedPostVisual = {
  heroUrl: string;
  secondaryUrl?: string;
  alt: string;
  altSecondary?: string;
  ruleId: string;
};

export function resolveEnrichedPostVisuals(post: ContentPost): EnrichedPostVisual {
  const haystack = buildHaystack(post);
  let best: { rule: VisualRule; score: number } | null = null;
  for (const rule of RULES) {
    const s = scoreRule(haystack, rule);
    if (s <= 0) continue;
    if (!best || s > best.score) best = { rule, score: s };
  }
  if (best) {
    return {
      heroUrl: best.rule.hero,
      secondaryUrl: best.rule.secondary,
      alt: best.rule.alt,
      altSecondary: best.rule.altSecondary,
      ruleId: best.rule.id,
    };
  }
  const fb = ENRICHMENT_FALLBACK_BY_REGION[post.region_slug] ?? DEFAULT_FALLBACK;
  return {
    heroUrl: fb.hero,
    alt: fb.alt,
    ruleId: `region:${post.region_slug}`,
  };
}

function spotHaystack(spot: RouteSpot, post: ContentPost): string {
  return [
    spot.title,
    spot.place_name,
    spot.address_line ?? "",
    spot.short_description,
    spot.body,
    post.title,
    post.summary,
    post.tags.join(" "),
    post.region_slug,
  ]
    .join(" ")
    .toLowerCase();
}

/** When a route spot has no uploads, pick a still aligned with spot + post text. */
export function resolveEnrichedSpotVisual(spot: RouteSpot, post: ContentPost): EnrichedPostVisual {
  const haystack = spotHaystack(spot, post);
  let best: { rule: VisualRule; score: number } | null = null;
  for (const rule of RULES) {
    const s = scoreRule(haystack, rule);
    if (s <= 0) continue;
    if (!best || s > best.score) best = { rule, score: s };
  }
  if (best) {
    return {
      heroUrl: best.rule.hero,
      secondaryUrl: best.rule.secondary,
      alt: `${spot.place_name} — ${best.rule.alt}`,
      altSecondary: best.rule.altSecondary,
      ruleId: best.rule.id,
    };
  }
  const fb = ENRICHMENT_FALLBACK_BY_REGION[post.region_slug] ?? DEFAULT_FALLBACK;
  return {
    heroUrl: fb.hero,
    alt: `${spot.place_name} — ${fb.alt}`,
    ruleId: `region:${post.region_slug}`,
  };
}
