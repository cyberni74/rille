import type { MediaItem, ResolvedPost } from "@/lib/instagram/types";
import type { QualityPref } from "@/lib/platform";

export function pickPreferredItem(post: ResolvedPost, preferred: QualityPref): MediaItem | undefined {
  if (preferred === "audio") {
    return post.items.find((item) => item.type === "audio" || item.quality === "audio") ?? post.items[0];
  }
  if (preferred !== "original") {
    const match = post.items.find((item) => item.quality === preferred);
    if (match) return match;
  }
  return (
    post.items.find((item) => item.quality === "original") ??
    post.items.find((item) => item.quality === "1080") ??
    post.items.find((item) => item.quality === "720") ??
    post.items.find((item) => item.quality === "360") ??
    post.items.find((item) => item.type === "video") ??
    post.items[0]
  );
}

export function galleryItems(post: ResolvedPost, preferred: QualityPref): MediaItem[] {
  if (!post.items.length) return [];
  if (preferred === "audio") {
    const audio = post.items.filter((item) => item.type === "audio" || item.quality === "audio");
    if (audio.length) return audio;
  }

  const images = post.items.filter((item) => item.type === "image");
  const videos = post.items.filter((item) => item.type === "video");

  if (images.length > 1 && videos.length <= 1) return images.length ? images : videos;

  if (videos.length > 1 && images.length === 0) {
    const picked = pickPreferredItem({ ...post, items: videos }, preferred);
    return picked ? [picked] : [videos[0]];
  }

  if (images.length && videos.length) {
    const picked = pickPreferredItem({ ...post, items: videos }, preferred);
    return [...images, ...(picked ? [picked] : videos.slice(0, 1))];
  }

  const picked = pickPreferredItem(post, preferred);
  return picked ? [picked] : [];
}
