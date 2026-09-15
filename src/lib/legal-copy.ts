import type { Locale } from "@/lib/locale";

export const OPERATOR = {
  name: "Bernhard Ehmer",
  email: "bernhardehmer@gmail.com",
};

export type LegalBlock = {
  heading?: string;
  paragraphs: string[];
};

export const LEGAL = {
  de: {
    imprintTitle: "Impressum",
    imprintLead: "Anbieterkennzeichnung nach § 5 Digitale-Dienste-Gesetz (DDG).",
    privacyTitle: "Datenschutz",
    privacyLead: "Informationen nach Art. 13 und 14 DSGVO.",
    termsTitle: "Nutzungsbedingungen",
    termsLead: "Regeln für die Nutzung von Rille.",
  },
  en: {
    imprintTitle: "Imprint",
    imprintLead: "Provider identification under German law (§ 5 DDG).",
    privacyTitle: "Privacy",
    privacyLead: "Information under Art. 13 and 14 GDPR.",
    termsTitle: "Terms of use",
    termsLead: "Rules for using Rille.",
  },
} as const;

export function legalUi(locale: Locale) {
  return LEGAL[locale] ?? LEGAL.de;
}

export function imprintBlocks(locale: Locale): LegalBlock[] {
  if (locale === "en") {
    return [
      {
        heading: "Provider",
        paragraphs: [
          `${OPERATOR.name}`,
          `Email: ${OPERATOR.email}`,
          "Postal address for service of documents: provided promptly on request at the email address above. A street address is not published here so that a private residence is not listed on a public website.",
        ],
      },
      {
        heading: "Contact for rightholders",
        paragraphs: [
          `If you believe material available through Rille infringes your rights, write to ${OPERATOR.email} with the URL and a description of the work. We will review takedown notices and, where appropriate, block the resolution of that link.`,
        ],
      },
      {
        heading: "Responsible for editorial content",
        paragraphs: [
          `Responsible person within the meaning of § 18 (2) MStV: ${OPERATOR.name}, reachable at ${OPERATOR.email}.`,
        ],
      },
      {
        heading: "Online dispute resolution",
        paragraphs: [
          "The European Commission provides a platform for online dispute resolution: https://ec.europa.eu/consumers/odr. Rille is neither obliged nor willing to take part in dispute resolution before a consumer arbitration board.",
        ],
      },
      {
        heading: "What Rille is",
        paragraphs: [
          "Rille is a web tool for saving publicly reachable Instagram Reels and posts, YouTube videos and Shorts, and TikToks. It is offered as a private project, not a registered company, and is not affiliated with Instagram, Meta, YouTube, Google, TikTok or ByteDance.",
        ],
      },
      {
        heading: "Trademarks",
        paragraphs: [
          "Instagram and Reels are trademarks of Meta. YouTube and Shorts are trademarks of Google. TikTok is a trademark of ByteDance. The names are used only to describe the supported sources.",
        ],
      },
    ];
  }
  return [
    {
      heading: "Anbieter",
      paragraphs: [
        `${OPERATOR.name}`,
        `E-Mail: ${OPERATOR.email}`,
        "Ladungsfähige Anschrift: wird auf Anfrage unter der genannten E-Mail unverzüglich mitgeteilt. Eine Straßenanschrift wird hier nicht veröffentlicht, damit eine private Wohnanschrift nicht auf einer öffentlichen Website steht.",
      ],
    },
    {
      heading: "Kontakt für Rechteinhaber",
      paragraphs: [
        `Wenn du der Ansicht bist, dass über Rille erreichbares Material deine Rechte verletzt, schreib an ${OPERATOR.email} mit der URL und einer Beschreibung des Werks. Hinweise auf Rechtsverletzungen werden geprüft; der betreffende Link wird dann gegebenenfalls nicht mehr aufgelöst.`,
      ],
    },
    {
      heading: "Verantwortlich für den Inhalt",
      paragraphs: [
        `Verantwortlich i. S. d. § 18 Abs. 2 MStV: ${OPERATOR.name}, erreichbar unter ${OPERATOR.email}.`,
      ],
    },
    {
      heading: "Online-Streitbeilegung",
      paragraphs: [
        "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr. Rille ist nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      ],
    },
    {
      heading: "Was Rille ist",
      paragraphs: [
        "Rille ist ein Web-Werkzeug zum Sichern öffentlich erreichbarer Instagram-Reels und Beiträge, YouTube-Videos und Shorts sowie TikToks. Es wird als privates Projekt bereitgestellt, nicht als eingetragene Firma, und ist nicht mit Instagram, Meta, YouTube, Google, TikTok oder ByteDance verbunden.",
      ],
    },
    {
      heading: "Marken",
      paragraphs: [
        "Instagram und Reels sind Marken von Meta. YouTube und Shorts sind Marken von Google. TikTok ist eine Marke von ByteDance. Die Nutzung der Namen dient ausschließlich der Beschreibung der unterstützten Quellen.",
      ],
    },
  ];
}

export function privacyBlocks(locale: Locale): LegalBlock[] {
  if (locale === "en") {
    return [
      {
        heading: "Controller",
        paragraphs: [
          `Controller under Art. 4 (7) GDPR: ${OPERATOR.name}, email ${OPERATOR.email}.`,
        ],
      },
      {
        heading: "What this tool does",
        paragraphs: [
          "Rille does not create accounts. You paste a public Instagram, YouTube or TikTok URL. We resolve that URL to a publicly available media file and let you save it. No advertising profile is built. No data is sold.",
        ],
      },
      {
        heading: "Legal bases",
        paragraphs: [
          "Art. 6 (1)(b) GDPR — processing needed to provide the tool you asked to use (resolving the link, returning the file).",
          "Art. 6 (1)(f) GDPR — legitimate interests in operating, securing and preventing abuse of the service (connection logs, rate limits).",
        ],
      },
      {
        heading: "Data we process",
        paragraphs: [
          "The URL you submit, for the purpose of fetching the public file.",
          "Technical connection data at the host (IP address, user agent, time, requested path). These are server logs, not an account.",
          "No content from private profiles. Rille does not bypass logins, age gates or technical protection measures.",
        ],
      },
      {
        heading: "Recipients and processors",
        paragraphs: [
          "Vercel Inc. (USA) hosts the app. The intended region is Frankfurt (fra1). Failover to other Vercel regions, including the USA (for example iad1), can occur. Transfers to the USA are based on the EU Standard Contractual Clauses used by Vercel.",
          "To resolve public links we send the URL you entered to specialised retrieval services: loader.to / savenow.to (YouTube), Snapinsta-family hosts such as snapcdn.app (Instagram), and tikwm.com (TikTok). YouTube oEmbed (Google) and Instagram oEmbed (Meta) may be queried for title and thumbnail of public posts. These parties receive the public URL, not a Rille account.",
          "The page loads a script from grok.com (grok-app-builder/extensions.js) required by the app builder that generated this project. It may contact grok.com / app-builder-deployer.grok.com. Rille does not use that script for advertising. It is documented here because it is a third-party request on every page view.",
        ],
      },
      {
        heading: "Storage in your browser",
        paragraphs: [
          "localStorage key rille-history-v1 stores source URLs of items you recently loaded (not the expired file links). You can clear this list in the UI.",
          "sessionStorage key rille-pending-slots-v1 keeps links briefly when you switch between Instagram, YouTube and TikTok.",
          "localStorage key rille-locale-v1 and the cookie rille-locale remember the language you picked (German or English). The cookie exists so the first server render can match your choice.",
          "These stores stay on your device. They are not copied into a Rille user account — there is none.",
        ],
      },
      {
        heading: "Retention",
        paragraphs: [
          "Submitted URLs are not kept in a server-side user database. Host logs follow the host’s retention (typically days to a few weeks). Browser storage lasts until you delete it.",
        ],
      },
      {
        heading: "Fonts",
        paragraphs: [
          "Typefaces are hosted on this site. The browser does not contact fonts.googleapis.com or fonts.gstatic.com.",
        ],
      },
      {
        heading: "No advertising trackers",
        paragraphs: [
          "Rille does not embed advertising pixels, analytics suites or social plugins. The grok.com builder script described above is the only extra third-party script. Hosting and media-resolution requests are required for the tool to work.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You have the right of access, rectification, erasure, restriction, data portability and objection (Art. 15–18, 20, 21 GDPR). To exercise them, email the controller. You also have the right to lodge a complaint with a supervisory authority. In Germany this is typically the data protection commissioner of the Land where the controller lives; an overview is at https://www.bfdi.bund.de.",
        ],
      },
      {
        heading: "No automated decisions",
        paragraphs: [
          "Rille does not make decisions based solely on automated processing that produce legal effects concerning you (Art. 22 GDPR).",
        ],
      },
    ];
  }
  return [
    {
      heading: "Verantwortlicher",
      paragraphs: [
        `Verantwortlicher i. S. d. Art. 4 Nr. 7 DSGVO: ${OPERATOR.name}, E-Mail ${OPERATOR.email}.`,
      ],
    },
    {
      heading: "Wofür dieses Tool Daten braucht",
      paragraphs: [
        "Rille legt keine Konten an. Du fügst eine öffentliche Instagram-, YouTube- oder TikTok-URL ein. Wir lösen diese URL zu einer öffentlich erreichbaren Mediendatei auf und stellen dir den Download bereit. Es entsteht kein Werbeprofil. Daten werden nicht verkauft.",
      ],
    },
    {
      heading: "Rechtsgrundlagen",
      paragraphs: [
        "Art. 6 Abs. 1 lit. b DSGVO — Verarbeitung, die nötig ist, um das von dir aufgerufene Tool zu erbringen (Link auflösen, Datei ausliefern).",
        "Art. 6 Abs. 1 lit. f DSGVO — berechtigte Interessen am Betrieb, an der Sicherheit und an der Missbrauchsprävention (Verbindungslogs, Begrenzung von Anfragen).",
      ],
    },
    {
      heading: "Welche Daten verarbeitet werden",
      paragraphs: [
        "Die von dir eingegebene URL, um die öffentliche Datei zu holen.",
        "Technische Verbindungsdaten beim Host (IP-Adresse, User-Agent, Zeitpunkt, aufgerufener Pfad). Das sind Serverlogs, kein Konto.",
        "Keine Inhalte privater Profile. Rille umgeht keine Logins, Altersbeschränkungen oder technischen Schutzmaßnahmen.",
      ],
    },
    {
      heading: "Empfänger und Auftragsverarbeitung",
      paragraphs: [
        "Vercel Inc. (USA) hostet die Anwendung. Vorgesehene Region ist Frankfurt (fra1). Ein Ausweichen auf andere Vercel-Regionen, einschließlich der USA (etwa iad1), ist möglich. Übermittlungen in die USA stützen sich auf die von Vercel verwendeten EU-Standardvertragsklauseln.",
        "Zum Auflösen öffentlicher Links wird die von dir eingegebene URL an spezialisierte Dienste geschickt: loader.to / savenow.to (YouTube), Snapinsta-Familie wie snapcdn.app (Instagram) und tikwm.com (TikTok). YouTube-oEmbed (Google) und Instagram-oEmbed (Meta) können für Titel und Vorschaubild öffentlicher Beiträge abgefragt werden. Diese Stellen erhalten die öffentliche URL, kein Rille-Konto.",
        "Die Seite lädt ein Script von grok.com (grok-app-builder/extensions.js), das der App-Baukasten dieses Projekts voraussetzt. Es kann grok.com / app-builder-deployer.grok.com kontaktieren. Rille nutzt dieses Script nicht für Werbung. Es wird hier genannt, weil es bei jedem Seitenaufruf eine Drittanbieter-Anfrage auslöst.",
      ],
    },
    {
      heading: "Speicherung in deinem Browser",
      paragraphs: [
        "localStorage-Schlüssel rille-history-v1 speichert Quell-URLs zuletzt geladener Medien (nicht die ablaufenden Dateilinks). Die Liste lässt sich im Tool löschen.",
        "sessionStorage-Schlüssel rille-pending-slots-v1 hält Links kurz, wenn du zwischen Instagram, YouTube und TikTok wechselst.",
        "localStorage-Schlüssel rille-locale-v1 und der Cookie rille-locale merken die gewählte Sprache (Deutsch oder Englisch). Der Cookie existiert, damit der erste Server-Render zu deiner Wahl passt.",
        "Diese Speicher liegen auf deinem Gerät. Sie werden nicht in ein Rille-Nutzerkonto kopiert — es gibt keines.",
      ],
    },
    {
      heading: "Speicherdauer",
      paragraphs: [
        "Eingegebene URLs werden nicht in einer serverseitigen Nutzerdatenbank gehalten. Host-Logs folgen der Aufbewahrung des Hosters (typisch Tage bis wenige Wochen). Browser-Speicher bleibt, bis du ihn löschst.",
      ],
    },
    {
      heading: "Schriften",
      paragraphs: [
        "Schriftarten liegen auf dieser Site. Der Browser verbindet nicht zu fonts.googleapis.com oder fonts.gstatic.com.",
      ],
    },
    {
      heading: "Keine Werbetracker",
      paragraphs: [
        "Rille bettet keine Werbepixel, Analytics-Suiten oder Social-Plugins ein. Das oben beschriebene grok.com-Baukasten-Script ist das einzige zusätzliche Drittanbieter-Script. Hosting- und Auflösungsanfragen sind für die Funktion nötig.",
      ],
    },
    {
      heading: "Deine Rechte",
      paragraphs: [
        "Du hast Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch (Art. 15–18, 20, 21 DSGVO). Zur Ausübung reicht eine E-Mail an den Verantwortlichen. Du hast außerdem das Recht, dich bei einer Aufsichtsbehörde zu beschweren. In Deutschland ist das in der Regel der Landesdatenschutzbeauftragte des Wohnsitzes des Verantwortlichen; eine Übersicht: https://www.bfdi.bund.de.",
      ],
    },
    {
      heading: "Keine automatisierten Entscheidungen",
      paragraphs: [
        "Rille trifft keine ausschließlich auf automatisierter Verarbeitung beruhenden Entscheidungen, die dir gegenüber rechtliche Wirkung entfalten (Art. 22 DSGVO).",
      ],
    },
  ];
}

export function termsBlocks(locale: Locale): LegalBlock[] {
  if (locale === "en") {
    return [
      {
        heading: "Allowed use",
        paragraphs: [
          "Use Rille only for media you are allowed to save — typically private use or your own posts. The tool is not a licence and does not replace permission from the rightholder.",
        ],
      },
      {
        heading: "Public media only",
        paragraphs: [
          "Private profiles, Close-Friends stories, age-restricted and login-gated videos are not loaded. Rille does not circumvent technical protection measures.",
        ],
      },
      {
        heading: "Prohibited",
        paragraphs: [
          "Automated mass scraping, overloading the service, bypassing access restrictions, or using Rille to infringe copyright or personality rights is forbidden.",
        ],
      },
      {
        heading: "Notice and takedown",
        paragraphs: [
          `Rightholders can send notices to ${OPERATOR.email}. Include the public URL and a description of the work. We will review and, where appropriate, stop resolving that link.`,
        ],
      },
      {
        heading: "Availability",
        paragraphs: [
          "Whether a public file can be fetched depends on Instagram, YouTube, TikTok and the rightholders. Rille does not warrant completeness or lasting availability.",
        ],
      },
      {
        heading: "YouTube, Instagram and TikTok terms",
        paragraphs: [
          "Downloading may conflict with the terms of those platforms. You are responsible for complying with their terms and with copyright law, including § 95a UrhG where it applies. Rille does not circumvent protection measures.",
        ],
      },
    ];
  }
  return [
    {
      heading: "Erlaubte Nutzung",
      paragraphs: [
        "Du darfst Rille nur für Inhalte nutzen, zu denen du berechtigt bist — in der Regel für den privaten Gebrauch oder für eigene Beiträge. Das Tool ersetzt keine Lizenz und keine Zustimmung der Rechteinhaberin.",
      ],
    },
    {
      heading: "Nur öffentliche Medien",
      paragraphs: [
        "Private Profile, Close-Friends-Stories, altersbeschränkte und login-geschützte Videos werden nicht geladen. Rille umgeht keine technischen Schutzmaßnahmen.",
      ],
    },
    {
      heading: "Untersagt",
      paragraphs: [
        "Automatisiertes Massen-Scraping, das Überlasten des Dienstes, das Umgehen von Zugangsbeschränkungen und die Nutzung von Rille zur Verletzung von Urheber- oder Persönlichkeitsrechten sind untersagt.",
      ],
    },
    {
      heading: "Hinweis und Sperrung",
      paragraphs: [
        `Rechteinhaber können Hinweise an ${OPERATOR.email} schicken. Bitte die öffentliche URL und eine Beschreibung des Werks angeben. Wir prüfen und stellen das Auflösen dieses Links gegebenenfalls ein.`,
      ],
    },
    {
      heading: "Verfügbarkeit",
      paragraphs: [
        "Ob eine öffentliche Datei geholt werden kann, hängt von Instagram, YouTube, TikTok und den Rechteinhabern ab. Rille übernimmt keine Gewähr für Vollständigkeit oder dauerhafte Erreichbarkeit.",
      ],
    },
    {
      heading: "Nutzungsbedingungen der Plattformen",
      paragraphs: [
        "Das Herunterladen kann gegen die Nutzungsbedingungen dieser Plattformen verstoßen. Du bist dafür verantwortlich, deren Bedingungen und das Urheberrecht einzuhalten, einschließlich § 95a UrhG soweit er greift. Rille umgeht keine Schutzmaßnahmen.",
      ],
    },
  ];
}
