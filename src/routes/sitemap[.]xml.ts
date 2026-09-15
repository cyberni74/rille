import { createFileRoute } from "@tanstack/react-router";
import { SITEMAP_PATHS } from "@/lib/seo";

function priorityFor(path: string) {
  if (path === "/") return "1.0";
  if (path === "/youtube-mp4" || path === "/tiktok-downloader") return "0.9";
  return "0.3";
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = SITEMAP_PATHS.map((path) => {
          const loc = path === "/" ? `${origin}/` : `${origin}${path}`;
          return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priorityFor(path)}</priority>\n  </url>`;
        }).join("\n");
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
