/**
 * Verify that questions.json is complete and all questions have a correctAnswer.
 *
 * Checks:
 *  1. Total question count (460 expected)
 *  2. All questions have correctAnswer
 *  3. Breakdown by type (general / state per state name)
 *
 * Writes output/verify-report.json. Exits 1 if any check fails.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Question } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const QUESTIONS_PATH = path.join(OUTPUT_DIR, 'questions.json');
const REPORT_PATH = path.join(OUTPUT_DIR, 'verify-report.json');

function main() {
    const questions: Question[] = JSON.parse(readFileSync(QUESTIONS_PATH, 'utf8'));

    const EXPECTED_TOTAL = 460;
    const totalOk = questions.length === EXPECTED_TOTAL;

    const missing = questions.filter(q => !q.correctAnswer);
    const answersOk = missing.length === 0;

    // Breakdown by group
    const groups = new Map<string, { total: number; missing: number }>();
    for (const q of questions) {
        const key = q.type === 'general' ? 'general' : (q.state ?? 'state-unknown');
        const g = groups.get(key) ?? { total: 0, missing: 0 };
        g.total++;
        if (!q.correctAnswer) g.missing++;
        groups.set(key, g);
    }

    const breakdown: Record<string, string> = {};
    for (const [key, g] of [...groups.entries()].sort()) {
        breakdown[key] = g.missing === 0
            ? `${g.total}/${g.total} ✓`
            : `${g.total - g.missing}/${g.total} — missing: ${questions
                .filter(q => !q.correctAnswer && (q.type === 'general' ? 'general' : (q.state ?? 'state-unknown')) === key)
                .map(q => `#${q.id}`)
                .join(', ')
            }`;
    }

    const pass = totalOk && answersOk;

    const report = {
        timestamp: new Date().toISOString(),
        pass,
        totalCount: questions.length,
        expectedTotal: EXPECTED_TOTAL,
        missingAnswers: missing.length,
        missingIds: missing.map(q => q.id),
        breakdown,
    };

    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

    console.log(`Total: ${questions.length}/${EXPECTED_TOTAL} ${totalOk ? '✓' : '✗'}`);
    console.log(`correctAnswer present: ${questions.length - missing.length}/${questions.length} ${answersOk ? '✓' : '✗'}`);
    console.log('\nBreakdown:');
    for (const [key, val] of Object.entries(breakdown)) {
        console.log(`  ${key}: ${val}`);
    }
    console.log(`\nOverall: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`Report written to ${REPORT_PATH}`);

    if (!pass) process.exit(1);
}

main();
