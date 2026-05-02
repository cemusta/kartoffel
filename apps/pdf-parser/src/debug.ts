import { getDocumentProxy, createIsomorphicCanvasFactory } from 'unpdf';
import fs from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';

const pdfPath = path.resolve('assets/gesamtfragenkatalog-lebenindeutschland.pdf');
const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canvasFactory = await createIsomorphicCanvasFactory(() => import('@napi-rs/canvas') as any);
const pdf = await getDocumentProxy(pdfData, { canvasFactory });

// Focus on page 9 (q21, 4 images from page 8)
const PAGE = 9;
const DEF_PAGE = 8;

// Render defining page first
console.log(`\n=== Rendering defining page ${DEF_PAGE} ===`);
const dp = await pdf.getPage(DEF_PAGE);
const dvp = dp.getViewport({ scale: 1 });
const dcanvas = createCanvas(Math.round(dvp.width), Math.round(dvp.height));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
await (dp as any).render({ canvasContext: dcanvas.getContext('2d'), viewport: dvp }).promise;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log('page.objs keys after render:', Object.keys((dp as any).objs?._objs ?? {}).slice(0, 20));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log('commonObjs keys after render:', Object.keys((dp as any).commonObjs?._objs ?? {}).slice(0, 20));

// Now get the referencing page
console.log(`\n=== Page ${PAGE} ===`);
const page = await pdf.getPage(PAGE);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ops = await (page as any).getOperatorList();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const objs = (page as any).objs;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const commonObjs = (page as any).commonObjs;

// Find image names
const imageNames: string[] = [];
for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === 85 || ops.fnArray[i] === 86) {
        const name = ops.argsArray[i]?.[0] as string;
        if (name && !imageNames.includes(name)) imageNames.push(name);
    }
}
console.log('Image names on page:', imageNames);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log('objs keys:', Object.keys((objs as any)?._objs ?? {}).slice(0, 20));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log('commonObjs keys:', Object.keys((commonObjs as any)?._objs ?? {}).slice(0, 20));

// Try resolving each image from both objs and commonObjs
for (const name of imageNames) {
    console.log(`\n--- ${name} ---`);
    // Try page objs
    const fromObjs = await new Promise(resolve => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (objs as any).get(name, (img: unknown) => resolve(img));
        setTimeout(() => resolve('TIMEOUT'), 2000);
    });
    console.log('  objs.get result:', fromObjs === 'TIMEOUT' ? 'TIMEOUT' : fromObjs ? `{width:${(fromObjs as any).width}, height:${(fromObjs as any).height}}` : null);

    // Try commonObjs
    const fromCommon = await new Promise(resolve => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (commonObjs as any).get(name, (img: unknown) => resolve(img));
        setTimeout(() => resolve('TIMEOUT'), 2000);
    });
    console.log('  commonObjs.get result:', fromCommon === 'TIMEOUT' ? 'TIMEOUT' : fromCommon ? `{width:${(fromCommon as any).width}, height:${(fromCommon as any).height}}` : null);
}
