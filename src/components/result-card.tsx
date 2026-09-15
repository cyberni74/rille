import { useEffect, useState } from "react";
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
import { useLocale } from "@/components/locale-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaProxyPath } from "@/lib/instagram/allowlist";
import { mediaSourceKind } from "@/lib/media-url";
import type { MediaItem, PostKind, ResolvedPost } from "@/lib/instagram/types";
import type { QualityPref } from "@/lib/platform";
import { publicErrorMessage } from "@/lib/public-error";
import { isAppleDevice, saveMedia } from "@/lib/save-media";
import { cn, formatBytes } from "@/lib/utils";
import type { QueueEntry } from "@/store/queue";

export async function handleSave(item: MediaItem) {
  const result = await saveMedia(item);
  if (result === "shared") {
    toast.success(
      typeof document !== "undefined" && document.documentElement.lang.startsWith("en")
        ? "Share sheet is open. Tap “Save to Photos”."
        : "Teilen-Menü ist offen. Dort „In Fotos sichern“ tippen.",
    );
  } else if (result === "downloaded") {
    toast.success(
      typeof document !== "undefined" && document.documentElement.lang.startsWith("en")
        ? "Download started."
        : "Download gestartet.",
    );
  }
}

function isYoutubeKind(kind: PostKind | string | null) {
  return kind === "youtube" || kind === "short";
}

function isTiktokKind(kind: PostKind | string | null) {
  return kind === "tiktok";
}

function itemFallbackLabel(item: MediaItem, index: number, total: number) {
  const base = item.type === "video" ? "MP4" : item.type === "audio" ? "MP3" : "JPG";
  return total > 1 ? `${base} ${index + 1}` : base;
}

function itemLine(item: MediaItem, index: number, total: number) {
  const bits = [item.label ?? itemFallbackLabel(item, index, total)];
  if (item.height && !/p\b/i.test(bits[0] ?? "")) bits.push(`${item.height}p`);
  const size = formatBytes(item.bytes);
  if (size) bits.push(size);
  return bits.join(" · ");
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
  onAbort,
}: {
  entry: QueueEntry;
  preferred: QualityPref;
  onRemove: () => void;
  onRetry: () => void;
  onAbort?: () => void;
}) {
  const { locale, t } = useLocale();

  if (entry.status === "loading") {
    const kind = mediaSourceKind(entry.url);
    const landscape = kind === "youtube";
    return (
      <article className="flex min-h-36 min-w-0 flex-col gap-3 rounded-[var(--radius-lg)] bg-card p-4 shadow-soft sm:flex-row sm:items-center">
        <div
          className={cn(
            "shrink-0 animate-pulse rounded-[var(--radius-md)] bg-muted",
            landscape ? "aspect-video w-full sm:w-40" : "aspect-[9/16] w-full max-w-28",
          )}
        />
        <div className="min-w-0 flex-1">
          <LoadingStatus phrases={t.loading} />
          <p className="mt-2 truncate font-mono text-xs text-muted-foreground">{entry.url}</p>
          {onAbort ? (
            <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={onAbort}>
              {t.abort}
            </Button>
          ) : null}
        </div>
      </article>
    );
  }

  if (entry.status === "error" || !entry.post) {
    return (
      <article className="min-w-0 rounded-[var(--radius-lg)] bg-card p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-destructive">{t.notLoaded}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {publicErrorMessage(entry.error, locale)}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={t.remove}>
            <X />
          </Button>
        </div>
        <p className="mt-3 truncate font-mono text-xs text-muted-foreground">{entry.url}</p>
        <Button type="button" variant="outline" className="mt-3" onClick={onRetry}>
          <RotateCw />
          {t.retry}
        </Button>
      </article>
    );
  }

  return <ReadyCard post={entry.post} preferred={preferred} onRemove={onRemove} />;
}

function LoadingStatus({ phrases }: { phrases: readonly string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [phrases]);
  return (
    <div>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        {phrases[index]}
      </p>
      <div className="rille-bar mt-3" aria-hidden>
        <span />
      </div>
    </div>
  );
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
  const { t } = useLocale();
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
      toast.error(error instanceof Error ? error.message : t.saveFail);
    } finally {
      setSavingId(null);
    }
  }

  const ratio =
    primary?.width && primary.height
      ? primary.width / primary.height
      : landscape
        ? 16 / 9
        : 9 / 16;

  return (
    <article className="min-w-0 overflow-hidden rounded-[var(--radius-lg)] bg-card shadow-elevated">
      <div
        className="relative w-full overflow-hidden bg-muted"
        style={{ aspectRatio: String(ratio) }}
      >
        {primary?.type === "audio" ? (
          <>
            {coverSrc ? (
              <img
                src={coverSrc}
                alt=""
                className="absolute inset-0 size-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
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
            className="absolute inset-0 size-full object-cover"
          />
        ) : coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="absolute inset-0 size-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
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
              <Badge>{t.kind[post.kind]}</Badge>
              <span className="text-sm tabular-nums text-muted-foreground">
                {t.files(post.items.length)}
                {post.duration ? ` · ${post.duration}` : ""}
              </span>
            </div>
            <p className="mt-2 truncate text-base font-medium">{heading}</p>
            {sub ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sub}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={t.remove}>
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
                  <span className="truncate">{itemLine(item, index, post.items.length)}</span>
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
                  {savingId === item.id ? t.saving : t.save}
                </Button>
              </li>
            );
          })}
        </ul>
        {apple ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.appleHint}</p>
        ) : null}
      </div>
    </article>
  );
}
