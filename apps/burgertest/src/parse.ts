/**
 * Parse the BAMF Gesamtfragenkatalog PDF into structured question objects.
 *
 * PDF structure (confirmed by inspection):
 *  - Questions: "Aufgabe N" label (bold, x≈71)
 *  - Question text: regular text at x≈71 (may wrap with hasEOL)
 *  - Options: bullet glyph (U+F0A3) at x≈114, followed by option text at x≈142
 *  - Options are assigned a/b/c/d by order (no explicit labels in PDF)
 *  - State sections: "Fragen für das Bundesland [state]" heading
 *  - Correct answers: NOT present in PDF — must be merged from external source
 */
import { getDocumentProxy } from 'unpdf';
import type { Question, OptionKey } from './types.js';
import fs from 'fs';

const GERMAN_STATES = [
    'Baden-Württemberg',
    'Bayern',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hessen',
    'Mecklenburg-Vorpommern',
    'Niedersachsen',
    'Nordrhein-Westfalen',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Thüringen',
];

const OPTION_KEYS: OptionKey[] = ['a', 'b', 'c', 'd'];

// Bullet glyphs used for checkboxes in the PDF:
//   U+F0A3 (font g_d0_f4) — used by most questions
//   U+25A1 □ (font g_d0_f9) — used by ~10 questions (e.g. Aufgabe 59, 66, 96, 111, 288)
const BULLET_CODEPOINTS = new Set([0xf0a3, 0x25a1]);

// x threshold for continuation lines: option text appears at x≈142 (standard) or x≈106 (alternate layout)
// Use 100 to cover both layouts; question text starts at x≈71
const OPTION_X_MIN = 100;

interface RawItem {
    str: string;
    transform: number[]; // [scaleX, skewX, skewY, scaleY, x, y]
}

interface PartialQuestion {
    id: number;
    type: 'general' | 'state';
    state?: string;
    textLines: string[];
    imageText?: string;           // copyright/attribution credit extracted from © lines
    optionTexts: string[];        // collected in order → a, b, c, d
    currentOptionLines: string[]; // accumulates current option's continuation lines
    pageNumber: number;
    inOptions: boolean;
}

function isBullet(item: RawItem): boolean {
    const cp = item.str.codePointAt(0);
    return cp !== undefined && BULLET_CODEPOINTS.has(cp);
}

function detectState(text: string): string | null {
    for (const state of GERMAN_STATES) {
        if (text.includes(state)) return state;
    }
    return null;
}

/**
 * Groups raw text items into visual lines by clustering on similar y-coordinates.
 * Returns lines sorted top-to-bottom (descending y, since PDF y=0 is bottom).
 */
function groupIntoLines(items: RawItem[]): RawItem[][] {
    const Y_TOLERANCE = 3;
    const sorted = [...items].sort((a, b) => {
        const dy = b.transform[5] - a.transform[5]; // descending y = top-to-bottom
        if (Math.abs(dy) > Y_TOLERANCE) return dy;
        return a.transform[4] - b.transform[4]; // left-to-right within line
    });

    const lines: RawItem[][] = [];
    let current: RawItem[] = [];
    let currentY: number | null = null;

    for (const item of sorted) {
        const y = item.transform[5];
        if (currentY === null || Math.abs(y - currentY) <= Y_TOLERANCE) {
            current.push(item);
            currentY = y;
        } else {
            if (current.length) lines.push(current);
            current = [item];
            currentY = y;
        }
    }
    if (current.length) lines.push(current);
    return lines;
}

function lineText(line: RawItem[]): string {
    return line.map(i => i.str).join('').trim();
}

function flushCurrentOption(q: PartialQuestion): void {
    if (q.currentOptionLines.length > 0) {
        q.optionTexts.push(q.currentOptionLines.join(' ').trim());
        q.currentOptionLines = [];
    }
}

function finalizeQuestion(q: PartialQuestion): Question | null {
    flushCurrentOption(q);
    if (q.optionTexts.length < 4) {
        process.stderr.write(
            `[WARN] Aufgabe ${q.id} (${q.state ?? 'general'}): only ${q.optionTexts.length} options found — skipping\n`
        );
        return null;
    }

    const options = {} as Record<OptionKey, string>;
    for (let i = 0; i < 4; i++) {
        options[OPTION_KEYS[i]] = q.optionTexts[i];
    }

    // Join text lines; if © credit slipped through into the text, split it out
    let joinedText = q.textLines.join(' ').trim();
    let imageText = q.imageText;
    const copyrightIdx = joinedText.indexOf('\u00a9');
    if (copyrightIdx !== -1) {
        const credit = joinedText.slice(copyrightIdx).trim();
        joinedText = joinedText.slice(0, copyrightIdx).trim();
        imageText = imageText ?? credit;
    }

    const result: Question = {
        id: q.id,
        type: q.type,
        page: q.pageNumber,
        text: joinedText,
        options,
        // correctAnswer intentionally absent — not encoded in PDF
    };

    if (q.type === 'state' && q.state) result.state = q.state;
    if (imageText) result.imageText = imageText;
    return result;
}

export async function parsePdf(pdfPath: string): Promise<{
    questions: Question[];
    questionPages: Map<number, number>; // questionId -> pageNumber
}> {
    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await getDocumentProxy(pdfData);
    const numPages = pdf.numPages;

    const questions: Question[] = [];
    const questionPages = new Map<number, number>();

    let currentState: string | null = null;
    let currentQ: PartialQuestion | null = null;
    // Use a global sequential id so state questions (which restart "Aufgabe 1" per state)
    // don't collide with general question ids.
    let globalId = 0;
    // Some questions (wappen / bundesland-map) have their question text appearing in the PDF
    // BEFORE the "Aufgabe N" label rather than after it. We buffer such text here so it can
    // be assigned to the next question when "Aufgabe N" is encountered.
    let pendingNextText: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const textContent = await (page as any).getTextContent();
        const rawItems: RawItem[] = textContent.items.filter(
            (item: RawItem) => typeof item.str === 'string'
        );

        const lines = groupIntoLines(rawItems);

        for (const line of lines) {
            const text = lineText(line);
            if (!text) continue;

            // ── State section heading: "Fragen für das Bundesland Bayern"
            // Use the specific phrase to avoid matching question texts that contain "Bundesland"
            // (e.g. "Welches Wappen gehört zum Bundesland Baden-Württemberg?")
            if (text.includes('Fragen für das Bundesland') || text.startsWith('Fragen für')) {
                const state = detectState(text);
                if (state) {
                    currentState = state;
                    continue;
                }
            }

            // ── General section heading resets state
            if (text === 'Allgemeine Fragen') {
                currentState = null;
                continue;
            }

            // ── Page footer: "Seite N von 191" — skip
            if (/^Seite \d+ von \d+$/.test(text)) continue;

            // ── Section headings — skip
            if (text === 'Teil II' || text === 'Teil I') continue;

            // ── Question start: "Aufgabe N"
            const aufgabeMatch = text.match(/^Aufgabe (\d+)$/);
            if (aufgabeMatch) {
                // Finalize previous question
                if (currentQ) {
                    const finished = finalizeQuestion(currentQ);
                    if (finished) {
                        questions.push(finished);
                        questionPages.set(finished.id, currentQ.pageNumber);
                    }
                }
                globalId++;
                currentQ = {
                    id: globalId,
                    type: currentState ? 'state' : 'general',
                    state: currentState ?? undefined,
                    // Capture text that appeared before this "Aufgabe N" label (unusual PDF layout
                    // used by wappen / bundesland-map questions where the question sentence
                    // precedes the question number in the visual flow).
                    textLines: pendingNextText,
                    optionTexts: [],
                    currentOptionLines: [],
                    pageNumber: pageNum,
                    inOptions: false,
                };
                pendingNextText = [];
                continue;
            }

            if (!currentQ) continue;

            // ── Line contains bullet glyph → new option starts
            const hasBullet = line.some(isBullet);
            if (hasBullet) {
                flushCurrentOption(currentQ);
                currentQ.inOptions = true;

                // Option text = everything on this line that isn't the bullet or whitespace-only
                const optText = line
                    .filter(i => !isBullet(i) && i.str.trim())
                    .map(i => i.str)
                    .join('')
                    .trim();
                if (optText) currentQ.currentOptionLines.push(optText);
                continue;
            }

            // ── Continuation lines
            const x = line[0]?.transform[4] ?? 0;
            if (currentQ.inOptions && x > OPTION_X_MIN) {
                // Continuation of current option text (wrapped line)
                currentQ.currentOptionLines.push(text);
            } else if (!currentQ.inOptions && x < OPTION_X_MIN) {
                // Continuation of question text — split out any © credit line
                if (text.includes('\u00a9')) {
                    const idx = text.indexOf('\u00a9');
                    const before = text.slice(0, idx).trim();
                    const credit = text.slice(idx).trim();
                    if (before) currentQ.textLines.push(before);
                    currentQ.imageText = credit;
                } else {
                    currentQ.textLines.push(text);
                }
            } else if (currentQ.inOptions && x < OPTION_X_MIN) {
                // Text at question-text x-position while already in options mode.
                // This happens when the NEXT question's text appears in the PDF before
                // the next "Aufgabe N" label (wappen / bundesland-map question layout).
                // Skip photo credits (lines containing ©) — they belong to the current question's image.
                if (!text.includes('\u00a9') && !text.includes('(c)')) {
                    pendingNextText.push(text);
                }
            }
            // else: skip headers, page numbers, image captions at unexpected positions
        }
    }

    // Finalize last question
    if (currentQ) {
        const finished = finalizeQuestion(currentQ);
        if (finished) {
            questions.push(finished);
            questionPages.set(finished.id, currentQ.pageNumber);
        }
    }

    return { questions, questionPages };
}
