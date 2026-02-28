const IMAGE_LIBRARY = {
  pigeon: [
    "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=1400&q=80",
  ],
  kingdom: [
    "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?auto=format&fit=crop&w=1400&q=80",
  ],
  detective: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1400&q=80",
  ],
  dragon: [
    "https://images.unsplash.com/photo-1579547621113-e4bb2a19bdd6?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
  ],
  spaceship: [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  ],
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const pickDemoImage = (twistText = "") => {
  const text = twistText.toLowerCase();

  if (text.includes("pigeon")) return randomFrom(IMAGE_LIBRARY.pigeon);
  if (text.includes("kingdom") || text.includes("castle")) return randomFrom(IMAGE_LIBRARY.kingdom);
  if (text.includes("detective") || text.includes("killer")) return randomFrom(IMAGE_LIBRARY.detective);
  if (text.includes("dragon") || text.includes("wizard")) return randomFrom(IMAGE_LIBRARY.dragon);
  if (text.includes("spaceship") || text.includes("mars")) return randomFrom(IMAGE_LIBRARY.spaceship);

  return randomFrom(IMAGE_LIBRARY.default);
};
