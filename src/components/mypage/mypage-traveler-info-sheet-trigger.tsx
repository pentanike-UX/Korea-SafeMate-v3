"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MypageTravelerInfoSheetTrigger({
  travelerId,
  matchId,
  triggerLabel = "여행자 정보",
}: {
  travelerId: string;
  matchId: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"right" | "bottom">("bottom");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setSide(mq.matches ? "right" : "bottom");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <SheetContent side={side} className={side === "right" ? "sm:max-w-md" : "max-h-[86vh] rounded-t-2xl"}>
        <SheetHeader>
          <SheetTitle>여행자 요청 상세</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">Traveler ID</p>
            <p className="font-mono text-sm break-all">{travelerId}</p>
          </div>
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">Match ID</p>
            <p className="font-mono text-xs break-all">{matchId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">요청 맥락 유지</Badge>
            <Badge variant="secondary">시트 닫기 시 목록 복귀</Badge>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
