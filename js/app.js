// app.js هو «المايسترو»: بيمسك الحالة (State)، ويقرر يعرض إيه، ويربط الأحداث.
import { loadCountries } from "./data.js";
import { cardHTML, loadingHTML, errorHTML, controlsHTML, detailsHTML, notFoundHTML } from "./ui.js";
import { getFavorites, saveFavorites, getTheme, saveTheme } from "./store.js";

const app = document.querySelector("#app");

// ===== الحالة: كل حاجة التطبيق محتاج يفتكرها في مكان واحد =====
const state = {
  countries: [],
  byCode: new Map(),
  query: "",
  region: "all",
  sort: "name",
  favOnly: false,
  favorites: getFavorites(),
};

// ===== التحميل =====
async function start() {
  app.innerHTML = loadingHTML();
  try {
    state.countries = await loadCountries();
    state.byCode = new Map(state.countries.map((c) => [c.code, c]));
    route();
  } catch (err) {
    app.innerHTML = errorHTML("اتأكد إنك فاتح المشروع من Live Server، وإن ملف data/countries.json موجود. (" + err.message + ")");
    document.querySelector("#retry").addEventListener("click", start);
  }
}

// ===== الفلترة والترتيب: بنحسب القايمة من الحالة، ومش بنعدّل الأصل =====
function visibleCountries() {
  const q = state.query.trim().toLowerCase();
  const list = state.countries.filter((c) =>
    (state.region === "all" || c.region === state.region) &&
    (!state.favOnly || state.favorites.has(c.code)) &&
    (!q || c.name.includes(q) || c.nameEn.toLowerCase().includes(q))
  );
  if (state.sort === "area") return [...list].sort((a, b) => b.area - a.area);
  return list;
}

// في فلتر شغال؟ بنستخدمها عشان نظهر زرار «مسح الفلاتر» بس وقت الحاجة
function hasFilters() {
  const active = [state.query.trim() !== "", state.region !== "all", state.sort !== "name"];
  active.push(state.favOnly);
  return active.some(Boolean);
}

function renderGrid() {
  const list = visibleCountries();
  document.querySelector("#grid").innerHTML = list.map((c) => cardHTML(c, state.favorites.has(c.code))).join("");
  document.querySelector("#count").textContent = list.length
    ? `${list.length} دولة`
    : "مفيش دول بالشروط دي. جرّب كلمة تانية أو شيل الفلتر.";
  document.querySelector("#reset").hidden = !hasFilters();
}

// بنستنى المستخدم يبطّل كتابة 250 مللي ثانية قبل ما نفلتر (Debounce)
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function showList() {
  const regions = [...new Set(state.countries.map((c) => c.region))].sort();
  app.innerHTML = controlsHTML(regions);
  const search = document.querySelector("#search");
  const region = document.querySelector("#region");
  const sort = document.querySelector("#sort");
  search.value = state.query;
  region.value = state.region;
  sort.value = state.sort;
  search.addEventListener("input", debounce(() => { state.query = search.value; renderGrid(); }, 250));
  region.addEventListener("change", () => { state.region = region.value; renderGrid(); });
  sort.addEventListener("change", () => { state.sort = sort.value; renderGrid(); });
  const favOnly = document.querySelector("#fav-only");
  favOnly.checked = state.favOnly;
  favOnly.addEventListener("change", () => { state.favOnly = favOnly.checked; renderGrid(); });
  document.querySelector("#reset").addEventListener("click", () => {
    state.query = "";
    state.region = "all";
    state.sort = "name";
    state.favOnly = false;
    showList(); // بيرسم الأدوات من جديد بالقيم الافتراضية
  });
  renderGrid();
}

// ===== التنقّل (Router): الرابط هو اللي بيحدد الصفحة =====
// #/                → كل الدول
// #/country/EGY     → صفحة دولة
function route() {
  const match = location.hash.match(/^#\/country\/([A-Z]{3})$/);
  if (!match) {
    showList();
    document.title = "مستكشف الدول";
    return;
  }
  const country = state.byCode.get(match[1]);
  app.innerHTML = country ? detailsHTML(country, state.byCode) : notFoundHTML();
  document.title = (country ? country.name : "مش موجودة") + " | مستكشف الدول";
  document.querySelector("h1").focus();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);

// ===== المفضلة: زرار واحد بيسمع لكل الكروت (Event delegation) =====
app.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-fav]");
  if (!btn) return;
  const code = btn.dataset.fav;
  if (state.favorites.has(code)) state.favorites.delete(code);
  else state.favorites.add(code);
  saveFavorites(state.favorites);
  renderGrid();
});

// ===== الوضع الغامق =====
const themeBtn = document.querySelector("#theme");
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}
applyTheme(getTheme());
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  saveTheme(next);
});

// اختصار: اضغط "/" عشان تكتب في البحث
document.addEventListener("keydown", (e) => {
  const search = document.querySelector("#search");
  if (e.key === "/" && search && document.activeElement !== search) {
    e.preventDefault();
    search.focus();
  }
});

start();
