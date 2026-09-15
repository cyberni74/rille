const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
  "instagr.am",
  "www.instagr.am",
]);

const PATH_RE =
  /^(?:\/[A-Za-z0-9._]+)?\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i;
const STORY_RE = /^\/stories\/([A-Za-z0-9._]+)\/(\d+)/i;
const SHARE_RE = /^\/share\/(?:reel|p|tv)?\/?([A-Za-z0-9_-]+)/i;

export type ParsedInstagramUrl = {
  canonical: string;
  shortcode?: string;
  kind: "reel" | "post" | "tv" | "story" | "share";
  username?: string;
  storyId?: string;
};

export function extractInstagramUrls(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const re =
    /https?:\/\/(?:www\.|m\.)?(?:instagram\.com|instagr\.am)\/[^\s<>"']+/gi;
  for (const match of text.match(re) ?? []) {
    const cleaned = match.replace(/[),.;]+$/g, "");
    const key = cleaned.split("?")[0]?.toLowerCase() ?? cleaned;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(cleaned);
  }
  return found;
}

export function parseInstagramUrl(raw: string): ParsedInstagramUrl | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!INSTAGRAM_HOSTS.has(host)) return null;

  const path = url.pathname.replace(/\/+$/, "") || "/";

  const story = path.match(STORY_RE);
  if (story) {
    return {
      canonical: `https://www.instagram.com/stories/${story[1]}/${story[2]}/`,
      kind: "story",
      username: story[1],
      storyId: story[2],
    };
  }

  const share = path.match(SHARE_RE);
  if (share) {
    return {
      canonical: `https://www.instagram.com${path}/`,
      kind: "share",
      shortcode: share[1],
    };
  }

  const media = path.match(PATH_RE);
  if (media) {
    const type = media[1].toLowerCase();
    const shortcode = media[2];
    const kind = type === "p" ? "post" : type === "tv" ? "tv" : "reel";
    const segment = kind === "post" ? "p" : kind === "tv" ? "tv" : "reel";
    return {
      canonical: `https://www.instagram.com/${segment}/${shortcode}/`,
      shortcode,
      kind,
    };
  }

  return null;
}

export function looksLikeInstagramUrl(raw: string): boolean {
  return parseInstagramUrl(raw) !== null;
}
