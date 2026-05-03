/**
 * Enrich questions with a fun fact / civic education context note using Gemini.
 *
 * - Reads output/questions.json
 * - Resumable: tracks progress in output/enrich-progress.json
 * - Batches 5 questions per Gemini call
 * - Sends up to CONCURRENCY batches in parallel, then waits for the next minute window
 * - Writes translations.en.context back to output/questions.json after each parallel group
 *
 * Usage:
 *   GEMINI_API_KEY=<key> npm run enrich --workspace=apps/burgertest
 *   GEMINI_API_KEY=<key> GEMINI_MODEL=gemini-2.0-flash npm run enrich --workspace=apps/burgertest
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Question } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const QUESTIONS_PATH = path.join(OUTPUT_DIR, 'questions.json');
const PROGRESS_PATH = path.join(OUTPUT_DIR, 'enrich-progress.json');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const BATCH_SIZE = 5;
const CONCURRENCY = 15;     // max parallel calls per minute window
const WINDOW_MS = 60_000;   // rate-limit window

if (!API_KEY) {
    console.error('Missing GEMINI_API_KEY environment variable.');
    process.exit(1);
}

interface EnrichProgress {
    enrichedIds: number[];
}

interface EnrichmentResult {
    id: number;
    context: string;
}

function loadProgress(): Set<number> {
    try {
        const p: EnrichProgress = JSON.parse(readFileSync(PROGRESS_PATH, 'utf8'));
        return new Set(p.enrichedIds);
    } catch {
        return new Set();
    }
}

function saveProgress(enriched: Set<number>): void {
    const p: EnrichProgress = { enrichedIds: [...enriched] };
    writeFileSync(PROGRESS_PATH, JSON.stringify(p, null, 2), 'utf8');
}

function buildPrompt(batch: Question[]): string {
    // Use English text when available, fall back to German
    const items = batch.map(q => ({
        id: q.id,
        question: q.translations?.en?.text ?? q.text,
        correctAnswer: q.correctAnswer ? (q.translations?.en?.options ?? q.options)[q.correctAnswer] : undefined,
    }));

    return `You are a civic education expert writing short context notes for immigrants learning about Germany.

For each question, write 1-3 sentences in English that explain why the correct answer is right and add a memorable fact. Keep the tone friendly and encouraging.

Rules:
- Return ONLY a valid JSON object. No markdown fences, no commentary before or after.
- The JSON must be complete and parseable.

Output format (id=1 is just an example — use the actual ids from the input):
{"enrichments":[{"id":1,"context":"Germany's Basic Law (Grundgesetz) was adopted in 1949 and is one of the world's most respected constitutions. It places human dignity at its very core — no law in Germany can override it!"}]}

Now write context notes for these questions and return a complete JSON object in that exact format:
${JSON.stringify(items, null, 2)}`;
}

async function enrichBatch(
    model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
    batch: Question[],
): Promise<EnrichmentResult[]> {
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(batch) }] }],
    });

    const text = result.response.text();
    // Gemma models may wrap JSON in chain-of-thought reasoning — find the last occurrence.
    const jsonStart = text.lastIndexOf('{"enrichments":[');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error(`No JSON object found in response: ${text.slice(0, 200)}`);
    }
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as { enrichments: EnrichmentResult[] };
    return parsed.enrichments;
}

async function main() {
    const genAI = new GoogleGenerativeAI(API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const questions: Question[] = JSON.parse(readFileSync(QUESTIONS_PATH, 'utf8'));
    const enriched = loadProgress();

    const todo = questions.filter(q => !enriched.has(q.id));
    console.log(`Enriching ${todo.length} questions (${enriched.size} already done) using ${MODEL}`);

    const byId = new Map<number, Question>(questions.map(q => [q.id, q]));
    const totalBatches = Math.ceil(todo.length / BATCH_SIZE);

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
            group.map(({ batch }) => enrichBatch(model, batch)),
        );

        let failed = 0;
        for (let k = 0; k < results.length; k++) {
            const result = results[k];
            if (result.status === 'fulfilled') {
                for (const r of result.value) {
                    const q = byId.get(r.id);
                    if (q) {
                        q.translations = { ...q.translations, en: { ...q.translations?.en, text: q.translations?.en?.text ?? q.text, options: q.translations?.en?.options ?? q.options, context: r.context } };
                        enriched.add(r.id);
                    }
                }
            } else {
                console.error(`\n  Batch ${group[k].batchNum} failed: ${(results[k] as PromiseRejectedResult).reason}`);
                failed++;
            }
        }

        writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');
        saveProgress(enriched);

        console.log(`done (${group.length - failed} ok, ${failed} failed)`);

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

    const remaining = questions.filter(q => !q.translations?.en?.context).length;
    console.log(`\nDone. ${enriched.size} enriched, ${remaining} remaining.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
