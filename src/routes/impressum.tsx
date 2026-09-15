import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { legalHead } from "@/lib/seo";

export const Route = createFileRoute("/impressum")({
  head: () =>
    legalHead(
      "Impressum",
      "Impressum von Rille, dem Video-Tool zum Sichern öffentlicher Instagram-Reels, YouTube-Videos und TikToks.",
      "/impressum",
    ),
  component: Impressum,
});

function Impressum() {
  return (
    <LegalPage title="Impressum">
      <p>
        Rille ist ein Web-Werkzeug zum Sichern öffentlich erreichbarer Instagram-Reels, Beiträge,
        YouTube-Videos, Shorts und TikToks. Es wird als Demo-Produkt bereitgestellt.
      </p>
      <p>
        Für inhaltliche Fragen zum Tool nutze die FAQ auf der Startseite. Rille ist nicht mit
        Instagram, Meta, YouTube, Google, TikTok oder ByteDance verbunden.
      </p>
      <p>
        Instagram und Reels sind Marken von Meta. YouTube und Shorts sind Marken von Google. TikTok
        ist eine Marke von ByteDance. Die Nutzung der Marken dient ausschließlich der Beschreibung
        der unterstützten Quellen.
      </p>
    </LegalPage>
  );
}
