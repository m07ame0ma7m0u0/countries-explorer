// مسؤول عن حاجة واحدة: يجيب الداتا ويرجّعها بشكل نضيف وموحّد.
// باقي الكود ميعرفش الداتا جاية منين ولا شكلها الأصلي إيه.

const DATA_URL = "data/countries.json";

export async function loadCountries() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  return raw.map(normalize).sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

// الداتا الحقيقية فيها فراغات: دول من غير عاصمة أو لغات أو جيران.
// بنحط قيمة افتراضية هنا مرة واحدة، بدل ما نكتب if في كل مكان بنعرض فيه.
function normalize(c) {
  return {
    code: c.cca3,
    flag: `https://flagcdn.com/w320/${c.cca2.toLowerCase()}.png`,
    name: c.translations?.ara?.common || c.name.common,
    nameEn: c.name.common,
    official: c.translations?.ara?.official || c.name.official,
    capital: c.capital?.[0] || "—",
    region: c.region,
    subregion: c.subregion || "—",
    area: c.area,
    languages: Object.values(c.languages || {}),
    borders: c.borders || [],
  };
}
