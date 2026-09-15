import { createFileRoute } from "@tanstack/react-router";
import { LegalBlocks, LegalPage } from "@/components/legal-page";
import { useLocale } from "@/components/locale-context";
import { imprintBlocks, legalUi } from "@/lib/legal-copy";
import { legalHead } from "@/lib/seo";

export const Route = createFileRoute("/impressum")({
  head: () =>
    legalHead(
      "Impressum",
      "Impressum von Rille: Anbieterkennzeichnung nach § 5 DDG, Kontakt für Rechteinhaber.",
      "/impressum",
    ),
  component: Impressum,
});

function Impressum() {
  const { locale } = useLocale();
  const ui = legalUi(locale);
  return (
    <LegalPage title={ui.imprintTitle} lead={ui.imprintLead}>
      <LegalBlocks blocks={imprintBlocks(locale)} />
    </LegalPage>
  );
}
