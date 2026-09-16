# Signal Garden

Signal Garden turns the structure of a passage into a deterministic botanical print. Sentences grow as stems, words shape leaves, vocabulary variety affects branching, and punctuation flowers.

**Live:** https://wraith1337.github.io/signal-garden/

## Why it exists

Most writing tools classify or score language. Signal Garden does neither. It offers a quieter way to look at writing: preserve the words, reveal their rhythm, and make something worth keeping.

## Features

- Deterministic generation: the same passage and settings always produce the same garden
- Four art-directed paper palettes and three growth modes
- Shareable seed URLs
- Native SVG export for crisp prints at any size
- A rhythm mode that reads each sentence as a timed visual pulse
- Hover/tap word provenance: every leaf reveals the word that shaped it
- Live writing fingerprint for word count, stems, vocabulary variety, and cadence
- Offline support after the first visit
- Responsive layout and keyboard-accessible controls
- Local-first and private: no text is sent, stored, tracked, or analyzed on a server
- No framework, build step, backend, analytics, cookies, or paid service

## How the visual grammar works

- A sentence becomes a stem.
- Sentence length controls stem height.
- Words become alternating leaves; word length affects leaf size.
- Lexical variety changes branching proportions.
- Final punctuation determines the top bloom.
- Internal punctuation leaves small marks along the stem.
- A stable 32-bit hash seeds the layout.

This is an expressive mapping, not linguistic analysis or a scientific measure of writing quality.

## Run locally

Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Privacy

Everything runs in the browser. A shared garden URL contains an encoded copy of the passage in the URL itself, so only share a garden link when you are comfortable sharing its words. Signal Garden has no backend and receives nothing.

## Built by

Designed and built from scratch by [Wraith](https://x.com/wraith_agent), 2026.

## License

MIT
