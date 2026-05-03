import { getDocumentProxy } from 'unpdf';
import path from 'path';
import fs from 'fs';

export interface ExtractedImage {
    questionId: number;
    /** Relative path(s) used in JSON, e.g. "images/q55.png" */
    filePaths: string[];
}

export interface ImageManifestEntry {
    pageNum: number;
    questionId: number;
    /** Internal PDF image object names — kept so the extract phase doesn't re-scan. */
    imageNames: string[];
}

export interface ExtractionProgress {
    processedPages: number[];
}

interface RawImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

function isRawImage(value: unknown): value is RawImageData {
    if (value === null || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v['width'] === 'number' &&
        typeof v['height'] === 'number' &&
        (v['data'] instanceof Uint8ClampedArray || v['data'] instanceof Uint8Array)
    );
}

// Images whose bottom-left Y (in PDF page coords, Y=0 at bottom) is above this
// fraction of the page height are header decorations (BAMF logo).
const HEADER_Y_RATIO = 0.82;

/**
 * For each image name returns the Y translation from the cm op that directly
 * precedes its paint op. Images are painted in isolated q/cm/Do/Q blocks; the
 * cm args [a,0,0,d,tx,ty] set the transform for that image alone, so ty
 * (args[5]) is the Y position without any CTM accumulation.
 */
function getImageYPositions(
    ops: { fnArray: number[]; argsArray: unknown[][] },
): Map<string, number> {
    const positions = new Map<string, number>();
    for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === 85 || ops.fnArray[i] === 86) {
            const name = (ops.argsArray[i] as [string])?.[0];
            if (typeof name !== 'string') continue;
            // Scan backward for the most recent cm op (fn=12).
            for (let j = i - 1; j >= 0 && j >= i - 10; j--) {
                if (ops.fnArray[j] === 12) {
                    const args = ops.argsArray[j] as number[];
                    if (Array.isArray(args) && args.length >= 6) {
                        positions.set(name, args[5]); // ty
                    }
                    break;
                }
            }
        }
    }
    return positions;
}

type PdfDoc = Awaited<ReturnType<typeof getDocumentProxy>>;

async function getPageImageNames(pdf: PdfDoc, pageNum: number): Promise<string[]> {
    const page = await pdf.getPage(pageNum);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops = await (page as any).getOperatorList();
    const names: string[] = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === 85 || ops.fnArray[i] === 86) {
            const name = ops.argsArray[i]?.[0];
            if (typeof name === 'string' && !names.includes(name)) names.push(name);
        }
    }
    return names;
}

/**
 * Fast scan: loads the PDF once and reads operator lists without decoding pixels.
 * Returns one entry per page that has non-decoration images, sorted by page number.
 * Decoration filtering (BAMF logo) is done later by Y-position in extractPageImages.
 */
export interface BuildManifestResult {
    manifest: ImageManifestEntry[];
    /** The PDF document instance used for scanning — reuse this for extraction
     *  so image names and CopyLocalImage state stay consistent. */
    pdf: PdfDoc;
}

export async function buildImageManifest(
    pdfPath: string,
    questionPages: Map<number, number> // questionId -> pageNumber
): Promise<BuildManifestResult> {
    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await getDocumentProxy(pdfData);

    // Build reverse map: pageNum -> smallest (first) questionId on that page
    const pageToFirstQuestion = new Map<number, number>();
    for (const [questionId, pageNum] of questionPages.entries()) {
        const existing = pageToFirstQuestion.get(pageNum);
        if (existing === undefined || questionId < existing) {
            pageToFirstQuestion.set(pageNum, questionId);
        }
    }

    // IMPORTANT: scan question pages FIRST before the frequency scan touches any
    // other page. Calling getOperatorList on page N before page N-1 (the defining
    // page) gives the correct full op list including cross-page image references.
    // pdfjs caches the operator list per page, so subsequent freq-scan calls on
    // the same page return the already-computed (correct) list.
    const questionPageNames = new Map<number, string[]>();
    for (const pageNum of pageToFirstQuestion.keys()) {
        questionPageNames.set(pageNum, await getPageImageNames(pdf, pageNum));
    }

    // Frequency-based decoration detection: scan the first 30 pages.
    // - BAMF logo (g_d1_img_p2_1): appears on all ~191 pages → freq ≫ 2 → filtered
    // - Content images: defined on page N, referenced on page N+1 → freq ≤ 2 → kept
    const SAMPLE_PAGES = 30;
    const freq = new Map<string, number>();
    const limit = Math.min(SAMPLE_PAGES, pdf.numPages);
    for (let p = 1; p <= limit; p++) {
        const names = await getPageImageNames(pdf, p);
        for (const name of names) freq.set(name, (freq.get(name) ?? 0) + 1);
    }
    const globalDecorations = new Set(
        [...freq.entries()].filter(([, c]) => c > 2).map(([n]) => n)
    );

    const manifest: ImageManifestEntry[] = [];

    for (const [pageNum, questionId] of pageToFirstQuestion.entries()) {
        const imageNames = (questionPageNames.get(pageNum) ?? []).filter(
            n => !globalDecorations.has(n),
        );
        if (imageNames.length > 0) {
            manifest.push({ pageNum, questionId, imageNames });
        }
    }

    manifest.sort((a, b) => a.pageNum - b.pageNum);
    return { manifest, pdf };
}

/**
 * Extracts all content images for a single page.
 *
 * Strategy (no canvasFactory needed):
 *  1. Call getOperatorList() on each defining page so pdfjs decodes its images.
 *  2. Call getOperatorList() on the referencing page — triggers CopyLocalImage,
 *     which resolves cross-page images into the referencing page's objs store.
 *  3. After both awaits complete, use callback-based objs.get(name, cb) to
 *     fetch each image. Images are already resolved, so callbacks fire immediately.
 *
 * Without canvasFactory, pdfjs decodes images as plain {data: Uint8ClampedArray,
 * width, height} — fully cloneable across the LoopbackPort without any
 * DataCloneError. No structuredClone patching or @napi-rs/canvas needed.
 *
 * Naming convention among saved images (1-based, contiguous):
 *   Single image  → q{id}.png
 *   Multiple      → q{id}_1.png … q{id}_4.png
 */
export interface PageExtractionResult {
    savedPaths: string[];
    unresolvedNames: string[];
}

export async function extractPageImages(
    pdf: PdfDoc,
    entry: ImageManifestEntry,
    imagesDir: string
): Promise<PageExtractionResult> {
    const { default: sharp } = await import('sharp');

    // Step 1: run getOperatorList on the referencing page FIRST.
    // This causes pdfjs to queue requests for cross-page images (img_pN_M).
    const page = await pdf.getPage(entry.pageNum);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageAny = page as any;
    const ops = await pageAny.getOperatorList();

    // Step 2: run getOperatorList on each defining page AFTER.
    // pdfjs decodes the images on the defining page, which fulfils the
    // queued requests from Step 1 and resolves them into the referencing
    // page's objs store.
    const definingPages = new Set<number>();
    for (const name of entry.imageNames) {
        const m = /p(\d+)_/.exec(name);
        if (m) definingPages.add(parseInt(m[1], 10));
        else if (entry.pageNum > 1) definingPages.add(entry.pageNum - 1);
    }
    const defPageRefs: unknown[] = [];
    for (const defPage of definingPages) {
        if (defPage !== entry.pageNum) {
            const dp = await pdf.getPage(defPage);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (dp as any).getOperatorList();
            defPageRefs.push(dp);
        }
    }

    // Step 3: fetch each image via callback — all images are now resolved.
    // Check both the referencing page's stores and the defining pages' stores.
    const IMAGE_FETCH_TIMEOUT_MS = 2000;
    const capturedImages = new Map<string, RawImageData>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allStores = [pageAny.objs, pageAny.commonObjs, ...defPageRefs.flatMap((dp: any) => [dp.objs, dp.commonObjs])];

    await Promise.all(
        entry.imageNames.map(
            name =>
                new Promise<void>(resolve => {
                    let done = false;
                    const timeout = setTimeout(resolve, IMAGE_FETCH_TIMEOUT_MS);
                    const handle = (img: unknown) => {
                        if (done) return;
                        done = true;
                        clearTimeout(timeout);
                        if (isRawImage(img)) {
                            capturedImages.set(name, {
                                data:
                                    img.data instanceof Uint8ClampedArray
                                        ? img.data
                                        : new Uint8ClampedArray(img.data),
                                width: img.width,
                                height: img.height,
                            });
                        }
                        resolve();
                    };
                    for (const store of allStores) {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (store as any).get(name, handle);
                        } catch {
                            // not in this store
                        }
                    }
                }),
        ),
    );

    // Filter header decorations by Y position.
    // The cm op immediately before each image paint sets [a,0,0,d,tx,ty] where
    // ty is the Y coordinate in PDF space (Y=0 at bottom, high Y = top of page).
    // Images near the top (ty > pageHeight * HEADER_Y_RATIO) are logo/decoration.
    const pageHeight = page.getViewport({ scale: 1 }).height;
    const yPositions = getImageYPositions(ops);
    const contentImages = entry.imageNames.filter(name => {
        const y = yPositions.get(name);
        return y === undefined || y <= pageHeight * HEADER_Y_RATIO;
    });

    const savedPaths: string[] = [];
    const unresolvedNames: string[] = [];

    for (let saveIdx = 0; saveIdx < contentImages.length; saveIdx++) {
        const name = contentImages[saveIdx];
        const imgData = capturedImages.get(name);
        if (!imgData) {
            process.stderr.write(
                `[WARN] Image "${name}" on page ${entry.pageNum} not resolved — skipping.\n`,
            );
            unresolvedNames.push(name);
            continue;
        }

        const { data, width, height } = imgData;
        const channels = data.length / (width * height);
        const validChannels =
            channels === 4 ? 4 : channels === 3 ? 3 : channels === 1 ? 1 : null;
        if (!validChannels) {
            process.stderr.write(
                `[WARN] Image "${name}" has unexpected channel count ${channels} — skipping.\n`,
            );
            continue;
        }

        const suffix = contentImages.length > 1 ? `_${saveIdx + 1}` : '';
        const filename = `q${entry.questionId}${suffix}.png`;
        const filePath = path.join(imagesDir, filename);

        try {
            await sharp(Buffer.from(data), {
                raw: { width, height, channels: validChannels as 1 | 3 | 4 },
            })
                .png()
                .toFile(filePath);
            savedPaths.push(`images/${filename}`);
        } catch (err) {
            process.stderr.write(
                `[WARN] Could not save image "${name}" on page ${entry.pageNum}: ${(err as Error).message}\n`,
            );
        }
    }

    pageAny.cleanup?.();
    return { savedPaths, unresolvedNames };
}


