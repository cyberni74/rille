const KEY = "rille-pending-slots-v1";

export function stashPendingSlots(urls: string[], autoRun = false) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ urls, autoRun }));
  } catch {
    /* ignore */
  }
}

export function takePendingSlots(): { urls: string[]; autoRun: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { urls?: unknown; autoRun?: unknown };
    if (!Array.isArray(parsed.urls)) return null;
    const urls = parsed.urls.filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );
    if (!urls.length) return null;
    return { urls, autoRun: parsed.autoRun === true };
  } catch {
    return null;
  }
}
