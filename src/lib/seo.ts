import { OPERATOR } from "@/lib/legal-copy";
import { PLATFORM_PATH, platformCopy, type PlatformId } from "@/lib/platform";

export const SITE = {
  name: "Rille",
  title: "Rille – Instagram Reels, YouTube und TikTok Downloader",
  description:
    "MP4 Video Downloader für Instagram Reels, YouTube-Videos, Shorts und TikToks — ohne Wasserzeichen, ohne Login, einzeln oder im Stapel.",
  themeColor: "#0c0b0a",
  origin: "https://rille.vercel.app",
  googleSiteVerification: "FEwKcV21WWdUoilCOZg2XIQqObL55kqylgzpnr9qEyw",
};

type SeoPage = {
  title: string;
  description: string;
  canonicalPath: string;
};

const PLATFORM_SEO: Record<PlatformId, SeoPage> = {
  instagram: {
    title: "Instagram Reels Downloader – Reels HD ohne Wasserzeichen | Rille",
    description:
      "Instagram Reels herunterladen als MP4: öffentliche Reels, Beiträge und Karussells HD downloaden — ohne Wasserzeichen, ohne Login. iPhone, Android und Desktop.",
    canonicalPath: "/",
  },
  youtube: {
    title: "YouTube Video Downloader – MP4 in 1080p und Shorts | Rille",
    description:
      "YouTube Videos herunterladen als MP4. 1080p, 720p oder 360p — in der Auflösung, die die Datei wirklich hat. YouTube Short als MP4 speichern.",
    canonicalPath: "/youtube-mp4",
  },
  tiktok: {
    title: "TikTok Video Downloader – ohne Wasserzeichen als MP4 | Rille",
    description:
      "TikTok Video ohne Wasserzeichen herunterladen. Öffentliche TikToks als HD-MP4 ohne Logo, optional Audio als MP3. Ohne Konto, auch Kurzlinks.",
    canonicalPath: "/tiktok-downloader",
  },
};

export function pageSeo(platform: PlatformId): SeoPage {
  return PLATFORM_SEO[platform];
}

function absoluteUrl(path: string) {
  return `${SITE.origin}${path === "/" ? "/" : path}`;
}

export function seoHead(platform: PlatformId) {
  const page = pageSeo(platform);
  const canonical = absoluteUrl(page.canonicalPath);
  const image = `${SITE.origin}/og.jpg`;
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "google-site-verification", content: SITE.googleSiteVerification },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "de_DE" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:url", content: canonical },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: page.title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

export function legalHead(title: string, description: string, path: string) {
  const canonical = absoluteUrl(path);
  return {
    meta: [
      { title: `${title} – ${SITE.name}` },
      { name: "description", content: description },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

export function jsonLdForPlatform(platform: PlatformId) {
  const copy = platformCopy(platform);
  const page = pageSeo(platform);
  const pageUrl = absoluteUrl(page.canonicalPath);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.origin,
        email: OPERATOR.email,
        logo: `${SITE.origin}/icons/icon-512.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE.name,
            item: `${SITE.origin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: copy.eyebrow,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        name: `${SITE.name} – ${copy.label}`,
        alternateName: [SITE.name, copy.eyebrow],
        description: page.description,
        url: pageUrl,
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Video Downloader",
        operatingSystem: "iOS, Android, Windows, macOS",
        inLanguage: ["de", "en"],
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
