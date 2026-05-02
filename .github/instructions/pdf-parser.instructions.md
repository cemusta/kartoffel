---
applyTo: 'apps/pdf-parser/**'
---

# PDF Parser — BAMF Gesamtfragenkatalog

Standalone CLI tool that parses the official BAMF citizenship test PDF into structured JSON.

## Quick start

```bash
# Always run from the repo root using the workspace flag:
npm run parse --workspace=apps/pdf-parser -- assets/gesamtfragenkatalog-lebenindeutschland.pdf output 2>&1

# interactive (prompts for PDF path and output dir):
npm run parse --workspace=apps/pdf-parser
```

## Architecture

- `src/types.ts` — `Question` interface (source of truth for JSON shape)
- `src/parse.ts` — text extraction; detects questions, options, state headings via font/x-position heuristics
- `src/extract-images.ts` — image extraction; no canvas factory needed — pdfjs decodes images as plain `Uint8ClampedArray` without one; cross-page images resolved by calling `getOperatorList()` on the referencing page first, then the defining page; header logo filtered by Y-position of the `cm` op preceding each `Do` op
- `src/index.ts` — CLI entry: interactive prompts → parse → extract images → write JSON
- `src/debug.ts` — throwaway debug script, not part of the pipeline
- `assets/` — PDF committed to repo
- `output/` — gitignored, created at runtime

## JSON schema

```ts
interface Question {
  id: number; // global sequential id (1-based, across general + all states)
  type: 'general' | 'state';
  state?: string; // e.g. "Bayern" — only when type === 'state'
  text: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer?: 'a' | 'b' | 'c' | 'd'; // absent — not encoded in PDF
  image?: string; // relative path e.g. "images/q130.png"
}
```

## PDF structure (confirmed)

| Element         | Pattern                              | x       | Font    |
| --------------- | ------------------------------------ | ------- | ------- |
| Section heading | `"Teil I"`, `"Allgemeine Fragen"`    | centred | g_d0_f3 |
| State heading   | `"Fragen für das Bundesland Bayern"` | centred | g_d0_f3 |
| Question label  | `"Aufgabe N"`                        | ≈71     | g_d0_f3 |
| Question text   | regular text, may wrap (hasEOL=true) | ≈71     | g_d0_f2 |
| Option bullet   | glyph U+F0A3 (empty checkbox)        | ≈114    | g_d0_f4 |
| Option text     | plain text after bullet              | ≈142    | g_d0_f2 |

Key facts:

- 191 pages; a question is always contained within a single page
- Options have no a/b/c/d labels — assigned by bullet order (1st=a … 4th=d)
- Correct answers are NOT marked in this PDF — all checkboxes are identical
- State sections restart "Aufgabe 1" numbering → parser uses a global sequential `id`

## Known issues / next steps

### 1. Image-option questions (10 questions currently skipped)

Questions 59, 66, 96, 111, 118, 149, 182, 184, 206, 288 use images as answer choices
(`"Bild 1"/"Bild 2"` labels at x≈112 instead of bullet glyph). No text options found → skipped with `[WARN]`.

Fix: detect `"Bild N"` text at x≈112 as option markers; store `options.a = "Bild 1"` and flag `image`.

### 2. Correct answers — external source needed

The PDF doesn't encode answers. Best sources:

- Community dataset: https://github.com/webmansa/german-citizenship-test-data (TS, updated Nov 2025, `correctAnswer` as 0-based index)
- Live BAMF portal: https://oet.bamf.de/ords/oetut/f?p=514:1:0 (can be scraped)

### 3. Image extraction

`extract-images.ts` uses `@napi-rs/canvas` with a `structuredClone` patch (see file header).
Images are defined on page N and referenced on page N+1 — always fetch from the defining page's `page.objs`.
Filter the BAMF header logo by frequency (appears on >1 page in a sample → skip as decoration).

## Libraries

| Package           | Purpose                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `unpdf`           | PDF text + image extraction via pdfjs-dist                                                          |
| `@napi-rs/canvas` | Native canvas for image decoding; loaded via `createRequire` (synchronous) before pdfjs initializes |
| `sharp`           | Write PNG files (installed, active once image extraction is complete)                               |
| `tsx`             | Run TS CLI directly without a build step                                                            |
