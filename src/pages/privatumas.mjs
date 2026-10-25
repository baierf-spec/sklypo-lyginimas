import { crumbs } from '../site.mjs';

export default {
  path: '/privatumo-politika/',
  title: 'Privatumo politika | sklypolyginimas.lt',
  description: 'Kaip sklypolyginimas.lt tvarko užklausose pateiktus asmens duomenis.',
  body: `
<section style="padding:40px 0 var(--sec)" data-mg data-stagger="90">
<div class="wrap stack" style="gap:36px">
${crumbs([{ name: 'Pradžia', path: '/' }, { name: 'Privatumo politika', path: '/privatumo-politika/' }])}
<h1 class="disp" style="font-size:clamp(40px,5vw,72px)" data-m="up">Privatumo politika</h1>
<div class="prose" data-m="up">
<p>Ši politika paaiškina, kaip svetainė sklypolyginimas.lt tvarko asmens duomenis, kuriuos pateikiate užklausos formoje. Duomenų valdytojas: [įmonės pavadinimas, įmonės kodas, adresas, el. paštas].</p>
<h2>Kokius duomenis renkame</h2>
<p>Vardą, telefono numerį, el. pašto adresą (jei nurodote), sklypo vietą, plotą, aprašymą ir nuotraukas, jei jas pridedate. Techniniais tikslais taip pat fiksuojamas užklausos laikas ir puslapis, iš kurio ji pateikta.</p>
<h2>Kam naudojame duomenis</h2>
<p>Tik tam, kad jūsų užklausą perduotume vienam rangovui, dirbančiam jūsų regione, ir jis galėtų su jumis susisiekti dėl pasiūlymo. Teisinis pagrindas – jūsų sutikimas, kurį pažymite pateikdami formą.</p>
<h2>Kam perduodame</h2>
<p>Užklausą gauna vienas partneris rangovas jūsų regione. Duomenų neparduodame reklamos tikslais ir neperduodame kitiems tretiesiems asmenims, išskyrus paslaugų teikėjus, užtikrinančius svetainės veikimą (talpinimas ir el. pašto siuntimas – Cloudflare, Inc.).</p>
<h2>Kiek laiko saugome</h2>
<p>Užklausų duomenis saugome ne ilgiau kaip 24 mėnesius, po to jie ištrinami.</p>
<h2>Jūsų teisės</h2>
<p>Galite prašyti susipažinti su savo duomenimis, juos ištaisyti ar ištrinti, taip pat atšaukti sutikimą, parašę [el. paštas]. Turite teisę pateikti skundą Valstybinei duomenų apsaugos inspekcijai.</p>
</div>
</div>
</section>`,
};
