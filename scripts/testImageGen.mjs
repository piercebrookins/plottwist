import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env manually (no dotenv dependency needed)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.+)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const PROMPT =
  "A detective pigeon wearing a tiny trench coat, investigating a crime scene in a noir film style, dramatic lighting";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set. Add it to your .env file.");
    process.exit(1);
  }

  const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
  console.log(`Model : ${model}`);
  console.log(`Prompt: ${PROMPT}`);
  console.log("Generating image...\n");

  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Gemini API error (${res.status}):`, err);
    process.exit(1);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart) {
    console.error("No image returned from Gemini. Full response:");
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const ext = imagePart.inlineData.mimeType?.includes("jpeg") ? "jpg" : "png";
  const outPath = path.resolve(`generated-image.${ext}`);
  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  fs.writeFileSync(outPath, buffer);

  console.log(`Image saved to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main();
