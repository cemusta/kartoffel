import { getDocumentProxy, createIsomorphicCanvasFactory } from 'unpdf';
import fs from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';

const pdfPath = path.resolve('assets/gesamtfragenkatalog-lebenindeutschland.pdf');
const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canvasFactory = await createIsomorphicCanvasFactory(() => import('@napi-rs/canvas') as any);
const pdf = await getDocumentProxy(pdfData, { canvasFactory });

const PAGE = 9;
const DEF_PAGE = 8;

// ── Test: hook page 9's objs.resolve BEFORE getOperatorList ───────────────
console.log('\n=== Hooking page 9 objs.resolve BEFORE getOperatorList ===');
const page9 = await pdf.getPage(PAGE);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p9Any = page9 as any;
const hookedNames: string[] = [];


const origObjs9 = p9Any.objs.resolve.bind(p9Any.objs);
p9Any.objs.resolve = (objId: string, data: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
    hookedNames.push(objId);
    console.log(`  [objs.resolve] ${objId}: keys=${data && typeof data === 'object' ? Object.keys(d).join(',') : typeof data} bitmap=${!!d?.bitmap} hasData=${d?.data instanceof Uint8ClampedArray || d?.data instanceof Uint8Array} width=${d?.width} height=${d?.height}`);
    origObjs9(objId, data);
};


const origCommon9 = p9Any.commonObjs.resolve.bind(p9Any.commonObjs);
p9Any.commonObjs.resolve = (objId: string, data: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
    hookedNames.push(objId);
    console.log(`  [commonObjs.resolve] ${objId}: keys=${data && typeof data === 'object' ? Object.keys(d).join(',') : typeof data} bitmap=${!!d?.bitmap} hasData=${d?.data instanceof Uint8ClampedArray || d?.data instanceof Uint8Array} width=${d?.width} height=${d?.height}`);
    origCommon9(objId, data);
};

const ops9 = await p9Any.getOperatorList();

// Find image names
const imageNames: string[] = [];
for (let i = 0; i < ops9.fnArray.length; i++) {
    if (ops9.fnArray[i] === 85 || ops9.fnArray[i] === 86) {
        const name = ops9.argsArray[i]?.[0] as string;
        if (name && !imageNames.includes(name)) imageNames.push(name);
    }
}
console.log('\nImage names from operator list:', imageNames);
console.log('Hook fired for:', hookedNames);

// ── Test: render defining page first, then try again ──────────────────────
console.log('\n=== Rendering page 8 (defining page) first ===');
const pdf2 = await getDocumentProxy(pdfData, { canvasFactory });
const dp2 = await pdf2.getPage(DEF_PAGE);
const dvp2 = dp2.getViewport({ scale: 1 });
const dcanvas2 = createCanvas(Math.round(dvp2.width), Math.round(dvp2.height));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
await (dp2 as any).render({ canvasContext: dcanvas2.getContext('2d'), viewport: dvp2 }).promise;
console.log('Page 8 rendered');

// Hook page 9 on the NEW doc
const page9b = await pdf2.getPage(PAGE);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p9bAny = page9b as any;
const hookedNames2: string[] = [];


const origObjs9b = p9bAny.objs.resolve.bind(p9bAny.objs);
p9bAny.objs.resolve = (objId: string, data: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
    hookedNames2.push(objId);
    console.log(`  [objs.resolve] ${objId}: keys=${data && typeof data === 'object' ? Object.keys(d).join(',') : typeof data} bitmap=${!!d?.bitmap} hasData=${d?.data instanceof Uint8ClampedArray || d?.data instanceof Uint8Array} width=${d?.width}`);
    origObjs9b(objId, data);
};


const origCommon9b = p9bAny.commonObjs.resolve.bind(p9bAny.commonObjs);
p9bAny.commonObjs.resolve = (objId: string, data: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
    hookedNames2.push(objId);
    console.log(`  [commonObjs.resolve] ${objId}: keys=${data && typeof data === 'object' ? Object.keys(d).join(',') : typeof data} bitmap=${!!d?.bitmap} hasData=${d?.data instanceof Uint8ClampedArray || d?.data instanceof Uint8Array} width=${d?.width}`);
    origCommon9b(objId, data);
};

await p9bAny.getOperatorList();
console.log('\nHook fired for (after render page 8):', hookedNames2);

// ── Test: synchronous get after getOperatorList ────────────────────────────
console.log('\n=== Sync get on page 9b after getOperatorList ===');
for (const name of imageNames) {
    for (const [label, store] of [['objs', p9bAny.objs], ['commonObjs', p9bAny.commonObjs]] as [string, unknown][]) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d = (store as any).get(name) as any;
            console.log(`  ${label}.get(${name}): keys=${d && typeof d === 'object' ? Object.keys(d).join(',') : typeof d} bitmap=${!!d?.bitmap} hasData=${d?.data instanceof Uint8ClampedArray || d?.data instanceof Uint8Array}`);
        } catch (e) {
            console.log(`  ${label}.get(${name}): THREW ${(e as Error).message}`);
        }
    }
}
