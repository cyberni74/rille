import { Download, FileCheck2, Layers, Link2, Smartphone } from "lucide-react";
import { useActivePlatform } from "@/components/platform-context";
import { platformCopy } from "@/lib/platform";

const ICONS = {
  instagram: [FileCheck2, Layers, Download, Smartphone],
  youtube: [Layers, Smartphone, Download, FileCheck2],
  tiktok: [FileCheck2, Layers, Link2, Download],
} as const;

export function FeatureGrid() {
  const platform = useActivePlatform();
  const copy = platformCopy(platform);
  const icons = ICONS[platform];

  return (
    <section
      id="funktionen"
      className="mx-auto w-full max-w-lg scroll-mt-24 px-4 py-14 sm:max-w-xl lg:max-w-5xl"
      aria-labelledby="funktionen-heading"
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Funktionen
      </p>
      <h2
        id="funktionen-heading"
        className="mt-2 font-display text-2xl tracking-[-0.03em] text-foreground"
      >
        {copy.label} im Überblick.
      </h2>
      <ul className="mt-8 grid gap-3 lg:grid-cols-2">
        {copy.features.map((feature, index) => {
          const Icon = icons[index] ?? FileCheck2;
          return (
            <li key={feature.title} className="flex gap-4 rounded-[var(--radius-lg)] bg-card p-4 shadow-soft">
              <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-muted text-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
