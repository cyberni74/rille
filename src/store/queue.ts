import { create } from "zustand";
import type { ResolvedPost } from "@/lib/instagram/types";

export type QueueStatus = "loading" | "ready" | "error";

export type QueueEntry = {
  id: string;
  url: string;
  status: QueueStatus;
  error?: string;
  post?: ResolvedPost;
  createdAt: number;
};

type HistoryEntry = {
  id: string;
  url: string;
  authorName?: string;
  title?: string;
  kind: string;
  itemCount: number;
  savedAt: number;
};

const HISTORY_KEY = "rille-history-v1";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
}

function persistHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 40)));
}

type QueueState = {
  entries: QueueEntry[];
  history: HistoryEntry[];
  busy: boolean;
  hydrate: () => void;
  reset: () => void;
  remove: (id: string) => void;
  start: (urls: string[]) => string[];
  fulfill: (id: string, post: ResolvedPost) => void;
  fail: (id: string, error: string) => void;
  clearHistory: () => void;
};

export const useQueue = create<QueueState>((set, get) => ({
  entries: [],
  history: [],
  busy: false,
  hydrate: () => set({ history: loadHistory() }),
  reset: () => set({ entries: [], busy: false }),
  remove: (id) => set({ entries: get().entries.filter((entry) => entry.id !== id) }),
  start: (urls) => {
    const now = Date.now();
    const entries = [...get().entries];
    const ids: string[] = [];
    urls.forEach((url, index) => {
      const existing = entries.findIndex((entry) => entry.url === url);
      if (existing >= 0) {
        const current = entries[existing];
        if (current.status === "loading") {
          ids.push(current.id);
          return;
        }
        const next: QueueEntry = {
          ...current,
          status: "loading",
          error: undefined,
          post: undefined,
          createdAt: now + index,
        };
        entries.splice(existing, 1);
        entries.unshift(next);
        ids.push(next.id);
        return;
      }
      const created: QueueEntry = {
        id: `${now}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        url,
        status: "loading",
        createdAt: now + index,
      };
      entries.unshift(created);
      ids.push(created.id);
    });
    set({ entries, busy: true });
    return ids;
  },
  fulfill: (id, post) => {
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, status: "ready" as const, post, error: undefined } : entry,
    );
    const historyItem: HistoryEntry = {
      id,
      url: post.sourceUrl,
      authorName: post.authorName,
      title: post.caption,
      kind: post.kind,
      itemCount: post.items.length,
      savedAt: Date.now(),
    };
    const history = [historyItem, ...get().history.filter((item) => item.url !== post.sourceUrl)].slice(
      0,
      40,
    );
    persistHistory(history);
    set({
      entries,
      history,
      busy: entries.some((entry) => entry.status === "loading"),
    });
  },
  fail: (id, error) => {
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, status: "error" as const, error } : entry,
    );
    set({
      entries,
      busy: entries.some((entry) => entry.status === "loading"),
    });
  },
  clearHistory: () => {
    persistHistory([]);
    set({ history: [] });
  },
}));
