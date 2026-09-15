const ALLOWED_HOSTS = new Set([
  "cdn.instasave.website",
  "scontent.cdninstagram.com",
  "instagram.com",
  "www.instagram.com",
  "snapcdn.app",
  "i.snapcdn.app",
  "dl.snapcdn.app",
  "i.ytimg.com",
  "ytimg.com",
  "loader.to",
  "savenow.to",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
  "tikwm.com",
  "www.tikwm.com",
]);

function hostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return true;
  if (host.endsWith(".cdninstagram.com")) return true;
  if (host.endsWith(".fbcdn.net")) return true;
  if (host.endsWith(".instagram.com")) return true;
  if (host.endsWith(".snapcdn.app")) return true;
  if (host.endsWith(".instasave.website")) return true;
  if (host.endsWith(".googlevideo.com")) return true;
  if (host.endsWith(".ytimg.com")) return true;
  if (host.endsWith(".savenow.to")) return true;
  if (host.endsWith(".affadaffa.com")) return true;
  if (host === "youtu.be" || host.endsWith(".youtube.com")) return true;
  if (host.endsWith(".tiktok.com")) return true;
  if (host.endsWith(".tiktokcdn.com")) return true;
  if (host.endsWith(".tiktokcdn-us.com")) return true;
  if (host.endsWith(".tiktokcdn-eu.com")) return true;
  if (host.endsWith(".tiktokcdn-in.com")) return true;
  if (host.endsWith(".tikwm.com")) return true;
  if (host.endsWith(".byteoversea.com")) return true;
  if (host.endsWith(".ibyteimg.com")) return true;
  if (host.endsWith(".muscdn.com")) return true;
  return false;
}

export function assertPublicMediaUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Ungültige Medienadresse.");
  }
  if (url.protocol !== "https:") {
    throw new Error("Nur HTTPS-Medienadressen sind erlaubt.");
  }
  if (!hostAllowed(url.hostname)) {
    throw new Error("Diese Quelle ist nicht erlaubt.");
  }
  return url;
}

export function mediaProxyPath(url: string, filename: string, inline = false) {
  const params = new URLSearchParams({
    u: url,
    n: filename,
  });
  if (inline) params.set("inline", "1");
  return `/api/file?${params.toString()}`;
}
