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

    updateSelected
