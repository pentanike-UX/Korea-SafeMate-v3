"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AttentionMenuKey, MypageHubAttentionView, MypageHubSnapshot } from "@/types/mypage-hub";
import { GUARDIAN_WORKSPACE_NAV_BADGE_KEYS, TRAVELER_NAV_BADGE_KEYS } from "@/types/mypage-hub";
import { computeMypageAttentionViewFromSnapshot } from "@/lib/mypage-attention-unread";
import { sameOriginApiUrl } from "@/lib/api-origin";

const STORAGE_PREFIX = "safemate-mypage-attention-seen-v1";

function storageKey(userId: string | null, menuKey: AttentionMenuKey) {
  return `${STORAGE_PREFIX}:${userId ?? "anon"}:${menuKey}`;
}

function menuFromPathname(pathname: string): AttentionMenuKey | null {
  if (pathname === "/mypage" || pathname === "/mypage/") return "navOverview";
  if (pathname.startsWith("/mypage/journeys")) return "navJourneys";
  if (pathname.startsWith("/mypage/profile")) return "navProfile";
  if (pathname.startsWith("/mypage/points")) return "navPoints";
  if (pathname.startsWith("/mypage/matches")) return "navMatches";
  if (pathname.startsWith("/mypage/guardian/profile")) return "guardianNavProfile";
  if (pathname.startsWith("/mypage/guardian/posts/new")) return "guardianNavNewPost";
  if (pathname.startsWith("/mypage/guardian/posts")) return "guardianNavPosts";
  if (pathname.startsWith("/mypage/guardian/matches")) return "guardianNavMatches";
  return null;
}

function loadSeenMapFromLocalLegacy(userId: string | null): Partial<Record<AttentionMenuKey, string>> {
  if (typeof window === "undefined") return {};
  const out: Partial<Record<AttentionMenuKey, string>> = {};
  const keys: AttentionMenuKey[] = [...TRAVELER_NAV_BADGE_KEYS, ...GUARDIAN_WORKSPACE_NAV_BADGE_KEYS];
  for (const k of keys) {
    const v = window.localStorage.getItem(storageKey(userId, k));
    if (v) out[k] = v;
  }
  return out;
}

async function postAttentionSeen(menuKey: AttentionMenuKey, signature: string) {
  await fetch(sameOriginApiUrl("/api/account/attention-seen"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menuKey, signature }),
  });
}

export function useMypageAttentionView(
  snapshot: MypageHubSnapshot,
  pathname: string,
  userId: string | null,
): MypageHubAttentionView {
  const [seenMap, setSeenMap] = useState<Partial<Record<AttentionMenuKey, string>>>({});
  const prevMenuRef = useRef<AttentionMenuKey | null>(null);

  const signatures = useMemo(
    () => ({ ...snapshot.travelerNavSignatures, ...snapshot.guardianWorkspaceNavSignatures }),
    [snapshot],
  );
  const currentMenu = useMemo(() => menuFromPathname(pathname), [pathname]);

  useEffect(() => {
    if (!userId) {
      setSeenMap({});
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(sameOriginApiUrl("/api/account/attention-seen"), { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { seen?: Partial<Record<AttentionMenuKey, string>> };
        let next: Partial<Record<AttentionMenuKey, string>> = { ...(data.seen ?? {}) };

        const legacy = loadSeenMapFromLocalLegacy(userId);
        const allKeys = [...TRAVELER_NAV_BADGE_KEYS, ...GUARDIAN_WORKSPACE_NAV_BADGE_KEYS];
        for (const k of allKeys) {
          const v = legacy[k];
          if (v && !next[k]) {
            next = { ...next, [k]: v };
            void postAttentionSeen(k, v);
          }
        }

        if (!cancelled) setSeenMap(next);
      } catch {
        if (!cancelled) setSeenMap({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const prev = prevMenuRef.current;
    if (prev && prev !== currentMenu) {
      const sig = signatures[prev];
      if (sig) {
        void postAttentionSeen(prev, sig);
        setSeenMap((old) => ({ ...old, [prev]: sig }));
      }
    }
    prevMenuRef.current = currentMenu;
    return () => {
      const leaving = prevMenuRef.current;
      if (!leaving || !userId) return;
      const sig = signatures[leaving];
      if (!sig) return;
      void postAttentionSeen(leaving, sig);
      setSeenMap((old) => ({ ...old, [leaving]: sig }));
    };
  }, [currentMenu, signatures, userId]);

  return useMemo(() => computeMypageAttentionViewFromSnapshot(snapshot, seenMap), [snapshot, seenMap]);
}
