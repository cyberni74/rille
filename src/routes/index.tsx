import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seoHead("instagram"),
  component: Home,
});

function Home() {
  return <HomePage platform="instagram" />;
}
