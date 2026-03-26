import type { ContentPost } from "@/types/domain";
import { getGuardianSeedBundle } from "./guardian-seed-bundle";
import { applyServiceSampleOverlay } from "./service-sample-overlay";

/** 포스트 목록 — 시드 생성 후 짝수 슬롯에 서비스 소개용 샘플(`is_sample`)을 덮어씁니다. */
export const mockContentPosts: ContentPost[] = applyServiceSampleOverlay(getGuardianSeedBundle().posts);
