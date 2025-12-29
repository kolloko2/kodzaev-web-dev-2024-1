const selectedDishes = {
  soup: null,
  main: null,
  salad: null,
  drink: null,
  dessert: null
};

const activeFilters = {
  soup: null,
  main: null,
  salad: null,
  drink: null,
  dessert: null
};

document.addEventListener("DOMContentLoaded", function () {
  const containers = {
    soup: document.getElementById("soups-grid"),
    main: document.getElementById("mains-grid"),
    salad: document.getElementById("salads-grid"),
    drink: document.getElementById("drinks-grid"),
    dessert: document.getElementById("desserts-grid")
  };

  // сгруппируем блюда по категориям
  const dishesByCategory = {
    soup: [],
    main: [],
    salad: [],
    drink: [],
    dessert: []
  };

  dishes.forEach(dish => {
    if (dishesByCategory[dish.category]) {
      dishesByCategory[dish.category].push(dish);
    }
  });

  function renderCategory(category) {
    const container = containers[category];
    if (!container) return;

    container.innerHTML = "";

    const filterKind = activeFilters[category];
    const list = dishesByCategory[category]
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .filter(dish => !filterKind || dish.kind === filterKind);

    list.forEach(dish => {
      const isSelected = selectedDishes[category] && selectedDishes[category].keyword === dish.keyword;

      const html = `
        <div class="menu-item ${isSelected ? "menu-item--selected" : ""}"
             data-dish="${dish.keyword}"
             data-category="${dish.category}">
          <img src="${dish.image}" alt="${dish.name}">
          <p class="price">${dish.price}₽</p>
          <p class="name">${dish.name}</p>
          <p class="weight">${dish.count}</p>
          <button type="button" class="add-btn">Добавить</button>
        </div>
      `;

      container.insertAdjacentHTML("beforeend", html);
    });
  }

  function renderAll() {
    Object.keys(dishesByCategory).forEach(renderCategory);
  }

  // ====== ВЫБОР БЛЮДА ======
  const mainElement = document.querySelector("main");

  mainElement.addEventListener("click", function (event) {
    const btn = event.target.closest(".add-btn");
    if (!btn) return;

    const card = btn.closest(".menu-item");
    if (!card) return;

    const keyword = card.dataset.dish;
    const dish = dishes.find(d => d.keyword === keyword);
    if (!dish) return;

    const category = dish.category;
    selectedDishes[category] = dish;

    // подсветка выбранной карточки ТОЛЬКО среди текущих отображаемых
    document
      .querySelectorAll(`.menu-item[data-category="${category}"]`)
      .forEach(item => item.classList.remove("menu-item--selected"));

    card.classList.add("menu-item--selected");

    updateSelectedView();
  });

  // ====== ФИЛЬТРЫ ======
  document.addEventListener("click", function (event) {
    const btn = event.target.closest(".filter-btn");
    if (!btn) return;

    const filtersBlock = btn.closest(".filters");
    if (!filtersBlock) return;

    const category = filtersBlock.dataset.filtersFor;
    const kind = btn.dataset.kind;

    const same = activeFilters[category] === kind;
    activeFilters[category] = same ? null : kind;

    // обновим active-класс кнопок в этом блоке
    filtersBlock.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    if (!same) btn.classList.add("active");

    // перерисуем категорию (выбор НЕ сбрасываем)
    renderCategory(category);
  });

  // ====== СБРОС ФОРМЫ ======
  const form = document.querySelector(".order-form");
  form.addEventListener("reset", function () {
    selectedDishes.soup = null;
    selectedDishes.main = null;
    selectedDishes.salad = null;
    selectedDishes.drink = null;
    selectedDishes.dessert = null;

    // фильтры по заданию не обязаны сбрасываться, но обычно удобно сбросить и их:
    Object.keys(activeFilters).forEach(k => activeFilters[k] = null);
    document.querySelectorAll(".filter-btn.active").forEach(b => b.classList.remove("active"));

    setTimeout(() => {
      renderAll();
      updateSelectedView();
    }, 0);
  });

  // старт
  renderAll();
  updateSelectedView();
});

function updateSelectedView() {
  const emptyBlock = document.getElementById("selected-empty");
  const categoriesBlock = document.getElementById("selected-categories");
  const summaryBlock = document.getElementById("order-summary");
  const totalSpan = document.getElementById("order-total");

  const hasSelection = !!(
    selectedDishes.soup ||
    selectedDishes.main ||
    selectedDishes.salad ||
    selectedDishes.drink ||
    selectedDishes.dessert
  );

  if (!hasSelection) {
    emptyBlock.classList.remove("hidden");
    categoriesBlock.classList.add("hidden");
    summaryBlock.classList.add("hidden");
  } else {
    emptyBlock.classList.add("hidden");
    categoriesBlock.classList.remove("hidden");
  }

  const mapping = [
    { category: "soup", defaultText: "Блюдо не выбрано" },
    { category: "main", defaultText: "Блюдо не выбрано" },
    { category: "salad", defaultText: "Блюдо не выбрано" },
    { category: "drink", defaultText: "Напиток не выбран" },
    { category: "dessert", defaultText: "Блюдо не выбрано" }
  ];

  let total = 0;

  mapping.forEach(({ category, defaultText }) => {
    const textEl = document.querySelector(
      `.selected-category[data-category="${category}"] .selected-text`
    );
    if (!textEl) return;

    const dish = selectedDishes[category];
    if (dish) {
      textEl.textContent = `${dish.name} — ${dish.price} ₽`;
      total += dish.price;
    } else {
      textEl.textContent = defaultText;
    }
  });

  if (total > 0) {
    summaryBlock.classList.remove("hidden");
    totalSpan.textContent = total;
  } else {
    summaryBlock.classList.add("hidden");
  }

  // скрытые поля формы (keyword’ы)
  const soupInput = document.getElementById("soup-input");
  const mainInput = document.getElementById("main-input");
  const saladInput = document.getElementById("salad-input");
  const drinkInput = document.getElementById("drink-input");
  const dessertInput = document.getElementById("dessert-input");

  if (soupInput) soupInput.value = selectedDishes.soup ? selectedDishes.soup.keyword : "";
  if (mainInput) mainInput.value = selectedDishes.main ? selectedDishes.main.keyword : "";
  if (saladInput) saladInput.value = selectedDishes.salad ? selectedDishes.salad.keyword : "";
  if (drinkInput) drinkInput.value = selectedDishes.drink ? selectedDishes.drink.keyword : "";
  if (dessertInput) dessertInput.value = selectedDishes.dessert ? selectedDishes.dessert.keyword : "";
}
