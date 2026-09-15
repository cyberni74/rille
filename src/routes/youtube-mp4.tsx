import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/youtube-mp4")({
  head: () => seoHead("youtube"),
  component: YoutubeMp4Page,
});

function YoutubeMp4Page() {
  return <HomePage platform="youtube" />;
}
