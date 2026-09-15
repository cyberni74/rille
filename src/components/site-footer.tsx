export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10 sm:max-w-xl lg:max-w-5xl">
        <div>
          <p className="font-display text-lg tracking-[-0.03em] text-foreground">Rille</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            MP4 Video Downloader für öffentliche Instagram Reels, YouTube-Videos, Shorts und TikToks —
            original, ohne Wasserzeichen, ohne Konto.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <nav aria-label="Downloader" className="grid gap-1 text-sm">
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
          <nav aria-label="Rechtliches" className="grid gap-1 text-sm">
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="/impressum">
              Impressum
            </a>
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="/datenschutz">
              Datenschutz
            </a>
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="/nutzung">
              Nutzungsbedingungen
            </a>
            <a className="flex min-h-11 items-center text-muted-foreground hover:text-foreground" href="#faq">
              FAQ
            </a>
          </nav>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Nur öffentliche Inhalte. Private Profile und geschützte Videos bleiben gesperrt. Nutze
          Dateien nur, wenn du dazu berechtigt bist. Rille ist nicht mit Meta, Google oder ByteDance
          verbunden.
        </p>
      </div>
    </footer>
  );
}
