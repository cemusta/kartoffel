import { getDocumentProxy, createIsomorphicCanvasFactory } from 'unpdf';
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

// Images whose bottom-left Y (in PDF page coords, Y=0 at bottom) is above this
// fraction of the page height are header decorations (BAMF logo). The logo is
// always painted in the top ~12 % of the page; content images are in the body.
const HEADER_Y_RATIO = 0.82;

/** Matrix multiply for 2-D affine matrices stored as [a,b,c,d,e,f]. */
function multiplyMatrix(m1: number[], m2: number[]): number[] {
    return [
        m1[0] * m2[0] + m1[2] * m2[1],
        m1[1] * m2[0] + m1[3] * m2[1],
        m1[0] * m2[2] + m1[2] * m2[3],
        m1[1] * m2[2] + m1[3] * m2[3],
        m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
        m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
    ];
}

/**
 * Walks the operator list tracking the current transform matrix (CTM) and
 * records the Y translation at the moment each image is painted.
 *
 * In PDF coordinates Y=0 is at the bottom of the page, so a high Y value means
 * the image is near the top (header area).
 */
function getImageYPositions(
    ops: { fnArray: number[]; argsArray: unknown[][] },
): Map<string, number> {
    const positions = new Map<string, number>();
    let ctm: number[] = [1, 0, 0, 1, 0, 0];
    const stack: number[][] = [];

    for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        if (fn === 14) {
            // q — save state
            stack.push([...ctm]);
        } else if (fn === 15) {
            // Q — restore state
            if (stack.length > 0) ctm = stack.pop()!;
        } else if (fn === 12) {
            // cm — concat transform
            ctm = multiplyMatrix(ctm, ops.argsArray[i] as number[]);
        } else if (fn === 85 || fn === 86) {
            // Do / paintInlineImageXObject
            const name = (ops.argsArray[i] as [string])?.[0];
            if (typeof name === 'string' && !positions.has(name)) {
                positions.set(name, ctm[5]); // ctm[5] = ty (Y translation)
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
export async function buildImageManifest(
    pdfPath: string,
    questionPages: Map<number, number> // questionId -> pageNumber
): Promise<ImageManifestEntry[]> {
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

    // Frequency-based decoration detection: image names that appear on more than
    // one of the sampled pages are header decorations shared across pages.
    // This reliably catches the BAMF logo whose JBIG2 stream is defined once on
    // page 2 and referenced by every subsequent page under the same object name.
    const SAMPLE_PAGES = 30;
    const freq = new Map<string, number>();
    const limit = Math.min(SAMPLE_PAGES, pdf.numPages);
    for (let p = 1; p <= limit; p++) {
        const names = await getPageImageNames(pdf, p);
        for (const name of names) freq.set(name, (freq.get(name) ?? 0) + 1);
    }
    const frequencyDecorations = new Set(
        [...freq.entries()].filter(([, c]) => c > 1).map(([n]) => n)
    );

    const manifest: ImageManifestEntry[] = [];

    for (const [pageNum, questionId] of pageToFirstQuestion.entries()) {
        const allNames = await getPageImageNames(pdf, pageNum);
        const imageNames = allNames.filter(n => !frequencyDecorations.has(n));
        if (imageNames.length > 0) {
            manifest.push({ pageNum, questionId, imageNames });
        }
    }

    manifest.sort((a, b) => a.pageNum - b.pageNum);
    return manifest;
}

/**
 * Extracts all content images for a single page.
 *
 * Accepts an already-open PDF document so that image objects decoded when
 * rendering the defining page (N-1) are visible to objs.get on the referencing
 * page (N).  Callers should create ONE document per extraction session and reuse
 * it across all pages, then destroy it when done.
 *
 * Header decorations (the BAMF logo) are filtered by their Y position in
 * PDF page coordinates (Y=0 at bottom; logo has high Y = top of page).
 *
 * Naming convention (among saved images, 1-based contiguous):
 *   - Single content image on a page → q{id}.png
 *   - Multiple content images         → q{id}_1.png … q{id}_4.png
 */
export async function extractPageImages(
    pdf: PdfDoc,
    entry: ImageManifestEntry,
    imagesDir: string
): Promise<string[]> {
    const { default: sharp } = await import('sharp');
    const { createCanvas } = await import('@napi-rs/canvas');

    // Images are defined on page N-1 and referenced on page N.
    // We render the *defining* page(s) first so pdfjs decodes the image objects
    // and caches them — then objs.get on the referencing page resolves immediately.
    // Extract defining page number from image name (e.g. "img_p8_1" → page 8).
    const definingPages = new Set<number>();
    for (const name of entry.imageNames) {
        const m = /p(\d+)_/.exec(name);
        if (m) {
            definingPages.add(parseInt(m[1], 10));
        } else if (entry.pageNum > 1) {
            definingPages.add(entry.pageNum - 1);
        }
    }

    for (const defPage of definingPages) {
        try {
            const dp = await pdf.getPage(defPage);
            const dvp = dp.getViewport({ scale: 1 });
            const dcanvas = createCanvas(Math.round(dvp.width), Math.round(dvp.height));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (dp as any).render({ canvasContext: dcanvas.getContext('2d'), viewport: dvp }).promise;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (dp as any).cleanup?.();
        } catch (err) {
            process.stderr.write(
                `[WARN] Render of defining page ${defPage} failed: ${(err as Error).message}\n`
            );
        }
    }

    const page = await pdf.getPage(entry.pageNum);
    const pageHeight = page.getViewport({ scale: 1 }).height;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops = await (page as any).getOperatorList();
    const yPositions = getImageYPositions(ops);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objs = (page as any).objs;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commonObjs = (page as any).commonObjs;

    // Filter to content images — drop header decorations by Y position.
    const contentImages = entry.imageNames.filter(name => {
        const y = yPositions.get(name);
        return y === undefined || y <= pageHeight * HEADER_Y_RATIO;
    });

    const savedPaths: string[] = [];

    for (let saveIdx = 0; saveIdx < contentImages.length; saveIdx++) {
        const name = contentImages[saveIdx];
        try {
            // Images live in either page.objs (JPEG etc.) or page.commonObjs (JBIG2/shared).
            // Try both; whichever resolves first within 3 s wins.
            const imgData = await Promise.race([
                new Promise<{
                    data: Uint8ClampedArray;
                    width: number;
                    height: number;
                } | null>(resolve => {
                    objs.get(
                        name,
                        (img: { data: Uint8ClampedArray; width: number; height: number } | null) => {
                            if (img?.data) resolve(img);
                        }
                    );
                    commonObjs.get(
                        name,
                        (img: { data: Uint8ClampedArray; width: number; height: number } | null) => {
                            if (img?.data) resolve(img);
                        }
                    );
                }),
                new Promise<null>(resolve => setTimeout(() => resolve(null), 3_000)),
            ]);

            if (!imgData?.data) {
                process.stderr.write(
                    `[WARN] Image "${name}" on page ${entry.pageNum} not resolved — skipping.\n`
                );
                continue;
            }

            const { data, width, height } = imgData;
            const channels = data.length / (width * height);
            const validChannels = channels === 4 ? 4 : channels === 3 ? 3 : null;
            if (!validChannels) {
                process.stderr.write(
                    `[WARN] Image "${name}" has unexpected channel count ${channels} — skipping.\n`
                );
                continue;
            }

            // Contiguous 1-based numbering among saved (content) images only.
            const suffix = contentImages.length > 1 ? `_${saveIdx + 1}` : '';
            const filename = `q${entry.questionId}${suffix}.png`;
            const filePath = path.join(imagesDir, filename);

            await sharp(Buffer.from(data), {
                raw: { width, height, channels: validChannels as 3 | 4 },
            })
                .png()
                .toFile(filePath);

            savedPaths.push(`images/${filename}`);
        } catch (err) {
            process.stderr.write(
                `[WARN] Could not extract image "${name}" on page ${entry.pageNum}: ${(err as Error).message}\n`
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (page as any).cleanup?.();
    return savedPaths;
}

/** Open a PDF document ready for image extraction (canvas factory included). */
export async function openPdfForExtraction(pdfPath: string): Promise<PdfDoc> {
    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvasFactory = await createIsomorphicCanvasFactory(() => import('@napi-rs/canvas') as any);
    return getDocumentProxy(pdfData, { canvasFactory });
}
