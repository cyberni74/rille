function readU32(buf: Uint8Array, offset: number) {
  return (
    ((buf[offset] ?? 0) << 24) |
    ((buf[offset + 1] ?? 0) << 16) |
    ((buf[offset + 2] ?? 0) << 8) |
    (buf[offset + 3] ?? 0)
  ) >>> 0;
}

function readFourCC(buf: Uint8Array, offset: number) {
  return String.fromCharCode(
    buf[offset] ?? 0,
    buf[offset + 1] ?? 0,
    buf[offset + 2] ?? 0,
    buf[offset + 3] ?? 0,
  );
}

function walkBoxes(
  buf: Uint8Array,
  start: number,
  end: number,
  visit: (type: string, payloadStart: number, payloadEnd: number) => boolean,
) {
  let offset = start;
  while (offset + 8 <= end) {
    let size = readU32(buf, offset);
    const type = readFourCC(buf, offset + 4);
    let header = 8;
    if (size === 1) {
      if (offset + 16 > end) break;
      size = Number(
        (BigInt(readU32(buf, offset + 8)) << 32n) + BigInt(readU32(buf, offset + 12)),
      );
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < header) break;
    const boxEnd = Math.min(offset + size, end);
    if (visit(type, offset + header, boxEnd)) return true;
    offset = boxEnd;
  }
  return false;
}

function parseTkhd(buf: Uint8Array, start: number, end: number): { width: number; height: number } | null {
  if (end - start < 4) return null;
  const version = buf[start] ?? 0;
  const dimOffset = start + (version === 1 ? 88 : 76);
  if (dimOffset + 8 > end) return null;
  const width = readU32(buf, dimOffset) >> 16;
  const height = readU32(buf, dimOffset + 4) >> 16;
  if (width < 16 || height < 16 || width > 7680 || height > 4320) return null;
  return { width, height };
}

export function parseMp4Dimensions(buf: Uint8Array): { width: number; height: number } | null {
  let found: { width: number; height: number } | null = null;
  const scan = (start: number, end: number) => {
    walkBoxes(buf, start, end, (type, payloadStart, payloadEnd) => {
      if (type === "moov" || type === "trak" || type === "mdia" || type === "minf") {
        scan(payloadStart, payloadEnd);
        return Boolean(found);
      }
      if (type === "tkhd") {
        const dim = parseTkhd(buf, payloadStart, payloadEnd);
        if (dim && dim.width >= (found?.width ?? 0)) found = dim;
      }
      return false;
    });
  };
  scan(0, buf.length);
  return found;
}

export function qualityLabelFromHeight(height: number | undefined, locale: "de" | "en" = "de"): string {
  if (!height) return locale === "en" ? "Best available MP4" : "Beste verfügbare Qualität";
  if (height >= 1000) return "1080p MP4";
  if (height >= 700) return "720p MP4";
  if (height >= 500) return "480p MP4";
  if (height >= 350) return "360p MP4";
  if (height >= 220) return "240p MP4";
  return locale === "en" ? "MP4" : "MP4";
}

export function qualityIdFromHeight(height: number | undefined, fallback: string): string {
  if (!height) return fallback;
  if (height >= 1000) return "1080";
  if (height >= 700) return "720";
  if (height >= 500) return "480";
  if (height >= 350) return "360";
  if (height >= 220) return "240";
  return fallback;
}
