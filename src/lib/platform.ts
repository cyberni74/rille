import type { Locale } from "@/lib/locale";
import { PLATFORMS_EN } from "@/lib/platform-en";

export type PlatformId = "instagram" | "youtube" | "tiktok";
export type QualityPref = "1080" | "720" | "360" | "original" | "audio";

export const PLATFORM_PATH = {
  instagram: "/",
  youtube: "/youtube-mp4",
  tiktok: "/tiktok-downloader",
} as const satisfies Record<PlatformId, string>;

export type QualityTile = { id: QualityPref; title: string; hint: string };

export type GuideBlock = { title: string; body: string };

export type PlatformCopy = {
  id: PlatformId;
  label: string;
  eyebrow: string;
  title: string;
  lead: string;
  placeholder: string;
  detectEmpty: string;
  exampleUrls: string[];
  quality: QualityTile[];
  defaultQuality: QualityPref;
  demoKind: string;
  demoMeta: string;
  demoAuthor: string;
  demoBody: string;
  demoImage: string;
  steps: { title: string; body: string }[];
  features: { title: string; body: string }[];
  guideTitle: string;
  guideLead: string;
  guide: GuideBlock[];
  faq: { question: string; answer: string }[];
};

export const EXAMPLE_IG = "https://www.instagram.com/reel/CtjoC2BNsB2/";
export const EXAMPLE_YT = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
export const EXAMPLE_SHORT = "https://www.youtube.com/shorts/0PT5c1z3LL8";
export const EXAMPLE_TT = "https://www.tiktok.com/@scout2015/video/6718335390845095173";

export const PLATFORMS: PlatformCopy[] = [
  {
    id: "instagram",
    label: "Instagram",
    eyebrow: "Instagram Reels Downloader",
    title: "Instagram Reels herunterladen.",
    lead: "Öffentlichen Link einfügen. Originaldatei als MP4 — ohne Wasserzeichen, ohne Login.",
    placeholder: "Instagram-Reel oder Beitrag einfügen",
    detectEmpty: "Reel, Beitrag oder Karussell — ein Link pro Feld.",
    exampleUrls: [EXAMPLE_IG],
    quality: [{ id: "original", title: "Original", hint: "Ohne Logo" }],
    defaultQuality: "original",
    demoKind: "Reel",
    demoMeta: "Original · MP4",
    demoAuthor: "@atelier",
    demoBody: "Öffentliches Reel, ohne Wasserzeichen — so landet die Datei bei dir.",
    demoImage: "/hero/rooftop.jpg",
    steps: [
      { title: "Link kopieren", body: "In der Instagram-App teilen und Link kopieren." },
      { title: "Hier einfügen", body: "Einfügen holt die Zwischenablage in dieses Feld." },
      { title: "Sichern", body: "Vorschau prüfen. iPhone: In Fotos sichern." },
    ],
    features: [
      { title: "Ohne Wasserzeichen", body: "Die Originaldatei, nicht der Teilen-Export mit Logo." },
      { title: "Reels, Beiträge, Karussells", body: "Öffentliche Clips und Fotos in einem Stapel." },
      { title: "Stapel bis 12", body: "Mehrere Instagram-Links in einem Durchgang." },
      { title: "Fürs Handy", body: "Große Flächen und das iPhone-Teilen-Menü." },
    ],
    guideTitle: "Instagram Reels HD downloaden — ohne App, ohne Logo.",
    guideLead:
      "Rille ist ein Instagram Reels Downloader für öffentliche Clips. Du holst das Reel als MP4, so wie es veröffentlicht wurde: hochkant, ohne Wasserzeichen, ohne Instagram-Konto.",
    guide: [
      {
        title: "Reels, Beiträge und Karussells",
        body: "Ein öffentlicher Instagram-Link reicht. Reels kommen als Video, Fotos und Karussells als einzelne Dateien. Private Profile, Close Friends und Stories hinter Login bleiben gesperrt.",
      },
      {
        title: "MP4 Video Downloader fürs Handy",
        body: "Das Eingabefeld ist groß, der Button darunter auch. Auf dem iPhone öffnet Sichern das Teilen-Menü — dort „In Fotos sichern“. Android und Desktop starten den Dateidownload.",
      },
      {
        title: "Ohne Wasserzeichen statt Teilen-Export",
        body: "Der Teilen-Link aus der App liefert oft eine Version mit Logo. Rille holt die öffentliche Originaldatei. Deshalb bleibt das Bild sauber — solange der Beitrag öffentlich ist.",
      },
      {
        title: "Nur mit Berechtigung",
        body: "Der Downloader ist ein Werkzeug, keine Lizenz. Speichere Reels nur, wenn du dazu berechtigt bist — privat oder eigene Beiträge. Rille umgeht keine Schutzmaßnahmen.",
      },
    ],
    faq: [
      {
        question: "Kann ich Instagram Reels ohne App herunterladen?",
        answer:
          "Ja. Kopiere den öffentlichen Link, füge ihn oben ein und sichere das Reel als MP4. Ein Instagram-Konto ist nicht nötig.",
      },
      {
        question: "Kann ich Instagram Reels HD downloaden?",
        answer:
          "Rille holt die öffentliche Originaldatei — in der Auflösung, die Instagram ausliefert, ohne Logo.",
      },
      {
        question: "Ist der Instagram-Download kostenlos?",
        answer: "Ja. Rille braucht kein Konto und keine Zahlung. Öffentliche Dateien, ohne Werbung im Tool.",
      },
      {
        question: "Funktioniert es auf dem iPhone?",
        answer:
          "Ja. Sichern öffnet das Teilen-Menü. Dort „In Fotos sichern“ oder „In Dateien sichern“ wählen.",
      },
      {
        question: "Welche Instagram-Links funktionieren nicht?",
        answer:
          "Private Profile, Close Friends und Stories hinter Login. Öffentliche Reels, Beiträge und Videos sind der Kern.",
      },
      {
        question: "Darf ich fremde Reels speichern?",
        answer:
          "Nur wenn du dazu berechtigt bist. Rille ersetzt keine Lizenz und umgeht keine Sperren.",
      },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    eyebrow: "YouTube Video Downloader",
    title: "YouTube Videos als MP4.",
    lead: "Watch oder Short einfügen. MP4 in 1080p, 720p oder 360p — ohne Konto.",
    placeholder: "YouTube-Video oder Short einfügen",
    detectEmpty: "Watch-URL oder Short — ein Link pro Feld.",
    exampleUrls: [EXAMPLE_YT, EXAMPLE_SHORT],
    quality: [
      { id: "1080", title: "1080p", hint: "Full HD" },
      { id: "720", title: "720p", hint: "Ausgewogen" },
      { id: "360", title: "360p", hint: "Spart Daten" },
    ],
    defaultQuality: "1080",
    demoKind: "YouTube",
    demoMeta: "1080p · MP4",
    demoAuthor: "Me at the zoo",
    demoBody: "Video oder Short als MP4. Qualität wählst du vor dem Sichern.",
    demoImage: "/hero/projector.jpg",
    steps: [
      { title: "Link kopieren", body: "Aus YouTube — Video, Short oder youtu.be." },
      { title: "Qualität wählen", body: "1080p, 720p oder 360p, soweit der Clip sie anbietet." },
      { title: "Sichern", body: "MP4 landet auf dem Gerät. iPhone: In Fotos sichern." },
    ],
    features: [
      { title: "1080p / 720p / 360p", body: "YouTube als MP4 in der Stufe, die du brauchst." },
      { title: "Videos und Shorts", body: "Watch-Links und hochkante Shorts in einem Tool." },
      { title: "Stapel bis 12", body: "Mehrere YouTube-Links, eine Warteschlange." },
      { title: "Ohne Konto", body: "Kein Login, keine Werbung im Tool." },
    ],
    guideTitle: "YouTube Video Downloader — Clips und Shorts als MP4.",
    guideLead:
      "Rille speichert öffentliche YouTube-Videos als MP4. Kein Converter-Konto, keine Erweiterung. Qualität wählst du vor dem Sichern: 1080p, 720p oder 360p, soweit der Clip sie anbietet.",
    guide: [
      {
        title: "YouTube Short als MP4 speichern",
        body: "Shorts-URL oder youtu.be einfügen. Rille erkennt das Hochkant-Format und liefert ein MP4, das auf dem Handy nativ spielt — nicht als Querformat gestreckt.",
      },
      {
        title: "1080p, wenn der Clip sie hat",
        body: "Full HD zuerst, sonst die nächste verfügbare Stufe. 720p spart Speicher, 360p spart Daten. Die Datei ist ein einziges MP4, kein getrenntes Audio.",
      },
      {
        title: "Für iPhone und Android",
        body: "Großes Feld, ein klarer Button. Auf dem iPhone: Sichern, dann „In Fotos sichern“. Am Rechner startet der Download direkt.",
      },
      {
        title: "Was nicht geladen wird",
        body: "Altersbeschränkte, private und viele Live-Streams bleiben gesperrt. Rille umgeht keine YouTube-Schutzmaßnahmen. Speichere nur, wozu du berechtigt bist.",
      },
    ],
    faq: [
      {
        question: "In welcher Qualität kommen YouTube-Videos?",
        answer:
          "Als MP4 in 1080p, 720p und 360p, soweit der Clip diese Stufen hat. Shorts bleiben hochkant.",
      },
      {
        question: "Kann ich einen YouTube Short als MP4 speichern?",
        answer:
          "Ja. Shorts-URL einfügen — Rille erkennt sie und liefert das MP4 im Hochformat.",
      },
      {
        question: "Ist der YouTube-Download kostenlos?",
        answer: "Ja. Kein Konto, keine Zahlung. Nur öffentliche Videos und Shorts.",
      },
      {
        question: "Funktioniert es auf dem iPhone?",
        answer:
          "Ja. Sichern öffnet das Teilen-Menü. Dort „In Fotos sichern“ oder „In Dateien sichern“ wählen.",
      },
      {
        question: "Welche YouTube-Links scheitern?",
        answer:
          "Altersbeschränkte, private und viele Live-Streams. Öffentliche Videos und Shorts funktionieren.",
      },
      {
        question: "Darf ich fremde YouTube-Videos speichern?",
        answer:
          "Nur mit Berechtigung. Der Downloader ist ein Werkzeug, keine Lizenz.",
      },
    ],
  },
  {
    id: "tiktok",
    label: "TikTok",
    eyebrow: "TikTok Video Downloader",
    title: "TikTok ohne Wasserzeichen.",
    lead: "Öffentlichen Link einfügen. HD-MP4 ohne Logo, optional Audio als MP3.",
    placeholder: "TikTok-Link einfügen",
    detectEmpty: "Video-Link aus der TikTok-App — auch vm.tiktok.com.",
    exampleUrls: [EXAMPLE_TT],
    quality: [
      { id: "1080", title: "HD", hint: "Ohne Logo" },
      { id: "original", title: "Standard", hint: "Ohne Logo" },
      { id: "audio", title: "Audio", hint: "MP3" },
    ],
    defaultQuality: "1080",
    demoKind: "TikTok",
    demoMeta: "HD · ohne Wasserzeichen",
    demoAuthor: "@scout2015",
    demoBody: "Öffentliches TikTok als sauberes MP4 — ohne Logo auf dem Bild.",
    demoImage: "/hero/musician.jpg",
    steps: [
      { title: "Link kopieren", body: "In TikTok auf Teilen, dann Link kopieren." },
      { title: "Hier einfügen", body: "Ein Feld pro Clip. Stapel mit weiteren Links." },
      { title: "Ohne Logo sichern", body: "HD oder Standard als MP4. iPhone: In Fotos sichern." },
    ],
    features: [
      { title: "Ohne Wasserzeichen", body: "Die saubere Datei, nicht der Teilen-Export mit Logo." },
      { title: "HD-MP4", body: "Höchste öffentliche Stufe, plus Standard und Audio." },
      { title: "Kurzlinks", body: "Auch vm.tiktok.com und vt.tiktok.com." },
      { title: "Stapel bis 12", body: "Mehrere TikToks in einem Durchgang." },
    ],
    guideTitle: "TikTok Video ohne Wasserzeichen herunterladen.",
    guideLead:
      "Rille ist ein TikTok Video Downloader für öffentliche Clips. Du bekommst ein MP4 ohne Logo — HD, sofern TikTok sie anbietet — plus optional die Audio-Spur als MP3.",
    guide: [
      {
        title: "Ohne Logo, nicht der Teilen-Export",
        body: "Der Link aus der TikTok-App führt oft zu einer Datei mit Wasserzeichen. Rille holt die öffentliche Originaldatei. Deshalb bleibt das Bild sauber.",
      },
      {
        title: "HD, Standard und Audio",
        body: "HD zuerst. Standard, wenn du eine kleinere Datei willst. Audio speichert nur den Ton als MP3 — nützlich für Sounds, nicht für das Bild.",
      },
      {
        title: "Kurzlinks und Stapel",
        body: "vm.tiktok.com und vt.tiktok.com funktionieren. Bis zu zwölf öffentliche Links in einem Durchgang, ein Feld pro Clip.",
      },
      {
        title: "iPhone und Berechtigung",
        body: "Sichern öffnet auf dem iPhone das Teilen-Menü. Private und gelöschte Clips bleiben gesperrt. Speichere nur, wozu du berechtigt bist.",
      },
    ],
    faq: [
      {
        question: "Kann ich TikToks ohne Wasserzeichen speichern?",
        answer:
          "Ja. Rille holt die öffentliche Originaldatei ohne Logo — HD, sofern TikTok sie anbietet.",
      },
      {
        question: "Ist der TikTok-Download kostenlos?",
        answer: "Ja. Kein Konto, keine Zahlung. Nur öffentliche Videos.",
      },
      {
        question: "Funktioniert der TikTok Downloader auf dem iPhone?",
        answer:
          "Ja. Sichern öffnet das Teilen-Menü. Dort „In Fotos sichern“ oder „In Dateien sichern“ wählen.",
      },
      {
        question: "Brauche ich ein TikTok-Konto?",
        answer: "Nein. Nur einen öffentlichen Link. Private und gelöschte Clips bleiben gesperrt.",
      },
      {
        question: "Geht das auch mit vm.tiktok.com?",
        answer: "Ja. Kurzlinks von vm.tiktok.com und vt.tiktok.com werden aufgelöst.",
      },
      {
        question: "Darf ich fremde TikToks speichern?",
        answer:
          "Nur mit Berechtigung. Rille ist ein Werkzeug, keine Lizenz, und umgeht keine Sperren.",
      },
    ],
  },
];

export function platformCopy(id: PlatformId, locale: Locale = "de"): PlatformCopy {
  const list = locale === "en" ? PLATFORMS_EN : PLATFORMS;
  return list.find((item) => item.id === id) ?? list[0];
}

