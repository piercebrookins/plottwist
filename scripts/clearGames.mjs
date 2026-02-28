const base = process.env.CLEAR_GAMES_BASE_URL || "https://plottwist-nine.vercel.app";
const url = `${base.replace(/\/$/, "")}/api/lobbies/clear-all`;

try {
  const res = await fetch(url, {
    method: "POST",
  });

  const payload = await res.json();
  if (!res.ok) {
    console.error("Failed to clear games:", payload);
    process.exit(1);
  }

  console.log("Cleared games successfully:", payload);
} catch (error) {
  console.error("Request failed:", error.message);
  process.exit(1);
}
