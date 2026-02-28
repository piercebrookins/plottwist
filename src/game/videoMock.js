const VIDEO_LIBRARY = {
  pigeon: [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  ],
  kingdom: [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscape.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  ],
  detective: [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  ],
  dragon: [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  ],
  spaceship: [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  ],
  default: [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  ],
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const pickDemoVideo = (twistText = "") => {
  const text = twistText.toLowerCase();

  if (text.includes("pigeon")) return randomFrom(VIDEO_LIBRARY.pigeon);
  if (text.includes("kingdom") || text.includes("castle")) return randomFrom(VIDEO_LIBRARY.kingdom);
  if (text.includes("detective") || text.includes("killer")) return randomFrom(VIDEO_LIBRARY.detective);
  if (text.includes("dragon") || text.includes("wizard")) return randomFrom(VIDEO_LIBRARY.dragon);
  if (text.includes("spaceship") || text.includes("mars")) return randomFrom(VIDEO_LIBRARY.spaceship);

  return randomFrom(VIDEO_LIBRARY.default);
};
