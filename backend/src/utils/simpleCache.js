const store = new Map();

const now = () => Date.now();

const getCache = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt < now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

const setCache = (key, value, ttlMs) => {
  store.set(key, {
    value,
    expiresAt: now() + ttlMs,
  });
};

module.exports = { getCache, setCache };
