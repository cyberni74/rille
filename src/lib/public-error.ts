import type { Locale } from "@/lib/locale";

function stripMarkup(raw: string) {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&/gi, "&")
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/error:\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

const COPY = {
  de: {
    gone: "Dieser Link führt zu keinem Beitrag mehr.",
    private: "Der Beitrag ist nicht öffentlich. Rille lädt nur öffentliche Inhalte.",
    age: "Der Clip ist altersbeschränkt und wird nicht geladen.",
    timeout: "Die Quelle antwortet gerade nicht. In ein paar Minuten erneut versuchen.",
    generic: "Das hat nicht geklappt. Link prüfen und erneut versuchen.",
  },
  en: {
    gone: "This link no longer points to a post.",
    private: "This post is not public. Rille only loads public media.",
    age: "This clip is age-restricted and will not be loaded.",
    timeout: "The source is not responding. Try again in a few minutes.",
    generic: "That didn’t work. Check the link and try again.",
  },
} as const;

export function publicErrorMessage(raw: unknown, locale: Locale = "de"): string {
  const text = stripMarkup(String(raw ?? ""));
  const lower = text.toLowerCase();
  const copy = COPY[locale] ?? COPY.de;

  if (
    /private|login required|not public|nicht öffentlich|close friends|auth/.test(lower)
  ) {
    return copy.private;
  }
  if (
    /not found|404|no media|couldn['’]t find|does not exist|no longer|kein beitrag|gelöscht|invalid (short)?code|media not/.test(
      lower,
    )
  ) {
    return copy.gone;
  }
  if (/age[- ]restrict|altersbeschränk|sign in to confirm/.test(lower)) {
    return copy.age;
  }
  if (
    /timeout|timed out|zeitüberschreitung|econnreset|5\d\d|unavailable|responding|antwortet|api limit|rate limit|too many request|1 request|aborted|abort/.test(
      lower,
    )
  ) {
    return copy.timeout;
  }

  const allowed = new Set<string>([...Object.values(COPY.de), ...Object.values(COPY.en)]);
  if (allowed.has(text)) return text;
  return copy.generic;
}
