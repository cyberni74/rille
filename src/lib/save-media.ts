import { mediaProxyPath } from "@/lib/instagram/allowlist";
import type { MediaItem } from "@/lib/instagram/types";

export function isAppleDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
}

function mimeFor(item: MediaItem, blob: Blob) {
  if (blob.type && blob.type !== "application/octet-stream") return blob.type;
  if (item.type === "audio" || item.filename.endsWith(".mp3")) return "audio/mpeg";
  return item.type === "video" ? "video/mp4" : "image/jpeg";
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

export async function saveMedia(
  item: MediaItem,
): Promise<"shared" | "downloaded" | "cancelled"> {
  const response = await fetch(mediaProxyPath(item.url, item.filename, false));
  if (!response.ok) {
    throw new Error("Die Datei konnte nicht geladen werden.");
  }
  const blob = await response.blob();
  const file = new File([blob], item.filename, { type: mimeFor(item, blob) });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: file.name });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
    }
  }

  await downloadBlob(file);
  return "downloaded";
}
