import { createFileRoute } from "@tanstack/react-router";
import { LegalBlocks, LegalPage } from "@/components/legal-page";
import { useLocale } from "@/components/locale-context";
import { legalUi, termsBlocks } from "@/lib/legal-copy";
import { legalHead } from "@/lib/seo";

export const Route = createFileRoute("/nutzung")({
  head: () =>
    legalHead(
      "Nutzungsbedingungen",
      "Nutzungsbedingungen für Rille: nur berechtigte, öffentliche Inhalte. Kontakt für Rechteinhaber.",
      "/nutzung",
    ),
  component: Nutzung,
});

function Nutzung() {
  const { locale } = useLocale();
  const ui = legalUi(locale);
  return (
    <LegalPage title={ui.termsTitle} lead={ui.termsLead}>
      <LegalBlocks blocks={termsBlocks(locale)} />
    </LegalPage>
  );
}
