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

const PRIO = { '/': 1.0, '/paslaugos/': 0.9, '/kaina/': 0.9, '/vilnius/': 0.8, '/kaunas/': 0.8, '/uzklausa/': 0.6 };
const listed = pages.filter((p) => !p.noSitemap && !p.noindex);
const urls = listed.map((p) => `  <url>\n    <loc>${SITE.url}${p.path}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n    <changefreq>${p.path === '/kaina/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${(p.priority ?? PRIO[p.path] ?? 0.5).toFixed(1)}</priority>${p.path === '/' ? `\n    <image:image><image:loc>${SITE.url}/og.png</image:loc></image:image>` : ''}\n  </url>`);
await writeFile(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`);

// llms-full.txt: the whole site as plain text for AI search engines (GEO)
const toText = (html) => html
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  .replace(/<(script|style|form|select|figure)[\s\S]*?<\/\1>/g, ' ')
  .replace(/<h1[^>]*>/g, '\n# ').replace(/<h2[^>]*>/g, '\n\n## ').replace(/<h3[^>]*>/g, '\n### ')
  .replace(/<(summary)[^>]*>/g, '\n**').replace(/<\/summary>/g, '**\n')
  .replace(/<(li|dt)[^>]*>/g, '\n- ').replace(/<(p|div|dd|tr|section)[^>]*>/g, '\n')
  .replace(/<td[^>]*>/g, ' | ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const full = listed.filter((p) => p.path !== '/privatumo-politika/').map((p) => `URL: ${SITE.url}${p.path}\nPavadinimas: ${p.title}\nAprašymas: ${p.description}\n\n${toText(p.body)}`);
await writeFile(join(OUT, 'llms-full.txt'), `# sklypolyginimas.lt – visas turinys\n\nAtnaujinta: ${SITE.updated}\n\n` + full.join('\n\n---\n\n') + '\n');

console.log(`Built ${pages.length} pages → ${OUT}/ (assets v=${v})`);
