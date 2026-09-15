import { assertPublicMediaUrl } from "./allowlist";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const TABLE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";

export type SnapFile = {
  url: string;
  filename: string;
  type: "video" | "image";
};

type Site = {
  origin: string;
  home: string;
  referer: string;
};

const SITES: Site[] = [
  {
    origin: "https://saveinsta.to",
    home: "https://saveinsta.to/en",
    referer: "https://saveinsta.to/en",
  },
  {
    origin: "https://snapinsta.to",
    home: "https://snapinsta.to/en46",
    referer: "https://snapinsta.to/en46",
  },
];

const tokenCache = new Map<string, { token: string; exp: string; until: number }>();

async function fetchText(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ status: number; text: string }> {
  const { timeoutMs = 14000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...rest, signal: controller.signal });
    return { status: response.status, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

function siteHeaders(site: Site): Record<string, string> {
  return {
    "User-Agent": BROWSER_UA,
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    Origin: site.origin,
    Referer: site.referer,
  };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

function baseConvert(value: string, fromBase: number, toBase: number) {
  const source = TABLE.slice(0, fromBase);
  const target = TABLE.slice(0, toBase);
  let acc = 0;
  [...value].reverse().forEach((char, index) => {
    const digit = source.indexOf(char);
    if (digit !== -1) acc += digit * fromBase ** index;
  });
  let out = "";
  while (acc > 0) {
    out = target[acc % toBase] + out;
    acc = Math.floor(acc / toBase);
  }
  return out || "0";
}

function decodePacked(raw: string): string | null {
  const match = raw.match(/\}\("(.+?)",\d+,"(.+?)",(\d+),(\d+),(\d+)\)/);
  if (!match) return null;
  const packed = match[1];
  const alphabet = match[2];
  const offset = Number(match[3]);
  const radix = Number(match[4]);
  const separator = alphabet[Number(match[4])];
  if (!separator) return null;
  let decoded = "";
  for (let i = 0; i < packed.length; i += 1) {
    let chunk = "";
    while (i < packed.length && packed[i] !== separator) {
      chunk += packed[i];
      i += 1;
    }
    for (let j = 0; j < alphabet.length; j += 1) {
      chunk = chunk.split(alphabet[j] ?? "").join(String(j));
    }
    decoded += String.fromCharCode(Number.parseInt(baseConvert(chunk, radix, 10), 10) - offset);
  }
  try {
    return decodeURIComponent(decoded);
  } catch {
    return decoded;
  }
}

async function siteTokens(site: Site) {
  const cached = tokenCache.get(site.origin);
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.until > now + 30) return cached;

  const { status, text } = await fetchText(site.home, {
    headers: { "User-Agent": BROWSER_UA, Accept: "text/html" },
    timeoutMs: 10000,
  });
  if (status >= 400) return null;
  const token = text.match(/k_token="([^"]+)"/)?.[1];
  const exp = text.match(/k_exp="([^"]+)"/)?.[1];
  if (!token || !exp) return null;
  const until = Number(exp) || now + 300;
  const next = { token, exp, until };
  tokenCache.set(site.origin, next);
  return next;
}

function classify(filename: string, url: string, label: string): "video" | "image" {
  const blob = `${filename} ${url} ${label}`.toLowerCase();
  if (/\.(mp4|m4v|mov|webm)(?:$|\?)/.test(blob) || /\bvideo\b/.test(blob)) return "video";
  return "image";
}

function parseDownloadHtml(html: string): SnapFile[] {
  const files: SnapFile[] = [];
  const seen = new Set<string>();
  const decoded = html.replace(/\\"/g, '"').replace(/\\'/g, "'");

  for (const match of decoded.matchAll(/https:\/\/dl\.snapcdn\.app\/[^"'\\\s<>]+/g)) {
    const href = match[0];
    if (seen.has(href)) continue;
    const around = decoded
      .slice(Math.max(0, (match.index ?? 0) - 80), (match.index ?? 0) + href.length + 160)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();
    if (/download with|other video|google play|app store/.test(around)) continue;
    const token = href.match(/token=([^&]+)/)?.[1];
    const payload = token ? decodeJwtPayload(token) : null;
    const sourceUrl = typeof payload?.url === "string" ? payload.url : "";
    const filename =
      typeof payload?.filename === "string"
        ? payload.filename
        : sourceUrl
          ? (sourceUrl.split("?")[0]?.split("/").pop() ?? "instagram.bin")
          : "instagram.bin";
    const type = classify(filename, sourceUrl || href, around);
    if (/download thumbnail/.test(around) && type === "image") continue;
    try {
      assertPublicMediaUrl(href);
    } catch {
      continue;
    }
    seen.add(href);
    files.push({ url: href, filename, type });
  }

  if (!files.some((file) => file.type === "image")) {
    for (const match of decoded.matchAll(/https:\/\/i\.snapcdn\.app\/[^"'\\\s<>]+/g)) {
      const href = match[0];
      if (seen.has(href)) continue;
      try {
        assertPublicMediaUrl(href);
      } catch {
        continue;
      }
      seen.add(href);
      files.push({ url: href, filename: "instagram.jpg", type: "image" });
      break;
    }
  }

  const videos = files.filter((file) => file.type === "video");
  const images = files.filter((file) => file.type === "image");
  if (videos.length && images[0]) return [...videos, images[0]];
  if (videos.length) return videos;
  return files;
}

async function fetchFromSite(site: Site, canonical: string): Promise<SnapFile[]> {
  const keys = await siteTokens(site);
  if (!keys) return [];
  const { text: verifyText, status: verifyStatus } = await fetchText(
    `${site.origin}/api/userverify`,
    {
      method: "POST",
      headers: siteHeaders(site),
      body: new URLSearchParams({ url: canonical }).toString(),
      timeoutMs: 10000,
    },
  );
  if (verifyStatus >= 400) return [];
  let cftoken = "";
  try {
    const parsed = JSON.parse(verifyText) as { token?: string };
    cftoken = parsed.token ?? "";
  } catch {
    return [];
  }
  if (!cftoken) return [];

  const { text: searchText, status: searchStatus } = await fetchText(
    `${site.origin}/api/ajaxSearch`,
    {
      method: "POST",
      headers: siteHeaders(site),
      body: new URLSearchParams({
        k_exp: keys.exp,
        k_token: keys.token,
        q: canonical,
        t: "media",
        lang: "en",
        v: "v2",
        cftoken,
      }).toString(),
      timeoutMs: 16000,
    },
  );
  if (searchStatus >= 400) return [];
  const payload = JSON.parse(searchText) as {
    status?: string;
    mess?: string;
    data?: string;
    v?: string;
  };
  if (payload.status && payload.status !== "ok") return [];
  if (payload.mess && !payload.data) {
    throw new Error(payload.mess);
  }
  const raw = payload.data ?? "";
  const html = raw.includes("eval(function") ? (decodePacked(raw) ?? raw) : raw;
  return parseDownloadHtml(html);
}

export async function fetchSnapFamily(canonical: string): Promise<SnapFile[]> {
  let lastError: Error | null = null;
  for (const site of SITES) {
    try {
      const files = await fetchFromSite(site, canonical);
      if (files.length) return files;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Snapinsta fehlgeschlagen");
    }
  }
  if (lastError) throw lastError;
  return [];
}
