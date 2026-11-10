// مسؤول عن حاجة واحدة: يحوّل الداتا لـ HTML. مفيش fetch ولا localStorage هنا.

const REGIONS = {
  Africa: "أفريقيا",
  Americas: "الأمريكتين",
  Asia: "آسيا",
  Europe: "أوروبا",
  Oceania: "أوقيانوسيا",
  Antarctic: "القارة القطبية",
};
export const regionName = (r) => REGIONS[r] || r;

// أي كلام جاي من الداتا بنهرّبه قبل ما نحطه في HTML.
export function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// نفس شكل الأرقام في كل التطبيق: 1,002,450
const number = (n) => Number(n).toLocaleString("en-US");

export function cardHTML(c, isFav) {
  return `
    <li class="card-wrap">
      <button class="fav" type="button" data-fav="${esc(c.code)}" aria-pressed="${isFav}" aria-label="ضيف ${esc(c.name)} للمفضلة">${isFav ? "★" : "☆"}</button>
      <a class="card" href="#/country/${esc(c.code)}">
        <img src="${esc(c.flag)}" alt="علم ${esc(c.name)}" width="320" height="213" loading="lazy">
        <div class="card-body">
          <h2>${esc(c.name)}</h2>
          <p class="en">${esc(c.nameEn)}</p>
          <p><b>العاصمة:</b> ${esc(c.capital)}</p>
          <p><b>القارة:</b> ${esc(regionName(c.region))}</p>
        </div>
      </a>
    </li>`;
}

export function loadingHTML() {
  return `<ul class="grid" aria-busy="true" aria-label="بيحمّل">${'<li class="skeleton"></li>'.repeat(8)}</ul>`;
}

export function errorHTML(message) {
  return `
    <div class="state" role="alert">
      <h2>حصلت مشكلة في تحميل الداتا</h2>
      <p>${esc(message)}</p>
      <button class="btn primary" type="button" id="retry">جرّب تاني</button>
    </div>`;
}

export function controlsHTML(regions) {
  return `
    <div class="controls">
      <label class="sr-only" for="search">ابحث</label>
      <input id="search" type="search" placeholder="ابحث باسم الدولة بالعربي أو الإنجليزي" autocomplete="off">
      <select id="region" aria-label="القارة">
        <option value="all">كل القارات</option>
        ${regions.map((r) => `<option value="${esc(r)}">${esc(regionName(r))}</option>`).join("")}
      </select>
      <select id="sort" aria-label="الترتيب">
        <option value="name">أبجديًا</option>
        <option value="area">الأكبر مساحة</option>
      </select>
      <label class="toggle"><input type="checkbox" id="fav-only"> المفضلة بس</label>
    </div>
    <p class="count" id="count" aria-live="polite"></p>
    <ul class="grid" id="grid"></ul>`;
}

export function detailsHTML(c, byCode) {
  const borders = c.borders
    .map((code) => byCode.get(code))
    .filter(Boolean)
    .map((b) => `<li><a href="#/country/${esc(b.code)}">${esc(b.name)}</a></li>`)
    .join("");
  return `
    <a class="btn back" href="#/">→ رجوع لكل الدول</a>
    <article class="details">
      <img src="${esc(c.flag)}" alt="علم ${esc(c.name)}" width="320" height="213">
      <div>
        <h1 tabindex="-1">${esc(c.name)}</h1>
        <p class="official">${esc(c.official)} • ${esc(c.nameEn)}</p>
        <dl class="facts">
          <dt>العاصمة</dt><dd>${esc(c.capital)}</dd>
          <dt>القارة</dt><dd>${esc(regionName(c.region))}</dd>
          <dt>المنطقة</dt><dd>${esc(c.subregion)}</dd>
          <dt>المساحة</dt><dd>${number(c.area)} كم²</dd>
          <dt>اللغات</dt><dd>${c.languages.length ? esc(c.languages.join("، ")) : "—"}</dd>
        </dl>
        <h2>الدول المجاورة</h2>
        ${borders ? `<ul class="chips">${borders}</ul>` : "<p>مفيش دول مجاورة على البر.</p>"}
      </div>
    </article>`;
}

export function notFoundHTML() {
  return `
    <div class="state">
      <h1 tabindex="-1">مش لاقيين الدولة دي</h1>
      <p>ممكن الرابط غلط.</p>
      <a class="btn primary" href="#/">رجوع لكل الدول</a>
    </div>`;
}
