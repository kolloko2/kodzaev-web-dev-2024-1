const selectedDishes = {
  soup: null,
  main: null,
  drink: null
};

document.addEventListener("DOMContentLoaded", function () {
  // куда отрисовываем карточки
  const containers = {
    soup: document.getElementById("soups-grid"),
    main: document.getElementById("mains-grid"),
    drink: document.getElementById("drinks-grid")
  };

  // группируем блюда по категориям
  const dishesByCategory = {
    soup: [],
    main: [],
    drink: []
  };

  dishes.forEach(dish => {
    dishesByCategory[dish.category].push(dish);
  });

  // сортируем внутри категории по имени и рисуем карточки
  Object.keys(dishesByCategory).forEach(category => {
    dishesByCategory[category]
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .forEach(dish => {
        const container = containers[category];
        if (!container) return;

        const html = `
          <div class="menu-item" data-dish="${dish.keyword}" data-category="${dish.category}">
            <img src="${dish.image}" alt="${dish.name}">
            <p class="price">${dish.price}₽</p>
            <p class="name">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button type="button" class="add-btn">Добавить</button>
          </div>
        `;

        container.insertAdjacentHTML("beforeend", html);
      });
  });

  // выбор блюда по клику на кнопку "Добавить"
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

    // подсветка выбранной карточки в своей категории
    document
      .querySelectorAll(`.menu-item[data-category="${category}"]`)
      .forEach(item => item.classList.remove("menu-item--selected"));

    card.classList.add("menu-item--selected");

    updateSelectedView();
  });

  // обработка сброса формы
  const form = document.querySelector(".order-form");
  form.addEventListener("reset", function () {
    selectedDishes.soup = null;
    selectedDishes.main = null;
    selectedDishes.drink = null;

    document
      .querySelectorAll(".menu-item--selected")
      .forEach(item => item.classList.remove("menu-item--selected"));

    setTimeout(updateSelectedView, 0);
  });

  // стартовое состояние
  updateSelectedView();
});

function updateSelectedView() {
  const emptyBlock = document.getElementById("selected-empty");
  const categoriesBlock = document.getElementById("selected-categories");
  const summaryBlock = document.getElementById("order-summary");
  const totalSpan = document.getElementById("order-total");

  const hasSelection =
    !!(selectedDishes.soup || selectedDishes.main || selectedDishes.drink);

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
    { category: "drink", defaultText: "Напиток не выбран" }
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

  // обновляем скрытые поля формы (keyword'ы)
  const soupInput = document.getElementById("soup-input");
  const mainInput = document.getElementById("main-input");
  const drinkInput = document.getElementById("drink-input");

  if (soupInput) soupInput.value = selectedDishes.soup ? selectedDishes.soup.keyword : "";
  if (mainInput) mainInput.value = selectedDishes.main ? selectedDishes.main.keyword : "";
  if (drinkInput) drinkInput.value = selectedDishes.drink ? selectedDishes.drink.keyword : "";
}
