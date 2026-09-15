import { Download, Play } from "lucide-react";
import { useActivePlatform } from "@/components/platform-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { platformCopy } from "@/lib/platform";
import { cn } from "@/lib/utils";

export function DemoPreview({ onUseExample }: { onUseExample: () => void }) {
  const platform = useActivePlatform();
  const copy = platformCopy(platform);
  const landscape = copy.id === "youtube";

  return (
    <section className="min-w-0" aria-labelledby="demo-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="demo-heading" className="font-display text-xl tracking-[-0.03em]">
            So sieht dein Ergebnis aus
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.label} · Vorschau und Sichern.</p>
        </div>
        <Badge variant="outline">Beispiel</Badge>
      </div>
      <article className="overflow-hidden rounded-[var(--radius-lg)] bg-card shadow-elevated">
        <div
          className={cn(
            "relative w-full overflow-hidden bg-muted",
            landscape ? "aspect-video" : "aspect-[9/14] max-h-72 sm:max-h-80",
          )}
        >
          <img
            src={copy.demoImage}
            alt=""
            width={landscape ? 1280 : 720}
            height={landscape ? 720 : 1080}
            className="size-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
          />
          <span className="absolute bottom-3 left-3 inline-flex size-11 items-center justify-center rounded-full bg-background/80 text-foreground">
            <Play className="size-4" aria-hidden />
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Badge>{copy.demoKind}</Badge>
            <span className="text-sm text-muted-foreground">{copy.demoMeta}</span>
          </div>
          <p className="mt-2 text-base font-medium">{copy.demoAuthor}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{copy.demoBody}</p>
          <Button type="button" className="mt-4 w-full" size="lg" onClick={onUseExample}>
            <Download />
            Beispiel laden
          </Button>
        </div>
      </article>
    </section>
  );
}
