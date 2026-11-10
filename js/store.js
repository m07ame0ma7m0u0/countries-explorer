// كل التعامل مع localStorage هنا. لو المتصفح قافله (Private mode مثلًا)
// التطبيق يفضل شغال، بس من غير حفظ.

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* مفيش حفظ، مش مشكلة */
  }
}

export function getFavorites() {
  const list = read("favorites", []);
  return new Set(Array.isArray(list) ? list : []);
}

export function saveFavorites(set) {
  write("favorites", [...set]);
}

export function getTheme() {
  const saved = read("theme", null);
  if (saved === "dark" || saved === "light") return saved;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme) {
  write("theme", theme);
}
