// sklypolyginimas.lt — Cloudflare Worker
// Serves the static site (ASSETS) and handles form submissions:
//   POST /api/lead     → client lead  → e-mail to ADMIN_EMAIL (+ photos) and D1
//   POST /api/partner  → contractor   → e-mail to ADMIN_EMAIL and D1
//   LeadHub: while the site is rented, client leads go to the tenant (see worker/leadhub.js)

import { deliverLead, handleLeadhub, leadhubEvent } from './leadhub.js';

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_PHOTO_BYTES = 18 * 1024 * 1024; // verified destinations accept up to 25 MiB
const MAX_BODY = 22 * 1024 * 1024;

const LEAD_FIELDS = [
  ['savivaldybe', 'Savivaldybė'], ['vieta', 'Vietovė'], ['arai', 'Plotas, a'], ['bukle', 'Situacija'],
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

    const lh = await handleLeadhub(request, env, ctx);
    if (lh) return lh;

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
      const AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'meta-externalagent', 'MistralAI-User', 'cohere-ai', 'YouBot'];
      const rules = 'Allow: /\nDisallow: /api/\nDisallow: /rangovams/\n';
      const body = isTrue(env.SEO_INDEXABLE)
        ? `# sklypolyginimas.lt – paieškos ir AI asistentai kviečiami indeksuoti visą viešą turinį\n# Content-Signal: search=yes, ai-input=yes, ai-train=yes\n\nUser-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\n${rules}\n` +
          AI.map((b) => `User-agent: ${b}\n${rules}`).join('\n') +
          `\nSitemap: ${origin}/sitemap.xml\n\n# Santrauka AI sistemoms: ${origin}/llms.txt\n# Visas turinys: ${origin}/llms-full.txt\n`
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
    if (!data.arai) return json({ ok: false, error: 'Nurodykite sklypo plotą arais (galima apytiksliai).' }, 400);
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
    : `Užklausa: ${[data.vieta || data.savivaldybe, data.arai ? data.arai + ' a' : ''].filter(Boolean).join(', ') || 'sklypo lyginimas'}${data.bukle ? ' · ' + data.bukle : ''} – ${data.vardas}`;

  const when = created.toLocaleString('lt-LT', { timeZone: 'Europe/Vilnius', dateStyle: 'short', timeStyle: 'short' });
  const country = request.cf?.country || '';
  const html = kind === 'partner'
    ? emailHtml({ kicker: 'Naujas partnerio kontaktas', title: data.imone, data, sections: [['Kontaktas', PARTNER_FIELDS]], attachments, when, id, country })
    : emailHtml({
        kicker: 'Nauja sklypo lyginimo užklausa',
        title: [data.vieta, data.savivaldybe].filter(Boolean).join(', ') || 'Vieta nenurodyta',
        chips: [data.arai ? `${data.arai} a` : 'Plotas nenurodytas', data.bukle, data.kada].filter(Boolean),
        data, attachments, when, id, country,
        sections: [
          ['Sklypas', [['savivaldybe', 'Savivaldybė'], ['vieta', 'Vietovė'], ['arai', 'Plotas'], ['bukle', 'Situacija'], ['darbai', 'Reikalingi darbai']]],
          ['Planai', [['kada', 'Kada'], ['savininkas', 'Savininkas'], ['biudzetas', 'Biudžetas'], ['laikas', 'Patogu skambinti']]],
        ],
      });

  const rows = [...fields, ...META_FIELDS].filter(([k]) => data[k]).map(([k, label]) => [label, data[k], k]);
  const text = [subject, '', ...rows.map(([l, v]) => `${l}: ${v}`), '', attachments.length ? `Nuotraukų: ${attachments.length}` : '', `${when} · ID ${id}`].join('\n');

  // Delivery with fallbacks so a lead is never lost:
  // 1) EMAIL_FROM  2) EMAIL_FROM_FALLBACK (another onboarded domain)  3) without attachments
  const sendTo = async (to, prefix) => {
    const message = { to, from: { email: env.EMAIL_FROM, name: 'sklypolyginimas.lt' }, subject: prefix + subject, html, text };
    if (data.email) message.replyTo = data.vardas ? { email: data.email, name: data.vardas } : data.email;
    if (attachments.length) message.attachments = attachments;
    const senders = [env.EMAIL_FROM, env.EMAIL_FROM_FALLBACK].filter(Boolean);
    let lastErr;
    for (const from of senders) {
      message.from = { email: from, name: 'sklypolyginimas.lt' };
      try { await env.EMAIL.send(message); return; } catch (e) { lastErr = e; console.error('email send failed', from, e.code, e.message); }
    }
    if (attachments.length) {
      delete message.attachments;
      message.text += '\n\n(Nuotraukų nepavyko prisegti – susisiekite su klientu.)';
      for (const from of senders) {
        message.from = { email: from, name: 'sklypolyginimas.lt' };
        try { await env.EMAIL.send(message); return; } catch (e) { lastErr = e; }
      }
    }
    throw lastErr || new Error('email not sent');
  };
  // Client leads go to the LeadHub tenant while the site is rented; partner sign-ups always to the owner.
  if (kind === 'lead') {
    await deliverLead(env, env.ADMIN_EMAIL, sendTo);
    ctx.waitUntil(leadhubEvent(env, 'form', { hasPhotos: attachments.length > 0 }));
  } else {
    await sendTo(env.ADMIN_EMAIL, '');
  }

  // Count the lead in GA4 from the server (Measurement Protocol): works with ad blockers
  // and without cookies. No personal data is sent to Google.
  let tracked = false;
  if (kind === 'lead' && env.GA_API_SECRET && env.GA_MEASUREMENT_ID) {
    const cid = /^\d+\.\d+$/.test(clean(form.get('ga_cid'), 40)) ? clean(form.get('ga_cid'), 40) : `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`;
    const sid = /^\d{6,20}$/.test(clean(form.get('ga_sid'), 20)) ? clean(form.get('ga_sid'), 20) : '';
    tracked = await sendGa(env, cid, {
      name: 'generate_lead',
      params: {
        form_name: 'kontaktinė_forma', lead_type: 'užklausa',
        form_location: data.saltinis || '', page_path: data.puslapis || '/',
        photos: attachments.length, ...(sid && { session_id: sid }), engagement_time_msec: 1,
        tracking: form.get('ga_cid') ? 'server_cookie' : 'server_no_cookie',
      },
    });
  }

  return json({ ok: true, id, tracked });
}

async function sendGa(env, clientId, event) {
  try {
    const r = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(env.GA_MEASUREMENT_ID)}&api_secret=${encodeURIComponent(env.GA_API_SECRET)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, events: [event] }),
      signal: AbortSignal.timeout(3000),
    });
    return r.ok;
  } catch (e) { console.error('ga mp', e.message); return false; }
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

// ---------- E-mail template (table layout, inline styles: works in Gmail, Outlook, mobile) ----------
const C = { bg: '#EEF2EC', card: '#FFFFFF', ink: '#16291C', moss: '#2E5B3A', muted: '#5C6B60', line: '#E1E7DF', pale: '#E1ECDF', fern: '#8DB48E' };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif";

export function emailHtml({ kicker, title, chips = [], data, sections, attachments, when, id, country }) {
  const tel = data.tel ? data.tel.replace(/[^\d+]/g, '') : '';
  const row = (label, value) => `<tr><td style="padding:11px 0;border-bottom:1px solid ${C.line};color:${C.muted};font-size:14px;width:40%;vertical-align:top">${esc(label)}</td><td style="padding:11px 0;border-bottom:1px solid ${C.line};font-size:15px;font-weight:600;color:${C.ink};vertical-align:top">${value}</td></tr>`;
  const sectionHtml = ([name, list]) => {
    const items = list.map(([k, label]) => {
      if (data[k]) return row(label, esc(data[k]) + (k === 'arai' ? ' a' : ''));
      if (k === 'arai') return row(label, `<span style="color:#A4472F;font-weight:600">nenurodyta</span>`);
      return '';
    }).join('');
    return items ? `<tr><td style="padding:22px 28px 0"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.moss};font-weight:700;margin-bottom:4px">${esc(name)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${items}</table></td></tr>` : '';
  };
  const chipHtml = chips.map((c) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;background:#2E4A36;color:#E1ECDF;font-size:13px;font-weight:600">${esc(c)}</span>`).join('');
  const contact = data.vardas || data.tel || data.email ? `
<tr><td style="padding:24px 28px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:${C.pale};border-radius:14px"><tr><td style="padding:18px 20px">
<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.moss};font-weight:700">Klientas</div>
<div style="font-size:20px;font-weight:700;color:${C.ink};margin:4px 0 2px">${esc(data.vardas || '')}</div>
${data.email ? `<div style="font-size:14px"><a href="mailto:${esc(data.email)}" style="color:${C.moss}">${esc(data.email)}</a></div>` : ''}
${tel ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr><td style="background:${C.ink};border-radius:999px"><a href="tel:${esc(tel)}" style="display:inline-block;padding:12px 22px;color:#FFFFFF;font-size:16px;font-weight:700;text-decoration:none">Skambinti ${esc(data.tel)}</a></td></tr></table>` : ''}
</td></tr></table></td></tr>` : '';
  const comment = data.pastabos ? `
<tr><td style="padding:22px 28px 0">
<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.moss};font-weight:700;margin-bottom:8px">Kliento komentaras</div>
<div style="border-left:4px solid ${C.fern};background:#F6F8F4;border-radius:0 10px 10px 0;padding:14px 16px;font-size:15px;line-height:1.55;color:${C.ink};white-space:pre-wrap">${esc(data.pastabos)}</div>
</td></tr>` : '';
  const photos = attachments.length ? `
<tr><td style="padding:18px 28px 0"><div style="font-size:14px;color:${C.ink};background:#F6F8F4;border-radius:10px;padding:12px 16px">📎 Prisegta sklypo nuotraukų: <b>${attachments.length}</b></div></td></tr>` : '';
  const meta = META_FIELDS.filter(([k]) => data[k]).map(([k, l]) => `${esc(l)}: ${esc(data[k])}`).join(' · ');
  return `<!doctype html><html lang="lt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};color:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc([title, ...chips, data.vardas].filter(Boolean).join(' · '))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.card};border-radius:18px;overflow:hidden">
<tr><td style="background:${C.ink};padding:24px 28px 20px">
<div style="font-size:13px;color:${C.fern};font-weight:700;letter-spacing:.04em">${esc(kicker)}</div>
<div style="font-size:24px;line-height:1.25;font-weight:700;color:#F8FAF6;margin:6px 0 14px">${esc(title || '')}</div>
${chipHtml}
</td></tr>
${contact}
${comment}
${sections.map(sectionHtml).join('')}
${photos}
<tr><td style="padding:24px 28px 26px"><div style="font-size:12px;line-height:1.6;color:${C.muted}">${esc(when)} · ${esc(country)} · ID ${id}${meta ? `<br>${meta}` : ''}</div></td></tr>
</table>
<div style="font-size:12px;color:${C.muted};padding:14px 0 0">sklypolyginimas.lt</div>
</td></tr></table></body></html>`;
}
