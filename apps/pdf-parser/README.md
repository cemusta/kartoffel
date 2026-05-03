# pdf-parser

Standalone CLI tool that parses the official BAMF citizenship test PDF
(_Leben in Deutschland – Gesamtfragenkatalog_) into structured JSON with images.

## Quick start

```bash
# From repo root — non-interactive (recommended):
npm run parse --workspace=apps/pdf-parser -- assets/gesamtfragenkatalog-lebenindeutschland.pdf output

# Interactive (prompts for PDF path and output dir):
npm run parse --workspace=apps/pdf-parser

# Delete all output (questions.json, images/, manifest, progress):
npm run clean --workspace=apps/pdf-parser
```

## Output

```text
output/
  questions.json       ← all 460 questions
  images/
    q21_1.png … q21_4.png
    q55.png
    …                  ← 43 questions have images
  image-manifest.json  ← internal: page→question mapping used during extraction
  image-progress.json  ← internal: allows resuming a partial run
  parse-results.json   ← summary: counts, unresolved images, timestamp
```

## JSON schema

```ts
interface Question {
  id: number; // global sequential id (1-based, across general + all states)
  type: 'general' | 'state';
  state?: string; // e.g. "Bayern" — only when type === 'state'
  page: number; // PDF page number (1-based)
  text: string; // full question text (wrapped lines joined with space)
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer?: 'a' | 'b' | 'c' | 'd'; // absent — not encoded in PDF
  image?: string | string[]; // e.g. "images/q55.png" or ["images/q21_1.png", …]
}
```

## Current extraction status

| Metric                   | Value               |
| ------------------------ | ------------------- |
| Total questions          | 460                 |
| General (Teil I)         | 300                 |
| State (Teil II, 16 × 10) | 160                 |
| Questions with images    | 43                  |
| `correctAnswer` field    | absent — not in PDF |

## PDF structure

| Element         | Pattern                              | x       | Font              |
| --------------- | ------------------------------------ | ------- | ----------------- |
| Section heading | `"Teil I"`, `"Allgemeine Fragen"`    | centred | g_d0_f3           |
| State heading   | `"Fragen für das Bundesland Bayern"` | centred | g_d0_f3           |
| Question label  | `"Aufgabe N"`                        | ≈71     | g_d0_f3           |
| Question text   | regular text, may wrap               | ≈71     | g_d0_f2           |
| Option bullet   | glyph U+F0A3 or U+25A1               | ≈114    | g_d0_f4 / g_d0_f9 |
| Option text     | plain text after bullet              | ≈142    | g_d0_f2           |

Key facts:

- 191 pages; a question is always contained within a single page
- Options have no a/b/c/d labels — assigned by bullet order (1st=a … 4th=d)
- State sections restart "Aufgabe 1" numbering — parser uses a global sequential `id`
- Correct answers are **not** marked in this PDF

## Architecture

```text
src/
  types.ts          — Question interface (source of truth for JSON shape)
  parse.ts          — text extraction; detects questions, options, state headings
  extract-images.ts — image extraction via pdfjs operator lists (no canvas needed)
  index.ts          — CLI entry: interactive prompts → parse → images → write JSON
  debug.ts          — throwaway debug script, not part of the pipeline
assets/
  gesamtfragenkatalog-lebenindeutschland.pdf
output/             — gitignored, created at runtime
```

### Image extraction notes

- No `canvasFactory` needed — pdfjs decodes images as plain `{data, width, height}` without one
- Images are defined on page N and referenced on page N+1 (cross-page XObjects)
- Correct resolution order: call `getOperatorList()` on the **referencing page first**, then the **defining page**
- The manifest scan and extraction reuse the **same PDF instance** — a fresh instance produces different internal image names and breaks resolution
- Header logo (BAMF logo) filtered by Y-position (ty > 82% of page height = decoration)

## Correct answers — external source needed

The PDF does not encode correct answers. Best sources:

- Community dataset: <https://github.com/webmansa/german-citizenship-test-data> (TypeScript, `correctAnswer` as 0-based index)
- Live BAMF portal: <https://oet.bamf.de/ords/oetut/f?p=514:1:0> (can be scraped)

## Libraries

| Package | Purpose                                          |
| ------- | ------------------------------------------------ |
| `unpdf` | PDF text + image extraction via pdfjs-dist       |
| `sharp` | Write PNG files                                  |
| `tsx`   | Run TypeScript CLI directly without a build step |
