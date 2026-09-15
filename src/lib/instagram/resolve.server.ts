import { assertPublicMediaUrl } from "./allowlist";
import { parseInstagramUrl } from "./parse-url";
import { fetchSnapFamily } from "./snapinsta.server";
import type { MediaItem, PostKind, ResolvedPost } from "./types";

const IG_APP_ID = "936619743392459";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const GEO_BLOCK = /geoblock|isn'?t available to everyone|can'?t be seen by certain audiences|not available in your country/i;

function safeFilename(name: string, fallback: string) {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").slice(0, 140);
  return cleaned || fallback;
}

function extensionOf(value: string, fallback: "mp4" | "jpg") {
  const match = value.toLowerCase().match(/\.(mp4|m4v|mov|webm|jpg|jpeg|png|webp)(?:$|\?)/);
  if (!match) return fallback;
  if (match[1] === "jpeg") return "jpg";
  return match[1];
}

function classifyMedia(filename: string, url: string): "video" | "image" {
  const ext = extensionOf(`${filename} ${url}`, "jpg");
  return ext === "mp4" || ext === "m4v" || ext === "mov" || ext === "webm"
    ? "video"
    : "image";
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ status: number; text: string }> {
  const { timeoutMs = 14000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...rest, signal: controller.signal });
    const text = await response.text();
    return { status: response.status, text };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Zeitüberschreitung. Bitte noch einmal versuchen.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

type OEmbed = {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  media_id?: string;
  message?: string;
  gating_type?: string;
};

async function fetchOEmbed(canonical: string): Promise<OEmbed | null> {
  const endpoint = `https://www.instagram.com/api/v1/oembed/?${new URLSearchParams({
    url: canonical,
    omitscript: "true",
  })}`;
  try {
    const { status, text } = await fetchText(endpoint, {
      headers: {
        "User-Agent": BROWSER_UA,
        "x-ig-app-id": IG_APP_ID,
        Accept: "application/json",
      },
      timeoutMs: 8000,
    });
    if (!text) return null;
    const parsed = JSON.parse(text) as OEmbed;
    if (status !== 200) return parsed;
    return parsed;
  } catch {
    return null;
  }
}

type ExtractedFile = {
  url: string;
  filename: string;
  type: "video" | "image";
};

function parseInstasavePayload(raw: string): ExtractedFile[] {
  const files: ExtractedFile[] = [];
  const seen = new Set<string>();
  const tokens = raw.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) ?? [];

  for (const token of tokens) {
    const payload = decodeJwtPayload(token);
    const instagramUrl = typeof payload?.url === "string" ? payload.url : "";
    const filename =
      typeof payload?.filename === "string"
        ? payload.filename
        : `instagram.${classifyMedia("", instagramUrl) === "video" ? "mp4" : "jpg"}`;
    const type = classifyMedia(filename, instagramUrl);
    const wrapped = `https://cdn.instasave.website/?token=${token}`;
    const key = instagramUrl || token;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    let url: string | null = null;
    try {
      assertPublicMediaUrl(wrapped);
      url = wrapped;
    } catch {
      if (instagramUrl) {
        try {
          assertPublicMediaUrl(instagramUrl);
          url = instagramUrl;
        } catch {
          url = null;
        }
      }
    }
    if (!url) continue;
    files.push({ url, filename, type });
  }

  return files;
}

async function fetchInstasave(canonical: string): Promise<ExtractedFile[]> {
  let lastStatus = 0;
  let lastBody = "";
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { status, text } = await fetchText("https://api.instasave.website/media", {
        method: "POST",
        headers: {
          "User-Agent": BROWSER_UA,
          "Content-Type": "application/json",
          Accept: "*/*",
          Origin: "https://instasave.website",
          Referer: "https://instasave.website/",
        },
        body: JSON.stringify({ url: canonical }),
        timeoutMs: 12000,
      });
      lastStatus = status;
      lastBody = text;
      const files = parseInstasavePayload(text);
      if (files.length) return files;
      if (status === 404) {
        throw new Error("Beitrag nicht gefunden. Prüfe, ob der Link öffentlich ist.");
      }
      if (status === 429 || status === 403) {
        lastError = new Error(
          "Zu viele Anfragen. Warte einen Moment und versuche es erneut.",
        );
        await sleep(600 * (attempt + 1));
        continue;
      }
      if (status >= 400) {
        lastError = new Error(
          "Die Medienquelle hat den Beitrag nicht ausgeliefert. Gleich noch einmal versuchen.",
        );
        await sleep(400 * (attempt + 1));
        continue;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Netzwerkfehler");
      await sleep(400 * (attempt + 1));
    }
  }

  if (lastBody && parseInstasavePayload(lastBody).length) {
    return parseInstasavePayload(lastBody);
  }
  if (lastStatus === 404) {
    throw new Error("Beitrag nicht gefunden. Prüfe, ob der Link öffentlich ist.");
  }
  throw lastError ?? new Error("Die Medienquelle ist gerade nicht erreichbar.");
}

async function fetchGraphqlMedia(shortcode: string): Promise<ExtractedFile[]> {
  try {
    const home = await fetchText("https://www.instagram.com/", {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html",
      },
      timeoutMs: 7000,
    });
    const csrf = home.text.match(/"csrf_token":"([^"]+)"/)?.[1];
    const lsd = home.text.match(/"LSD",\[\],\{"token":"([^"]+)"/)?.[1];
    if (!csrf || !lsd) return [];

    const attempts = [
      {
        docId: "27128499623469141",
        variables: { shortcode },
        friendly: undefined as string | undefined,
      },
      {
        docId: "8845758582119845",
        variables: {
          shortcode,
          fetch_tagged_user_count: null,
          hoisted_comment_id: null,
          hoisted_reply_id: null,
        },
        friendly: "PolarisPostActionLoadPostQueryQuery",
      },
    ];

    for (const attempt of attempts) {
      const body = new URLSearchParams({
        variables: JSON.stringify(attempt.variables),
        doc_id: attempt.docId,
        lsd,
        server_timestamps: "true",
      });
      if (attempt.friendly) {
        body.set("fb_api_caller_class", "RelayModern");
        body.set("fb_api_req_friendly_name", attempt.friendly);
      }
      const headers: Record<string, string> = {
        "User-Agent": BROWSER_UA,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-IG-App-ID": IG_APP_ID,
        "X-FB-LSD": lsd,
        "X-CSRFToken": csrf,
        "X-ASBD-ID": "129477",
        "Sec-Fetch-Site": "same-origin",
        Origin: "https://www.instagram.com",
        Referer: `https://www.instagram.com/p/${shortcode}/`,
      };
      if (attempt.friendly) headers["X-FB-Friendly-Name"] = attempt.friendly;
      const { status, text } = await fetchText("https://www.instagram.com/graphql/query", {
        method: "POST",
        headers,
        body,
        timeoutMs: 8000,
      });
      if (status !== 200) continue;
      try {
        const json = JSON.parse(text) as {
          data?: Record<string, unknown>;
        };
        const data = json.data ?? {};
        const node =
          (data.xdt_shortcode_media as Record<string, unknown> | undefined) ??
          (data.shortcode_media as Record<string, unknown> | undefined) ??
          (
            data.xdt_api__v1__media__shortcode__web_info as
              | { items?: Record<string, unknown>[] }
              | undefined
          )?.items?.[0];
        if (!node) continue;
        const files = flattenGraphqlNode(node, shortcode);
        if (files.length) return files;
      } catch {
        continue;
      }
    }
  } catch {
    return [];
  }
  return [];
}

function flattenGraphqlNode(node: Record<string, unknown>, shortcode: string): ExtractedFile[] {
  const sidecar = node.edge_sidecar_to_children as
    | { edges?: { node: Record<string, unknown> }[] }
    | undefined;
  const carousel = node.carousel_media as Record<string, unknown>[] | undefined;
  const children =
    sidecar?.edges?.map((edge) => edge.node) ??
    carousel ??
    [node];
  const files: ExtractedFile[] = [];
  children.forEach((child, index) => {
    const videoUrl =
      (typeof child.video_url === "string" && child.video_url) ||
      (Array.isArray(child.video_versions)
        ? (child.video_versions[0] as { url?: string } | undefined)?.url
        : null);
    const displayUrl =
      (typeof child.display_url === "string" && child.display_url) ||
      (
        child.image_versions2 as
          | { candidates?: { url?: string }[] }
          | undefined
      )?.candidates?.[0]?.url;
    if (typeof videoUrl === "string" && videoUrl) {
      files.push({
        url: videoUrl,
        filename: `${shortcode}_${index + 1}.mp4`,
        type: "video",
      });
    } else if (typeof displayUrl === "string" && displayUrl) {
      files.push({
        url: displayUrl,
        filename: `${shortcode}_${index + 1}.jpg`,
        type: "image",
      });
    }
  });
  return files.filter((file) => {
    try {
      assertPublicMediaUrl(file.url);
      return true;
    } catch {
      return false;
    }
  });
}

function pickDownloadable(
  files: ExtractedFile[],
  kindHint: "reel" | "post" | "tv" | "story" | "share",
): ExtractedFile[] {
  const videos = files.filter((file) => file.type === "video");
  const images = files.filter((file) => file.type === "image");
  if ((kindHint === "reel" || kindHint === "tv") && videos.length) {
    return videos;
  }
  if (videos.length >= 1 && images.length === 1) {
    return videos;
  }
  return files;
}

function inferKind(
  parsedKind: "reel" | "post" | "tv" | "story" | "share",
  files: ExtractedFile[],
): PostKind {
  if (parsedKind === "story") return "story";
  if (parsedKind === "reel") return "reel";
  if (parsedKind === "tv") return "video";
  if (files.length > 1) return "carousel";
  if (files[0]?.type === "video") return "video";
  return "photo";
}

function geoblocked(oembed: OEmbed | null): boolean {
  if (!oembed) return false;
  if (oembed.gating_type === "unappealable") return true;
  const blob = `${oembed.message ?? ""} ${oembed.title ?? ""}`;
  return GEO_BLOCK.test(blob);
}

export async function resolveInstagramPost(rawUrl: string): Promise<ResolvedPost> {
  const parsed = parseInstagramUrl(rawUrl);
  if (!parsed) {
    throw new Error("Das sieht nicht nach einem Instagram-Link aus.");
  }

  const canonical = parsed.canonical;
  const [oembed, files] = await Promise.all([
    fetchOEmbed(
      canonical.startsWith("https://www.instagram.com/stories/") ? rawUrl : canonical,
    ),
    (async () => {
      const errors: Error[] = [];
      try {
        const fromSnap = await fetchSnapFamily(canonical);
        if (fromSnap.length) return fromSnap;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error("Snapinsta fehlgeschlagen"));
      }
      try {
        const fromSave = await fetchInstasave(canonical);
        if (fromSave.length) return fromSave;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error("Instasave fehlgeschlagen"));
      }
      if (parsed.shortcode) {
        const fromGql = await fetchGraphqlMedia(parsed.shortcode);
        if (fromGql.length) return fromGql;
      }
      if (errors[0]) throw errors[0];
      return [];
    })(),
  ]);

  if (!files.length) {
    if (geoblocked(oembed)) {
      throw new Error(
        "Dieser Beitrag ist regional gesperrt oder nicht für alle sichtbar. Instagram liefert ihn hier nicht aus.",
      );
    }
    throw new Error(
      "Keine öffentlichen Medien gefunden. Private Beiträge, Stories und Login-Wände können nicht geladen werden.",
    );
  }

  const shortcode =
    parsed.shortcode ?? files[0]?.filename.replace(/\W+/g, "").slice(0, 12) ?? "post";
  const downloadable = pickDownloadable(files, parsed.kind);
  const blocked = geoblocked(oembed) || GEO_BLOCK.test(oembed?.title ?? "");
  const caption = blocked ? undefined : oembed?.title;
  const thumbnail = files.find((file) => file.type === "image")?.url;

  const items: MediaItem[] = downloadable.map((file, index) => {
    const ext = extensionOf(file.filename, file.type === "video" ? "mp4" : "jpg");
    const author = !blocked && oembed?.author_name ? `${oembed.author_name}_` : "";
    return {
      id: `${shortcode}-${index}`,
      type: file.type,
      url: file.url,
      thumbnailUrl: file.type === "image" ? file.url : thumbnail,
      filename: safeFilename(
        `${author}${shortcode}_${index + 1}.${ext}`,
        `${shortcode}_${index + 1}.${ext}`,
      ),
    };
  });

  return {
    sourceUrl: canonical,
    shortcode,
    kind: inferKind(parsed.kind, downloadable),
    authorName: blocked ? undefined : oembed?.author_name,
    authorUrl: blocked ? undefined : oembed?.author_url,
    caption,
    thumbnailUrl: thumbnail,
    items,
  };
}
