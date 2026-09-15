import { extractInstagramUrls, parseInstagramUrl } from "./instagram/parse-url";
import { extractYoutubeUrls, parseYoutubeUrl } from "./youtube/parse-url";
import { extractTiktokUrls, parseTiktokUrl, tiktokDedupeKey } from "./tiktok/parse-url";
import type { PlatformId } from "./platform";

export type MediaSourceKind = "instagram" | "youtube" | "short" | "tiktok";

export function extractMediaUrls(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  for (const url of [
    ...extractInstagramUrls(text),
    ...extractYoutubeUrls(text),
    ...extractTiktokUrls(text),
  ]) {
    const key = mediaDedupeKey(url);
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(url);
  }
  return found;
}

export function canonicalMediaUrl(raw: string): string | null {
  const tt = parseTiktokUrl(raw);
  if (tt) return tt.canonical;
  const yt = parseYoutubeUrl(raw);
  if (yt) return yt.canonical;
  const ig = parseInstagramUrl(raw);
  if (ig) return ig.canonical;
  return null;
}

export function mediaDedupeKey(raw: string): string {
  const tt = parseTiktokUrl(raw);
  if (tt) return tiktokDedupeKey(tt);
  const yt = parseYoutubeUrl(raw);
  if (yt) return `yt:${yt.videoId}`;
  const ig = parseInstagramUrl(raw);
  if (ig) return `ig:${(ig.shortcode ?? ig.canonical).toLowerCase()}`;
  return raw.trim().toLowerCase();
}

export function mediaSourceKind(raw: string): MediaSourceKind | null {
  if (parseTiktokUrl(raw)) return "tiktok";
  const yt = parseYoutubeUrl(raw);
  if (yt) return yt.kind === "short" ? "short" : "youtube";
  if (parseInstagramUrl(raw)) return "instagram";
  return null;
}

export function platformForUrl(raw: string): PlatformId | null {
  const kind = mediaSourceKind(raw);
  if (kind === "tiktok") return "tiktok";
  if (kind === "youtube" || kind === "short") return "youtube";
  if (kind === "instagram") return "instagram";
  return null;
}

export function isSupportedMediaUrl(raw: string): boolean {
  return canonicalMediaUrl(raw) !== null;
}
