import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { legalHead } from "@/lib/seo";

export const Route = createFileRoute("/nutzung")({
  head: () =>
    legalHead(
      "Nutzungsbedingungen",
      "Nutzungsbedingungen für Rille: nur berechtigte, öffentliche Inhalte. Kein Umgehen von Schutzmaßnahmen.",
      "/nutzung",
    ),
  component: Nutzung,
});

function Nutzung() {
  return (
    <LegalPage title="Nutzungsbedingungen">
      <p>
        Du darfst Rille nur für Inhalte nutzen, zu denen du berechtigt bist — in der Regel für den
        privaten Gebrauch oder für eigene Beiträge. Das Tool ersetzt keine Lizenz und umgeht keine
        Schutzmaßnahmen.
      </p>
      <p>
        Private Profile, Close-Friends-Stories, altersbeschränkte und login-geschützte Videos
        werden nicht geladen. Missbrauch, automatisiertes Massen-Scraping oder das Umgehen von
        Zugangsbeschränkungen ist untersagt.
      </p>
      <p>
        Die Verfügbarkeit öffentlicher Dateien hängt von Instagram, YouTube, TikTok und den
        jeweiligen Rechteinhabern ab. Rille übernimmt keine Gewähr für Vollständigkeit oder
        dauerhafte Erreichbarkeit.
      </p>
    </LegalPage>
  );
}
