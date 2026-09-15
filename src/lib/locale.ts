export type Locale = "de" | "en";

export const LOCALES: Locale[] = ["de", "en"];
export const DEFAULT_LOCALE: Locale = "de";
const STORAGE_KEY = "rille-locale-v1";
const COOKIE_KEY = "rille-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "de" || value === "en";
}

export function localeFromAccept(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number(q.trim().slice(2)) : 1;
      return { tag: (tag ?? "").toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .sort((a, b) => b.quality - a.quality);
  for (const part of parts) {
    if (part.tag.startsWith("en")) return "en";
    if (part.tag.startsWith("de")) return "de";
  }
  return DEFAULT_LOCALE;
}

export function localeFromCookie(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const match = header.match(/(?:^|;\s*)rille-locale=(de|en)(?:;|$)/i);
  return match && isLocale(match[1]?.toLowerCase()) ? (match[1].toLowerCase() as Locale) : null;
}

export function localeFromHeaders(
  cookie: string | null | undefined,
  accept: string | null | undefined,
): Locale {
  return localeFromCookie(cookie) ?? localeFromAccept(accept);
}

export function localeFromNavigator(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const item of candidates) {
    const lower = String(item ?? "").toLowerCase();
    if (lower.startsWith("en")) return "en";
    if (lower.startsWith("de")) return "de";
  }
  return DEFAULT_LOCALE;
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function storeLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore quota */
  }
  try {
    document.cookie = `${COOKIE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function resolveClientLocale(): Locale {
  return readStoredLocale() ?? localeFromCookie(typeof document !== "undefined" ? document.cookie : null) ?? localeFromNavigator();
}
