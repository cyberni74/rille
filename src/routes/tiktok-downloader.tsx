import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/tiktok-downloader")({
  head: () => seoHead("tiktok"),
  component: TiktokDownloaderPage,
});

function TiktokDownloaderPage() {
  return <HomePage platform="tiktok" />;
}
