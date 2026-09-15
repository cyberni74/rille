import { useActivePlatform } from "@/components/platform-context";
import { platformCopy } from "@/lib/platform";

export function Hero() {
  const platform = useActivePlatform();
  const copy = platformCopy(platform);

  return (
    <section
      className="mx-auto w-full max-w-lg px-4 pt-6 sm:max-w-xl sm:pt-8 lg:max-w-5xl"
      aria-labelledby="hero-heading"
    >
      <div key={copy.id} className="hero-stagger text-center lg:mx-auto lg:max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
          {copy.eyebrow}
        </p>
        <h1
          id="hero-heading"
          className="mt-2 font-display text-2xl font-medium leading-[1.12] tracking-[-0.03em] text-foreground sm:mt-3 sm:text-3xl"
        >
          {copy.title}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
          {copy.lead}
        </p>
      </div>
    </section>
  );
}
