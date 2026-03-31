import type { ContentPost } from "@/types/domain";
import {
  FILL_IMAGE_POST_HERO_SCENE,
  FILL_IMAGE_POST_HERO_SUBJECT,
  FILL_IMAGE_POST_LIST_SCENE,
  FILL_IMAGE_POST_LIST_SUBJECT,
  FILL_IMAGE_POST_THUMB_SQUARE,
  FILL_IMAGE_ROUTE_SPOT_SCENE,
  FILL_IMAGE_ROUTE_SPOT_SUBJECT,
} from "@/lib/ui/fill-image";

/** 인물·콘텐츠 팬덤에 가까운 포스트 — 히어로/시트에서 얼굴·상체 우선 */
const SUBJECT_FORWARD_KINDS: ContentPost["kind"][] = ["k_content", "hot_place", "food"];

export function postUsesSubjectForwardCrop(kind: ContentPost["kind"]): boolean {
  return SUBJECT_FORWARD_KINDS.includes(kind);
}

/** 포스트 상세·시트 상단 와이드 히어로 */
export function postHeroCoverClass(post: Pick<ContentPost, "kind">): string {
  return postUsesSubjectForwardCrop(post.kind) ? FILL_IMAGE_POST_HERO_SUBJECT : FILL_IMAGE_POST_HERO_SCENE;
}

/** 포스트 목록·라우트 카드 16:10 영역 */
export function postListCardCoverClass(post: Pick<ContentPost, "kind">): string {
  return postUsesSubjectForwardCrop(post.kind) ? FILL_IMAGE_POST_LIST_SUBJECT : FILL_IMAGE_POST_LIST_SCENE;
}

/** 탐색·시트 등 작은 직사각/정사각 썸네일 */
export function postCompactThumbCoverClass(post: Pick<ContentPost, "kind">): string {
  return postUsesSubjectForwardCrop(post.kind)
    ? "h-full w-full object-cover object-[center_32%]"
    : "h-full w-full object-cover object-[center_48%]";
}

/** 루트 포스트 스팟 본문 이미지 — 장소 vs 인물 섞임 */
export function routeSpotImageCoverClass(post: Pick<ContentPost, "kind">): string {
  return postUsesSubjectForwardCrop(post.kind) ? FILL_IMAGE_ROUTE_SPOT_SUBJECT : FILL_IMAGE_ROUTE_SPOT_SCENE;
}

/** 시트 리스트 썸네일 — kind 없으면 정사각 혼합 기본 */
export function sheetRelatedPostThumbCoverClass(kind?: ContentPost["kind"]): string {
  return kind != null ? postCompactThumbCoverClass({ kind }) : FILL_IMAGE_POST_THUMB_SQUARE;
}
