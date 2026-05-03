/**
 * Translate questions and answers from German to English using Gemini.
 *
 * - Reads output/questions.json
 * - Resumable: tracks progress in output/translate-progress.json
 * - Batches 10 questions per Gemini call
 * - Writes textEn + optionsEn back to output/questions.json after each batch
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
const DELAY_MS = 1000; // 1 s between batches

if (!API_KEY) {
    console.error('Missing GEMINI_API_KEY environment variable.');
    process.exit(1);
}

interface TranslateProgress {
    translatedIds: number[];
}

interface TranslationResult {
    id: number;
    textEn: string;
    optionsEn: Record<OptionKey, string>;
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
{"translations":[{"id":1,"textEn":"What is the capital of Germany?","optionsEn":{"a":"Berlin","b":"Hamburg","c":"Munich","d":"Cologne"}}]}

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

    for (let i = 0; i < todo.length; i += BATCH_SIZE) {
        const batch = todo.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(todo.length / BATCH_SIZE);
        process.stdout.write(`Batch ${batchNum}/${totalBatches} (ids ${batch[0].id}–${batch[batch.length - 1].id})… `);

        try {
            const results = await translateBatch(model, batch);
            for (const r of results) {
                const q = byId.get(r.id);
                if (q) {
                    q.textEn = r.textEn;
                    q.optionsEn = r.optionsEn;
                    translated.add(r.id);
                }
            }
            console.log('done');
        } catch (err) {
            console.error(`\nFailed: ${(err as Error).message}`);
            console.log('Progress saved — re-run to continue.');
            break;
        }

        // Persist after every batch
        writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');
        saveProgress(translated);

        if (i + BATCH_SIZE < todo.length) {
            await new Promise(res => setTimeout(res, DELAY_MS));
        }
    }

    const remaining = questions.filter(q => !q.textEn).length;
    console.log(`\nDone. ${translated.size} translated, ${remaining} remaining.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
