const base = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const ensure = () => {
  if (!base || !token) throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
};

const cmd = async (...args) => {
  ensure();
  const res = await fetch(`${base}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["COMMAND", ...args]]),
  });

  if (!res.ok) throw new Error(`Redis REST error: ${res.status}`);
  const json = await res.json();
  return json?.[0]?.result;
};

export const redis = {
  sadd: (key, value) => cmd("SADD", key, value),
  smembers: (key) => cmd("SMEMBERS", key),
  setex: (key, ttl, value) => cmd("SETEX", key, String(ttl), value),
  get: (key) => cmd("GET", key),
  incr: (key) => cmd("INCR", key),
  expire: (key, ttl) => cmd("EXPIRE", key, String(ttl)),
};
