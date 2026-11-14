import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const images = new Set([
  'anleeno-home-profile.png',
  'projects/ADAS.png',
  'projects/doris.png',
  'projects/mmsearch.png',
].map(path => fileURLToPath(new URL(`../src/assets/${path}`, import.meta.url))));

// Keep original assets and config paths; serve optimized copies in production.
export function optimizeImagesPlugin() {
  return {
    name: 'optimize-site-images',
    apply: 'build',
    enforce: 'pre',
    async load(id) {
      const [file, query = ''] = id.split('?', 2);
      if (!images.has(file) || (query && !new URLSearchParams(query).has('url'))) return null;
      const original = await readFile(file);
      const image = sharp(original);
      const metadata = await image.metadata();
      if (metadata.depth !== 'uchar' || metadata.space !== 'srgb' || metadata.hasProfile) return null;
      const source = await image.clone().webp({ lossless: true, effort: 6 }).toBuffer();
      if (source.length >= original.length) return null;
      const originalPixels = await image.ensureAlpha().raw().toBuffer();
      const optimizedPixels = await sharp(source).ensureAlpha().raw().toBuffer();
      // Preserve every channel, including RGB values under fully transparent pixels.
      if (!originalPixels.equals(optimizedPixels)) return null;
      const reference = this.emitFile({
        type: 'asset',
        name: basename(file).replace(/\.png$/i, '.webp'),
        source,
      });
      return `export default import.meta.ROLLUP_FILE_URL_${reference};`;
    },
  };
}
