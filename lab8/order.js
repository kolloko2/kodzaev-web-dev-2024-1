const selectedDishes = { soup: null, main: null, salad: null, drink: null, dessert: null };

const STORAGE_KEY = "lunch_selected_ids";
const ORDERS_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/orders";

function readSelectedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { soup: null, main: null, salad: null, drink: null, dessert: null };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { soup: null, main: null, salad: null, drink: null, dessert: null };
    }

    return {
      soup: Number.isFinite(Number(parsed.soup)) ? Number(parsed.soup) : null,
      main: Number.isFinite(Number(parsed.main)) ? Number(parsed.main) : null,
      salad: Number.isFinite(Number(parsed.salad)) ? Number(parsed.salad) : null,
      drink: Number.isFinite(Number(parsed.drink)) ? Number(parsed.drink) : null,
      dessert: Number.isFinite(Number(parsed.dessert)) ? Number(parsed.dessert) : null,
    };
  } catch {
    return { soup: null, main: null, salad: null, drink: null, dessert: null };
  }
}

function writeSelectedIds() {
  const data = {
    soup: selectedDishes.soup?.id ?? null,
    main: selectedDishes.main?.id ?? null,
    salad: selectedDishes.salad?.id ?? null,
    drink: selectedDishes.drink?.id ?? null,
    dessert: selectedDishes.dessert?.id ?? null,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearSelectedIds() {
  localStorage.removeItem(STORAGE_KEY);
}

function validateLunch(sel) {
  const hasSoup = !!sel.soup;
  const hasMain = !!sel.main;
  const hasSalad = !!sel.salad;
  const hasDrink = !!sel.drink;
  const hasDessert = !!sel.dessert;

  if (!hasSoup && !hasMain && !hasSalad && !hasDrink && !hasDessert) {
    return "Ничего не выбрано. Выберите блюда для заказа";
  }

  const valid =
    (hasSoup && hasMain && hasSalad && hasDrink) ||
    (hasSoup && hasMain && hasDrink && !hasSalad) ||
    (hasSoup && hasSalad && hasDrink && !hasMain) ||
    (hasMain && hasSalad && hasDrink && !hasSoup) ||
    (hasMain && hasDrink && !hasSoup && !hasSalad);

  if (valid) return null;

  if (!hasDrink) return "Выберите напиток";
  if (hasSoup && !hasMain && !hasSalad) return "Выберите главное блюдо/салат/стартер";
  if (hasSalad && !hasSoup && !hasMain) return "Выберите суп или главное блюдо";
  if ((hasDrink || hasDessert) && !hasMain) return "Выберите главное блюдо";

  return "Выберите напиток";
}

function timeToMinutes(t) {
  const [h, m] = String(t || "").split(":");
  const hh = Number(h);
  const mm = Number(m);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function validateDeliveryTime(form) {
  const type = form.elements.delivery_type?.value;
  const time = form.elements.delivery_time?.value;

  if (type !== "by_time") return null;
  if (!time) return "Укажите время доставки";

  const minutes = timeToMinutes(time);
  if (minutes === null) return "Некорректное время доставки";

  const min = timeToMinutes("07:00");
  const max = timeToMinutes("23:00");
  if (minutes < min || minutes > max) return "Время доставки должно быть в диапазоне 07:00–23:00";

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < nowMinutes) return "Время доставки не должно быть раньше текущего";

  return null;
}

function setVal(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v ? String(v) : "";
}

function updateSelectedView() {
  const totalSpan = document.getElementById("order-total");

  const mapping = [
    { category: "soup", defaultText: "Не выбран" },
    { category: "main", defaultText: "Не выбрано" },
    { category: "salad", defaultText: "Не выбран" },
    { category: "drink", defaultText: "Не выбран" },
    { category: "dessert", defaultText: "Не выбран" },
  ];

  let total = 0;

  mapping.forEach(({ category, defaultText }) => {
    const textEl = document.querySelector(`.selected-category[data-category="${category}"] .selected-text`);
    const dish = selectedDishes[category];
    if (!textEl) return;

    if (dish) {
      textEl.textContent = `${dish.name} ${dish.price} ₽`;
      total += dish.price;
    } else {
      textEl.textContent = defaultText;
    }
  });

  if (totalSpan) totalSpan.textContent = String(total);

  setVal("soup-input", selectedDishes.soup?.id);
  setVal("main-input", selectedDishes.main?.id);
  setVal("salad-input", selectedDishes.salad?.id);
  setVal("drink-input", selectedDishes.drink?.id);
  setVal("dessert-input", selectedDishes.dessert?.id);

  writeSelectedIds();
}

function dishCard(dish) {
  return `
    <div class="menu-item" data-id="${dish.id}" data-category="${dish.category}">
      <img src="${dish.image}" alt="${dish.name}">
      <p class="price">${dish.price}₽</p>
      <p class="name">${dish.name}</p>
      <p class="weight">${dish.count}</p>
      <button type="button" class="remove-btn">Удалить</button>
    </div>
  `;
}

function renderOrderCards() {
  const grid = document.getElementById("order-dishes-grid");
  const empty = document.getElementById("order-empty");

  const picked = Object.values(selectedDishes).filter(Boolean);

  if (empty) {
    if (picked.length === 0) empty.classList.remove("hidden");
    else empty.classList.add("hidden");
  }

  if (!grid) return;
  grid.innerHTML = "";

  picked.forEach(dish => {
    grid.insertAdjacentHTML("beforeend", dishCard(dish));
  });
}

async function submitOrder(form) {
  const lunchMsg = validateLunch(selectedDishes);
  if (lunchMsg) {
    alert(lunchMsg);
    return;
  }

  const timeMsg = validateDeliveryTime(form);
  if (timeMsg) {
    alert(timeMsg);
    return;
  }

  await requireApiKey();

  const fd = new FormData(form);

  const subscribe = form.elements.subscribe?.checked ? 1 : 0;
  fd.set("subscribe", String(subscribe));

  const type = form.elements.delivery_type?.value;
  if (type !== "by_time") {
    fd.delete("delivery_time");
  }

  const res = await apiFetch(ORDERS_URL, {
    method: "POST",
    body: fd,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = (json && (json.error || json.message)) ? (json.error || json.message) : `Ошибка оформления заказа: ${res.status}`;
    throw new Error(msg);
  }

  clearSelectedIds();
  alert("Заказ успешно оформлен");
  form.reset();
}

document.addEventListener("DOMContentLoaded", async () => {
  await requireApiKey();

  try {
    dishes = await loadDishes();
  } catch (e) {
    console.error(e);
    return;
  }

  const storedIds = readSelectedIds();
  Object.keys(selectedDishes).forEach(category => {
    const id = storedIds[category];
    if (!id) return;
    const dish = dishes.find(d => d.id === id && d.category === category);
    if (dish) selectedDishes[category] = dish;
  });

  renderOrderCards();
  updateSelectedView();

  document.querySelector("main")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove-btn");
    if (!btn) return;

    const card = btn.closest(".menu-item");
    const id = Number(card?.dataset?.id);
    const category = card?.dataset?.category;
    if (!Number.isFinite(id) || !category) return;

    if (selectedDishes[category]?.id === id) {
      selectedDishes[category] = null;
      writeSelectedIds();
      card.remove();
      updateSelectedView();
      renderOrderCards();
    }
  });

  const form = document.getElementById("order-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await submitOrder(form);
    } catch (err) {
      alert(err?.message || "Не удалось оформить заказ");
    }
  });

  form?.addEventListener("reset", () => {
    Object.keys(selectedDishes).forEach(k => selectedDishes[k] = null);
    clearSelectedIds();
    setTimeout(() => {
      renderOrderCards();
      updateSelectedView();
    }, 0);
  });
});
