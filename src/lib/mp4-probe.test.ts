import assert from "node:assert/strict";
import { test } from "node:test";
import { prefersDirectMedia, sniffMedia } from "./mp4-probe.ts";

test("sniffMedia tells an MP4 from a text page", () => {
  const mp4 = new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  assert.equal(sniffMedia(mp4), "mp4");
  assert.equal(sniffMedia(new TextEncoder().encode("<html><body>nope</body></html>")), "text");
  assert.equal(sniffMedia(new TextEncoder().encode('{"error":1}')), "text");
});

test("YouTube file hosts play directly, not through the proxy", () => {
  assert.equal(prefersDirectMedia("https://aiden90.savenow.to/api/v2/download/abc"), true);
  assert.equal(prefersDirectMedia("https://i.ytimg.com/vi/abc/hqdefault.jpg"), true);
  assert.equal(prefersDirectMedia("https://rille.vercel.app/api/file?u=1"), false);
});
