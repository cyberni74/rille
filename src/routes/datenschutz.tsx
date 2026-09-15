import { createFileRoute } from "@tanstack/react-router";
import { LegalBlocks, LegalPage } from "@/components/legal-page";
import { useLocale } from "@/components/locale-context";
import { legalUi, privacyBlocks } from "@/lib/legal-copy";
import { legalHead } from "@/lib/seo";

export const Route = createFileRoute("/datenschutz")({
  head: () =>
    legalHead(
      "Datenschutz",
      "Datenschutzerklärung von Rille: Verantwortlicher, Rechtsgrundlagen, Empfänger, Speicher in diesem Browser.",
      "/datenschutz",
    ),
  component: Datenschutz,
});

function Datenschutz() {
  const { locale } = useLocale();
  const ui = legalUi(locale);
  return (
    <LegalPage title={ui.privacyTitle} lead={ui.privacyLead}>
      <LegalBlocks blocks={privacyBlocks(locale)} />
    </LegalPage>
  );
}
