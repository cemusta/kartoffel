/**
 * Translate questions and answers from German to English using Gemini.
 *
 * - Reads output/questions.json
 * - Resumable: tracks progress in output/translate-progress.json
 * - Batches 10 questions per Gemini call
 * - Sends up to CONCURRENCY batches in parallel, then waits for the next minute window
 * - Writes translations.en back to output/questions.json after each parallel group
 *
 * Usage:
 *   GEMINI_API_KEY=<key> npm run translate --workspace=apps/burgertest
 *   GEMINI_API_KEY=<key> GEMINI_MODEL=gemini-2.0-flash npm run translate --workspace=apps/burgertest
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Question, OptionKey } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const QUESTIONS_PATH = path.join(OUTPUT_DIR, 'questions.json');
const PROGRESS_PATH = path.join(OUTPUT_DIR, 'translate-progress.json');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const BATCH_SIZE = 10;
const CONCURRENCY = 15;       // max parallel calls per minute window
const WINDOW_MS = 60_000;     // rate-limit window

if (!API_KEY) {
    console.error('Missing GEMINI_API_KEY environment variable.');
    process.exit(1);
}

interface TranslateProgress {
    translatedIds: number[];
}

interface TranslationResult {
    id: number;
    text: string;
    options: Record<OptionKey, string>;
}

function loadProgress(): Set<number> {
    try {
        const p: TranslateProgress = JSON.parse(readFileSync(PROGRESS_PATH, 'utf8'));
        return new Set(p.translatedIds);
    } catch {
        return new Set();
    }
}

function saveProgress(translated: Set<number>): void {
    const p: TranslateProgress = { translatedIds: [...translated] };
    writeFileSync(PROGRESS_PATH, JSON.stringify(p, null, 2), 'utf8');
}

function buildPrompt(batch: Question[]): string {
    const items = batch.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
    }));
    return `You are a professional German-to-English translator specialising in civic education.
Translate each question text and its four answer options from German to English.
Keep the translated text concise, accurate, and natural-sounding.

Rules:
- Return ONLY a valid JSON object. No markdown fences, no commentary before or after.
- Every field must contain the complete translated text. Never use ellipsis (...) or any shorthand.
- The JSON must be complete and parseable.

Output format (id=1 is just an example — use the actual ids from the input):
{"translations":[{"id":1,"text":"What is the capital of Germany?","options":{"a":"Berlin","b":"Hamburg","c":"Munich","d":"Cologne"}}]}

Now translate these questions and return a complete JSON object in that exact format:
${JSON.stringify(items, null, 2)}`;
}

async function translateBatch(
    model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
    batch: Question[],
): Promise<TranslationResult[]> {
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(batch) }] }],
    });

    const text = result.response.text();
    // Gemma models wrap the JSON in chain-of-thought reasoning. The final answer
    // is always at the end as {"translations":[...]}. Find the last occurrence.
    const jsonStart = text.lastIndexOf('{"translations":[');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error(`No JSON object found in response: ${text.slice(0, 200)}`);
    }
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as { translations: TranslationResult[] };
    return parsed.translations;
}

async function main() {
    const genAI = new GoogleGenerativeAI(API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const questions: Question[] = JSON.parse(readFileSync(QUESTIONS_PATH, 'utf8'));
    const translated = loadProgress();

    const todo = questions.filter(q => !translated.has(q.id));
    console.log(
        `Translating ${todo.length} questions (${translated.size} already done) using ${MODEL}`,
    );

    // Index questions by id for fast update
    const byId = new Map<number, Question>(questions.map(q => [q.id, q]));
    const totalBatches = Math.ceil(todo.length / BATCH_SIZE);

    // Process CONCURRENCY batches in parallel, then wait for the next minute window
    for (let i = 0; i < todo.length; i += BATCH_SIZE * CONCURRENCY) {
        const windowStart = Date.now();
        const group = [];
        for (let j = i; j < Math.min(i + BATCH_SIZE * CONCURRENCY, todo.length); j += BATCH_SIZE) {
            const batch = todo.slice(j, j + BATCH_SIZE);
            const batchNum = Math.floor(j / BATCH_SIZE) + 1;
            group.push({ batch, batchNum });
        }

        process.stdout.write(
            `Batches ${group[0].batchNum}–${group[group.length - 1].batchNum} of ${totalBatches} (${group.length} parallel)… `,
        );

        const results = await Promise.allSettled(
            group.map(({ batch }) => translateBatch(model, batch)),
        );

        let failed = 0;
        for (let k = 0; k < results.length; k++) {
            const result = results[k];
            if (result.status === 'fulfilled') {
                for (const r of result.value) {
                    const q = byId.get(r.id);
                    if (q) {
                        q.translations = { ...q.translations, en: { text: r.text, options: r.options } };
                        translated.add(r.id);
                    }
                }
            } else {
                console.error(`\n  Batch ${group[k].batchNum} failed: ${result.reason}`);
                failed++;
            }
        }

        writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');
        saveProgress(translated);

        console.log(`done (${group.length - failed} ok, ${failed} failed)`);

        // If there are more batches, wait out the remainder of the minute window
        if (i + BATCH_SIZE * CONCURRENCY < todo.length) {
            const elapsed = Date.now() - windowStart;
            const wait = Math.max(0, WINDOW_MS - elapsed);
            if (wait > 0) {
                process.stdout.write(`  Rate-limit pause ${(wait / 1000).toFixed(1)}s… `);
                await new Promise(res => setTimeout(res, wait));
                console.log('resuming');
            }
        }
    }

    const remaining = questions.filter(q => !q.translations?.en).length;
    console.log(`\nDone. ${translated.size} translated, ${remaining} remaining.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
