import { assertPublicMediaUrl } from "@/lib/instagram/allowlist";
import type { MediaItem, ResolvedPost } from "@/lib/instagram/types";
import type { Locale } from "@/lib/locale";
import { parseMp4Dimensions, qualityIdFromHeight, qualityLabelFromHeight } from "@/lib/mp4-probe";
import type { QualityPref } from "@/lib/platform";
import { parseYoutubeUrl } from "./parse-url";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const FORMATS = [
  { id: "1080", label: "1080p MP4" },
  { id: "720", label: "720p MP4" },
  { id: "360", label: "360p MP4" },
] as const;

const MAX_POLLS = 18;
const POLL_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeFilename(name: string, fallback: string) {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").slice(0, 140);
  return cleaned || fallback;
}

function formatDuration(raw: unknown): string | undefined {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    const total = Math.round(raw);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) return formatDuration(Number(trimmed));
    if (/^\d+:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed;
  }
  return undefined;
}

function durationSeconds(value?: string): number | undefined {
  if (!value) return undefined;
  const parts = value.split(":").map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n))) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return undefined;
}

async function fetchJson(url: string, timeoutMs = 14000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/json",
        Referer: "https://loader.to/",
        Origin: "https://loader.to",
      },
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error("YouTube-Quelle antwortet gerade nicht.");
    }
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Zeitüberschreitung beim YouTube-Download.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

type LoaderJob = {
  success?: boolean | number;
  id?: string;
  title?: string;
  progress_url?: string;
  download_url?: string | null;
  thumbnail_url?: string;
  format?: string;
  video_duration?: unknown;
  info?: { title?: string; image?: string };
};

function downloadUrlOf(job: LoaderJob | null | undefined): string {
  return typeof job?.download_url === "string" ? job.download_url : "";
}

async function startLoader(watchUrl: string, format: string): Promise<LoaderJob> {
  const endpoint = `https://loader.to/ajax/download.php?${new URLSearchParams({
    format,
    url: watchUrl,
  })}`;
  const json = (await fetchJson(endpoint, 12000)) as LoaderJob;
  if (!json?.progress_url && !downloadUrlOf(json)) {
    throw new Error("Dieses YouTube-Video konnte nicht vorbereitet werden.");
  }
  return json;
}

type QualityJob = {
  format: (typeof FORMATS)[number];
  progressUrl: string;
  downloadUrl: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
};

function pickThumbnail(job: LoaderJob, videoId: string) {
  return (
    job.thumbnail_url ||
    job.info?.image ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  );
}

type OEmbed = {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
};

async function fetchOembed(watchUrl: string): Promise<OEmbed | null> {
  try {
    const endpoint = `https://www.youtube.com/oembed?${new URLSearchParams({
      url: watchUrl,
      format: "json",
    })}`;
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/json",
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as OEmbed;
  } catch {
    return null;
  }
}

function formatsForPref(preferred?: QualityPref): (typeof FORMATS)[number][] {
  const wanted = FORMATS.find((item) => item.id === preferred);
  if (!wanted) return [...FORMATS];
  const lower = FORMATS.filter((item) => Number(item.id) < Number(wanted.id));
  return [wanted, ...lower];
}

async function pollJob(job: QualityJob) {
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    if (job.downloadUrl) return;
    if (!job.progressUrl) return;
    try {
      const last = (await fetchJson(job.progressUrl, 10000)) as LoaderJob;
      const url = downloadUrlOf(last);
      if (url) {
        job.downloadUrl = url;
        job.title = last.title || last.info?.title || job.title;
        job.thumbnail = last.thumbnail_url || last.info?.image || job.thumbnail;
        job.duration = formatDuration(last.video_duration) ?? job.duration;
        return;
      }
    } catch {
      /* keep polling */
    }
    await sleep(POLL_MS);
  }
}

async function probeFile(url: string): Promise<{ bytes?: number; width?: number; height?: number }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Range: "bytes=0-524287",
        Referer: "https://www.youtube.com/",
      },
      signal: AbortSignal.timeout(8000),
    });
    const range = response.headers.get("content-range");
    const total = range?.split("/")[1];
    const bytes = Number(total || response.headers.get("content-length") || "");
    const buf = new Uint8Array(await response.arrayBuffer());
    const dim = parseMp4Dimensions(buf);
    return {
      bytes: Number.isFinite(bytes) && bytes > 0 ? bytes : undefined,
      width: dim?.width,
      height: dim?.height,
    };
  } catch {
    return {};
  }
}

export async function resolveYoutubeVideo(
  rawUrl: string,
  preferred?: QualityPref,
  locale: Locale = "de",
): Promise<ResolvedPost> {
  const parsed = parseYoutubeUrl(rawUrl);
  if (!parsed) {
    throw new Error("Das sieht nicht nach einem YouTube-Link aus.");
  }

  const oembedPromise = fetchOembed(parsed.watchUrl);
  const ladder = formatsForPref(preferred);
  let ready: QualityJob | null = null;

  for (const format of ladder) {
    try {
      const started = await startLoader(parsed.watchUrl, format.id);
      const job: QualityJob = {
        format,
        progressUrl: started.progress_url ?? "",
        downloadUrl: downloadUrlOf(started),
        title: started.title || started.info?.title,
        thumbnail: pickThumbnail(started, parsed.videoId),
        duration: formatDuration(started.video_duration),
      };
      await pollJob(job);
      if (job.downloadUrl) {
        ready = job;
        break;
      }
    } catch {
      /* try next lower rung */
    }
  }

  if (!ready?.downloadUrl) {
    throw new Error("YouTube braucht gerade länger. Bitte noch einmal versuchen.");
  }

  const oembed = await oembedPromise;
  const title = (ready.title || oembed?.title || parsed.videoId).replace(/\s+/g, " ").trim();
  const duration = ready.duration;
  const thumbnail =
    oembed?.thumbnail_url ||
    ready.thumbnail ||
    `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg`;

  let mediaUrl: string;
  try {
    mediaUrl = assertPublicMediaUrl(ready.downloadUrl).href;
  } catch {
    throw new Error("Die YouTube-Datei kommt von einer unbekannten Quelle.");
  }

  const probe = await probeFile(mediaUrl);
  const actualId = qualityIdFromHeight(probe.height, ready.format.id);
  const label = qualityLabelFromHeight(probe.height, locale);

  let thumbUrl: string | undefined;
  try {
    thumbUrl = assertPublicMediaUrl(thumbnail).href;
  } catch {
    thumbUrl = undefined;
  }

  const seconds = durationSeconds(duration);
  const kind = parsed.kind === "short" && (seconds == null || seconds <= 90) ? "short" : "youtube";

  const items: MediaItem[] = [
    {
      id: `${parsed.videoId}-${actualId}`,
      type: "video",
      url: mediaUrl,
      thumbnailUrl: thumbUrl,
      filename: safeFilename(`${title}_${parsed.videoId}_${actualId}p.mp4`, `${parsed.videoId}.mp4`),
      label,
      quality: actualId,
      bytes: probe.bytes,
      width: probe.width,
      height: probe.height,
    },
  ];

  return {
    sourceUrl: parsed.canonical,
    shortcode: parsed.videoId,
    kind,
    authorName: oembed?.author_name,
    authorUrl: oembed?.author_url,
    caption: title,
    thumbnailUrl: thumbUrl,
    duration,
    items,
  };
}
