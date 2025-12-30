
const API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

function normalizeCategory(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (s.includes("суп")) return "soup";
  if (s.includes("глав")) return "main";
  if (s.includes("салат") || s.includes("стартер")) return "salad";
  if (s.includes("напит")) return "drink";
  if (s.includes("десерт")) return "dessert";
  return s; // fallback
}

function normalizeKind(category, rawKind) {
  const k = String(rawKind || "").trim().toLowerCase();

  if (category === "soup" || category === "main" || category === "salad") {
    if (k.includes("рыб")) return "fish";
    if (k.includes("мяс")) return "meat";
    if (k.includes("вег") || k.includes("овощ") || k.includes("раст")) return "veg";
    // иногда API может отдавать уже английские значения
    if (k === "fish" || k === "meat" || k === "veg") return k;
    return "veg"; // безопасный дефолт
  }

  if (category === "drink") {
    if (k.includes("холод") || k.includes("cold")) return "cold";
    if (k.includes("горяч") || k.includes("hot")) return "hot";
    return "cold";
  }

  if (category === "dessert") {
    if (k.includes("мал") || k.includes("small")) return "small";
    if (k.includes("сред") || k.includes("medium")) return "medium";
    if (k.includes("бол") || k.includes("big") || k.includes("large")) return "big";
    return "small";
  }

  return k || "default";
}


function mapDish(apiDish) {
  const category = normalizeCategory(apiDish["категория"] ?? apiDish.category);
  const kind = normalizeKind(category, apiDish["вид"] ?? apiDish.kind);

  const keyword =
    apiDish["ключевое слово"] ??
    apiDish.keyword ??
    apiDish["ключ"] ??
    apiDish.key ??
    "";

  const name =
    apiDish["имя"] ??
    apiDish.name ??
    apiDish["название"] ??
    "Без названия";

  const count =
    apiDish["количество"] ??
    apiDish.count ??
    "";

  const price =
    Number(apiDish["цена"] ?? apiDish.price ?? 0);

  // image: API отдаёт URL без расширения — обычно это норм (сервер отдаёт картинку по этому адресу)
  const image =
    apiDish.image ??
    apiDish["image"] ??
    "";

  return { keyword, category, kind, name, price, count, image };
}


async function loadDishes() {
  const res = await fetch(API_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("API returned non-array JSON");
  }

  // нормализация
  const mapped = data.map(mapDish);

  // Уберём битые записи (без категории/keyword)
  return mapped.filter(d => d.category && d.keyword);
}

// Глобальная переменная, как раньше
let dishes = [];
