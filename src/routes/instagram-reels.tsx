import { createFileRoute } from "@tanstack/react-router";
import { redirect301 } from "@/lib/http";

export const Route = createFileRoute("/instagram-reels")({
  server: {
    handlers: {
      GET: ({ request }) => redirect301(request, "/"),
    },
  },
});
