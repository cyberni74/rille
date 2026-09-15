import { assertPublicMediaUrl } from "@/lib/instagram/allowlist";
import type { MediaItem, ResolvedPost } from "@/lib/instagram/types";
import { parseTiktokUrl } from "./parse-url";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type TikwmAuthor = {
  unique_id?: string;
  nickname?: string;
};

type TikwmData = {
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

type TikwmResponse = {
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

function safeFilename(name: string, fallback: string) {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
  return cleaned || fallback;
}

function formatDuration(seconds: number | undefined): string | undefined {
  if (!seconds || seconds < 1) return undefined;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function asMediaUrl(raw: string | undefined): string | undefined {
  const abs = absUrl(raw);
  if (!abs) return undefined;
  try {
    return assertPublicMediaUrl(abs).href;
  } catch {
    return undefined;
  }
}

export async function resolveTiktokVideo(raw: string): Promise<ResolvedPost> {
  const parsed = parseTiktokUrl(raw);
  if (!parsed) {
    throw new Error("Das sieht nicht nach einem TikTok-Link aus.");
  }

  const endpoint = `https://www.tikwm.com/api/?hd=1&url=${encodeURIComponent(parsed.canonical)}`;
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      Referer: "https://www.tikwm.com/",
    },
    signal: AbortSignal.timeout(16000),
  });
  if (!response.ok) {
    throw new Error("TikTok ist gerade nicht erreichbar. Bitte erneut versuchen.");
  }

  let payload: TikwmResponse;
  try {
    payload = (await response.json()) as TikwmResponse;
  } catch {
    throw new Error("TikTok hat keine verwertbare Antwort geliefert.");
  }

  if (payload.code !== 0 || !payload.data) {
    throw new Error(
      payload.msg && payload.msg !== "success"
        ? payload.msg
        : "Dieses TikTok ist privat, gelöscht oder nicht öffentlich.",
    );
  }

  const data = payload.data;
  const id = data.id ?? parsed.videoId ?? "tiktok";
  const author = data.author?.unique_id || parsed.username;
  const title = (data.title ?? "").trim();
  const cover = asMediaUrl(data.origin_cover) ?? asMediaUrl(data.cover);
  const items: MediaItem[] = [];

  const hd = asMediaUrl(data.hdplay);
  const play = asMediaUrl(data.play);
  const music = asMediaUrl(data.music);

  if (hd && hd !== play) {
    items.push({
      id: `${id}-hd`,
      type: "video",
      url: hd,
      thumbnailUrl: cover,
      filename: safeFilename(`${author ?? "tiktok"}_${id}_hd.mp4`, `${id}_hd.mp4`),
      label: "HD · ohne Wasserzeichen",
      quality: "1080",
    });
  }
  if (play) {
    items.push({
      id: `${id}-nowm`,
      type: "video",
      url: play,
      thumbnailUrl: cover,
      filename: safeFilename(`${author ?? "tiktok"}_${id}.mp4`, `${id}.mp4`),
      label: "Ohne Wasserzeichen",
      quality: "original",
    });
  }
  if (Array.isArray(data.images)) {
    data.images.forEach((image, index) => {
      const url = asMediaUrl(image);
      if (!url) return;
      items.push({
        id: `${id}-img-${index}`,
        type: "image",
        url,
        thumbnailUrl: url,
        filename: safeFilename(`${author ?? "tiktok"}_${id}_${index + 1}.jpg`, `${id}_${index + 1}.jpg`),
        label: `Foto ${index + 1}`,
      });
    });
  }
  if (music) {
    items.push({
      id: `${id}-audio`,
      type: "audio",
      url: music,
      thumbnailUrl: cover,
      filename: safeFilename(`${author ?? "tiktok"}_${id}.mp3`, `${id}.mp3`),
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
    duration: formatDuration(data.duration),
    items,
  };
}
