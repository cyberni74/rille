import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/components/locale-context";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const { t } = useLocale();
  return (
    <SiteShell>
      <article className="mx-auto w-full max-w-lg px-4 py-16 sm:max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.03em]">{t.notFoundTitle}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t.notFoundBody}</p>
        <div className="mt-8 grid gap-2 sm:grid-cols-3">
          <Button asChild>
            <Link to="/">{t.backHome}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/youtube-mp4">YouTube</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/tiktok-downloader">TikTok</Link>
          </Button>
        </div>
      </article>
    </SiteShell>
  );
}
