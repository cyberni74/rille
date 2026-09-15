import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useLocale } from "@/components/locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locale";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const nav = [
    { href: "#downloader", label: t.navTool },
    { href: "#funktionen", label: t.navFeatures },
    { href: "#anleitung", label: t.navGuide },
    { href: "#faq", label: t.navFaq },
  ];

  return (
    <header className="site-header sticky top-0 z-40 border-b border-border bg-background/95 pb-3">
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4">
        <a href="/" className="flex min-h-12 items-center gap-3">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-[var(--radius-sm)] bg-muted shadow-[var(--shadow-border)]"
          >
            <span className="font-display text-lg leading-none text-accent">R</span>
          </span>
          <span>
            <span className="block font-display text-lg leading-none tracking-[-0.03em]">
              Rille
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{t.tool}</span>
          </span>
        </a>

        <nav aria-label={t.navAria} className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex h-11 items-center px-3 text-sm text-muted-foreground transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <LanguageSwitch locale={locale} setLocale={setLocale} t={t} />
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <LanguageSwitch locale={locale} setLocale={setLocale} t={t} compact />
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label={t.menuOpen}>
                <Menu />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70" />
              <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-card px-5 py-6 shadow-[var(--shadow-elevated)] focus:outline-none">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-display text-xl tracking-[-0.03em]">
                    {t.menu}
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">{t.menuDescription}</Dialog.Description>
                  <Dialog.Close asChild>
                    <Button type="button" variant="ghost" size="icon" aria-label={t.menuClose}>
                      <X />
                    </Button>
                  </Dialog.Close>
                </div>
                <nav className="mt-8 grid gap-1" aria-label={t.navMobileAria}>
                  {nav.map((item) => (
                    <Dialog.Close asChild key={item.href}>
                      <a
                        href={item.href}
                        className="flex min-h-12 items-center rounded-[var(--radius-md)] px-3 text-base text-foreground hover:bg-muted"
                      >
                        {item.label}
                      </a>
                    </Dialog.Close>
                  ))}
                </nav>
                <div className="mt-auto grid gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
                  <a href="/" className="min-h-11 py-2">
                    Instagram
                  </a>
                  <a href="/youtube-mp4" className="min-h-11 py-2">
                    YouTube
                  </a>
                  <a href="/tiktok-downloader" className="min-h-11 py-2">
                    TikTok
                  </a>
                  <a href="/impressum" className="min-h-11 py-2">
                    {t.imprint}
                  </a>
                  <a href="/datenschutz" className="min-h-11 py-2">
                    {t.privacy}
                  </a>
                  <a href="/nutzung" className="min-h-11 py-2">
                    {t.terms}
                  </a>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}

function LanguageSwitch({
  locale,
  setLocale,
  t,
  compact = false,
}: {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: ReturnType<typeof useLocale>["t"];
  compact?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={t.langAria}
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] bg-muted p-0.5",
        compact ? "text-xs" : "text-sm",
      )}
    >
      {(["de", "en"] as const).map((code) => {
        const selected = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={selected}
            onClick={() => setLocale(code)}
            className={cn(
              "min-h-11 min-w-11 rounded-[calc(var(--radius-sm)-2px)] px-2.5 font-medium uppercase tracking-[0.08em] transition-colors",
              selected
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-border)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {code}
            <span className="sr-only">{code === "de" ? t.langDe : t.langEn}</span>
          </button>
        );
      })}
    </div>
  );
}
