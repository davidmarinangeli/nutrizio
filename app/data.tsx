export const mockMeals = [
  {
    id: "colazione",
    name: "Colazione",
    time: "08:00",
    totalCalories: 420,
    completed: false,
    items: [
      {
        id: "uova",
        name: "Uova strapazzate",
        quantity: "3 uova",
        calories: 210,
        alternatives: [
          { name: "Yogurt greco", quantity: "200g", calories: 200 },
          { name: "Ricotta fresca", quantity: "150g", calories: 195 },
          { name: "Albumi", quantity: "6 albumi", calories: 180 },
        ],
      },
      {
        id: "avocado",
        name: "Avocado",
        quantity: "1/2 avocado medio",
        calories: 160,
        alternatives: [
          { name: "Olio EVO", quantity: "1 cucchiaio", calories: 120 },
          { name: "Noci", quantity: "30g", calories: 200 },
          { name: "Mandorle", quantity: "25g", calories: 145 },
        ],
      },
      {
        id: "pane",
        name: "Pane integrale",
        quantity: "2 fette",
        calories: 140,
        alternatives: [
          { name: "Fette biscottate", quantity: "4 fette", calories: 160 },
          { name: "Avena", quantity: "40g", calories: 150 },
        ],
      },
    ],
  },
  {
    id: "spuntino1",
    name: "Spuntino Mattina",
    time: "10:30",
    totalCalories: 180,
    completed: true,
    items: [
      {
        id: "frutta1",
        name: "Mela verde",
        quantity: "1 mela media",
        calories: 80,
        completed: true,
        rating: 4,
        alternatives: [
          { name: "Pera", quantity: "1 pera", calories: 85 },
          { name: "Arancia", quantity: "1 arancia", calories: 75 },
          { name: "Kiwi", quantity: "2 kiwi", calories: 90 },
        ],
      },
      {
        id: "mandorle1",
        name: "Mandorle",
        quantity: "15g",
        calories: 100,
        completed: true,
        rating: 5,
        alternatives: [
          { name: "Noci", quantity: "12g", calories: 95 },
          { name: "Nocciole", quantity: "15g", calories: 105 },
        ],
      },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    time: "13:00",
    totalCalories: 650,
    completed: false,
    items: [
      {
        id: "pollo",
        name: "Petto di pollo",
        quantity: "150g",
        calories: 250,
        alternatives: [
          { name: "Salmone", quantity: "120g", calories: 280 },
          { name: "Tonno", quantity: "130g", calories: 200 },
          { name: "Tacchino", quantity: "150g", calories: 240 },
        ],
      },
      {
        id: "riso",
        name: "Riso basmati",
        quantity: "80g (crudo)",
        calories: 280,
        alternatives: [
          { name: "Quinoa", quantity: "70g", calories: 260 },
          { name: "Pasta integrale", quantity: "70g", calories: 250 },
        ],
      },
      {
        id: "verdure1",
        name: "Verdure miste",
        quantity: "200g",
        calories: 60,
        alternatives: [
          { name: "Insalata", quantity: "150g", calories: 30 },
          { name: "Broccoli", quantity: "200g", calories: 70 },
        ],
      },
      {
        id: "olio1",
        name: "Olio EVO",
        quantity: "1 cucchiaio",
        calories: 120,
        alternatives: [{ name: "Avocado", quantity: "1/4", calories: 80 }],
      },
    ],
  },
  {
    id: "spuntino2",
    name: "Spuntino Pomeriggio",
    time: "16:30",
    totalCalories: 200,
    completed: false,
    items: [
      {
        id: "yogurt",
        name: "Yogurt proteico",
        quantity: "150g",
        calories: 120,
        alternatives: [
          { name: "Barretta proteica", quantity: "1 barretta", calories: 180 },
          { name: "Shake proteico", quantity: "1 porzione", calories: 150 },
        ],
      },
      {
        id: "frutti",
        name: "Frutti di bosco",
        quantity: "100g",
        calories: 80,
        alternatives: [
          { name: "Banana", quantity: "1 piccola", calories: 90 },
          { name: "Fragole", quantity: "150g", calories: 50 },
        ],
      },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    time: "20:00",
    totalCalories: 550,
    completed: false,
    items: [
      {
        id: "pesce",
        name: "Salmone alla griglia",
        quantity: "120g",
        calories: 280,
        alternatives: [
          { name: "Branzino", quantity: "150g", calories: 200 },
          { name: "Orata", quantity: "140g", calories: 180 },
        ],
      },
      {
        id: "patate",
        name: "Patate dolci",
        quantity: "150g",
        calories: 180,
        alternatives: [
          { name: "Patate normali", quantity: "150g", calories: 160 },
          { name: "Zucca", quantity: "200g", calories: 120 },
        ],
      },
      {
        id: "verdure2",
        name: "Asparagi",
        quantity: "200g",
        calories: 40,
        alternatives: [
          { name: "Zucchine", quantity: "200g", calories: 35 },
          { name: "Spinaci", quantity: "150g", calories: 25 },
        ],
      },
      {
        id: "olio2",
        name: "Olio EVO",
        quantity: "1 cucchiaio",
        calories: 120,
        alternatives: [{ name: "Burro chiarificato", quantity: "1 cucchiaino", calories: 100 }],
      },
    ],
  },
]

export const mockWeeklyPlan = {
  Lunedì: [
    {
      id: "colazione",
      name: "Colazione",
      time: "08:00",
      totalCalories: 420,
      completed: false,
      items: [
        {
          id: "uova",
          name: "Uova strapazzate",
          quantity: "3 uova",
          calories: 210,
          alternatives: [
            { name: "Yogurt greco", quantity: "200g", calories: 200 },
            { name: "Ricotta fresca", quantity: "150g", calories: 195 },
            { name: "Albumi", quantity: "6 albumi", calories: 180 },
          ],
        },
        {
          id: "avocado",
          name: "Avocado",
          quantity: "1/2 avocado medio",
          calories: 160,
          alternatives: [
            { name: "Olio EVO", quantity: "1 cucchiaio", calories: 120 },
            { name: "Noci", quantity: "30g", calories: 200 },
            { name: "Mandorle", quantity: "25g", calories: 145 },
          ],
        },
      ],
    },
    {
      id: "pranzo_lun",
      name: "Pranzo",
      time: "13:00",
      totalCalories: 650,
      completed: false,
      items: [
        {
          id: "pollo_lun",
          name: "Petto di pollo alla griglia",
          quantity: "150g",
          calories: 250,
          alternatives: [
            { name: "Tacchino", quantity: "150g", calories: 240 },
            { name: "Merluzzo al vapore", quantity: "180g", calories: 220 },
          ],
        },
        {
          id: "quinoa_lun",
          name: "Quinoa",
          quantity: "80g",
          calories: 280,
          alternatives: [
            { name: "Riso integrale", quantity: "80g", calories: 280 },
            { name: "Farro", quantity: "70g", calories: 250 },
          ],
        },
      ],
    },
  ],
  Martedì: [
    {
      id: "colazione_mar",
      name: "Colazione",
      time: "08:00",
      totalCalories: 380,
      completed: false,
      items: [
        {
          id: "yogurt_mar",
          name: "Yogurt Greco 0%",
          quantity: "250g",
          calories: 150,
          alternatives: [
            { name: "Skyr", quantity: "200g", calories: 140 },
            { name: "Fiocchi di latte", quantity: "200g", calories: 180 },
          ],
        },
        {
          id: "frutta_mar",
          name: "Frutti di bosco",
          quantity: "150g",
          calories: 80,
          alternatives: [
            { name: "Fragole", quantity: "200g", calories: 70 },
            { name: "Kiwi", quantity: "2", calories: 90 },
          ],
        },
      ],
    },
    {
      id: "pranzo_mar",
      name: "Pranzo",
      time: "13:00",
      totalCalories: 550,
      completed: false,
      items: [
        {
          id: "salmone_mar",
          name: "Salmone al forno",
          quantity: "150g",
          calories: 300,
          alternatives: [
            { name: "Orata", quantity: "180g", calories: 280 },
            { name: "Sgombro", quantity: "140g", calories: 320 },
          ],
        },
      ],
    },
  ],
  Mercoledì: [
    {
      id: "colazione",
      name: "Colazione",
      time: "08:00",
      totalCalories: 420,
      completed: false,
      items: [
        {
          id: "uova",
          name: "Uova strapazzate",
          quantity: "3 uova",
          calories: 210,
          alternatives: [
            { name: "Yogurt greco", quantity: "200g", calories: 200 },
            { name: "Ricotta fresca", quantity: "150g", calories: 195 },
            { name: "Albumi", quantity: "6 albumi", calories: 180 },
          ],
        },
        {
          id: "avocado",
          name: "Avocado",
          quantity: "1/2 avocado medio",
          calories: 160,
          alternatives: [
            { name: "Olio EVO", quantity: "1 cucchiaio", calories: 120 },
            { name: "Noci", quantity: "30g", calories: 200 },
            { name: "Mandorle", quantity: "25g", calories: 145 },
          ],
        },
        {
          id: "pane",
          name: "Pane integrale",
          quantity: "2 fette",
          calories: 140,
          alternatives: [
            { name: "Fette biscottate", quantity: "4 fette", calories: 160 },
            { name: "Avena", quantity: "40g", calories: 150 },
            { name: "Gallette di riso", quantity: "5", calories: 130 },
          ],
        },
      ],
    },
    {
      id: "spuntino1",
      name: "Spuntino Mattina",
      time: "10:30",
      totalCalories: 180,
      completed: true,
      items: [
        {
          id: "frutta1",
          name: "Mela verde",
          quantity: "1 mela media",
          calories: 80,
          completed: true,
          rating: 4,
          alternatives: [
            { name: "Pera", quantity: "1 pera", calories: 85 },
            { name: "Arancia", quantity: "1 arancia", calories: 75 },
            { name: "Kiwi", quantity: "2 kiwi", calories: 90 },
          ],
        },
        {
          id: "mandorle1",
          name: "Mandorle",
          quantity: "15g",
          calories: 100,
          completed: true,
          rating: 5,
          alternatives: [
            { name: "Noci", quantity: "12g", calories: 95 },
            { name: "Nocciole", quantity: "15g", calories: 105 },
            { name: "Anacardi", quantity: "15g", calories: 100 },
          ],
        },
      ],
    },
    {
      id: "pranzo",
      name: "Pranzo",
      time: "13:00",
      totalCalories: 650,
      completed: false,
      items: [
        {
          id: "pollo",
          name: "Petto di pollo",
          quantity: "150g",
          calories: 250,
          alternatives: [
            { name: "Salmone", quantity: "120g", calories: 280 },
            { name: "Tonno al naturale", quantity: "160g", calories: 200 },
            { name: "Tacchino", quantity: "150g", calories: 240 },
          ],
        },
        {
          id: "riso",
          name: "Riso basmati",
          quantity: "80g (crudo)",
          calories: 280,
          alternatives: [
            { name: "Quinoa", quantity: "70g", calories: 260 },
            { name: "Pasta integrale", quantity: "70g", calories: 250 },
            { name: "Couscous", quantity: "75g", calories: 270 },
          ],
        },
        {
          id: "verdure1",
          name: "Verdure miste al vapore",
          quantity: "200g",
          calories: 60,
          alternatives: [
            { name: "Insalata mista", quantity: "150g", calories: 30 },
            { name: "Broccoli al forno", quantity: "200g", calories: 70 },
          ],
        },
        {
          id: "olio1",
          name: "Olio EVO",
          quantity: "1 cucchiaio",
          calories: 120,
          alternatives: [
            { name: "Avocado", quantity: "1/4", calories: 80 },
            { name: "Semi di lino", quantity: "10g", calories: 55 },
            { name: "Ghi", quantity: "10g", calories: 90 },
          ],
        },
      ],
    },
  ],
  Giovedì: [],
  Venerdì: [],
  Sabato: [],
  Domenica: [],
}

// Fill empty days with Mercoledì's plan for mock purposes
mockWeeklyPlan["Giovedì"] = JSON.parse(JSON.stringify(mockWeeklyPlan["Mercoledì"]))
mockWeeklyPlan["Venerdì"] = JSON.parse(JSON.stringify(mockWeeklyPlan["Lunedì"]))
mockWeeklyPlan["Sabato"] = JSON.parse(JSON.stringify(mockWeeklyPlan["Martedì"]))
mockWeeklyPlan["Domenica"] = JSON.parse(JSON.stringify(mockWeeklyPlan["Mercoledì"]))

export const weekDays = [
  { day: "Lun", date: "5", isToday: false, key: "Lunedì" },
  { day: "Mar", date: "6", isToday: false, key: "Martedì" },
  { day: "Mer", date: "7", isToday: true, key: "Mercoledì" },
  { day: "Gio", date: "8", isToday: false, key: "Giovedì" },
  { day: "Ven", date: "9", isToday: false, key: "Venerdì" },
  { day: "Sab", date: "10", isToday: false, key: "Sabato" },
  { day: "Dom", date: "11", isToday: false, key: "Domenica" },
]

export const ratingTags = [
  "Delizioso",
  "Troppo salato",
  "Perfetto",
  "Insipido",
  "Troppo dolce",
  "Ottima consistenza",
  "Troppo piccante",
  "Ben cotto",
  "Crudo",
  "Bruciato",
  "Fresco",
  "Secco",
  "Cremoso",
  "Croccante",
  "Morbido",
]
