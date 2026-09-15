import { useLocale } from "@/components/locale-context";

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="site-footer mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10 sm:max-w-xl lg:max-w-5xl">
        <div>
          <p className="font-display text-lg tracking-[-0.03em] text-foreground">Rille</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.footerLead}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <nav aria-label={t.footerTools} className="grid gap-1 text-sm">
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="/">
              Instagram Reels Downloader
            </a>
            <a
              className="flex min-h-11 items-center text-muted-foreground hover:text-foreground"
              href="/youtube-mp4"
            >
              YouTube Video Downloader
            </a>
            <a
              className="flex min-h-11 items-center text-muted-foreground hover:text-foreground"
              href="/tiktok-downloader"
            >
              TikTok Video Downloader
            </a>
          </nav>
          <nav aria-label={t.footerLegal} className="grid gap-1 text-sm">
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="/impressum">
              {t.imprint}
            </a>
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="/datenschutz">
              {t.privacy}
            </a>
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="/nutzung">
              {t.terms}
            </a>
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="#faq">
              {t.navFaq}
            </a>
          </nav>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{t.footerNote}</p>
        <p className="text-xs text-muted-foreground">{t.copyright}</p>
      </div>
    </footer>
  );
}
