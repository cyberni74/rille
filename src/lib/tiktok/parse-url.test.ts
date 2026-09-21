import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTiktokUrls, parseTiktokUrl, tiktokDedupeKey } from "./parse-url.ts";

test("parses standard @user/video URLs", () => {
  const parsed = parseTiktokUrl(
    "https://www.tiktok.com/@scout2015/video/6718335390845095173?is_from_webapp=1",
  );
  assert.equal(parsed?.videoId, "6718335390845095173");
  assert.equal(parsed?.username, "scout2015");
  assert.equal(parsed?.canonical, "https://www.tiktok.com/@scout2015/video/6718335390845095173");
  assert.equal(tiktokDedupeKey(parsed!), "tt:6718335390845095173");
});

test("parses mobile html, share, embed, and query-id URLs", () => {
  assert.equal(parseTiktokUrl("https://m.tiktok.com/v/6718335390845095173.html")?.videoId, "6718335390845095173");
  assert.equal(parseTiktokUrl("https://www.tiktok.com/share/video/6718335390845095173")?.videoId, "6718335390845095173");
  assert.equal(parseTiktokUrl("https://www.tiktok.com/embed/v2/6718335390845095173")?.videoId, "6718335390845095173");
  assert.equal(
    parseTiktokUrl("https://www.tiktok.com/?share_item_id=6718335390845095173")?.videoId,
    "6718335390845095173",
  );
});

test("parses short vm/vt and /t/ links", () => {
  assert.equal(parseTiktokUrl("https://vm.tiktok.com/ZMxxxx/")?.kind, "short");
  assert.equal(parseTiktokUrl("https://vt.tiktok.com/ZSxxxx")?.kind, "short");
  assert.equal(parseTiktokUrl("https://www.tiktok.com/t/ZTRabcd/")?.kind, "short");
});

test("extracts unique tiktok urls from share text", () => {
  const found = extractTiktokUrls(
    "schau https://www.tiktok.com/@scout2015/video/6718335390845095173 und https://m.tiktok.com/v/6718335390845095173.html",
  );
  assert.equal(found.length, 1);
});
