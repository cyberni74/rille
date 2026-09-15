import { assertPublicMediaUrl } from "@/lib/instagram/allowlist";
import type { MediaItem, ResolvedPost } from "@/lib/instagram/types";
import { parseYoutubeUrl } from "./parse-url";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const FORMATS = [
  { id: "1080", label: "1080p MP4" },
  { id: "720", label: "720p MP4" },
  { id: "360", label: "360p MP4" },
] as const;

const MAX_POLLS = 20;
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

export async function resolveYoutubeVideo(rawUrl: string): Promise<ResolvedPost> {
  const parsed = parseYoutubeUrl(rawUrl);
  if (!parsed) {
    throw new Error("Das sieht nicht nach einem YouTube-Link aus.");
  }

  const oembedPromise = fetchOembed(parsed.watchUrl);
  const started = await Promise.all(
    FORMATS.map(async (format): Promise<QualityJob | null> => {
      try {
        const job = await startLoader(parsed.watchUrl, format.id);
        return {
          format,
          progressUrl: job.progress_url ?? "",
          downloadUrl: downloadUrlOf(job),
          title: job.title || job.info?.title,
          thumbnail: pickThumbnail(job, parsed.videoId),
          duration: formatDuration(job.video_duration),
        };
      } catch {
        return null;
      }
    }),
  );

  const jobs: QualityJob[] = [];
  for (const job of started) {
    if (job) jobs.push(job);
  }
  if (!jobs.length) {
    throw new Error("Dieses YouTube-Video konnte nicht vorbereitet werden.");
  }

  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    const pending = jobs.filter((job) => !job.downloadUrl && job.progressUrl);
    if (!pending.length) break;
    await Promise.all(
      pending.map(async (job) => {
        try {
          const last = (await fetchJson(job.progressUrl, 10000)) as LoaderJob;
          const url = downloadUrlOf(last);
          if (url) {
            job.downloadUrl = url;
            job.title = last.title || last.info?.title || job.title;
            job.thumbnail = last.thumbnail_url || last.info?.image || job.thumbnail;
            job.duration = formatDuration(last.video_duration) ?? job.duration;
          }
        } catch {
          /* keep polling other qualities */
        }
      }),
    );
    const readyCount = jobs.filter((job) => job.downloadUrl).length;
    if (readyCount === jobs.length) break;
    if (readyCount >= 2 && attempt >= 16) break;
    await sleep(POLL_MS);
  }

  const ready = jobs.filter((job) => job.downloadUrl);
  if (!ready.length) {
    throw new Error("YouTube braucht gerade länger. Bitte noch einmal versuchen.");
  }

  const oembed = await oembedPromise;
  const title = (
    ready[0]?.title ||
    oembed?.title ||
    parsed.videoId
  )
    .replace(/\s+/g, " ")
    .trim();
  const duration = ready.find((job) => job.duration)?.duration;
  const thumbnail =
    oembed?.thumbnail_url ||
    ready[0]?.thumbnail ||
    `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg`;

  let thumbUrl: string | undefined;
  try {
    thumbUrl = assertPublicMediaUrl(thumbnail).href;
  } catch {
    thumbUrl = undefined;
  }

  const items: MediaItem[] = [];
  for (const job of ready) {
    let mediaUrl: string;
    try {
      mediaUrl = assertPublicMediaUrl(job.downloadUrl).href;
    } catch {
      continue;
    }
    items.push({
      id: `${parsed.videoId}-${job.format.id}`,
      type: "video",
      url: mediaUrl,
      thumbnailUrl: thumbUrl,
      filename: safeFilename(
        `${title}_${parsed.videoId}_${job.format.id}p.mp4`,
        `${parsed.videoId}_${job.format.id}p.mp4`,
      ),
      label: job.format.label,
      quality: job.format.id,
    });
  }

  if (!items.length) {
    throw new Error("Die YouTube-Datei kommt von einer unbekannten Quelle.");
  }

  return {
    sourceUrl: parsed.canonical,
    shortcode: parsed.videoId,
    kind: parsed.kind === "short" ? "short" : "youtube",
    authorName: oembed?.author_name,
    authorUrl: oembed?.author_url,
    caption: title,
    thumbnailUrl: thumbUrl,
    duration,
    items,
  };
}
