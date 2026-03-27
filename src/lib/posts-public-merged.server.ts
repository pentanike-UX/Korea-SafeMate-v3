import { cache } from "react";
import { mockContentPosts } from "@/data/mock";
import { postHasRouteJourney } from "@/lib/content-post-route";
import type { ContentPost, ContentPostKind, ContentPostStatus } from "@/types/domain";
import type { RouteJourney } from "@/types/domain";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

type RawPost = {
  id: string;
  author_user_id: string;
  region_id: string;
  category_id: string;
  kind: string;
  title: string;
  summary: string | null;
  body: string;
  tags: string[];
  status: string;
  created_at: string;
  usefulness_votes: number;
  helpful_rating: number | null;
  popular_score: number;
  recommended_score: number;
  featured: boolean;
  post_format: string | null;
  cover_image_url: string | null;
  route_journey: RouteJourney | null;
  route_highlights: unknown;
};

function mapToContentPost(
  row: RawPost,
  region_slug: string,
  category_slug: string,
  author_display_name: string,
): ContentPost {
  const highlights = Array.isArray(row.route_highlights)
    ? row.route_highlights.filter((x): x is string => typeof x === "string")
    : [];
  const rj = row.route_journey ?? undefined;
  return {
    id: row.id,
    author_user_id: row.author_user_id,
    author_display_name,
    region_slug,
    category_slug,
    kind: row.kind as ContentPostKind,
    title: row.title,
    body: row.body,
    summary: row.summary ?? "",
    status: row.status as ContentPostStatus,
    created_at: row.created_at,
    tags: row.tags ?? [],
    usefulness_votes: row.usefulness_votes,
    helpful_rating: row.helpful_rating,
    popular_score: row.popular_score,
    recommended_score: row.recommended_score,
    featured: row.featured,
    post_format: row.post_format as ContentPost["post_format"],
    cover_image_url: row.cover_image_url,
    route_journey: rj,
    route_highlights: highlights,
    is_sample: false,
    has_route: Boolean(rj?.spots?.length),
  };
}

async function mapRowsToPosts(rows: RawPost[]): Promise<ContentPost[]> {
  const sb = createServiceRoleSupabase();
  if (!sb || rows.length === 0) return [];

  const regionIds = [...new Set(rows.map((r) => r.region_id))];
  const categoryIds = [...new Set(rows.map((r) => r.category_id))];
  const authorIds = [...new Set(rows.map((r) => r.author_user_id))];

  const [{ data: regions }, { data: categories }, { data: guardians }] = await Promise.all([
    sb.from("regions").select("id, slug").in("id", regionIds),
    sb.from("content_categories").select("id, slug").in("id", categoryIds),
    sb.from("guardian_profiles").select("user_id, display_name").in("user_id", authorIds),
  ]);

  const regionSlug = new Map((regions ?? []).map((r) => [r.id, r.slug as string]));
  const categorySlug = new Map((categories ?? []).map((c) => [c.id, c.slug as string]));
  const authorName = new Map((guardians ?? []).map((g) => [g.user_id, g.display_name as string]));

  const out: ContentPost[] = [];
  for (const row of rows) {
    const rs = regionSlug.get(row.region_id);
    const cs = categorySlug.get(row.category_id);
    if (!rs || !cs) continue;
    out.push(
      mapToContentPost(row, rs, cs, authorName.get(row.author_user_id)?.trim() || "Guardian"),
    );
  }
  return out;
}

/** 승인된 퍼블릭 포스트 — DB + 시드 mock 병합(동일 id는 DB 우선) */
export const listApprovedPostsMerged = cache(async (): Promise<ContentPost[]> => {
  const sb = createServiceRoleSupabase();
  const mockApproved = mockContentPosts.filter((p) => p.status === "approved");
  if (!sb) return mockApproved;

  const { data: rows, error } = await sb
    .from("content_posts")
    .select("*")
    .eq("status", "approved")
    .order("recommended_score", { ascending: false })
    .limit(400);

  if (error) {
    console.error("[listApprovedPostsMerged]", error);
    return mockApproved;
  }

  const dbPosts = await mapRowsToPosts((rows ?? []) as RawPost[]);
  const dbIds = new Set(dbPosts.map((p) => p.id));
  const mockOnly = mockApproved.filter((m) => !dbIds.has(m.id));
  return [...dbPosts, ...mockOnly].sort((a, b) => {
    if (b.recommended_score !== a.recommended_score) return b.recommended_score - a.recommended_score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});

export async function getPublicPostByIdMerged(id: string): Promise<ContentPost | null> {
  const sb = createServiceRoleSupabase();
  if (sb) {
    const { data: row, error } = await sb.from("content_posts").select("*").eq("id", id).eq("status", "approved").maybeSingle();
    if (!error && row) {
      const mapped = await mapRowsToPosts([row as RawPost]);
      if (mapped[0]) return mapped[0];
    }
  }
  const mock = mockContentPosts.find((x) => x.id === id);
  return mock && mock.status === "approved" ? mock : null;
}

export async function listApprovedRoutePostsMerged(): Promise<ContentPost[]> {
  const all = await listApprovedPostsMerged();
  return all.filter((p) => postHasRouteJourney(p));
}

export async function listPostsForGuardianMerged(authorUserId: string): Promise<ContentPost[]> {
  const all = await listApprovedPostsMerged();
  return all.filter((p) => p.author_user_id === authorUserId);
}

export async function relatedPostsForMerged(current: ContentPost, limit = 4): Promise<ContentPost[]> {
  const all = await listApprovedPostsMerged();
  return all
    .filter((p) => p.id !== current.id)
    .filter((p) => p.region_slug === current.region_slug || p.category_slug === current.category_slug)
    .sort((a, b) => b.recommended_score - a.recommended_score)
    .slice(0, limit);
}
