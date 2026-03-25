"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppAccountRole } from "@/lib/auth/app-role";
import type { GuardianProfileStatus } from "@/lib/auth/guardian-profile-status";

export type MypageHubContextValue = {
  appRole: AppAccountRole;
  guardianStatus: GuardianProfileStatus;
};

const MypageHubContext = createContext<MypageHubContextValue | null>(null);

export function MypageHubProvider({ value, children }: { value: MypageHubContextValue; children: ReactNode }) {
  return <MypageHubContext.Provider value={value}>{children}</MypageHubContext.Provider>;
}

export function useMypageHubContext(): MypageHubContextValue | null {
  return useContext(MypageHubContext);
}
