const PLACEHOLDER_IMAGES = [
  "https://via.placeholder.com/1280x720/1a1a2e/ffffff?text=PlotTwist+Placeholder+Scene+1",
  "https://via.placeholder.com/1280x720/16213e/ffffff?text=PlotTwist+Placeholder+Scene+2",
  "https://via.placeholder.com/1280x720/0f3460/ffffff?text=PlotTwist+Placeholder+Scene+3",
];

export const pickPlaceholderMedia = (seedText = "") => {
  const seed = Array.from(seedText).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const imageUrl = PLACEHOLDER_IMAGES[seed % PLACEHOLDER_IMAGES.length];

  return {
    mediaType: "image",
    mediaUrl: imageUrl,
    mediaProvider: "placeholder-mock",
    generatedScene:
      "[PLACEHOLDER MODE] A dramatic still frame appears while production bots pretend this is a finished render.",
  };
};
