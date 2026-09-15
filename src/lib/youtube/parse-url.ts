const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export type ParsedYoutubeUrl = {
  canonical: string;
  watchUrl: string;
  videoId: string;
  kind: "video" | "short";
};

export function extractYoutubeUrls(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const re =
    /https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\/[^\s<>"']+/gi;
  for (const match of text.match(re) ?? []) {
    const cleaned = match.replace(/[),.;]+$/g, "");
    const parsed = parseYoutubeUrl(cleaned);
    const key = parsed ? `yt:${parsed.videoId}` : (cleaned.split("?")[0]?.toLowerCase() ?? cleaned);
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(cleaned);
  }
  return found;
}

export function parseYoutubeUrl(raw: string): ParsedYoutubeUrl | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  const path = url.pathname.replace(/\/+$/, "") || "/";
  let videoId = "";
  let kind: "video" | "short" = "video";

  if (host === "youtu.be" || host === "www.youtu.be") {
    videoId = path.slice(1).split("/")[0] ?? "";
  } else {
    const shorts = path.match(/^\/shorts\/([A-Za-z0-9_-]{11})/i);
    const embed = path.match(/^\/(?:embed|live|v)\/([A-Za-z0-9_-]{11})/i);
    const fromQuery = url.searchParams.get("v") ?? "";
    if (shorts) {
      videoId = shorts[1];
      kind = "short";
    } else if (embed) {
      videoId = embed[1];
    } else if (ID_RE.test(fromQuery)) {
      videoId = fromQuery;
    }
  }

  if (!ID_RE.test(videoId)) return null;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  return {
    canonical: kind === "short" ? `https://www.youtube.com/shorts/${videoId}` : watchUrl,
    watchUrl,
    videoId,
    kind,
  };
}

export function looksLikeYoutubeUrl(raw: string): boolean {
  return parseYoutubeUrl(raw) !== null;
}
