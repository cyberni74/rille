import { create } from "zustand";
import type { QualityPref } from "@/lib/platform";

type PlatformState = {
  quality: QualityPref;
  setQuality: (quality: QualityPref) => void;
};

export const usePlatform = create<PlatformState>((set) => ({
  quality: "original",
  setQuality: (quality) => set({ quality }),
}));
