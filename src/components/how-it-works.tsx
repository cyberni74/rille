import { ClipboardPaste, Download, Link2 } from "lucide-react";
import { useActivePlatform } from "@/components/platform-context";
import { platformCopy } from "@/lib/platform";

const ICONS = [Link2, ClipboardPaste, Download];

export function HowItWorks() {
  const platform = useActivePlatform();
  const copy = platformCopy(platform);

  return (
    <section
      id="anleitung"
      className="mx-auto w-full max-w-lg scroll-mt-24 px-4 py-10 sm:max-w-xl lg:max-w-5xl"
      aria-labelledby="anleitung-heading"
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Anleitung
      </p>
      <h2
        id="anleitung-heading"
        className="mt-2 font-display text-2xl tracking-[-0.03em] text-foreground"
      >
        {copy.label} herunterladen: drei Schritte.
      </h2>
      <ol className="mt-8 grid gap-3 lg:grid-cols-3">
        {copy.steps.map((step, index) => {
          const Icon = ICONS[index] ?? Link2;
          return (
            <li key={step.title} className="flex gap-4 rounded-[var(--radius-lg)] bg-card p-4 shadow-soft">
              <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-muted font-display text-lg text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
