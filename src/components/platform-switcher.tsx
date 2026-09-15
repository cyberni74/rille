import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";
import { TikTokGlyph } from "@/components/tiktok-glyph";
import { useActivePlatform } from "@/components/platform-context";
import { PLATFORM_PATH, PLATFORMS } from "@/lib/platform";
import { cn } from "@/lib/utils";

const ICONS = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: TikTokGlyph,
} as const;

export function PlatformSwitcher() {
  const platform = useActivePlatform();

  return (
    <nav className="mx-auto w-full max-w-lg px-4 pt-5 sm:max-w-xl lg:max-w-5xl" aria-label="Plattform">
      <div className="grid grid-cols-3 gap-2">
        {PLATFORMS.map((item) => {
          const selected = platform === item.id;
          const Icon = ICONS[item.id];
          return (
            <Link
              key={item.id}
              to={PLATFORM_PATH[item.id]}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-lg)] px-2 py-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] sm:min-h-[4.5rem] sm:text-base",
                selected
                  ? "bg-primary text-primary-foreground shadow-elevated"
                  : "bg-card text-muted-foreground shadow-soft hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
