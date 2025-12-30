const API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

// Глобально как раньше
let dishes = [];

// 1) приводим category к твоим ключам: soup/main/salad/drink/dessert
function normalizeCategory(raw) {
  const c = String(raw ?? "").trim().toLowerCase();

  if (c === "soup" || c.includes("суп")) return "soup";
  if (c === "salad" || c.includes("салат") || c.includes("стартер")) return "salad";
  if (c === "drink" || c.includes("напит")) return "drink";
  if (c === "dessert" || c.includes("десерт")) return "dessert";

  // ВАЖНО: в API есть "main-course"
  if (c === "main-course" || c.includes("main") || c.includes("глав") || c.includes("основ")) return "main";

  return c; // fallback
}

// 2) приводим kind к твоим значениям
function normalizeKind(category, raw) {
  const k = String(raw ?? "").trim().toLowerCase();

  // soup/main/salad: fish meat veg
  if (category === "soup" || category === "main" || category === "salad") {
    if (k === "fish" || k.includes("рыб")) return "fish";
    if (k === "meat" || k.includes("мяс")) return "meat";
    if (k === "veg" || k.includes("вег") || k.includes("овощ") || k.includes("раст")) return "veg";
    return "veg";
  }

  // drink: cold/hot
  if (category === "drink") {
    if (k === "cold" || k.includes("холод")) return "cold";
    if (k === "hot" || k.includes("горяч")) return "hot";
    return "cold";
  }

  // dessert: small/medium/big
  if (category === "dessert") {
    if (k === "small" || k.includes("мал")) return "small";
    if (k === "medium" || k.includes("сред")) return "medium";
    if (k === "big" || k === "large" || k.includes("бол")) return "big"; // large -> big
    return "small";
  }

  return k || "default";
}

// 3) безопасно достаём значение по списку возможных ключей
function pick(obj, keys, def = "") {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return def;
}

// 4) маппер в формат проекта
function mapDish(apiDish) {
  const categoryRaw = pick(apiDish, ["category", "категория"]);
  const category = normalizeCategory(categoryRaw);

  const kindRaw = pick(apiDish, ["kind", "вид"]);
  const kind = normalizeKind(category, kindRaw);

  const keyword = pick(apiDish, ["keyword", "ключевое слово"]);
  const name = pick(apiDish, ["name", "имя", "название"], "Без названия");

  const count = pick(apiDish, ["count", "количество"], "");
  const price = Number(pick(apiDish, ["price", "цена"], 0));

  const image = pick(apiDish, ["image"], "");

  return { keyword, category, kind, name, count, price, image };
}

// 5) функция ЛР7
async function loadDishes() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("API returned non-array JSON");

  // нормализация
  const mapped = data.map(mapDish);

  // уберём битые элементы
  return mapped.filter(d => d.keyword && d.category);
}
