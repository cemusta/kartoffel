/**
 * Bundle: copy the enriched output/questions.json into the published
 * @kartoffel/burgertest data package so it can be consumed by other apps.
 */

import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../output');
const PACKAGE_DATA_DIR = path.resolve(__dirname, '../../../packages/burgertest/data');

const SRC = path.join(OUTPUT_DIR, 'questions.json');
const DEST = path.join(PACKAGE_DATA_DIR, 'questions.json');

mkdirSync(PACKAGE_DATA_DIR, { recursive: true });
copyFileSync(SRC, DEST);

console.log(`Bundled: ${SRC} → ${DEST}`);
