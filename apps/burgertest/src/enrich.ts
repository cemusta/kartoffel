/**
 * Enrich questions with a fun fact / civic education context note using Gemini.
 *
 * - Reads output/questions.json
 * - Resumable: tracks progress in output/enrich-progress.json
 * - Batches 5 questions per Gemini call
 * - Writes context field back to output/questions.json after each batch
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
const DELAY_MS = 1200;

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

    return `You are an engaging educator helping immigrants learn about German civic life and culture.
For each question below, write a short context note (1-3 sentences in English) that:
- Explains WHY the correct answer is correct, or gives interesting background
- Adds a memorable fact that makes the topic stick
- Keeps a friendly, encouraging tone — learning should be fun!

Return a JSON object — no markdown fences, no extra keys:

{
  "enrichments": [
    {
      "id": <number>,
      "context": "<1-3 sentence educational note in English>"
    }
  ]
}

Questions:
${JSON.stringify(items, null, 2)}`;
}

async function enrichBatch(
    model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
    batch: Question[],
): Promise<EnrichmentResult[]> {
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(batch) }] }],
        generationConfig: { responseMimeType: 'application/json' },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text) as { enrichments: EnrichmentResult[] };
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

    for (let i = 0; i < todo.length; i += BATCH_SIZE) {
        const batch = todo.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(todo.length / BATCH_SIZE);
        process.stdout.write(
            `Batch ${batchNum}/${totalBatches} (ids ${batch[0].id}–${batch[batch.length - 1].id})… `,
        );

        try {
            const results = await enrichBatch(model, batch);
            for (const r of results) {
                const q = byId.get(r.id);
                if (q) {
                    q.translations = { ...q.translations, en: { ...q.translations?.en, text: q.translations?.en?.text ?? q.text, options: q.translations?.en?.options ?? q.options, context: r.context } };
                    enriched.add(r.id);
                }
            }
            console.log('done');
        } catch (err) {
            console.error(`\nFailed: ${(err as Error).message}`);
            console.log('Progress saved — re-run to continue.');
            break;
        }

        writeFileSync(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');
        saveProgress(enriched);

        if (i + BATCH_SIZE < todo.length) {
            await new Promise(res => setTimeout(res, DELAY_MS));
        }
    }

    const remaining = questions.filter(q => !q.translations?.en?.context).length;
    console.log(`\nDone. ${enriched.size} enriched, ${remaining} remaining.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
