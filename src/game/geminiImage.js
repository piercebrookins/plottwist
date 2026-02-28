const API_PATH = "/api/generate-image";

/**
 * Calls the Gemini Nano Banana image generation endpoint and returns
 * a data-URL that can be used directly as an <img> src.
 *
 * @param {string}  prompt       – text description of the image to generate
 * @param {object}  [options]
 * @param {string}  [options.aspectRatio] – e.g. "16:9", "1:1", "4:3" (default "16:9")
 * @param {string}  [options.model]       – Gemini model ID (default: server-configured)
 * @returns {Promise<string>}      data-URL of the generated image
 */
export async function generateImage(prompt, { aspectRatio = "16:9", model } = {}) {
  const res = await fetch(API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Image generation failed (${res.status})`);
  }

  const { image, mimeType } = await res.json();
  return `data:${mimeType};base64,${image}`;
}
