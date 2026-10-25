// sklypolyginimas.lt — Cloudflare Worker
// Serves the static site (ASSETS) and handles form submissions:
//   POST /api/lead     → client lead  → e-mail to ADMIN_EMAIL (+ photos) and D1
//   POST /api/partner  → contractor   → e-mail to ADMIN_EMAIL and D1

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_PHOTO_BYTES = 18 * 1024 * 1024; // verified destinations accept up to 25 MiB
const MAX_BODY = 22 * 1024 * 1024;

const LEAD_FIELDS = [
  ['savivaldybe', 'Savivaldybė'], ['vieta', 'Vietovė'], ['arai', 'Plotas, a'], ['bukle', 'Žemės būklė'],
  ['darbai', 'Darbai'], ['kada', 'Kada'], ['savininkas', 'Savininkas'], ['biudzetas', 'Biudžetas'],
  ['pastabos', 'Pastabos'], ['vardas', 'Vardas'], ['tel', 'Telefonas'], ['email', 'El. paštas'], ['laikas', 'Patogu skambinti'],
];
const META_FIELDS = [['saltinis', 'Forma'], ['puslapis', 'Puslapis'], ['referrer', 'Atėjo iš'], ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'], ['utm_term', 'utm_term'], ['gclid', 'gclid']];
const PARTNER_FIELDS = [['imone', 'Įmonė'], ['regionas', 'Regionas'], ['vardas', 'Kontaktinis asmuo'], ['tel', 'Telefonas'], ['email', 'El. paštas']];

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max = 500) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const isTrue = (v) => String(v).toLowerCase() === 'true';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/lead' || url.pathname === '/api/partner') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Netinkamas metodas.' }, 405);
      try {
        return await handleForm(request, env, ctx, url.pathname === '/api/partner' ? 'partner' : 'lead');
      } catch (err) {
        console.error('form error', err && (err.code || ''), err && err.message);
        return json({ ok: false, error: 'Nepavyko išsiųsti užklausos. Bandykite dar kartą po minutės.' }, 500);
      }
    }

    if (url.pathname === '/robots.txt') {
      const origin = env.SITE_ORIGIN || url.origin;
      const body = isTrue(env.SEO_INDEXABLE)
        ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`
        : 'User-agent: *\nDisallow: /\n';
      return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    // Canonical host: redirect www → apex when SITE_ORIGIN is set
    if (env.SITE_ORIGIN && url.hostname.startsWith('www.')) {
      return Response.redirect(env.SITE_ORIGIN + url.pathname + url.search, 301);
    }

    const res = await env.ASSETS.fetch(request);
    if (!isTrue(env.SEO_INDEXABLE) || url.hostname.endsWith('.workers.dev')) {
      const r = new Response(res.body, res);
      r.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return r;
    }
    return res;
  },
};

async function handleForm(request, env, ctx, kind) {
  if (kind === 'lead' && env.LEADS_ENABLED && !isTrue(env.LEADS_ENABLED)) {
    return json({ ok: false, error: 'Užklausos laikinai nepriimamos.' }, 503);
  }

  // Origin check
  const origin = request.headers.get('Origin');
  const self = new URL(request.url).origin;
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (origin && origin !== self && !allowed.includes(origin)) return json({ ok: false, error: 'Neleistinas šaltinis.' }, 403);

  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BODY) return json({ ok: false, error: 'Nuotraukos per didelės. Pridėkite mažiau nuotraukų.' }, 413);

  const form = await request.formData();

  // Honeypot: bots fill hidden "website" field → pretend success
  if (clean(form.get('website'))) return json({ ok: true });

  const ip = request.headers.get('CF-Connecting-IP') || '';

  // Turnstile (only when configured)
  if (env.TURNSTILE_SECRET_KEY) {
    const token = form.get('cf-turnstile-response');
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip);
    if (!ok) return json({ ok: false, error: 'Nepavyko patvirtinti, kad esate ne robotas. Atnaujinkite puslapį ir bandykite dar kartą.' }, 400);
  }

  // Simple rate limit per IP (needs D1)
  if (env.DB && ip) {
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip = ?1 AND created_at > datetime('now','-10 minutes')").bind(ip).first().catch(() => null);
    if (row && row.n >= 5) return json({ ok: false, error: 'Per daug užklausų iš eilės. Pabandykite po kelių minučių.' }, 429);
  }

  const fields = kind === 'partner' ? PARTNER_FIELDS : LEAD_FIELDS;
  const data = {};
  for (const [k] of [...fields, ...META_FIELDS]) {
    const all = form.getAll(k).map((v) => (typeof v === 'string' ? clean(v, k === 'pastabos' ? 2000 : 300) : '')).filter(Boolean);
    if (all.length) data[k] = all.join(', ');
  }

  // Validation
  if (kind === 'lead') {
    if (!data.vardas) return json({ ok: false, error: 'Įrašykite vardą.' }, 400);
    if (!data.tel || data.tel.replace(/\D/g, '').length < 8) return json({ ok: false, error: 'Patikrinkite telefono numerį.' }, 400);
    if (clean(form.get('sutikimas')) !== 'taip') return json({ ok: false, error: 'Pažymėkite sutikimą, kad galėtume perduoti užklausą rangovui.' }, 400);
  } else {
    if (!data.imone) return json({ ok: false, error: 'Įrašykite įmonės pavadinimą.' }, 400);
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json({ ok: false, error: 'Patikrinkite el. pašto adresą.' }, 400);
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) delete data.email;

  // Photos
  const attachments = [];
  if (kind === 'lead') {
    let total = 0;
    for (const f of form.getAll('foto')) {
      if (typeof f === 'string' || !f || !f.size) continue;
      if (attachments.length >= MAX_PHOTOS) break;
      if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type)) continue;
      if (f.size > MAX_PHOTO_BYTES || total + f.size > MAX_TOTAL_PHOTO_BYTES) continue;
      total += f.size;
      const ext = f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : 'jpg';
      attachments.push({ content: await f.arrayBuffer(), filename: `sklypas-${attachments.length + 1}.${ext}`, type: f.type, disposition: 'attachment' });
    }
  }

  const id = crypto.randomUUID();
  const created = new Date();

  // Store (best effort, never blocks the e-mail)
  if (env.DB) {
    ctx.waitUntil(
      env.DB.prepare('INSERT INTO leads (id, kind, data, photos, ip, country, user_agent) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
        .bind(id, kind, JSON.stringify(data), attachments.length, ip, request.cf?.country || '', clean(request.headers.get('User-Agent'), 300))
        .run().catch((e) => console.error('d1 insert', e.message)),
    );
  }

  // E-mail to admin
  const subject = kind === 'partner'
    ? `Naujas partneris: ${data.imone}${data.regionas ? ', ' + data.regionas : ''}`
    : `Nauja užklausa: ${[data.vieta || data.savivaldybe, data.arai ? data.arai + ' a' : ''].filter(Boolean).join(', ') || 'sklypo lyginimas'} – ${data.vardas}`;

  const rows = [...fields, ...META_FIELDS].filter(([k]) => data[k]).map(([k, label]) => [label, data[k], k]);
  const when = created.toLocaleString('lt-LT', { timeZone: 'Europe/Vilnius' });

  const html = `<!doctype html><html lang="lt"><body style="margin:0;background:#EEF2EC;font-family:Arial,Helvetica,sans-serif;color:#16291C">
<div style="max-width:620px;margin:0 auto;padding:24px">
<div style="background:#16291C;color:#EEF2EC;border-radius:16px 16px 0 0;padding:20px 24px;font-size:18px;font-weight:bold">${kind === 'partner' ? 'Naujas partnerio kontaktas' : 'Nauja sklypo lyginimo užklausa'}</div>
<div style="background:#FFFFFF;border-radius:0 0 16px 16px;padding:8px 24px 24px">
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">
${rows.map(([label, value, k]) => `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #DCE3DA;color:#4C5A4F;width:38%;vertical-align:top">${esc(label)}</td><td style="padding:10px 0;border-bottom:1px solid #DCE3DA;vertical-align:top;white-space:pre-wrap">${k === 'tel' ? `<a href="tel:${esc(value.replace(/[^\d+]/g, ''))}" style="color:#2E5B3A;font-weight:bold">${esc(value)}</a>` : k === 'email' ? `<a href="mailto:${esc(value)}" style="color:#2E5B3A">${esc(value)}</a>` : esc(value)}</td></tr>`).join('')}
</table>
${attachments.length ? `<p style="margin:16px 0 0;font-size:14px;color:#4C5A4F">Pridėta nuotraukų: ${attachments.length} (priedai).</p>` : ''}
<p style="margin:16px 0 0;font-size:12px;color:#5C6B60">${esc(when)} · ID ${id} · ${esc(request.cf?.country || '')}</p>
</div></div></body></html>`;

  const text = [subject, '', ...rows.map(([l, v]) => `${l}: ${v}`), '', attachments.length ? `Nuotraukų: ${attachments.length}` : '', `${when} · ID ${id}`].join('\n');

  const message = {
    to: env.ADMIN_EMAIL,
    from: { email: env.EMAIL_FROM, name: 'sklypolyginimas.lt' },
    subject,
    html,
    text,
  };
  if (data.email) message.replyTo = data.vardas ? { email: data.email, name: data.vardas } : data.email;
  if (attachments.length) message.attachments = attachments;

  // Delivery with fallbacks so a lead is never lost:
  // 1) EMAIL_FROM  2) EMAIL_FROM_FALLBACK (another onboarded domain)  3) without attachments
  const senders = [env.EMAIL_FROM, env.EMAIL_FROM_FALLBACK].filter(Boolean);
  let sent = false, lastErr;
  for (const from of senders) {
    message.from = { email: from, name: 'sklypolyginimas.lt' };
    try { await env.EMAIL.send(message); sent = true; break; } catch (e) { lastErr = e; console.error('email send failed', from, e.code, e.message); }
  }
  if (!sent && attachments.length) {
    delete message.attachments;
    message.text += '\n\n(Nuotraukų nepavyko prisegti – susisiekite su klientu.)';
    for (const from of senders) {
      message.from = { email: from, name: 'sklypolyginimas.lt' };
      try { await env.EMAIL.send(message); sent = true; break; } catch (e) { lastErr = e; }
    }
  }
  if (!sent) throw lastErr || new Error('email not sent');

  return json({ ok: true, id });
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', String(token));
  if (ip) body.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const j = await r.json().catch(() => ({}));
  return !!j.success;
}
