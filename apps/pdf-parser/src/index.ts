import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { parsePdf } from './parse.js';
import { buildImageManifest, extractPageImages, openPdfForExtraction } from './extract-images.js';
import type { ExtractionProgress } from './extract-images.js';
import type { Question } from './types.js';

function prompt(rl: readline.Interface, question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

function writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function loadProgress(filePath: string): ExtractionProgress {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ExtractionProgress;
    }
    return { processedPages: [] };
}

async function main(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const defaultPdf = path.resolve('assets/gesamtfragenkatalog-lebenindeutschland.pdf');
    const defaultOutput = path.resolve('output');

    const pdfArg = process.argv[2];
    const outArg = process.argv[3];

    let pdfPath: string;
    let outputDir: string;

    if (pdfArg) {
        pdfPath = path.resolve(pdfArg);
    } else {
        const answer = await prompt(
            rl,
            `PDF path [${defaultPdf}]: `
        );
        pdfPath = answer.trim() || defaultPdf;
    }

    if (outArg) {
        outputDir = path.resolve(outArg);
    } else {
        const answer = await prompt(
            rl,
            `Output directory [${defaultOutput}]: `
        );
        outputDir = answer.trim() || defaultOutput;
    }

    rl.close();

    if (!fs.existsSync(pdfPath)) {
        process.stderr.write(`Error: PDF not found at "${pdfPath}"\n`);
        process.exit(1);
    }

    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`\nParsing PDF: ${pdfPath}`);
    console.log(`Output dir:  ${outputDir}\n`);

    const outputPath = path.join(outputDir, 'questions.json');
    const manifestPath = path.join(outputDir, 'image-manifest.json');
    const progressPath = path.join(outputDir, 'image-progress.json');
    const imagesDir = path.join(outputDir, 'images');

    // ── Phase 1: Text parsing ──────────────────────────────────────────────
    process.stdout.write('Extracting text and questions...');
    const { questions, questionPages } = await parsePdf(pdfPath);
    process.stdout.write(` done. Found ${questions.length} questions.\n`);

    const generalCount = questions.filter(q => q.type === 'general').length;
    const stateCount = questions.filter(q => q.type === 'state').length;
    console.log(`  General: ${generalCount}  |  State: ${stateCount}`);

    // Write questions.json immediately — image paths added incrementally below
    writeJson(outputPath, questions);
    console.log(`Wrote questions to: ${outputPath}`);

    // ── Phase 2: Image manifest (fast scan, no pixel decoding) ─────────────
    process.stdout.write('Scanning PDF for images...');
    const manifest = await buildImageManifest(pdfPath, questionPages);
    writeJson(manifestPath, manifest);
    process.stdout.write(` found ${manifest.length} page(s) with images.\n`);

    // ── Phase 3: Extract images page-by-page with progress tracking ─────────
    // Fresh PDF document per page avoids pdfjs-dist memory accumulation.
    const progress = loadProgress(progressPath);
    const pending = manifest.filter(e => !progress.processedPages.includes(e.pageNum));
    const alreadyDone = manifest.length - pending.length;

    if (alreadyDone > 0) {
        console.log(`Resuming: ${alreadyDone} page(s) already done, ${pending.length} remaining.`);
    }

    fs.mkdirSync(imagesDir, { recursive: true });

    // Open ONE shared PDF document for all page extractions.
    // Image objects are cached at the document level, so rendering page N-1
    // (where images are defined) makes them available when extracting page N.
    const extractionPdf = await openPdfForExtraction(pdfPath);

    // Work on a mutable copy that may already have image paths from a previous run
    const currentQuestions: Question[] = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

    for (let i = 0; i < pending.length; i++) {
        const entry = pending[i];
        process.stdout.write(
            `  [${i + 1}/${pending.length}] Page ${entry.pageNum}` +
            ` (q${entry.questionId}, ${entry.imageNames.length} image(s))...`
        );

        const filePaths = await extractPageImages(extractionPdf, entry, imagesDir);

        if (filePaths.length > 0) {
            const q = currentQuestions.find(q => q.id === entry.questionId);
            if (q) q.image = filePaths.length === 1 ? filePaths[0] : filePaths;
            // Persist after every page so a crash doesn't lose prior work
            writeJson(outputPath, currentQuestions);
        }

        progress.processedPages.push(entry.pageNum);
        writeJson(progressPath, progress);

        process.stdout.write(` saved ${filePaths.length} image(s).\n`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (extractionPdf as any).destroy?.();

    const withImages = currentQuestions.filter(q => q.image).length;
    console.log(`\nDone. ${withImages} question(s) have images.`);
    console.log(`Output: ${outputPath}`);

    printAnswerNote(currentQuestions);
}

function printAnswerNote(questions: Question[]): void {
    const withoutAnswer = questions.filter(q => !q.correctAnswer).length;
    if (withoutAnswer > 0) {
        console.log(
            `\nNote: ${withoutAnswer} questions have no correctAnswer.` +
            ` The BAMF PDF does not mark correct answers.` +
            ` Merge from a community dataset (e.g. https://github.com/webmansa/german-citizenship-test-data).`
        );
    }
}

main().catch(err => {
    process.stderr.write(`Fatal error: ${(err as Error).message}\n`);
    process.exit(1);
});
