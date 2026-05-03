/**
 * Bundle: copy the enriched output/questions.json and output/images/ into the
 * published @kartoffel/burgertest data package so it can be consumed by other apps.
 */

import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const PACKAGE_DATA_DIR = path.resolve(__dirname, '../../../packages/burgertest/data');

// Copy questions.json
const SRC = path.join(OUTPUT_DIR, 'questions.json');
const DEST = path.join(PACKAGE_DATA_DIR, 'questions.json');

mkdirSync(PACKAGE_DATA_DIR, { recursive: true });
copyFileSync(SRC, DEST);
console.log(`Bundled: ${SRC} → ${DEST}`);

// Copy images/
const IMAGES_SRC = path.join(OUTPUT_DIR, 'images');
const IMAGES_DEST = path.join(PACKAGE_DATA_DIR, 'images');

mkdirSync(IMAGES_DEST, { recursive: true });
const imageFiles = readdirSync(IMAGES_SRC);
for (const file of imageFiles) {
    copyFileSync(path.join(IMAGES_SRC, file), path.join(IMAGES_DEST, file));
}
console.log(`Bundled: ${imageFiles.length} image(s) → ${IMAGES_DEST}`);
