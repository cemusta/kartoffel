# PDF Parser — BAMF Gesamtfragenkatalog

Parses the official BAMF citizenship test PDF into structured JSON.

## Quick start

```bash
cd apps/pdf-parser
npm run parse
# prompts for PDF path (default: assets/gesamtfragenkatalog-lebenindeutschland.pdf)
# prompts for output dir (default: output/)
# writes: output/questions.json, output/images/
```

Or non-interactively:

```bash
npx tsx src/index.ts assets/gesamtfragenkatalog-lebenindeutschland.pdf output/
```

---

## PDF structure (confirmed by text-layer inspection)

| Element         | Pattern                                | x position | Font    |
| --------------- | -------------------------------------- | ---------- | ------- |
| Section heading | `"Teil I"`, `"Allgemeine Fragen"`      | centred    | g_d0_f3 |
| State heading   | `"Fragen für das Bundesland Bayern"`   | centred    | g_d0_f3 |
| Question label  | `"Aufgabe N"`                          | x≈71       | g_d0_f3 |
| Question text   | regular text, may wrap (`hasEOL=true`) | x≈71       | g_d0_f2 |
| Option bullet   | glyph U+F0A3 (empty checkbox)          | x≈114      | g_d0_f4 |
| Option text     | plain text after bullet                | x≈142      | g_d0_f2 |
| Page number     | `"Seite N von 191"`                    | right      | g_d0_f2 |

**Key facts:**

- 191 pages total
- A question is **always contained within a single page** — never split across pages
- Options have **no a/b/c/d labels** — assigned by order (1st bullet=a, …, 4th=d)
- **Correct answers are NOT marked** in this PDF — all checkboxes are identical empty squares
- State sections restart "Aufgabe 1" numbering — parser uses a global sequential id to avoid collisions

---

## Current output status

| Metric                           | Value                  |
| -------------------------------- | ---------------------- |
| Total questions extracted        | 450                    |
| General (Teil I)                 | 290                    |
| State (Teil II, 16 states × 10)  | 160                    |
| Skipped (image-option questions) | 10                     |
| `correctAnswer` field            | ❌ absent — not in PDF |
| Images extracted                 | ❌ blocked — see below |

---

## Known issues

### 1. Image extraction is blocked

`unpdf`'s `extractImages()` requires a canvas renderer to decode image objects. Without it, `page.objs.get()` throws synchronously:

```
Error: Requesting object that isn't resolved yet img_p47_1.
```

**Fix:** install `@napi-rs/canvas` (native binary). Then `extractImages` from `unpdf` works.

The BAMF header logo appears on every page — filter by frequency: build a map of image-name → page count from a 20-page sample; skip any image appearing on >1 page as a decoration.

### 2. Image-option questions (10 questions, skipped)

Some questions have **images as answer choices** (e.g. Aufgabe 130 page 48: 4 ballot paper images labeled "Bild 1"/"Bild 2"/"Bild 3"/"Bild 4"). The bullet glyph never appears → 0 text options found → question is skipped with `[WARN]`.

Affected general questions (by PDF "Aufgabe" number, not globalId):
59, 66, 96, 111, 118, 149, 182, 184, 206, 288

**Fix:** detect `"Bild N"` text at x≈112 as option markers; store `options.a = "Bild 1"` etc. and flag `image` once extraction works.

### 3. Correct answers — external source needed

The PDF does not mark correct answers. Options:

- **Best community dataset:** [webmansa/german-citizenship-test-data](https://github.com/webmansa/german-citizenship-test-data) — TypeScript, updated Nov 2025, `correctAnswer` as 0-based index
- **Authoritative scrape:** [oet.bamf.de](https://oet.bamf.de/ords/oetut/f?p=514:1:0) — live BAMF portal, can be scraped
- **Merge strategy:** match by question text similarity, or by sequential question number if the catalog order matches

---

## JSON schema

```ts
interface Question {
  id: number; // global sequential id (1-based, across general + all states)
  type: 'general' | 'state';
  state?: string; // e.g. "Bayern" — only when type === 'state'
  text: string; // full question text (wrapped lines joined with space)
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer?: 'a' | 'b' | 'c' | 'd'; // absent until merged from external source
  image?: string; // relative path e.g. "images/q130.png" — absent until extraction works
}
```

---

## Architecture

```
src/
  types.ts          — Question interface
  parse.ts          — text extraction + question/option/state detection
  extract-images.ts — image extraction (needs @napi-rs/canvas to work)
  index.ts          — CLI entry: interactive prompts → parse → images → write JSON
  debug.ts          — throwaway debug script (not part of the output)
assets/
  gesamtfragenkatalog-lebenindeutschland.pdf   ← PDF committed to repo
output/             — gitignored, created at runtime
  questions.json
  images/
    q130.png
    ...
```

## Libraries

| Package           | Purpose                            | Status                                      |
| ----------------- | ---------------------------------- | ------------------------------------------- |
| `unpdf`           | PDF text extraction via pdfjs-dist | ✅ works                                    |
| `sharp`           | Write PNG image files              | ✅ installed, unused until images unblocked |
| `@napi-rs/canvas` | Native canvas for image decoding   | ❌ not installed — needed                   |
| `tsx`             | Run TypeScript CLI directly        | ✅ works                                    |

## Next steps (priority order)

1. **Install `@napi-rs/canvas`** → unblocks `unpdf`'s `extractImages()` → can extract question images and filter logo
2. **Fix image-option questions** → detect "Bild N" labels → store as option text + image placeholder
3. **Merge correct answers** → fetch/parse the webmansa dataset → join on question text or index
