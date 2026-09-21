import { assertPublicMediaUrl } from "../instagram/allowlist.ts";
import type { MediaItem, ResolvedPost } from "../instagram/types.ts";
import type { Locale } from "../locale.ts";
import { delay } from "../utils.ts";
import { parseTiktokUrl, type ParsedTiktokUrl } from "./parse-url.ts";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export type TikwmAuthor = {
  unique_id?: string;
  nickname?: string;
};

export type TikwmData = {
  id?: string;
  title?: string;
  duration?: number;
  cover?: string;
  origin_cover?: string;
  play?: string;
  hdplay?: string;
  music?: string;
  images?: string[];
  author?: TikwmAuthor;
};

export type TikwmResponse = {
  code?: number;
  msg?: string;
  data?: TikwmData;
};

function absUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://www.tikwm.com${raw}`;
  return raw;
}

export function safeTiktokFilename(name: string, fallback: string) {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
  return cleaned || fallback;
}

export function formatTiktokDuration(seconds: number | undefined): string | undefined {
  if (!seconds || seconds < 1) return undefined;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function asTiktokMediaUrl(raw: string | undefined): string | undefined {
  const abs = absUrl(raw);
  if (!abs) return undefined;
  try {
    return assertPublicMediaUrl(abs).href;
  } catch {
    return undefined;
  }
}

export function isTikwmRateLimited(payload: TikwmResponse | null | undefined, raw?: string) {
  const msg = `${payload?.msg ?? ""} ${raw ?? ""}`.toLowerCase();
  return payload?.code === -1 || /api limit|rate limit|too many request|1 request/.test(msg);
}

export function postFromTikwm(
  data: TikwmData,
  parsed: ParsedTiktokUrl,
  locale: Locale = "de",
): ResolvedPost {
  const id = data.id ?? parsed.videoId ?? "tiktok";
  const author = data.author?.unique_id || parsed.username;
  const title = (data.title ?? "").trim();
  const cover = asTiktokMediaUrl(data.origin_cover) ?? asTiktokMediaUrl(data.cover);
  const items: MediaItem[] = [];
  const hdLabel = locale === "en" ? "HD · no watermark" : "HD · ohne Wasserzeichen";
  const stdLabel = locale === "en" ? "No watermark" : "Ohne Wasserzeichen";
  const photoLabel = (n: number) => (locale === "en" ? `Photo ${n}` : `Foto ${n}`);

  const hd = asTiktokMediaUrl(data.hdplay);
  const play = asTiktokMediaUrl(data.play);
  const music = asTiktokMediaUrl(data.music);

  if (hd && hd !== play) {
    items.push({
      id: `${id}-hd`,
      type: "video",
      url: hd,
      thumbnailUrl: cover,
      filename: safeTiktokFilename(`${author ?? "tiktok"}_${id}_hd.mp4`, `${id}_hd.mp4`),
      label: hdLabel,
      quality: "1080",
    });
  }
  if (play) {
    items.push({
      id: `${id}-nowm`,
      type: "video",
      url: play,
      thumbnailUrl: cover,
      filename: safeTiktokFilename(`${author ?? "tiktok"}_${id}.mp4`, `${id}.mp4`),
      label: stdLabel,
      quality: "original",
    });
  }
  if (Array.isArray(data.images)) {
    data.images.forEach((image, index) => {
      const url = asTiktokMediaUrl(image);
      if (!url) return;
      items.push({
        id: `${id}-img-${index}`,
        type: "image",
        url,
        thumbnailUrl: url,
        filename: safeTiktokFilename(`${author ?? "tiktok"}_${id}_${index + 1}.jpg`, `${id}_${index + 1}.jpg`),
        label: photoLabel(index + 1),
      });
    });
  }
  if (music) {
    items.push({
      id: `${id}-audio`,
      type: "audio",
      url: music,
      thumbnailUrl: cover,
      filename: safeTiktokFilename(`${author ?? "tiktok"}_${id}.mp3`, `${id}.mp3`),
      label: "Audio · MP3",
      quality: "audio",
    });
  }

  if (!items.length) {
    throw new Error("Für dieses TikTok gibt es keine öffentliche Datei.");
  }

  return {
    sourceUrl: parsed.canonical,
    shortcode: id,
    kind: "tiktok",
    authorName: author,
    caption: title,
    thumbnailUrl: cover,
    duration: formatTiktokDuration(data.duration),
    items,
  };
}

async function fetchTikwm(canonical: string): Promise<TikwmResponse> {
  const endpoint = `https://www.tikwm.com/api/?hd=1&url=${encodeURIComponent(canonical)}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      ...(typeof window === "undefined"
        ? { "User-Agent": UA, Referer: "https://www.tikwm.com/" }
        : {}),
    },
    signal: AbortSignal.timeout(14000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error("TikTok ist gerade nicht erreichbar. Bitte erneut versuchen.");
  }
  let payload: TikwmResponse;
  try {
    payload = JSON.parse(text) as TikwmResponse;
  } catch {
    throw new Error("TikTok hat keine verwertbare Antwort geliefert.");
  }
  return payload;
}

export async function resolveTiktokClient(
  raw: string,
  locale: Locale = "de",
): Promise<ResolvedPost> {
  const parsed = parseTiktokUrl(raw);
  if (!parsed) {
    throw new Error("Das sieht nicht nach einem TikTok-Link aus.");
  }

  let payload = await fetchTikwm(parsed.canonical);
  if (isTikwmRateLimited(payload)) {
    await delay(1200);
    payload = await fetchTikwm(parsed.canonical);
  }

  if (payload.code !== 0 || !payload.data) {
    throw new Error(
      payload.msg && payload.msg !== "success"
        ? payload.msg
        : "Dieses TikTok ist privat, gelöscht oder nicht öffentlich.",
    );
  }

  return postFromTikwm(payload.data, parsed, locale);
}
