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

// Bullet glyph used for all checkboxes in the PDF (U+F0A3 in symbol font g_d0_f4)
const BULLET_CODEPOINT = 0xf0a3;

// x threshold: option text appears at x≈142, question text at x≈71
const OPTION_X_MIN = 130;

interface RawItem {
    str: string;
    transform: number[]; // [scaleX, skewX, skewY, scaleY, x, y]
    width: number;
    height: number;
    fontName: string;
}

interface PartialQuestion {
    id: number;
    type: 'general' | 'state';
    state?: string;
    textLines: string[];
    optionTexts: string[];        // collected in order → a, b, c, d
    currentOptionLines: string[]; // accumulates current option's continuation lines
    pageNumber: number;
    inOptions: boolean;
}

function isBullet(item: RawItem): boolean {
    return item.str.codePointAt(0) === BULLET_CODEPOINT;
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

    const result: Question = {
        id: q.id,
        type: q.type,
        text: q.textLines.join(' ').trim(),
        options,
        // correctAnswer intentionally absent — not encoded in PDF
    };

    if (q.type === 'state' && q.state) result.state = q.state;
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
            if (text.includes('Bundesland') || text.includes('Fragen für')) {
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
                    textLines: [],
                    optionTexts: [],
                    currentOptionLines: [],
                    pageNumber: pageNum,
                    inOptions: false,
                };
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
                // Continuation of question text
                currentQ.textLines.push(text);
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
