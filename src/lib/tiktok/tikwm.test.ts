import assert from "node:assert/strict";
import { test } from "node:test";
import { isTikwmRateLimited, postFromTikwm } from "./tikwm.ts";

test("maps tikwm payload to HD, standard and audio items", () => {
  const post = postFromTikwm(
    {
      id: "6718335390845095173",
      title: "hello",
      duration: 10,
      play: "https://v16m.tiktokcdn-us.com/play.mp4",
      hdplay: "https://v16-notes.tiktokcdn-us.com/hd.mp4",
      music: "https://v19-ies-music.tiktokcdn-us.com/a.mp3",
      origin_cover: "https://p19-common-sign.tiktokcdn-us.com/cover.jpg",
      author: { unique_id: "scout2015" },
    },
    {
      canonical: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
      username: "scout2015",
      videoId: "6718335390845095173",
      kind: "video",
    },
    "de",
  );
  assert.equal(post.kind, "tiktok");
  assert.equal(post.authorName, "scout2015");
  assert.equal(post.items.length, 3);
  assert.deepEqual(
    post.items.map((item) => item.quality),
    ["1080", "original", "audio"],
  );
  assert.equal(post.duration, "0:10");
});

test("detects tikwm rate-limit messages", () => {
  assert.equal(isTikwmRateLimited({ code: -1, msg: "Free Api Limit: 1 request/second." }), true);
  assert.equal(isTikwmRateLimited({ code: 0, msg: "success" }), false);
});
