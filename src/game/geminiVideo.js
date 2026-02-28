const START_API = "/api/generate-video";
const STATUS_API = "/api/video-status";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withApiKeyIfGoogleUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("generativelanguage.googleapis.com")) return url;
  return url;
};

export async function startVideoGeneration(
  prompt,
  { aspectRatio = "16:9", durationSeconds = 8, model, signal } = {}
) {
  const res = await fetch(START_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, durationSeconds, model }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Video start failed (${res.status})`);
  }

  const data = await res.json();
  if (!data.operationId) throw new Error("Missing operationId from video start");
  return data;
}

export async function pollVideoStatus(
  operationId,
  { pollIntervalMs = 4000, timeoutMs = 180000, signal, onProgress } = {}
) {
  const startedAt = Date.now();

  while (true) {
    if (signal?.aborted) throw new Error("aborted");

    const res = await fetch(`${STATUS_API}?op=${encodeURIComponent(operationId)}`, { signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Video status failed (${res.status})`);
    }

    const data = await res.json();
    const elapsedMs = Date.now() - startedAt;
    onProgress?.({ operationId, status: data.status || (data.done ? "done" : "running"), elapsedMs });

    if (data.status === "done" && data.videoUrl) {
      return { ...data, videoUrl: withApiKeyIfGoogleUrl(data.videoUrl) };
    }

    if (data.status === "failed") {
      throw new Error(data.error || "Video generation failed");
    }

    if (elapsedMs > timeoutMs) {
      throw new Error("timeout");
    }

    await delay(pollIntervalMs);
  }
}

export async function generateVideo(prompt, options = {}) {
  const { operationId } = await startVideoGeneration(prompt, options);
  const final = await pollVideoStatus(operationId, options);
  return final.videoUrl;
}
