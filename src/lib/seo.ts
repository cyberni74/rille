import { PLATFORM_PATH, platformCopy, type PlatformId } from "@/lib/platform";

export const SITE = {
  name: "Rille",
  title: "Rille – Instagram Reels, YouTube und TikTok Downloader",
  description:
    "MP4 Video Downloader für Instagram Reels, YouTube-Videos, Shorts und TikToks — ohne Wasserzeichen, ohne Login, einzeln oder im Stapel.",
  themeColor: "#0c0b0a",
};

type SeoPage = {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
};

const PLATFORM_SEO: Record<PlatformId, SeoPage> = {
  instagram: {
    title: "Instagram Reels Downloader – Reels HD ohne Wasserzeichen | Rille",
    description:
      "Instagram Reels herunterladen als MP4: öffentliche Reels, Beiträge und Karussells HD downloaden — ohne Wasserzeichen, ohne Login. iPhone, Android und Desktop.",
    keywords:
      "Instagram Reels Downloader, Instagram Reels herunterladen, Instagram Reels HD downloaden, Instagram Video speichern, MP4 Video Downloader, Reel ohne Wasserzeichen",
    canonicalPath: "/",
  },
  youtube: {
    title: "YouTube Video Downloader – MP4 in 1080p und Shorts | Rille",
    description:
      "YouTube Videos herunterladen als MP4. 1080p, 720p oder 360p. YouTube Short als MP4 speichern — ohne Konto, auf iPhone, Android und Desktop.",
    keywords:
      "YouTube Video Downloader, YouTube Videos herunterladen, YouTube MP4, YouTube Short als MP4 speichern, 1080p Download, MP4 Video Downloader",
    canonicalPath: "/youtube-mp4",
  },
  tiktok: {
    title: "TikTok Video Downloader – ohne Wasserzeichen als MP4 | Rille",
    description:
      "TikTok Video ohne Wasserzeichen herunterladen. Öffentliche TikToks als HD-MP4 ohne Logo, optional Audio als MP3. Ohne Konto, auch Kurzlinks.",
    keywords:
      "TikTok Video Downloader, TikTok Video ohne Wasserzeichen herunterladen, TikTok herunterladen, TikTok MP4, TikTok HD speichern, MP4 Video Downloader",
    canonicalPath: "/tiktok-downloader",
  },
};

export function pageSeo(platform: PlatformId): SeoPage {
  return PLATFORM_SEO[platform];
}

export function seoHead(platform: PlatformId) {
  const page = pageSeo(platform);
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "keywords", content: page.keywords },
      { name: "robots", content: "index,follow,max-image-preview:large" },
    ],
    links: [
      { rel: "canonical", href: page.canonicalPath },
      { rel: "alternate", href: page.canonicalPath, hrefLang: "de" },
      { rel: "alternate", href: page.canonicalPath, hrefLang: "x-default" },
    ],
  };
}

export function legalHead(title: string, description: string, path: string) {
  return {
    meta: [
      { title: `${title} – ${SITE.name}` },
      { name: "description", content: description },
      { name: "robots", content: "index,follow" },
    ],
    links: [
      { rel: "canonical", href: path },
      { rel: "alternate", href: path, hrefLang: "de" },
      { rel: "alternate", href: path, hrefLang: "x-default" },
    ],
  };
}

export function jsonLdForPlatform(platform: PlatformId) {
  const copy = platformCopy(platform);
  const page = pageSeo(platform);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        name: `${SITE.name} – ${copy.label}`,
        alternateName: [SITE.name, copy.eyebrow],
        description: page.description,
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Video Downloader",
        operatingSystem: "iOS, Android, Windows, macOS",
        inLanguage: "de",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        featureList: copy.features.map((feature) => feature.title),
      },
      {
        "@type": "HowTo",
        name: copy.guideTitle,
        description: copy.guideLead,
        inLanguage: "de",
        step: copy.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body,
        })),
      },
      {
        "@type": "FAQPage",
        inLanguage: "de",
        mainEntity: copy.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export const SITEMAP_PATHS = [
  PLATFORM_PATH.instagram,
  PLATFORM_PATH.youtube,
  PLATFORM_PATH.tiktok,
  "/impressum",
  "/datenschutz",
  "/nutzung",
] as const;
