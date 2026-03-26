"use client";

import { useTranslations } from "next-intl";
import { POST_SAMPLE_BADGE_CLASS } from "@/components/posts/post-sample-constants";

export function PostSampleBadge({ className }: { className?: string }) {
  const t = useTranslations("Posts");
  return (
    <span className={className ? `${POST_SAMPLE_BADGE_CLASS} ${className}` : POST_SAMPLE_BADGE_CLASS} title={t("sampleBadgeAria")}>
      {t("sampleBadge")}
    </span>
  );
}
