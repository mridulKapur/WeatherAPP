export class MemoryCache {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.store = new Map(); // key -> { value, expiresAt }
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, { ttlMs } = {}) {
    const expiresAt = ttlMs ? this.now() + ttlMs : null;
    this.store.set(key, { value, expiresAt });
  }
}

