import { createFileRoute } from "@tanstack/react-router";
import { assertPublicMediaUrl } from "@/lib/instagram/allowlist";

function asciiFilename(name: string) {
  const cleaned = name.replace(/[^\w.\-]+/g, "_").slice(0, 140) || "media.bin";
  return cleaned;
}

export const Route = createFileRoute("/api/file")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const incoming = new URL(request.url);
        const target = incoming.searchParams.get("u");
        const name = incoming.searchParams.get("n") ?? "media.bin";
        const inline = incoming.searchParams.get("inline") === "1";
        if (!target) {
          return new Response("Missing media url", { status: 400 });
        }

        let url: URL;
        try {
          url = assertPublicMediaUrl(target);
        } catch (error) {
          return new Response(
            error instanceof Error ? error.message : "Forbidden",
            { status: 400 },
          );
        }

        const host = url.hostname.toLowerCase();
        const referer = host.endsWith("snapcdn.app")
          ? "https://saveinsta.to/"
          : host.includes("instasave")
            ? "https://instasave.website/"
            : host.endsWith("savenow.to") ||
                host.endsWith("affadaffa.com") ||
                host === "loader.to"
              ? "https://loader.to/"
              : host.endsWith("googlevideo.com") || host.endsWith("ytimg.com")
                ? "https://www.youtube.com/"
                : host.includes("tiktok") ||
                    host.endsWith("tikwm.com") ||
                    host.endsWith("byteoversea.com") ||
                    host.endsWith("ibyteimg.com") ||
                    host.endsWith("byteimg.com") ||
                    host.endsWith("muscdn.com") ||
                    host.endsWith("ttwstatic.com") ||
                    host.endsWith("tiktokv.com") ||
                    host.endsWith("tiktokv.us") ||
                    host.endsWith("ibytedtos.com")
                  ? "https://www.tiktok.com/"
                  : "https://www.instagram.com/";
        const upstream = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            Referer: referer,
            Accept: "*/*",
          },
          redirect: "follow",
        });

        if (!upstream.ok || !upstream.body) {
          return new Response("Medien-Download fehlgeschlagen.", {
            status: upstream.status || 502,
          });
        }

        const contentType =
          upstream.headers.get("content-type") ?? "application/octet-stream";
        const filename = asciiFilename(name);
        const disposition = inline ? "inline" : "attachment";
        const headers = new Headers({
          "Content-Type": contentType,
          "Content-Disposition": `${disposition}; filename="${filename}"`,
          "Cache-Control": "private, max-age=120",
          "X-Content-Type-Options": "nosniff",
        });
        const length = upstream.headers.get("content-length");
        if (length) headers.set("Content-Length", length);

        return new Response(upstream.body, {
          status: 200,
          headers,
        });
      },
    },
  },
});
