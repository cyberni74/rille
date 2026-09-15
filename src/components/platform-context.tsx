import { createContext, useContext, type ReactNode } from "react";
import type { PlatformId } from "@/lib/platform";

const PlatformContext = createContext<PlatformId>("instagram");

export function PlatformProvider({
  platform,
  children,
}: {
  platform: PlatformId;
  children: ReactNode;
}) {
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}

export function useActivePlatform() {
  return useContext(PlatformContext);
}
