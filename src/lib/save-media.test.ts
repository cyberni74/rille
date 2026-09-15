import assert from "node:assert/strict";
import { test } from "node:test";
import type { MediaItem, ResolvedPost } from "./instagram/types.ts";
import { galleryItems, pickPreferredItem } from "./gallery-items.ts";

function item(partial: Partial<MediaItem> & Pick<MediaItem, "id" | "type" | "filename">): MediaItem {
  return {
    url: `https://example.com/${partial.filename}`,
    ...partial,
  };
}

function post(items: MediaItem[], kind: ResolvedPost["kind"] = "reel"): ResolvedPost {
  return {
    sourceUrl: "https://example.com/p",
    shortcode: "x",
    kind,
    items,
  };
}

test("YouTube qualities: gallery keeps the preferred file only", () => {
  const resolved = post(
    [
      item({ id: "1080", type: "video", filename: "a-1080.mp4", quality: "1080" }),
      item({ id: "720", type: "video", filename: "a-720.mp4", quality: "720" }),
      item({ id: "360", type: "video", filename: "a-360.mp4", quality: "360" }),
    ],
    "youtube",
  );
  const picked = galleryItems(resolved, "720");
  assert.equal(picked.length, 1);
  assert.equal(picked[0]?.id, "720");
});

test("TikTok HD + original + audio: gallery keeps one video", () => {
  const resolved = post(
    [
      item({ id: "hd", type: "video", filename: "t-hd.mp4", quality: "1080" }),
      item({ id: "std", type: "video", filename: "t.mp4", quality: "original" }),
      item({ id: "mp3", type: "audio", filename: "t.mp3", quality: "audio" }),
    ],
    "tiktok",
  );
  const picked = galleryItems(resolved, "original");
  assert.equal(picked.length, 1);
  assert.equal(picked[0]?.id, "std");
});

test("carousel photos: gallery keeps every image", () => {
  const resolved = post(
    [
      item({ id: "1", type: "image", filename: "1.jpg" }),
      item({ id: "2", type: "image", filename: "2.jpg" }),
      item({ id: "3", type: "image", filename: "3.jpg" }),
    ],
    "carousel",
  );
  const picked = galleryItems(resolved, "original");
  assert.equal(picked.map((entry) => entry.id).join(","), "1,2,3");
});

test("audio preference returns the mp3", () => {
  const resolved = post(
    [
      item({ id: "hd", type: "video", filename: "t-hd.mp4", quality: "1080" }),
      item({ id: "mp3", type: "audio", filename: "t.mp3", quality: "audio" }),
    ],
    "tiktok",
  );
  const picked = galleryItems(resolved, "audio");
  assert.equal(picked.length, 1);
  assert.equal(picked[0]?.id, "mp3");
  assert.equal(pickPreferredItem(resolved, "1080")?.id, "hd");
});
