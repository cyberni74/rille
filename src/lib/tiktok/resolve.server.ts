import { assertPublicMediaUrl } from "@/lib/instagram/allowlist";
import type { MediaItem, ResolvedPost } from "@/lib/instagram/types";
import type { Locale } from "@/lib/locale";
import { delay } from "@/lib/utils";
import { parseTiktokUrl } from "./parse-url";
import {
  isTikwmRateLimited,
  resolveTiktokClient,
  safeTiktokFilename,
} from "./tikwm";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type LoaderJob = {
  success?: boolean | number;
  progress_url?: string;
  download_url?: string | null;
  title?: string;
  thumbnail_url?: string;
  video_duration?: unknown;
  info?: { title?: string; image?: string };
};

function downloadUrlOf(job: LoaderJob | null | undefined): string {
  return typeof job?.download_url === "string" ? job.download_url : "";
}

function isHardMiss(message: string) {
  return /privat|gelöscht|not found|no longer|nicht öffentlich|keine öffentliche|nicht nach einem tiktok/i.test(
    message,
  );
}

async function fetchLoaderJson(url: string, timeoutMs = 12000): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      Referer: "https://loader.to/",
      Origin: "https://loader.to",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error("TikTok ist gerade nicht erreichbar. Bitte erneut versuchen.");
  }
  return JSON.parse(text) as unknown;
}

async function resolveViaLoader(canonical: string, locale: Locale): Promise<ResolvedPost> {
  const parsed = parseTiktokUrl(canonical);
  if (!parsed) {
    throw new Error("Das sieht nicht nach einem TikTok-Link aus.");
  }
  const start = `https://loader.to/ajax/download.php?${new URLSearchParams({
    format: "1080",
    url: parsed.canonical,
  })}`;
  const first = (await fetchLoaderJson(start)) as LoaderJob;
  let download = downloadUrlOf(first);
  const progressUrl = first.progress_url ?? "";
  for (let i = 0; i < 10 && !download && progressUrl; i += 1) {
    await delay(700);
    const next = (await fetchLoaderJson(progressUrl, 10000)) as LoaderJob;
    download = downloadUrlOf(next);
    if (download) {
      first.title = next.title || next.info?.title || first.title;
      first.thumbnail_url = next.thumbnail_url || next.info?.image || first.thumbnail_url;
    }
  }
  if (!download) {
    throw new Error("TikTok ist gerade nicht erreichbar. Bitte erneut versuchen.");
  }
  let mediaUrl: string;
  try {
    mediaUrl = assertPublicMediaUrl(download).href;
  } catch {
    throw new Error("Die TikTok-Datei kommt von einer unbekannten Quelle.");
  }
  const id = parsed.videoId ?? "tiktok";
  const author = parsed.username;
  let thumb: string | undefined;
  try {
    if (first.thumbnail_url) thumb = assertPublicMediaUrl(first.thumbnail_url).href;
  } catch {
    thumb = undefined;
  }
  const label = locale === "en" ? "HD · no watermark" : "HD · ohne Wasserzeichen";
  const items: MediaItem[] = [
    {
      id: `${id}-loader`,
      type: "video",
      url: mediaUrl,
      thumbnailUrl: thumb,
      filename: safeTiktokFilename(`${author ?? "tiktok"}_${id}.mp4`, `${id}.mp4`),
      label,
      quality: "1080",
    },
  ];
  return {
    sourceUrl: parsed.canonical,
    shortcode: id,
    kind: "tiktok",
    authorName: author,
    caption: (first.title || first.info?.title || "").trim(),
    thumbnailUrl: thumb,
    items,
  };
}

export async function resolveTiktokVideo(
  raw: string,
  locale: Locale = "de",
): Promise<ResolvedPost> {
  try {
    return await resolveTiktokClient(raw, locale);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isHardMiss(message) && !isTikwmRateLimited({ msg: message }, message)) {
      throw error;
    }
    try {
      return await resolveViaLoader(raw, locale);
    } catch {
      throw error;
    }
  }
}
