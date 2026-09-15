import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <SiteShell>
      <article className="mx-auto w-full max-w-lg px-4 py-10 sm:max-w-xl">
        <p className="text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Zurück zum Tool
          </a>
        </p>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-[-0.03em]">{title}</h1>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
          {children}
        </div>
      </article>
    </SiteShell>
  );
}
