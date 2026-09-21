const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
  "www.vm.tiktok.com",
  "www.vt.tiktok.com",
]);

export type ParsedTiktokUrl = {
  canonical: string;
  videoId?: string;
  username?: string;
  kind: "video" | "photo" | "short";
};

export function extractTiktokUrls(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const re =
    /https?:\/\/(?:www\.|m\.|vm\.|vt\.)?tiktok\.com\/[^\s<>"']+/gi;
  for (const match of text.match(re) ?? []) {
    const cleaned = match.replace(/[),.;]+$/g, "");
    const parsed = parseTiktokUrl(cleaned);
    const key = parsed ? tiktokDedupeKey(parsed) : cleaned.split("?")[0]?.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    found.push(parsed?.canonical ?? cleaned);
  }
  return found;
}

function fromVideoId(id: string, username?: string): ParsedTiktokUrl {
  return {
    canonical: username
      ? `https://www.tiktok.com/@${username}/video/${id}`
      : `https://www.tiktok.com/video/${id}`,
    username,
    videoId: id,
    kind: "video",
  };
}

export function parseTiktokUrl(raw: string): ParsedTiktokUrl | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (!TIKTOK_HOSTS.has(host)) return null;

  const path = url.pathname.replace(/\/+$/, "") || "/";
  const shortHost =
    host === "vm.tiktok.com" ||
    host === "vt.tiktok.com" ||
    host.startsWith("www.vm.") ||
    host.startsWith("www.vt.");
  if (shortHost) {
    const code = path.replace(/^\//, "").split("/")[0] ?? "";
    if (!code) return null;
    return {
      canonical: `https://${host.replace(/^www\./, "")}/${code}`,
      kind: "short",
    };
  }

  const video = path.match(/^\/@([^/]+)\/video\/(\d+)/i);
  if (video) {
    return fromVideoId(video[2], video[1]);
  }

  const photo = path.match(/^\/@([^/]+)\/photo\/(\d+)/i);
  if (photo) {
    return {
      canonical: `https://www.tiktok.com/@${photo[1]}/photo/${photo[2]}`,
      username: photo[1],
      videoId: photo[2],
      kind: "photo",
    };
  }

  const bareVideo = path.match(/^\/(?:embed\/(?:v2\/)?|share\/)?video\/(\d+)/i);
  if (bareVideo) {
    return fromVideoId(bareVideo[1]);
  }

  const mobileHtml = path.match(/^\/v\/(\d+)(?:\.html)?/i);
  if (mobileHtml) {
    return fromVideoId(mobileHtml[1]);
  }

  const embed = path.match(/^\/embed\/(?:v2\/)?(\d+)/i);
  if (embed) {
    return fromVideoId(embed[1]);
  }

  const share = path.match(/^\/t\/([A-Za-z0-9]+)/i);
  if (share) {
    return {
      canonical: `https://www.tiktok.com/t/${share[1]}`,
      kind: "short",
    };
  }

  const queryId =
    url.searchParams.get("video_id") ||
    url.searchParams.get("item_id") ||
    url.searchParams.get("share_item_id");
  if (queryId && /^\d{5,}$/.test(queryId)) {
    return fromVideoId(queryId);
  }

  return null;
}

export function tiktokDedupeKey(parsed: ParsedTiktokUrl): string {
  if (parsed.videoId) return `tt:${parsed.videoId}`;
  return `tt:${parsed.canonical.toLowerCase()}`;
}

export function looksLikeTiktokUrl(raw: string): boolean {
  return parseTiktokUrl(raw) !== null;
}
