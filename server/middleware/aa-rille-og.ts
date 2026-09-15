/**
 * After the Grok PWA injector: keep per-route Open Graph title/description
 * and force a share image on rille.vercel.app (the injector skips *.vercel.app).
 */
const ORIGIN = "https://rille.vercel.app";
const IMAGE = `${ORIGIN}/og.jpg`;
const AMP = "\u0026";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", `${AMP}amp;`)
    .replaceAll("<", `${AMP}lt;`)
    .replaceAll(">", `${AMP}gt;`)
    .replaceAll('"', `${AMP}quot;`);
}

function attr(html: string, re: RegExp) {
  return unescape(html.match(re)?.[1] ?? "").trim();
}

function unescape(value: string) {
  return value
    .replaceAll(`${AMP}lt;`, "<")
    .replaceAll(`${AMP}gt;`, ">")
    .replaceAll(`${AMP}quot;`, '"')
    .replaceAll(`${AMP}#39;`, "'")
    .replaceAll(`${AMP}amp;`, "&");
}

function upsert(html: string, attrName: "property" | "name", key: string, content: string) {
  if (!content) return html;
  const tag = `<meta ${attrName}="${key}" content="${escapeHtml(content)}">`;
  const re = new RegExp(`<meta\\b[^>]*(?:property|name)\\s*=\\s*["']${key}["'][^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `${tag}</head>`);
}

function patchHead(html: string) {
  const title = attr(html, /<title\b[^>]*>([^<]*)<\/title>/i);
  const description =
    attr(
      html,
      /<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"]*)["'][^>]*>/i,
    ) ||
    attr(
      html,
      /<meta\b[^>]*content\s*=\s*["']([^"]*)["'][^>]*name\s*=\s*["']description["'][^>]*>/i,
    );
  const canonical = attr(
    html,
    /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"]*)["'][^>]*>/i,
  );
  let next = html;
  if (title) {
    next = upsert(next, "property", "og:title", title);
    next = upsert(next, "name", "twitter:title", title);
  }
  if (description) {
    next = upsert(next, "property", "og:description", description);
    next = upsert(next, "name", "twitter:description", description);
  }
  next = upsert(next, "property", "og:site_name", "Rille");
  next = upsert(next, "property", "og:type", "website");
  next = upsert(next, "property", "og:locale", "de_DE");
  if (canonical) next = upsert(next, "property", "og:url", canonical);
  next = upsert(next, "property", "og:image", IMAGE);
  next = upsert(next, "property", "og:image:width", "1200");
  next = upsert(next, "property", "og:image:height", "630");
  next = upsert(next, "property", "og:image:alt", title || "Rille");
  next = upsert(next, "name", "twitter:card", "summary_large_image");
  next = upsert(next, "name", "twitter:image", IMAGE);
  return next;
}

interface EventShape {
  url: URL;
  req: { method: string; headers: Headers };
}

export default async function rilleOgMiddleware(
  event: EventShape,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET") return next();

  const result = await next();
  if (
    !(result instanceof Response) ||
    !result.body ||
    !String(result.headers.get("content-type") ?? "").includes("text/html") ||
    result.headers.get("content-encoding")
  ) {
    return result;
  }

  const raw = await result.text();
  const patched = patchHead(raw);
  const headers = new Headers(result.headers);
  headers.delete("content-length");
  return new Response(patched, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
