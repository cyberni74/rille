import { useActivePlatform } from "@/components/platform-context";
import { platformCopy } from "@/lib/platform";

export function SeoGuide() {
  const platform = useActivePlatform();
  const copy = platformCopy(platform);

  return (
    <section
      id="ratgeber"
      className="mx-auto w-full max-w-lg scroll-mt-24 px-4 py-14 sm:max-w-xl lg:max-w-5xl"
      aria-labelledby="ratgeber-heading"
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Ratgeber
      </p>
      <h2
        id="ratgeber-heading"
        className="mt-2 max-w-2xl font-display text-2xl tracking-[-0.03em] text-foreground"
      >
        {copy.guideTitle}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{copy.guideLead}</p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {copy.guide.map((block) => (
          <article key={block.title} className="rounded-[var(--radius-lg)] bg-card p-5 shadow-soft">
            <h3 className="font-display text-xl tracking-[-0.03em] text-foreground">{block.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{block.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
