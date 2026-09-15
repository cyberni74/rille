import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { publicErrorMessage } from "@/lib/public-error";
import { UI } from "@/lib/ui-copy";
import type { Locale } from "@/lib/locale";

function currentLocale(): Locale {
  if (typeof document !== "undefined" && document.documentElement.lang.startsWith("en")) {
    return "en";
  }
  return "de";
}

function errorMessage(error: unknown, locale: Locale): string {
  if (error instanceof Error && error.message) return publicErrorMessage(error.message, locale);
  if (typeof error === "string" && error) return publicErrorMessage(error, locale);
  return UI[locale].errorFallback;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const locale = currentLocale();
  const t = UI[locale];
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <span className="text-destructive" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-2xl tracking-[-0.03em]">{t.errorTitle}</h1>
      <p className="max-w-md text-sm break-words text-muted-foreground">{errorMessage(error, locale)}</p>
      <a
        href="/"
        className="inline-flex h-12 items-center rounded-[var(--radius-md)] bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        {t.backHome}
      </a>
    </main>
  );
}
