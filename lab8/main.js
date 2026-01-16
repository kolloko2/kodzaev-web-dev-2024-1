const selectedDishes = { soup: null, main: null, salad: null, drink: null, dessert: null };
const activeFilters  = { soup: null, main: null, salad: null, drink: null, dessert: null };

const STORAGE_KEY = "lunch_selected_ids";

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

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof requireApiKey === "function") {
    try {
      await requireApiKey();
    } catch {
      // ignore
    }
  }

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

  const containers = {
    soup: document.getElementById("soups-grid"),
    main: document.getElementById("mains-grid"),
    salad: document.getElementById("salads-grid"),
    drink: document.getElementById("drinks-grid"),
    dessert: document.getElementById("desserts-grid"),
  };

  const dishesByCategory = { soup: [], main: [], salad: [], drink: [], dessert: [] };

  dishes.forEach(d => {
    if (dishesByCategory[d.category]) dishesByCategory[d.category].push(d);
  });

  function dishCard(dish, isSelected) {
    return `
      <div class="menu-item ${isSelected ? "menu-item--selected" : ""}"
           data-id="${dish.id}"
           data-category="${dish.category}">
        <img src="${dish.image}" alt="${dish.name}">
        <p class="price">${dish.price}₽</p>
        <p class="name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button type="button" class="add-btn">Добавить</button>
      </div>
    `;
  }

  function renderCategory(category) {
    const container = containers[category];
    if (!container) return;

    container.innerHTML = "";
    const kind = activeFilters[category];

    dishesByCategory[category]
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .filter(d => !kind || d.kind === kind)
      .forEach(dish => {
        const isSelected = selectedDishes[category]?.id === dish.id;
        container.insertAdjacentHTML("beforeend", dishCard(dish, isSelected));
      });
  }

  function renderAll() {
    Object.keys(dishesByCategory).forEach(renderCategory);
  }

  document.querySelector("main").addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;

    const card = btn.closest(".menu-item");
    const id = Number(card.dataset.id);
    if (!Number.isFinite(id)) return;
    const dish = dishes.find(d => d.id === id);
    if (!dish) return;

    selectedDishes[dish.category] = dish;

    document
      .querySelectorAll(`.menu-item[data-category="${dish.category}"]`)
      .forEach(el => el.classList.remove("menu-item--selected"));

    card.classList.add("menu-item--selected");
    updateSelectedView();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    const block = btn.closest(".filters");
    if (!block) return;

    const category = block.dataset.filtersFor;
    const kind = btn.dataset.kind;

    const same = activeFilters[category] === kind;
    activeFilters[category] = same ? null : kind;

    block.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    if (!same) btn.classList.add("active");

    renderCategory(category);
  });

  const form = document.querySelector(".order-form");

  form?.addEventListener("submit", (e) => {
    const msg = validateLunch(selectedDishes);
    if (msg) {
      e.preventDefault();
      showNotice(msg);
    }
  });

  form?.addEventListener("reset", () => {
    Object.keys(selectedDishes).forEach(k => selectedDishes[k] = null);
    Object.keys(activeFilters).forEach(k => activeFilters[k] = null);
    document.querySelectorAll(".filter-btn.active").forEach(b => b.classList.remove("active"));

    clearSelectedIds();

    setTimeout(() => {
      renderAll();
      updateSelectedView();
    }, 0);
  });

  renderAll();
  updateSelectedView();
});

function updateSelectedView() {
  const emptyBlock = document.getElementById("selected-empty");
  const categoriesBlock = document.getElementById("selected-categories");
  const summaryBlock = document.getElementById("order-summary");
  const totalSpan = document.getElementById("order-total");

  const checkoutPanel = document.getElementById("checkout-panel");
  const checkoutTotal = document.getElementById("checkout-total");
  const checkoutLink = document.getElementById("checkout-link");

  const has = Object.values(selectedDishes).some(Boolean);

  if (emptyBlock && categoriesBlock && summaryBlock) {
    if (!has) {
      emptyBlock.classList.remove("hidden");
      categoriesBlock.classList.add("hidden");
      summaryBlock.classList.add("hidden");
    } else {
      emptyBlock.classList.add("hidden");
      categoriesBlock.classList.remove("hidden");
    }
  }

  const mapping = [
    { category: "soup", defaultText: "Блюдо не выбрано" },
    { category: "main", defaultText: "Блюдо не выбрано" },
    { category: "salad", defaultText: "Блюдо не выбрано" },
    { category: "drink", defaultText: "Напиток не выбран" },
    { category: "dessert", defaultText: "Блюдо не выбрано" },
  ];

  let total = 0;

  mapping.forEach(({ category, defaultText }) => {
    const textEl = document.querySelector(`.selected-category[data-category="${category}"] .selected-text`);
    const dish = selectedDishes[category];
    if (!textEl) return;

    if (dish) {
      textEl.textContent = `${dish.name} — ${dish.price} ₽`;
      total += dish.price;
    } else {
      textEl.textContent = defaultText;
    }
  });

  if (summaryBlock && totalSpan) {
    if (total > 0) {
      summaryBlock.classList.remove("hidden");
      totalSpan.textContent = String(total);
    } else {
      summaryBlock.classList.add("hidden");
    }
  }

  if (checkoutPanel && checkoutTotal && checkoutLink) {
    if (has) {
      checkoutPanel.classList.remove("hidden");
      checkoutTotal.textContent = String(total);
    } else {
      checkoutPanel.classList.add("hidden");
      checkoutTotal.textContent = "0";
    }

    const msg = validateLunch(selectedDishes);
    const isValidCombo = !msg;
    checkoutLink.classList.toggle("checkout-panel__link--disabled", !isValidCombo);
    checkoutLink.setAttribute("aria-disabled", String(!isValidCombo));
  }

  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || "";
  };

  setVal("soup-input", selectedDishes.soup?.id);
  setVal("main-input", selectedDishes.main?.id);
  setVal("salad-input", selectedDishes.salad?.id);
  setVal("drink-input", selectedDishes.drink?.id);
  setVal("dessert-input", selectedDishes.dessert?.id);

  writeSelectedIds();
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

function showNotice(text) {
  document.querySelector(".notice-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "notice-overlay";

  const box = document.createElement("div");
  box.className = "notice";

  const p = document.createElement("div");
  p.className = "notice__text";
  p.textContent = text;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "notice__btn";
  btn.textContent = "Окей 👌";

  btn.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });

  box.append(p, btn);
  overlay.append(box);
  document.body.append(overlay);
}
