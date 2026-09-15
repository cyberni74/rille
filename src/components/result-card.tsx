import { useState } from "react";
import {
  Download,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Music2,
  RotateCw,
  Share,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaProxyPath } from "@/lib/instagram/allowlist";
import { mediaSourceKind } from "@/lib/media-url";
import type { MediaItem, PostKind, ResolvedPost } from "@/lib/instagram/types";
import type { QualityPref } from "@/lib/platform";
import { isAppleDevice, saveMedia } from "@/lib/save-media";
import { cn } from "@/lib/utils";
import type { QueueEntry } from "@/store/queue";

export const KIND_LABEL: Record<PostKind, string> = {
  reel: "Reel",
  post: "Beitrag",
  carousel: "Karussell",
  story: "Story",
  video: "Video",
  photo: "Foto",
  youtube: "YouTube",
  short: "Short",
  tiktok: "TikTok",
};

export async function handleSave(item: MediaItem) {
  const result = await saveMedia(item);
  if (result === "shared") {
    toast.success("Teilen-Menü ist offen. Dort „In Fotos sichern“ tippen.");
  } else if (result === "downloaded") {
    toast.success("Download gestartet.");
  }
}

function isYoutubeKind(kind: PostKind | string | null) {
  return kind === "youtube" || kind === "short";
}

function isTiktokKind(kind: PostKind | string | null) {
  return kind === "tiktok";
}

function loadingCopy(kind: string | null) {
  if (isYoutubeKind(kind)) return "YouTube wird vorbereitet";
  if (isTiktokKind(kind)) return "TikTok wird vorbereitet";
  return "Wird geladen";
}

function itemFallbackLabel(item: MediaItem, index: number, total: number) {
  const base =
    item.type === "video" ? "Video" : item.type === "audio" ? "Audio" : "Foto";
  return total > 1 ? `${base} ${index + 1}` : base;
}

export function pickPreferredItem(post: ResolvedPost, preferred: QualityPref) {
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

export function ResultCard({
  entry,
  preferred,
  onRemove,
  onRetry,
}: {
  entry: QueueEntry;
  preferred: QualityPref;
  onRemove: () => void;
  onRetry: () => void;
}) {
  if (entry.status === "loading") {
    const kind = mediaSourceKind(entry.url);
    const landscape = kind === "youtube";
    return (
      <article className="flex min-h-36 min-w-0 items-center gap-4 rounded-[var(--radius-lg)] bg-card p-4 shadow-soft">
        <div
          className={cn(
            "shrink-0 animate-pulse rounded-[var(--radius-md)] bg-muted",
            landscape ? "aspect-video w-28 sm:w-40" : "size-24",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {loadingCopy(kind)}
          </p>
          <p className="mt-2 truncate font-mono text-xs text-muted-foreground">{entry.url}</p>
        </div>
      </article>
    );
  }

  if (entry.status === "error" || !entry.post) {
    return (
      <article className="min-w-0 rounded-[var(--radius-lg)] bg-card p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-destructive">Nicht geladen</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {entry.error ?? "Unbekannter Fehler"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Entfernen">
            <X />
          </Button>
        </div>
        <p className="mt-3 truncate font-mono text-xs text-muted-foreground">{entry.url}</p>
        <Button type="button" variant="outline" className="mt-3" onClick={onRetry}>
          <RotateCw />
          Erneut versuchen
        </Button>
      </article>
    );
  }

  return <ReadyCard post={entry.post} preferred={preferred} onRemove={onRemove} />;
}

function ReadyCard({
  post,
  preferred,
  onRemove,
}: {
  post: ResolvedPost;
  preferred: QualityPref;
  onRemove: () => void;
}) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const titled = isYoutubeKind(post.kind) || isTiktokKind(post.kind);
  const landscape = post.kind === "youtube";
  const cover = post.thumbnailUrl ?? post.items[0]?.thumbnailUrl ?? post.items[0]?.url;
  const coverSrc = cover ? mediaProxyPath(cover, "thumb.jpg", true) : undefined;
  const primary = pickPreferredItem(post, preferred);
  const apple = isAppleDevice();
  const heading = titled
    ? post.caption || (post.authorName ? `@${post.authorName}` : post.shortcode)
    : post.authorName
      ? `@${post.authorName}`
      : post.shortcode;
  const sub = titled
    ? [post.caption && post.authorName ? `@${post.authorName}` : null, post.duration]
        .filter(Boolean)
        .join(" · ")
    : post.caption;

  async function onSave(item: MediaItem) {
    setSavingId(item.id);
    try {
      await handleSave(item);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sichern fehlgeschlagen.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <article className="min-w-0 overflow-hidden rounded-[var(--radius-lg)] bg-card shadow-elevated">
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          landscape ? "aspect-video" : "aspect-[9/14] max-h-72",
        )}
      >
        {primary?.type === "audio" ? (
          <>
            {coverSrc ? (
              <img
                src={coverSrc}
                alt=""
                className="size-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <Music2 className="size-6" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-background/90 p-3">
              <audio
                src={mediaProxyPath(primary.url, primary.filename, true)}
                controls
                preload="metadata"
                className="w-full"
              />
            </div>
          </>
        ) : primary?.type === "video" ? (
          <video
            src={mediaProxyPath(primary.url, primary.filename, true)}
            poster={coverSrc}
            controls
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        ) : coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="size-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <Film className="size-6" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{KIND_LABEL[post.kind]}</Badge>
              <span className="text-sm tabular-nums text-muted-foreground">
                {post.items.length} Datei{post.items.length === 1 ? "" : "en"}
                {post.duration ? ` · ${post.duration}` : ""}
              </span>
            </div>
            <p className="mt-2 truncate text-base font-medium">{heading}</p>
            {sub ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sub}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Entfernen">
            <Trash2 />
          </Button>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {post.items.map((item, index) => {
            const active = primary?.id === item.id;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex min-w-0 items-center justify-between gap-2 rounded-[var(--radius-md)] px-2 py-1.5",
                  active && "bg-muted",
                )}
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  {item.type === "audio" ? (
                    <Music2 className="size-3.5 shrink-0" />
                  ) : item.type === "video" ? (
                    <Film className="size-3.5 shrink-0" />
                  ) : (
                    <ImageIcon className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {item.label ?? itemFallbackLabel(item, index, post.items.length)}
                  </span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={active ? "default" : "secondary"}
                  disabled={savingId === item.id}
                  onClick={() => void onSave(item)}
                >
                  {savingId === item.id ? (
                    <LoaderCircle className="animate-spin" />
                  ) : apple ? (
                    <Share />
                  ) : (
                    <Download />
                  )}
                  {savingId === item.id ? "Sichert…" : "Sichern"}
                </Button>
              </li>
            );
          })}
        </ul>
        {apple ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            iPhone: Sichern öffnet das Teilen-Menü. Dort „In Fotos sichern“ wählen.
          </p>
        ) : null}
      </div>
    </article>
  );
}
