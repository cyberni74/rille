import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ClipboardPaste,
  Download,
  Film,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DemoPreview } from "@/components/demo-preview";
import { useLocale } from "@/components/locale-context";
import { useActivePlatform } from "@/components/platform-context";
import { handleSave, ResultCard } from "@/components/result-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveMedia } from "@/lib/instagram.functions";
import {
  canonicalMediaUrl,
  extractMediaUrls,
  mediaDedupeKey,
  mediaSourceKind,
  platformForUrl,
  type MediaSourceKind,
} from "@/lib/media-url";
import { publicErrorMessage } from "@/lib/public-error";
import { PLATFORM_PATH, platformCopy, type PlatformId } from "@/lib/platform";
import { stashPendingSlots, takePendingSlots } from "@/lib/pending-slots";
import { cn, delay } from "@/lib/utils";
import { usePlatform } from "@/store/platform";
import { useQueue } from "@/store/queue";

const MAX_SLOTS = 12;
const TIMEOUT_MS = 30_000;

const SOURCE_LABEL: Record<MediaSourceKind, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  short: "Short",
  tiktok: "TikTok",
};

export function Downloader() {
  const [slots, setSlots] = useState<string[]>([""]);
  const [attempted, setAttempted] = useState(false);
  const platform = useActivePlatform();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const storedQuality = usePlatform((s) => s.quality);
  const setQuality = usePlatform((s) => s.setQuality);
  const copy = platformCopy(platform, locale);
  const quality = copy.quality.some((tile) => tile.id === storedQuality)
    ? storedQuality
    : copy.defaultQuality;
  const hydrate = useQueue((s) => s.hydrate);
  const start = useQueue((s) => s.start);
  const fulfill = useQueue((s) => s.fulfill);
  const fail = useQueue((s) => s.fail);
  const reset = useQueue((s) => s.reset);
  const remove = useQueue((s) => s.remove);
  const entries = useQueue((s) => s.entries);
  const history = useQueue((s) => s.history);
  const busy = useQueue((s) => s.busy);
  const clearHistory = useQueue((s) => s.clearHistory);
  const runRef = useRef<(urls: string[]) => Promise<void>>(async () => {});
  const genRef = useRef(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const detected = useMemo(() => {
    const found: string[] = [];
    const seen = new Set<string>();
    for (const slot of slots) {
      const extracted = extractMediaUrls(slot);
      const candidate = extracted[0] ?? slot.trim();
      if (!candidate) continue;
      const canonical = canonicalMediaUrl(candidate) ?? candidate;
      const key = mediaDedupeKey(canonical);
      if (seen.has(key)) continue;
      seen.add(key);
      found.push(canonical);
    }
    return found;
  }, [slots]);

  const slotErrors = useMemo(() => {
    return slots.map((slot) => {
      const trimmed = slot.trim();
      if (!trimmed) return null;
      const extracted = extractMediaUrls(trimmed);
      const candidate = extracted[0] ?? trimmed;
      const plat = platformForUrl(candidate);
      if (plat === platform) return null;
      if (plat) return t.onlyThis(copy.label);
      if (/^https?:\/\//i.test(candidate) || extracted.length) return t.invalidField(copy.label);
      return t.invalidField(copy.label);
    });
  }, [slots, platform, copy.label, t]);

  const visibleEntries = entries.filter((entry) => {
    const plat = platformForUrl(entry.url);
    return !plat || plat === platform;
  });
  const visibleHistory = history.filter((item) => {
    const plat = platformForUrl(item.url);
    return !plat || plat === platform;
  });

  function updateSlot(index: number, value: string) {
    setSlots((current) => current.map((slot, i) => (i === index ? value : slot)));
  }

  function addSlot() {
    setSlots((current) => (current.length >= MAX_SLOTS ? current : [...current, ""]));
  }

  function removeSlot(index: number) {
    setSlots((current) => {
      if (current.length <= 1) return [""];
      return current.filter((_, i) => i !== index);
    });
  }

  function fillExample() {
    setAttempted(false);
    setSlots(copy.exampleUrls);
  }

  function goToPlatform(next: PlatformId, urls: string[], autoRun: boolean) {
    stashPendingSlots(urls.slice(0, MAX_SLOTS), autoRun);
    toast.message(t.switched(platformCopy(next, locale).label));
    void navigate({ to: PLATFORM_PATH[next] });
  }

  function abortRun() {
    genRef.current += 1;
    useQueue.getState().entries.forEach((entry) => {
      if (entry.status === "loading") fail(entry.id, t.aborted);
    });
  }

  async function run(urls: string[]) {
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const url of urls) {
      const canonical = canonicalMediaUrl(url) ?? url.trim();
      if (!canonical) continue;
      const key = mediaDedupeKey(canonical);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(canonical);
    }
    if (!unique.length) {
      toast.error(t.noValid(copy.label));
      return;
    }

    const plats = unique.map((url) => platformForUrl(url));
    const foreign = unique.filter((_, i) => plats[i] && plats[i] !== platform);
    if (foreign.length === unique.length && plats[0]) {
      goToPlatform(plats[0] as PlatformId, unique, true);
      return;
    }
    if (foreign.length) {
      toast.error(t.onlyThis(copy.label));
      return;
    }

    if (unique.length > 12) toast.message(t.maxBatch);
    const batch = unique.slice(0, 12);
    const gen = (genRef.current += 1);
    const ids = start(batch);
    const timer = window.setTimeout(() => {
      if (gen !== genRef.current) return;
      ids.forEach((id) => {
        const entry = useQueue.getState().entries.find((item) => item.id === id);
        if (entry?.status === "loading") fail(id, t.loadingTimeout);
      });
      toast.error(t.loadingTimeout);
    }, TIMEOUT_MS);
    try {
      const { results } = await resolveMedia({ data: { urls: batch, quality, locale } });
      if (gen !== genRef.current) return;
      results.forEach((result, index) => {
        const id = ids[index];
        if (!id) return;
        const current = useQueue.getState().entries.find((item) => item.id === id);
        if (current && current.status !== "loading") return;
        if (result.ok) fulfill(id, result.post);
        else fail(id, publicErrorMessage(result.failure.error, locale));
      });
      const ok = results.filter((r) => r.ok).length;
      const failCount = results.length - ok;
      if (ok) toast.success(ok === 1 ? t.loadedOne : t.loadedN(ok));
      if (failCount) toast.error(t.failedN(failCount));
    } catch (error) {
      if (gen !== genRef.current) return;
      ids.forEach((id) => {
        const current = useQueue.getState().entries.find((item) => item.id === id);
        if (current?.status === "loading") {
          fail(id, publicErrorMessage(error instanceof Error ? error.message : error, locale));
        }
      });
      toast.error(t.requestFailed);
    } finally {
      window.clearTimeout(timer);
    }
  }

  runRef.current = run;

  useEffect(() => {
    const pending = takePendingSlots();
    if (!pending) return;
    setSlots(pending.urls);
    if (pending.autoRun) void runRef.current(pending.urls);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    const hasTypedInvalid = slotErrors.some(Boolean) && !detected.length;
    if (hasTypedInvalid) return;
    await run(detected);
  }

  async function pasteIntoSlot(index: number) {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        toast.error(t.emptyClipboard);
        return;
      }
      const urls = extractMediaUrls(text);
      const first = urls[0] ?? text.split(/\s+/)[0] ?? text;
      const detectedPlatform = platformForUrl(first);
      if (detectedPlatform && detectedPlatform !== platform) {
        goToPlatform(detectedPlatform, urls.length ? urls.slice(0, MAX_SLOTS) : [first], false);
        return;
      }
      if (urls.length > 1) {
        setSlots((current) => {
          const next = [...current];
          urls.slice(0, MAX_SLOTS).forEach((url, offset) => {
            const target = index + offset;
            if (target < next.length) next[target] = url;
            else if (next.length < MAX_SLOTS) next.push(url);
          });
          return next;
        });
        toast.success(t.pastedN(Math.min(urls.length, MAX_SLOTS)));
        return;
      }
      updateSlot(index, first);
      toast.success(t.pasted);
    } catch {
      toast.error(t.noClipboard);
    }
  }

  const readyItems = visibleEntries.flatMap(
    (entry) => entry.post?.items.map((item) => ({ entry, item })) ?? [],
  );

  async function downloadAll() {
    if (!readyItems.length) return;
    toast.message(t.saveAllStart(readyItems.length));
    for (const { item } of readyItems) {
      try {
        await handleSave(item);
      } catch (error) {
        toast.error(error instanceof Error ? publicErrorMessage(error.message, locale) : t.saveFail);
      }
      await delay(400);
    }
  }

  function describeDetected(urls: string[]): string {
    const parts: string[] = [];
    let ig = 0;
    let yt = 0;
    let shorts = 0;
    let tt = 0;
    for (const url of urls) {
      const kind = mediaSourceKind(url);
      if (kind === "short") shorts += 1;
      else if (kind === "youtube") yt += 1;
      else if (kind === "instagram") ig += 1;
      else if (kind === "tiktok") tt += 1;
    }
    if (ig) parts.push(`${ig} Instagram`);
    if (yt) parts.push(`${yt} YouTube`);
    if (shorts) parts.push(`${shorts} Short${shorts === 1 ? "" : "s"}`);
    if (tt) parts.push(`${tt} TikTok`);
    return parts.length ? `${parts.join(" · ")} ${t.readySuffix}` : "";
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 sm:max-w-xl lg:max-w-5xl">
      <div className="mt-5 grid items-start gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-8">
        <form
          id="downloader"
          onSubmit={(event) => void onSubmit(event)}
          className="scroll-mt-24 rounded-[var(--radius-lg)] bg-card p-4 shadow-elevated sm:p-5"
          noValidate
        >
          <ol className="grid min-w-0 gap-3">
            {slots.map((slot, index) => {
              const kind = mediaSourceKind(extractMediaUrls(slot)[0] ?? slot);
              const issue = attempted ? slotErrors[index] : null;
              return (
                <li key={index} className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label htmlFor={`link-${index}`} className="text-sm text-muted-foreground">
                      {slots.length > 1 ? t.linkN(index + 1) : t.linkFor(copy.label)}
                    </label>
                    {kind ? (
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {SOURCE_LABEL[kind]}
                      </span>
                    ) : null}
                  </div>
                  <div className="relative min-w-0">
                    <Input
                      id={`link-${index}`}
                      type="text"
                      inputMode="url"
                      enterKeyHint="go"
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={slot}
                      aria-invalid={issue ? true : undefined}
                      aria-describedby={issue ? `link-${index}-error` : undefined}
                      onChange={(event) => updateSlot(index, event.target.value)}
                      placeholder={copy.placeholder}
                      className={cn(
                        "pr-14",
                        slots.length > 1 && "pr-24",
                        issue && "ring-2 ring-destructive/80",
                      )}
                    />
                    <div className="absolute inset-y-1 right-1 flex items-center gap-1">
                      {slots.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-11"
                          onClick={() => removeSlot(index)}
                          aria-label={t.removeField(index + 1)}
                        >
                          <X />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-11"
                        onClick={() => void pasteIntoSlot(index)}
                        aria-label={t.pasteInto(index + 1)}
                      >
                        <ClipboardPaste />
                      </Button>
                    </div>
                  </div>
                  {issue ? (
                    <p id={`link-${index}-error`} className="mt-2 text-sm text-destructive">
                      {issue}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <p className="mt-4 text-sm text-muted-foreground">
            {detected.length ? describeDetected(detected) : copy.detectEmpty}
          </p>

          <div className="mt-4 grid gap-2">
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? <LoaderCircle className="animate-spin" /> : <Film />}
              {copy.label} {t.load}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={addSlot}
                disabled={slots.length >= MAX_SLOTS}
              >
                <Plus />
                {t.moreLink}
              </Button>
              <Button type="button" variant="outline" onClick={fillExample}>
                {t.example}
              </Button>
            </div>
          </div>

          {copy.quality.length > 1 ? (
            <fieldset className="mt-5">
              <legend className="text-sm text-muted-foreground">{t.format}</legend>
              <div
                className={cn(
                  "mt-2 grid gap-2",
                  copy.quality.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
                )}
              >
                {copy.quality.map((tile) => {
                  const selected = quality === tile.id;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => setQuality(tile.id)}
                      className={cn(
                        "min-h-14 rounded-[var(--radius-md)] px-2 py-2 text-center transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)] sm:text-left",
                        selected
                          ? "bg-primary text-primary-foreground shadow-[var(--shadow-border)]"
                          : "bg-muted text-foreground hover:bg-secondary",
                      )}
                    >
                      <span className="block text-sm font-medium sm:text-base">{tile.title}</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs",
                          selected ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {tile.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
        </form>

        {visibleEntries.length > 0 ? (
          <section className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl tracking-[-0.03em]">{t.results}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.filesReady(readyItems.length)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void downloadAll()}
                  disabled={!readyItems.length}
                >
                  <Download />
                  {t.saveAll}
                </Button>
                <Button type="button" variant="ghost" onClick={reset}>
                  {t.clear}
                </Button>
              </div>
            </div>
            <ul className="mt-5 grid min-w-0 gap-4">
              {visibleEntries.map((entry) => (
                <li key={entry.id} className="min-w-0">
                  <ResultCard
                    entry={entry}
                    preferred={quality}
                    onRemove={() => remove(entry.id)}
                    onRetry={() => void run([entry.url])}
                    onAbort={abortRun}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <DemoPreview onUseExample={fillExample} />
        )}
      </div>

      {visibleHistory.length > 0 ? (
        <section className="mt-10 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl tracking-[-0.03em]">{t.history}</h2>
            <Button type="button" variant="ghost" size="sm" onClick={clearHistory}>
              {t.clearHistory}
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {visibleHistory.slice(0, 6).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {item.title || (item.authorName ? `@${item.authorName}` : item.url)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {t.kind[item.kind as keyof typeof t.kind] ?? item.kind}
                    {item.authorName ? ` · @${item.authorName}` : ""}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => void run([item.url])}>
                  {t.again}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
