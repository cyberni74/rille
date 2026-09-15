export type MediaKind = "video" | "image" | "audio";

export type PostKind =
  | "reel"
  | "post"
  | "carousel"
  | "story"
  | "video"
  | "photo"
  | "youtube"
  | "short"
  | "tiktok";

export type MediaItem = {
  id: string;
  type: MediaKind;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  label?: string;
  quality?: string;
};

export type ResolvedPost = {
  sourceUrl: string;
  shortcode: string;
  kind: PostKind;
  authorName?: string;
  authorUrl?: string;
  caption?: string;
  thumbnailUrl?: string;
  duration?: string;
  items: MediaItem[];
};

export type ResolveFailure = {
  sourceUrl: string;
  error: string;
};

export type ResolveResult =
  | { ok: true; post: ResolvedPost }
  | { ok: false; failure: ResolveFailure };
