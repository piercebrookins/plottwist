export const computeActivityScore = (record, now = Date.now()) => {
  const ageSeconds = Math.max(0, Math.floor((now - (record.updatedAt || now)) / 1000));
  const freshnessBonus = Math.max(0, 30 - ageSeconds);
  return (
    (Number(record.playerCount) || 0) * 10 +
    (record.status && record.status !== "lobby" ? 15 : 0) +
    freshnessBonus
  );
};
