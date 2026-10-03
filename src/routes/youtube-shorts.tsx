import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/youtube-shorts")({
  head: () => seoHead("shorts"),
  component: YoutubeShortsPage,
});

function YoutubeShortsPage() {
  return <HomePage platform="shorts" />;
}
