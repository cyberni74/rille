import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveInstagramPost } from "./instagram/resolve.server";
import type { ResolveResult } from "./instagram/types";
import { extractMediaUrls, canonicalMediaUrl, mediaDedupeKey } from "./media-url";
import { parseYoutubeUrl } from "./youtube/parse-url";
import { resolveYoutubeVideo } from "./youtube/resolve.server";
import { parseTiktokUrl } from "./tiktok/parse-url";
import { resolveTiktokVideo } from "./tiktok/resolve.server";
import { publicErrorMessage } from "./public-error";
import type { QualityPref } from "./platform";
import { isLocale, type Locale } from "./locale";

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
      quality: z.enum(["1080", "720", "360", "original", "audio"]).optional(),
      locale: z.enum(["de", "en"]).optional(),
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

    const quality = data.quality as QualityPref | undefined;
    const locale: Locale = isLocale(data.locale) ? data.locale : "de";

    return {
      results: await mapPool(unique, CONCURRENCY, async (url): Promise<ResolveResult> => {
        try {
          const post = parseTiktokUrl(url)
            ? await resolveTiktokVideo(url, locale)
            : parseYoutubeUrl(url)
              ? await resolveYoutubeVideo(url, quality, locale)
              : await resolveInstagramPost(url);
          const asked = mediaDedupeKey(url);
          const got = mediaDedupeKey(post.sourceUrl);
          if (asked && got && asked !== got) {
            const id = post.shortcode;
            const related = Boolean(
              id &&
                (url.includes(id) ||
                  asked.endsWith(id) ||
                  got.endsWith(id) ||
                  asked.includes(`:${id}`) ||
                  got.includes(`:${id}`)),
            );
            if (!related) {
              return {
                ok: false,
                failure: { sourceUrl: url, error: publicErrorMessage("not found", locale) },
              };
            }
          }
          return { ok: true, post };
        } catch (error) {
          return {
            ok: false,
            failure: {
              sourceUrl: url,
              error: publicErrorMessage(error instanceof Error ? error.message : error, locale),
            },
          };
        }
      }),
    };
  });
