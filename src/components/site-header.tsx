import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#downloader", label: "Tool" },
  { href: "#funktionen", label: "Funktionen" },
  { href: "#anleitung", label: "Anleitung" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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
            <span className="mt-1 block text-xs text-muted-foreground">Video-Tool</span>
          </span>
        </a>

        <nav aria-label="Seite" className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex h-11 items-center px-3 text-sm text-muted-foreground transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Menü öffnen"
            >
              <Menu />
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-card px-5 py-6 shadow-[var(--shadow-elevated)] focus:outline-none">
              <div className="flex items-center justify-between">
                <Dialog.Title className="font-display text-xl tracking-[-0.03em]">
                  Menü
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Navigation zu Tool, Funktionen, Anleitung und FAQ
                </Dialog.Description>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Menü schließen">
                    <X />
                  </Button>
                </Dialog.Close>
              </div>
              <nav className="mt-8 grid gap-1" aria-label="Mobil">
                {NAV.map((item) => (
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
                  Impressum
                </a>
                <a href="/datenschutz" className="min-h-11 py-2">
                  Datenschutz
                </a>
                <a href="/nutzung" className="min-h-11 py-2">
                  Nutzung
                </a>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
