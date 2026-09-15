import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatBytes(n?: number): string | undefined {
  if (!n || !Number.isFinite(n) || n <= 0) return undefined;
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  const mb = n / (1024 * 1024);
  const rounded = mb >= 10 ? mb.toFixed(0) : mb.toFixed(1);
  return `${rounded.replace(/\.0$/, "")} MB`;
}
