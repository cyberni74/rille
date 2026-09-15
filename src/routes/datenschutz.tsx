import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { legalHead } from "@/lib/seo";

export const Route = createFileRoute("/datenschutz")({
  head: () =>
    legalHead(
      "Datenschutz",
      "Datenschutzhinweise für Rille: kein Konto, keine Tracker, Verlauf nur in diesem Browser.",
      "/datenschutz",
    ),
  component: Datenschutz,
});

function Datenschutz() {
  return (
    <LegalPage title="Datenschutz">
      <p>
        Rille benötigt kein Konto. Links, die du einfügst, werden nur verarbeitet, um die
        öffentliche Datei aufzulösen und dir den Download bereitzustellen.
      </p>
      <p>
        Der Verlauf „Zuletzt geladen“ bleibt in diesem Browser (localStorage) und wird nicht auf
        einem Server-Konto gespeichert. Du kannst ihn jederzeit löschen.
      </p>
      <p>
        Es werden keine Werbetracker eingebettet. Technische Logs der Infrastruktur können
        übliche Verbindungsdaten enthalten. Private Instagram-, YouTube- oder TikTok-Inhalte
        werden nicht umgangen.
      </p>
    </LegalPage>
  );
}
