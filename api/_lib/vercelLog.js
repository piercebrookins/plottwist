const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ note: "unserializable payload" });
  }
};

const emit = (level, scope, event, data = {}) => {
  const line = safeStringify({
    ts: new Date().toISOString(),
    level,
    scope,
    event,
    ...data,
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const createLogger = (scope) => ({
  info: (event, data) => emit("info", scope, event, data),
  warn: (event, data) => emit("warn", scope, event, data),
  error: (event, data) => emit("error", scope, event, data),
});
