/**
 * Merge correct answers from the leben-in-deutschland community dataset into questions.json.
 *
 * Primary source: https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper
 *   - Scraped from the live BAMF portal (oet.bamf.de)
 *   - Covers all 460 questions across all 16 states
 *   - Uses `solution` field (letter a/b/c/d in THEIR ordering) + answer text
 *
 * Matching strategy: answer-TEXT matching (not letter matching).
 *   1. Find the LID entry by normalised question text
 *   2. Look up the correct answer TEXT from LID (lid[lid.solution])
 *   3. Find which of OUR options contains that same text → that is our correctAnswer
 *   This correctly handles different answer orderings between datasets and PDF parsing.
 *
 * Fallback: webmansa dataset (covers general 1-300 + Berlin, ID-based for general,
 *   positional for Berlin) — used for any question that LID couldn't match.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Question, OptionKey } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const ASSETS_DIR = path.resolve(__dirname, '../assets');
const QUESTIONS_PATH = path.join(OUTPUT_DIR, 'questions.json');

const LID_CACHE = path.join(ASSETS_DIR, 'leben-in-deutschland.json');
const LID_URL = 'https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper/raw/refs/heads/main/data/question.json';

const WEBMANSA_CACHE = path.join(ASSETS_DIR, 'webmansa.ts');
const WEBMANSA_URL = 'https://raw.githubusercontent.com/webmansa/german-citizenship-test-data/main/questions.ts';

const OPTION_KEYS: OptionKey[] = ['a', 'b', 'c', 'd'];

interface LIDEntry {
    num: string;
    question: string;
    a: string;
    b: string;
    c: string;
    d: string;
    solution: string;
}

interface WebmansaQuestion {
    id: number;
    question: string;
    answers: string[];
    correctAnswer: number;
}

// ── Normalisation ─────────────────────────────────────────────────────────────

/** Normalise a question text for matching: collapse whitespace, lowercase,
 *  normalise ellipsis variants, strip everything from the LAST '?' onwards
 *  (removes photo credits like "© Deutscher Bundestag/Janine Schmitz"),
 *  and sort slash-separated gender pairs so "X/Y" and "Y/X" are equal. */
function normQuestion(text: string): string {
    const trimmed = text
        .replace(/\u00a0/g, ' ')
        .replace(/\u2026/g, '...')   // U+2026 HORIZONTAL ELLIPSIS → three dots
        .replace(/\s+/g, ' ')
        .trim();
    const qi = trimmed.lastIndexOf('?');
    let s = (qi >= 0 ? trimmed.slice(0, qi + 1) : trimmed).toLowerCase();
    // Normalise spaces around slash, then sort each adjacent pair so
    // "die Regierungschefin/den Regierungschef" === "den Regierungschef / die Regierungschefin"
    s = s.replace(/\s*\/\s*/g, '/');
    s = s.replace(/([^\s/]+(?:\s[^\s/]+)?)\/([^\s/]+(?:\s[^\s/]+)?)/g,
        (_, a: string, b: string) => [a, b].sort().join('/'));
    return s;
}

/** Normalise an answer option for matching: collapse whitespace, lowercase,
 *  strip leading "Bild " prefix (wappen image options) and trailing period
 *  (PDF options often end with '.' while LID options do not),
 *  and sort slash-separated gender pairs so "X/Y" and "Y/X" are equal. */
function normAnswer(text: string): string {
    let s = text
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/^bild\s+/, '')   // wappen: "Bild 1" → "1"
        .replace(/\.$/, '');    // trailing period: "Stuttgart." → "Stuttgart"
    // Normalise slash spacing, then sort the words IMMEDIATELY around each slash
    // (not full phrases) so "Senatorin/Senator für X" === "Senator / Senatorin für X".
    // Also strip German genitive -es suffix (Senates → Senats) for lax matching.
    s = s.replace(/\s*\/\s*/g, '/');
    s = s.replace(/([^\s/]+(?:\s[^\s/]+)?)\/([^\s/]+(?:\s[^\s/]+)?)/g,
        (_, a: string, b: string) => [a, b].sort().join('/'));
    s = s.replace(/(\S{4,})es\b/g, '$1s');  // genitive: "Senates" → "Senats"
    return s;
}

// ── Dataset loaders ───────────────────────────────────────────────────────────

async function loadLID(): Promise<LIDEntry[]> {
    try {
        const cached = readFileSync(LID_CACHE, 'utf8');
        console.log('Using cached leben-in-deutschland dataset.');
        return JSON.parse(cached) as LIDEntry[];
    } catch {
        console.log('Fetching leben-in-deutschland dataset from GitHub...');
        const resp = await fetch(LID_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching LID dataset`);
        const data = await resp.text();
        writeFileSync(LID_CACHE, data, 'utf8');
        console.log(`Saved to ${LID_CACHE}`);
        return JSON.parse(data) as LIDEntry[];
    }
}

async function loadWebmansa(): Promise<WebmansaQuestion[]> {
    try {
        readFileSync(WEBMANSA_CACHE, 'utf8');
        console.log('Using cached webmansa dataset.');
    } catch {
        console.log('Fetching webmansa dataset from GitHub...');
        const resp = await fetch(WEBMANSA_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching webmansa dataset`);
        const data = await resp.text();
        writeFileSync(WEBMANSA_CACHE, data, 'utf8');
        console.log(`Saved to ${WEBMANSA_CACHE}`);
    }
    const module = await import(pathToFileURL(WEBMANSA_CACHE).href);
    return module.questions as WebmansaQuestion[];
}

// ── Core matching ─────────────────────────────────────────────────────────────

/** Given a LID entry and our question's options, find which of our options
 *  matches LID's correct answer text. Returns null if no match. */
function matchAnswerText(
    lid: LIDEntry,
    ourOptions: Record<OptionKey, string>,
): OptionKey | null {
    const correctLidText = normAnswer(lid[lid.solution as 'a' | 'b' | 'c' | 'd'] ?? '');
    if (!correctLidText) return null;
    for (const key of OPTION_KEYS) {
        if (normAnswer(ourOptions[key]) === correctLidText) return key;
    }
    return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const [lidEntries, webmansaQuestions] = await Promise.all([loadLID(), loadWebmansa()]);
    console.log(`Loaded ${lidEntries.length} LID entries, ${webmansaQuestions.length} webmansa questions.`);

    // Build LID lookup: normalised question text → entry (last one wins for dupes)
    const lidByText = new Map<string, LIDEntry>();
    for (const entry of lidEntries) {
        const key = normQuestion(entry.question);
        if (key) lidByText.set(key, entry);
    }

    // Build webmansa fallback lookups
    const wmById = new Map<number, OptionKey>();
    for (const wq of webmansaQuestions) {
        if (wq.id <= 300) {
            const key = OPTION_KEYS[wq.correctAnswer];
            if (key) wmById.set(wq.id, key);
        }
    }
    const wmByText = new Map<string, OptionKey>();
    for (const wq of webmansaQuestions) {
        const key = OPTION_KEYS[wq.correctAnswer];
        if (key) wmByText.set(normQuestion(wq.question), key);
    }

    // Webmansa Berlin positional fallback
    const wmBerlin = webmansaQuestions
        .filter(wq => wq.id >= 301 && wq.id <= 310)
        .sort((a, b) => a.id - b.id);

    const questions: Question[] = JSON.parse(readFileSync(QUESTIONS_PATH, 'utf8'));
    console.log(`Loaded ${questions.length} parsed questions.`);

    // Sort our Berlin questions for positional fallback
    const ourBerlin = questions
        .filter(q => q.state === 'Berlin')
        .sort((a, b) => a.id - b.id);
    const berlinPositional = new Map<number, OptionKey>();
    for (let i = 0; i < Math.min(ourBerlin.length, wmBerlin.length); i++) {
        const key = OPTION_KEYS[wmBerlin[i].correctAnswer];
        if (key) berlinPositional.set(ourBerlin[i].id, key);
    }

    // Manual fallback for LID entries with broken/empty answer data
    const MANUAL_CORRECT_ANSWER_TEXT: Record<string, string> = {
        'die landeshauptstadt von brandenburg heißt ...': 'Potsdam',
        'die landeshauptstadt von hessen heißt ...': 'Wiesbaden',
    };

    let lidMatch = 0;
    let wmIdMatch = 0;
    let wmTextMatch = 0;
    let wmBerlinMatch = 0;
    let manualMatch = 0;
    let unmatched = 0;

    for (const q of questions) {
        // ── Primary: LID answer-text match ───────────────────────────────────
        if (q.text) {
            const lid = lidByText.get(normQuestion(q.text));
            if (lid) {
                const key = matchAnswerText(lid, q.options);
                if (key) {
                    q.correctAnswer = key;
                    lidMatch++;
                    continue;
                }
            }
        }

        // ── Fallback 1: webmansa ID match (general questions 1-300) ──────────
        if (q.type === 'general') {
            const key = wmById.get(q.id);
            if (key !== undefined) {
                q.correctAnswer = key;
                wmIdMatch++;
                continue;
            }
        }

        // ── Fallback 2: webmansa text match ───────────────────────────────────
        if (q.text) {
            const key = wmByText.get(normQuestion(q.text));
            if (key !== undefined) {
                q.correctAnswer = key;
                wmTextMatch++;
                continue;
            }
        }

        // ── Fallback 3: webmansa Berlin positional ────────────────────────────
        if (q.state === 'Berlin') {
            const key = berlinPositional.get(q.id);
            if (key !== undefined) {
                q.correctAnswer = key;
                wmBerlinMatch++;
                continue;
            }
        }

        // ── Fallback 4: manual answers for broken LID entries ─────────────────
        if (q.text) {
            const answerText = MANUAL_CORRECT_ANSWER_TEXT[normQuestion(q.text)];
            if (answerText) {
                const normExpected = normAnswer(answerText);
                const found = OPTION_KEYS.find(k => normAnswer(q.options[k]) === normExpected);
                if (found) {
                    q.correctAnswer = found;
                    manualMatch++;
                    continue;
                }
            }
        }

        unmatched++;
    }

    writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');

    console.log(`\nMerge complete:`);
    console.log(`  LID answer-text match:      ${lidMatch}`);
    console.log(`  Webmansa ID match:           ${wmIdMatch}`);
    console.log(`  Webmansa text match:         ${wmTextMatch}`);
    console.log(`  Webmansa Berlin positional:  ${wmBerlinMatch}`);
    console.log(`  Manual fallback:             ${manualMatch}`);
    console.log(`  Unmatched:                   ${unmatched}`);

    if (unmatched > 0) {
        const ids = questions.filter(q => !q.correctAnswer).map(q => `#${q.id} (${q.state ?? 'general'})`);
        console.log(`  Unmatched IDs: ${ids.join(', ')}`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
