// LeadHub connection (same behaviour as the other LeadHub sites).
//
// LeadHub decides what the site shows: while the site is rented, the tenant's contact card and
// work photos; otherwise nothing (the page offers only the enquiry form) and enquiries go to
// ADMIN_EMAIL. The Worker talks to LeadHub over a service binding:
//   wrangler: "services": [{ "binding": "LEADHUB", "service": "leadhub" }]
//   vars: LEADHUB_SITE_KEY   secret: LEADHUB_SECRET
// Without the binding the site simply behaves as "not rented".

const EMPTY = { tenant: null, lead_email: null, gallery: [], operator: null };
const FRESH_MS = 60_000; // LeadHub changes show up within a minute
const CACHE_URL = 'https://leadhub.cache/site-config';
const SIZES = [480, 960, 1600];
const GALLERY_PATH = /^\/leadhub\/gallery\/(gallery\/[0-9a-f-]{36}\/[0-9a-f-]{36}-(?:480|960|1600)\.webp)$/i;

let memory = null;

const connected = (env) => !!(env.LEADHUB && env.LEADHUB_SITE_KEY && env.LEADHUB_SECRET);
const authHeaders = (env) => ({ 'x-site-key': env.LEADHUB_SITE_KEY, 'x-site-secret': env.LEADHUB_SECRET });
const edgeCache = () => { try { return globalThis.caches?.default ?? null; } catch { return null; } };

/** Current rental state; on a LeadHub outage the last known state is kept. */
export async function leadhubConfig(env) {
  if (!connected(env)) return EMPTY;
  if (memory && Date.now() - memory.at < FRESH_MS) return memory.config;
  const cache = edgeCache();
  try {
    const res = await env.LEADHUB.fetch(new Request('https://leadhub/api/site/config', { headers: authHeaders(env) }));
    if (!res.ok) throw new Error(`LeadHub ${res.status}`);
    const body = await res.json();
    const config = { tenant: body.tenant ?? null, lead_email: body.lead_email ?? null, gallery: body.gallery ?? [], operator: body.operator ?? null };
    memory = { at: Date.now(), config };
    await cache?.put(CACHE_URL, new Response(JSON.stringify(config), { headers: { 'cache-control': 'max-age=604800' } })).catch(() => undefined);
    return config;
  } catch (e) {
    console.error('LeadHub config unavailable', e && e.message);
    if (memory) return memory.config;
    const stale = await cache?.match(CACHE_URL).catch(() => undefined);
    if (stale) {
      const config = await stale.json();
      memory = { at: Date.now() - FRESH_MS / 2, config };
      return config;
    }
    return EMPTY;
  }
}

const publicConfig = (c) => ({
  tenant: c.tenant,
  operator: c.operator ?? null,
  gallery: c.gallery.map((p) => ({
    id: p.id,
    caption: p.caption,
    src: `/leadhub/gallery/${p.base}-960.webp`,
    srcSet: SIZES.map((s) => `/leadhub/gallery/${p.base}-${s}.webp ${s}w`).join(', '),
  })),
});

/**
 * What the visitor asked for, without their name or contacts: LeadHub uses it only to decide whether an
 * enquiry is real (spam and duplicates are not billed to the tenant). E-mail addresses, phone numbers and
 * links are removed here, before anything leaves the site.
 */
export function leadSummary(parts) {
  return parts
    .filter(Boolean)
    .join(' · ')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[el. paštas]')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[nuoroda]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[tel.]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600);
}

/** Records an enquiry or contact click in LeadHub (never the visitor's name or contacts). */
export async function leadhubEvent(env, kind, { hasPhotos = false, source = 'site', summary = '' } = {}) {
  if (!connected(env)) return;
  try {
    const r = await env.LEADHUB.fetch(new Request('https://leadhub/api/site/event', {
      method: 'POST',
      headers: { ...authHeaders(env), 'content-type': 'application/json' },
      body: JSON.stringify({ kind, has_photos: !!hasPhotos, source, summary: kind === 'form' ? summary : '' }),
    }));
    if (!r.ok) console.error('LeadHub event failed', r.status);
  } catch (e) { console.error('LeadHub event failed', e && e.message); }
}

/**
 * Sends an enquiry to the tenant while the site is rented (and a copy to the owner), otherwise to the owner. When delivery
 * to the tenant fails, the owner gets it with a forwarding note, so no enquiry is lost.
 * `send(to, subjectPrefix)` must throw when the e-mail could not be sent.
 */
export async function deliverLead(env, ownerEmail, send) {
  const config = await leadhubConfig(env);
  const tenantEmail = config.tenant ? config.lead_email : null;
  if (!tenantEmail) return send(ownerEmail, '');
  let sent;
  try {
    sent = await send(tenantEmail, '');
  } catch (e) {
    console.error('Lead to tenant failed, sending to owner', e && e.message);
    if (!ownerEmail) throw e;
    return send(ownerEmail, `[Persiųsti: ${config.tenant.company_name || 'nuomininkui'} <${tenantEmail}>] `);
  }
  // The site owner gets the same enquiry (to check it before counting it on the invoice).
  if (ownerEmail && ownerEmail.toLowerCase() !== tenantEmail.toLowerCase()) {
    await send(ownerEmail, `[Kopija: ${config.tenant.company_name || 'nuomininkui'}] `).catch((e) => console.error('Lead copy to owner failed', e && e.message));
  }
  return sent;
}

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...extra } });

/** GET /api/leadhub/config, POST /api/leadhub/event, GET /leadhub/gallery/…; null for other paths. */
export async function handleLeadhub(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === '/api/leadhub/config' && request.method === 'GET') {
    return json(publicConfig(await leadhubConfig(env)), 200, { 'cache-control': 'public, max-age=60', 'x-robots-tag': 'noindex' });
  }
  if (url.pathname === '/api/leadhub/event' && request.method === 'POST') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== url.host) return json({ ok: false }, 403);
    let kind = '';
    try { kind = String((await request.json()).kind ?? ''); } catch { /* empty */ }
    if (kind !== 'phone_click' && kind !== 'email_click') return json({ ok: false }, 400);
    await leadhubEvent(env, kind);
    return json({ ok: true });
  }
  const m = GALLERY_PATH.exec(url.pathname);
  if (m && request.method === 'GET') {
    if (!connected(env)) return new Response('Not found', { status: 404 });
    const cache = edgeCache();
    const hit = await cache?.match(request).catch(() => undefined);
    if (hit) return hit;
    const res = await env.LEADHUB.fetch(new Request(`https://leadhub/api/gallery/${m[1]}`));
    if (!res.ok) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
    const out = new Response(res.body, { headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=3600', etag: res.headers.get('etag') ?? '' } });
    if (cache) ctx.waitUntil(cache.put(request, out.clone()).catch(() => undefined));
    return out;
  }
  return null;
}
