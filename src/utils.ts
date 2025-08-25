export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage === "undefined") {
      return defaultValue;
    }

    const saved = localStorage.getItem(key);
    if (saved === null) {
      return defaultValue;
    }

    return saved as T;
  } catch {
    return defaultValue;
  }
}
