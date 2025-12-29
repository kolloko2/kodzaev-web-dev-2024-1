const dishes = [
  // SOUP: fish2 meat2 veg2
  { keyword: "soup_ukha", category: "soup", kind: "fish", name: "Уха", price: 320, count: "300 мл", image: "../lab4/norwegian_soup.jpg" },
  { keyword: "soup_salmon", category: "soup", kind: "fish", name: "Суп с лососем", price: 390, count: "300 мл", image: "../lab4/norwegian_soup.jpg" },

  { keyword: "soup_borscht", category: "soup", kind: "meat", name: "Борщ", price: 310, count: "300 мл", image: "../lab4/mushroom_soup.jpg" },
  { keyword: "soup_solyanka", category: "soup", kind: "meat", name: "Солянка", price: 370, count: "300 мл", image: "../lab4/mushroom_soup.jpg" },

  { keyword: "soup_gazpacho", category: "soup", kind: "veg", name: "Гаспачо", price: 290, count: "300 мл", image: "../lab4/gazpacho.jpg" },
  { keyword: "soup_mushroom", category: "soup", kind: "veg", name: "Грибной суп", price: 330, count: "300 мл", image: "../lab4/mushroom_soup.jpg" },

  // MAIN: fish2 meat2 veg2
  { keyword: "main_fish_1", category: "main", kind: "fish", name: "Рыбное филе с гарниром", price: 650, count: "250 г", image: "../lab4/lasagna.jpg" },
  { keyword: "main_fish_2", category: "main", kind: "fish", name: "Рыба на пару", price: 610, count: "240 г", image: "../lab4/lasagna.jpg" },

  { keyword: "main_meat_1", category: "main", kind: "meat", name: "Куриная котлета с пюре", price: 540, count: "300 г", image: "../lab4/chickencutletsandmashedpotatoes.jpg" },
  { keyword: "main_meat_2", category: "main", kind: "meat", name: "Мясо с овощами", price: 720, count: "280 г", image: "../lab4/chickencutletsandmashedpotatoes.jpg" },

  { keyword: "main_veg_1", category: "main", kind: "veg", name: "Овощная лазанья", price: 520, count: "260 г", image: "../lab4/lasagna.jpg" },
  { keyword: "main_veg_2", category: "main", kind: "veg", name: "Картофель с грибами", price: 430, count: "250 г", image: "../lab4/friedpotatoeswithmushrooms1.jpg" },

  // SALAD: fish1 meat1 veg4
  { keyword: "salad_fish_1", category: "salad", kind: "fish", name: "Салат с тунцом", price: 460, count: "180 г", image: "../lab4/norwegian_soup.jpg" },
  { keyword: "salad_meat_1", category: "salad", kind: "meat", name: "Цезарь с курицей", price: 520, count: "200 г", image: "../lab4/chickencutletsandmashedpotatoes.jpg" },

  { keyword: "salad_veg_1", category: "salad", kind: "veg", name: "Греческий салат", price: 410, count: "200 г", image: "../lab4/gazpacho.jpg" },
  { keyword: "salad_veg_2", category: "salad", kind: "veg", name: "Овощной микс", price: 360, count: "200 г", image: "../lab4/gazpacho.jpg" },
  { keyword: "salad_veg_3", category: "salad", kind: "veg", name: "Стартер: хумус", price: 330, count: "150 г", image: "../lab4/friedpotatoeswithmushrooms1.jpg" },
  { keyword: "salad_veg_4", category: "salad", kind: "veg", name: "Стартер: брускетта", price: 370, count: "150 г", image: "../lab4/friedpotatoeswithmushrooms1.jpg" },

  // DRINK: cold3 hot3
  { keyword: "drink_cold_apple", category: "drink", kind: "cold", name: "Сок яблочный", price: 160, count: "300 мл", image: "../lab4/applejuice.jpg" },
  { keyword: "drink_cold_orange", category: "drink", kind: "cold", name: "Сок апельсиновый", price: 170, count: "300 мл", image: "../lab4/orangejuice.jpg" },
  { keyword: "drink_cold_carrot", category: "drink", kind: "cold", name: "Сок морковный", price: 150, count: "300 мл", image: "../lab4/carrotjuice.jpg" },

  { keyword: "drink_hot_tea", category: "drink", kind: "hot", name: "Чай", price: 120, count: "300 мл", image: "../lab4/orangejuice.jpg" },
  { keyword: "drink_hot_coffee", category: "drink", kind: "hot", name: "Кофе", price: 170, count: "300 мл", image: "../lab4/applejuice.jpg" },
  { keyword: "drink_hot_cocoa", category: "drink", kind: "hot", name: "Какао", price: 190, count: "300 мл", image: "../lab4/carrotjuice.jpg" },

  // DESSERT: small3 medium2 big1
  { keyword: "dess_small_1", category: "dessert", kind: "small", name: "Макарон (мини)", price: 180, count: "60 г", image: "../lab4/applejuice.jpg" },
  { keyword: "dess_small_2", category: "dessert", kind: "small", name: "Эклер (мини)", price: 200, count: "70 г", image: "../lab4/orangejuice.jpg" },
  { keyword: "dess_small_3", category: "dessert", kind: "small", name: "Панна-котта (мини)", price: 220, count: "80 г", image: "../lab4/carrotjuice.jpg" },

  { keyword: "dess_medium_1", category: "dessert", kind: "medium", name: "Чизкейк", price: 340, count: "140 г", image: "../lab4/applejuice.jpg" },
  { keyword: "dess_medium_2", category: "dessert", kind: "medium", name: "Тирамису", price: 360, count: "150 г", image: "../lab4/orangejuice.jpg" },

  { keyword: "dess_big_1", category: "dessert", kind: "big", name: "Наполеон (большая порция)", price: 420, count: "220 г", image: "../lab4/carrotjuice.jpg" },
];
