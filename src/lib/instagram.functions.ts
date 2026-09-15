import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveInstagramPost } from "./instagram/resolve.server";
import type { ResolveResult } from "./instagram/types";
import { extractMediaUrls, canonicalMediaUrl, mediaDedupeKey } from "./media-url";
import { parseYoutubeUrl } from "./youtube/parse-url";
import { resolveYoutubeVideo } from "./youtube/resolve.server";
import { parseTiktokUrl } from "./tiktok/parse-url";
import { resolveTiktokVideo } from "./tiktok/resolve.server";

const MAX_BATCH = 12;
const CONCURRENCY = 3;

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      out[index] = await fn(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

export const resolveMedia = createServerFn({ method: "POST" })
  .validator(
    z.object({
      urls: z.array(z.string().min(8).max(500)).min(1).max(MAX_BATCH),
    }),
  )
  .handler(async ({ data }): Promise<{ results: ResolveResult[] }> => {
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const raw of data.urls) {
      const extracted = extractMediaUrls(raw);
      const candidates = extracted.length ? extracted : [raw.trim()];
      for (const candidate of candidates) {
        const canonical = canonicalMediaUrl(candidate) ?? candidate;
        const key = mediaDedupeKey(canonical);
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(canonical);
        if (unique.length >= MAX_BATCH) break;
      }
      if (unique.length >= MAX_BATCH) break;
    }

    return {
      results: await mapPool(unique, CONCURRENCY, async (url): Promise<ResolveResult> => {
        try {
          const post = parseTiktokUrl(url)
            ? await resolveTiktokVideo(url)
            : parseYoutubeUrl(url)
              ? await resolveYoutubeVideo(url)
              : await resolveInstagramPost(url);
          return { ok: true, post };
        } catch (error) {
          return {
            ok: false,
            failure: {
              sourceUrl: url,
              error:
                error instanceof Error
                  ? error.message
                  : "Der Link konnte nicht geladen werden.",
            },
          };
        }
      }),
    };
  });
