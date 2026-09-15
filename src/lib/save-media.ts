import { mediaProxyPath } from "@/lib/instagram/allowlist";
import type { MediaItem } from "@/lib/instagram/types";
import { delay } from "@/lib/utils";

export { galleryItems, pickPreferredItem } from "@/lib/gallery-items";

const FETCH_CONCURRENCY = 3;
const MAX_SHARE_BYTES = 180 * 1024 * 1024;

export type SaveStatus = "shared" | "downloaded" | "cancelled";

export type BatchSaveResult = {
  status: SaveStatus | "needs-gesture";
  files: File[];
  remaining: File[];
};

type Sharer = Navigator & {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
};

export function isAppleDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function isAndroidDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isMobileDevice() {
  return isAppleDevice() || isAndroidDevice();
}

export function fileShareAvailable() {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Sharer;
  if (typeof nav.share !== "function" || typeof nav.canShare !== "function") return false;
  try {
    const probe = new File(["rille"], "rille.mp4", { type: "video/mp4" });
    return Boolean(nav.canShare({ files: [probe] }));
  } catch {
    return false;
  }
}

function mimeFor(item: MediaItem, blob: Blob) {
  if (blob.type && blob.type !== "application/octet-stream") return blob.type;
  if (item.type === "audio" || item.filename.endsWith(".mp3")) return "audio/mpeg";
  if (item.type === "image" || /\.(jpe?g|png|webp)$/i.test(item.filename)) {
    if (item.filename.toLowerCase().endsWith(".png")) return "image/png";
    if (item.filename.toLowerCase().endsWith(".webp")) return "image/webp";
    return "image/jpeg";
  }
  return "video/mp4";
}

function uniquifyFilenames(files: File[]): File[] {
  const seen = new Map<string, number>();
  return files.map((file) => {
    const used = seen.get(file.name) ?? 0;
    seen.set(file.name, used + 1);
    if (used === 0) return file;
    const dot = file.name.lastIndexOf(".");
    const base = dot >= 0 ? file.name.slice(0, dot) : file.name;
    const ext = dot >= 0 ? file.name.slice(dot) : "";
    return new File([file], `${base}-${used + 1}${ext}`, { type: file.type });
  });
}

function canShareFiles(files: File[]): boolean {
  if (!files.length) return false;
  const nav = navigator as Sharer;
  if (typeof nav.share !== "function" || typeof nav.canShare !== "function") return false;
  try {
    return Boolean(nav.canShare({ files }));
  } catch {
    return false;
  }
}

function packShareable(files: File[]): { pack: File[]; rest: File[] } {
  if (!files.length) return { pack: [], rest: [] };
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total <= MAX_SHARE_BYTES && canShareFiles(files)) {
    return { pack: files, rest: [] };
  }
  const pack: File[] = [];
  const rest: File[] = [];
  let used = 0;
  for (const file of files) {
    const next = [...pack, file];
    const nextBytes = used + file.size;
    if (nextBytes <= MAX_SHARE_BYTES && canShareFiles(next)) {
      pack.push(file);
      used = nextBytes;
    } else {
      rest.push(file);
    }
  }
  return { pack, rest };
}

async function downloadBlob(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.name;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

export async function fetchMediaFile(item: MediaItem): Promise<File> {
  const response = await fetch(mediaProxyPath(item.url, item.filename, false));
  if (!response.ok) {
    throw new Error("Die Datei konnte nicht geladen werden.");
  }
  const blob = await response.blob();
  return new File([blob], item.filename, { type: mimeFor(item, blob) });
}

async function fetchAllFiles(
  items: MediaItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<File[]> {
  const files: File[] = [];
  let done = 0;
  for (let i = 0; i < items.length; i += FETCH_CONCURRENCY) {
    const chunk = items.slice(i, i + FETCH_CONCURRENCY);
    const part = await Promise.all(
      chunk.map(async (item) => {
        try {
          return await fetchMediaFile(item);
        } catch {
          return null;
        }
      }),
    );
    for (const file of part) {
      if (file) files.push(file);
    }
    done += chunk.length;
    onProgress?.(Math.min(done, items.length), items.length);
  }
  if (!files.length) {
    throw new Error("Die Dateien konnten nicht geladen werden.");
  }
  return uniquifyFilenames(files);
}

async function downloadAllFiles(files: File[]) {
  for (const file of files) {
    await downloadBlob(file);
    await delay(350);
  }
}

export async function shareFiles(files: File[]): Promise<BatchSaveResult> {
  if (!files.length) return { status: "cancelled", files, remaining: [] };
  if (isMobileDevice()) {
    const { pack, rest } = packShareable(files);
    if (pack.length && canShareFiles(pack)) {
      try {
        await (navigator as Sharer).share?.({ files: pack });
        return { status: "shared", files: pack, remaining: rest };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return { status: "cancelled", files, remaining: [] };
        }
        if (error instanceof Error && error.name === "NotAllowedError") {
          return { status: "needs-gesture", files, remaining: [] };
        }
      }
    }
  }
  await downloadAllFiles(files);
  return { status: "downloaded", files, remaining: [] };
}

export async function saveMedia(item: MediaItem): Promise<SaveStatus> {
  const file = await fetchMediaFile(item);
  const result = await shareFiles([file]);
  if (result.status === "needs-gesture") {
    await downloadAllFiles([file]);
    return "downloaded";
  }
  return result.status;
}

export async function saveMediaBatch(
  items: MediaItem[],
  onProgress?: (done: number, total: number) => void,
  prepared?: File[],
): Promise<BatchSaveResult> {
  if (!items.length && !prepared?.length) {
    return { status: "cancelled", files: [], remaining: [] };
  }
  const files = prepared?.length ? uniquifyFilenames(prepared) : await fetchAllFiles(items, onProgress);
  return shareFiles(files);
}
