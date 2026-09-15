# Rille

**Instagram Reels, YouTube und TikTok als MP4** — ohne Wasserzeichen, ohne Login, einzeln oder im Stapel.

Rille ist ein öffentlicher Media-Downloader. Du fügst einen Link ein, wählst die Qualität und speicherst die Datei. Auf dem iPhone geht das über „In Fotos sichern“.

Nicht mit Instagram, YouTube, TikTok, Meta oder ByteDance verbunden.

## Was drin ist

| Seite | URL | Zweck |
| --- | --- | --- |
| Instagram Reels Downloader | `/` | Öffentliche Reels, Beiträge, Karussells als MP4 |
| YouTube Video Downloader | `/youtube-mp4` | Videos und Shorts als MP4 in 1080p / 720p / 360p |
| TikTok Video Downloader | `/tiktok-downloader` | Öffentliche TikToks ohne Wasserzeichen, optional Audio als MP3 |

- Ein Eingabefeld pro Link, Einfügen per Button
- Stapel: mehrere Slots, ein Lauf
- iPhone: Datei als Blob, dann Web Share in die Fotos-Mediathek
- Nur öffentliche Links — kein Login, keine privaten Profile

## Starten

Node 22+, npm.

```bash
npm install
npm run dev
```

Die App läuft lokal unter `http://localhost:8080`.

Weitere Skripte:

```bash
npm run typecheck
npm run lint
npm run build
```

## Hinweis

Nur Inhalte nutzen, die du selbst veröffentlichen darfst oder die frei zugänglich sind. Rille speichert keine Konten und lädt nichts von privaten Profilen.
