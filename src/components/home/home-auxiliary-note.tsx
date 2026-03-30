import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 홈 보조 노트(Auxiliary note) — 본문/CTA를 대체하지 않는 보조 설명·경계 안내.
 *
 * ## 역할 (디자인 시스템 관점)
 * - **Primary UI가 아님**: 법적 필수 고지 전용 컴포넌트가 아니라, 스코프·프로세스 등을 가볍게 보완한다.
 * - **위계**: 히어로는 `HomeAuxiliaryNoteHero`, 라이트 플로우(카드 아래 등)는 `HomeAuxiliaryNoteSection`.
 *
 * ## 재사용 범위
 * - `HomeAuxiliaryNoteHero`: **히어로 다크 그라데이션/이미지 위**에서만 사용. 다른 섹션에 재사용하지 않는다.
 * - `HomeAuxiliaryNoteSection`: **라이트 배경**의 섹션 하단·카드 직후 등. 퀵스타트 `processClarity`와 동일 리듬이 필요할 때만 추가한다.
 *
 * ## 히어로 secondary(예: scopeNoteDetail) 모바일 정책
 * - 기본값 `secondaryFromSm === true`: **&lt; sm에서 부 문구는 시각적으로 숨김** — 세로 밀도·히어로 리듬 유지.
 * - 주(`primary`) 한 줄로 서비스 성격은 항상 노출된다.
 * - **정책 판단**: 현재 스코프 부 문구는 법적 필수 고지 수준이 아니라 “제외 범위·확인” 안내로 두고, 모바일 생략을 허용한다.
 * - **예외가 필요하면**: `secondaryFromSm={false}`로 부 문구를 모든 뷰포트에서 표시하거나, 약관/소개 페이지 링크(히어로 내 기존 링크 등)로 상세를 넘긴다. (“더 보기” 접기 UI는 필요 시 별도 디자인 과제.)
 * - 접근성: `hidden sm:block`은 시각적 숨김과 동시에 일부 AT에서 부가 노출이 약해질 수 있다. 필수 고지로 격상 시 `secondaryFromSm={false}` 또는 별도 고지 흐름을 권장한다.
 *
 * ## 토큰화 후보 (장기, globals / tailwind theme)
 * - 히어로 주:`text-white/52` → 예: `--home-hero-note-primary-fg`
 * - 히어로 부:`text-white/38` → 예: `--home-hero-note-secondary-fg`
 * - 섹션: `text-muted-foreground` + `border-border/50`는 기존 시맨틱 토큰과 정렬 가능
 * 당장 변수 추출은 하지 않고, 톤 변경 시 이 파일 한곳을 먼저 수정한다.
 */
const heroPrimaryText =
  "text-[10px] leading-snug text-white/52 sm:text-[11px]";
const heroSecondaryText =
  "text-[10px] leading-snug text-white/38 sm:text-[11px]";

/**
 * 홈 히어로 전용 — 다크 배경 위 스코프 안내(주) + 제외·확인(부).
 * @param secondaryFromSm `true`(기본): 부 노트는 `sm` 이상에서만 표시. `false`: 모든 뷰포트에서 표시.
 */
export function HomeAuxiliaryNoteHero({
  primary,
  secondary,
  secondaryFromSm = true,
  className,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  secondaryFromSm?: boolean;
  className?: string;
}) {
  const showSecondary = secondary != null && secondary !== "";
  return (
    <div className={cn("max-w-md space-y-1", className)} role="note">
      <p className={heroPrimaryText}>{primary}</p>
      {showSecondary ? (
        <p className={cn(heroSecondaryText, secondaryFromSm && "hidden sm:block")}>{secondary}</p>
      ) : null}
    </div>
  );
}

/**
 * 라이트 섹션용 — 프로세스·흐름 등 한 덩어리 보조 노트(왼쪽 액센트 보더).
 * 히어로 다크 배경에는 사용하지 않는다.
 */
export function HomeAuxiliaryNoteSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-muted-foreground mt-6 max-w-3xl border-border/50 border-l-2 pl-3 text-xs leading-relaxed sm:mt-7 sm:pl-3.5 sm:text-[13px]",
        className,
      )}
      role="note"
    >
      {children}
    </p>
  );
}
