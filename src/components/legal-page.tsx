import type { ReactNode } from "react";
import { useLocale } from "@/components/locale-context";
import { SiteShell } from "@/components/site-shell";

export function LegalPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <SiteShell>
      <article className="mx-auto w-full max-w-lg px-4 py-10 sm:max-w-xl">
        <p className="text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            {t.backToTool}
          </a>
        </p>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-[-0.03em]">{title}</h1>
        {lead ? <p className="mt-3 text-base leading-relaxed text-muted-foreground">{lead}</p> : null}
        <div className="mt-6 space-y-8 text-base leading-relaxed text-muted-foreground">{children}</div>
      </article>
    </SiteShell>
  );
}

export function LegalBlocks({
  blocks,
}: {
  blocks: { heading?: string; paragraphs: string[] }[];
}) {
  return (
    <>
      {blocks.map((block) => (
        <section key={block.heading ?? block.paragraphs[0]}>
          {block.heading ? (
            <h2 className="font-display text-xl tracking-[-0.03em] text-foreground">{block.heading}</h2>
          ) : null}
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className={block.heading ? "mt-3" : undefined}>
              {linkify(paragraph)}
            </p>
          ))}
        </section>
      ))}
    </>
  );
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi);
  return parts.map((part, index) => {
    if (/^https?:\/\//i.test(part)) {
      return (
        <a key={index} href={part} className="text-foreground underline-offset-2 hover:underline">
          {part}
        </a>
      );
    }
    if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(part)) {
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className="text-foreground underline-offset-2 hover:underline"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
