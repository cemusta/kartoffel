# Image Extraction — Debug Log & Status

## Goal

Parse 43 pages with images from the BAMF PDF. Each page saves 0 images. No errors thrown — they silently skip via timeout or missing capturedImages entry.

---

## PDF structure (confirmed)

Images named `img_pN_M` are **defined** on page N and **referenced** on page N+1.
Example: page 9 (q21) references `img_p8_1` through `img_p8_5` — all defined on page 8.

There are two image stores per page:

- `page.objs` — page-local (JPEG/RGB images)
- `page.commonObjs` — document-level shared (JBIG2 / logo, shared across pages)

---

## What was tried

### Attempt 1 — `objs.get()` with callback + 3s timeout (original)

```ts
objs.get(name, img => {
  if (img?.data) resolve(img);
});
commonObjs.get(name, img => {
  if (img?.data) resolve(img);
});
// race with setTimeout(3000)
```

**Result:** Always hits timeout — 0 images.

**Why it fails:** `img_p8_1` lives in page 8's `page.objs`, not page 9's. Reading from the **referencing** page's store always misses.

---

### Attempt 2 — Hook `page.objs.resolve` before `getOperatorList()` (current)

Plan: intercept `objs.resolve` on page 9 before calling `getOperatorList()` — pdfjs calls `resolve(objId, data)` per decoded image during operator list construction.

```ts
const origObjs = pageAny.objs.resolve.bind(pageAny.objs);
pageAny.objs.resolve = (objId, data) => {
  if (isRawImage(data)) capturedImages.set(objId, data);
  origObjs(objId, data);
};
await pageAny.getOperatorList();
```

**Result:** Hook fires only for fonts (`g_d0_f1`, `g_d0_f2_path_` etc.) — **never for image objects** (`img_p8_1` etc.).

**Why it fails (confirmed via debug):** `getOperatorList()` does NOT resolve images into `page.objs`. Images are resolved lazily — only during `page.render()`.

Also: when `render(page8)` runs (defining page), pdfjs worker tries to send decoded image data back via `LoopbackPort.postMessage()` which internally calls `structuredClone()`. With `@napi-rs/canvas` as the canvas factory, decoded images become native `ImageBitmap` objects. `structuredClone(ImageBitmap)` throws:

```
DOMException [DataCloneError]: Cannot transfer object of unsupported type.
  at structuredClone (node:internal/worker/js_transferable:126:26)
  at LoopbackPort.postMessage (unpdf/dist/pdfjs.mjs:...)
```

This crash happens in `CopyLocalImage` path — when page 9 operator list asks for `img_p8_1`, the worker tries to clone page 8's already-decoded ImageBitmap to send it back, and crashes. So images **never arrive** in page 9's `objs`.

---

## Root cause (confirmed)

`createIsomorphicCanvasFactory(() => import('@napi-rs/canvas'))` causes pdfjs to decode images as native `ImageBitmap` objects (via `@napi-rs/canvas`). When pdfjs tries to clone these objects across its internal LoopbackPort for cross-page XObject references (`CopyLocalImage`), Node's `structuredClone` throws `DataCloneError` because `ImageBitmap` from `@napi-rs/canvas` is not a transferable/cloneable type.

Result: cross-page images (img defined on page N, used on page N+1) never arrive. They silently fail.

---

## What can be tried next

### Option 1 — Open extraction PDF **without** canvas factory ⭐ most promising

The canvas factory is needed for rendering to screen. It's NOT needed for `getOperatorList()`. Without it, pdfjs decodes images as plain `{data: Uint8ClampedArray, width, height}` which IS cloneable.

```ts
// openPdfForExtraction: remove canvasFactory
const pdf = await getDocumentProxy(pdfData); // no canvasFactory

// Then in extractPageImages: hook BEFORE getOperatorList on defining page
// isRawImage check should now match since data is Uint8ClampedArray not ImageBitmap
```

Change needed: remove `canvasFactory` from `openPdfForExtraction` and ensure `isRawImage` check covers both `data instanceof Uint8ClampedArray` and also array-like raw data from pdfjs (it sometimes uses `Uint8Array`).

---

### Option 2 — Override global `structuredClone` to handle ImageBitmap

Monkey-patch before pdfjs loads:

```ts
const origClone = globalThis.structuredClone;
globalThis.structuredClone = (val, opts) => {
  if (val && typeof val === 'object' && val.bitmap) {
    return { ...val, bitmap: null }; // strip non-cloneable
  }
  return origClone(val, opts);
};
```

Risk: fragile, might corrupt other data.

---

### Option 3 — Hook `page.objs.resolve` on the DEFINING page during render (without canvas factory)

Without canvas factory, render produces raw Uint8ClampedArray data. Hook `defPage.objs.resolve` before `render(defPage)`, capture images there, then use them for page N+1.

This is the original plan but it requires Option 1 (no canvas factory) to make the data cloneable.

---

### Option 4 — Use unpdf's `extractImages()` directly (without canvasFactory)

```ts
// unpdf extractImages calls page.objs.get(key) synchronously after getOperatorList
const images = await extractImages(pdf, pageNum);
```

Only works if no DataCloneError blocks image resolution. Requires Option 1.

---

### Option 5 — Different library: mupdf.js

`mupdf.js` is a WebAssembly port, no pdfjs internals, no ImageBitmap issues.

```ts
import * as mupdf from 'mupdf';
const doc = mupdf.Document.openDocument(data, 'application/pdf');
const page = doc.loadPage(pageNum - 1);
const pixmap = page.toPixmap([1, 0, 0, 1, 0, 0], mupdf.ColorSpace.DeviceRGB);
const data = pixmap.getSamples(); // Uint8Array
```

Cost: new dependency, different API, but no pdfjs LoopbackPort issues.

---

### Option 6 — pdf-poppler / ghostscript CLI

Shell out to `pdftocairo` or `gs` to convert pages to images. Reliable, no pdfjs internals.

```ts
import { exec } from 'child_process';
exec(`pdftocairo -png -f ${pageNum} -l ${pageNum} input.pdf output/q${id}`);
```

Cost: requires external binary, less portable.

---

## Recommended next step

**Try Option 1 first** — remove `canvasFactory` from `openPdfForExtraction`, then re-run. The `isRawImage` check in `extract-images.ts` already handles `Uint8Array`. If images arrive as raw pixel arrays without the `DataCloneError`, the hook approach (Option 3 combined with Option 1) should work.

```ts
export async function openPdfForExtraction(pdfPath: string): Promise<PdfDoc> {
  const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
  return getDocumentProxy(pdfData); // no canvasFactory
}
```

Then delete `output/image-progress.json` and rerun.

---

## Key files

| File                         | Role                                         |
| ---------------------------- | -------------------------------------------- |
| `src/extract-images.ts`      | Image extraction — only file needing changes |
| `src/debug.ts`               | Throwaway debug script                       |
| `output/image-manifest.json` | 43 pages with images, confirmed correct      |
| `output/image-progress.json` | Delete before each test run                  |
