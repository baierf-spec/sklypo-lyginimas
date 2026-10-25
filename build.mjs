// Static build: renders src/pages/*.mjs into dist/, copies public/ and assets, writes sitemap.xml.
import { mkdir, writeFile, cp, rm, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { layout, SITE } from './src/site.mjs';
import index from './src/pages/index.mjs';
import paslaugos from './src/pages/paslaugos.mjs';
import kaina from './src/pages/kaina.mjs';
import cities from './src/pages/cities.mjs';
import uzklausa from './src/pages/uzklausa.mjs';
import rangovams from './src/pages/rangovams.mjs';
import privatumas from './src/pages/privatumas.mjs';
import notfound from './src/pages/notfound.mjs';

const OUT = 'dist';
const pages = [index, paslaugos, kaina, ...cities, uzklausa, rangovams, privatumas, notfound];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp('public', OUT, { recursive: true });
await cp('src/assets', join(OUT, 'assets'), { recursive: true });

const css = await readFile('src/assets/styles.css');
const js = Buffer.concat([await readFile('src/assets/app.js'), await readFile('src/assets/motion.js')]);
const v = createHash('sha1').update(css).update(js).digest('hex').slice(0, 8);

for (const p of pages) {
  const html = layout(p).replaceAll('__V__', v);
  const file = p.file ? join(OUT, p.file) : join(OUT, p.path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

const urls = pages.filter((p) => !p.noSitemap).map((p) => `<url><loc>${SITE.url}${p.path}</loc><lastmod>${SITE.updated}</lastmod></url>`);
await writeFile(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

console.log(`Built ${pages.length} pages → ${OUT}/ (assets v=${v})`);
