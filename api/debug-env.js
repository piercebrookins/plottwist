import { allowOptions, cors, json } from "./_lib/http.js";

const summarize = (value) => ({
  present: Boolean(value),
  length: value ? String(value).length : 0,
});

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  return json(res, 200, {
    ok: true,
    env: {
      GEMINI_API_KEY: summarize(process.env.GEMINI_API_KEY),
      GEMINI_IMAGE_MODEL: summarize(process.env.GEMINI_IMAGE_MODEL),
      GEMINI_ENHANCE_MODEL: summarize(process.env.GEMINI_ENHANCE_MODEL),
      VEO_MODEL: summarize(process.env.VEO_MODEL),
      UPSTASH_REDIS_REST_URL: summarize(process.env.UPSTASH_REDIS_REST_URL),
      UPSTASH_REDIS_REST_TOKEN: summarize(process.env.UPSTASH_REDIS_REST_TOKEN),
    },
    runtime: {
      node: process.version,
      vercelEnv: process.env.VERCEL_ENV || null,
      regionHint: process.env.VERCEL_REGION || null,
    },
  });
}
