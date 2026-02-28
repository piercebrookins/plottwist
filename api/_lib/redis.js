const base = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const ensure = () => {
  if (!base || !token) {
    throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
  }
};

const pipeline = async (commands) => {
  ensure();

  const res = await fetch(`${base}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Redis REST error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const first = data?.[0];
  if (first?.error) throw new Error(`Redis command error: ${first.error}`);
  return first?.result;
};

const cmd = async (...args) => pipeline([args.map((v) => String(v))]);

export const redis = {
  sadd: (key, value) => cmd("SADD", key, value),
  smembers: (key) => cmd("SMEMBERS", key),
  setex: (key, ttl, value) => cmd("SETEX", key, ttl, value),
  get: (key) => cmd("GET", key),
  incr: (key) => cmd("INCR", key),
  expire: (key, ttl) => cmd("EXPIRE", key, ttl),
  del: (...keys) => (keys.length ? cmd("DEL", ...keys) : 0),
};
