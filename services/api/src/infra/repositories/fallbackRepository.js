import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export class FallbackRepository {
  constructor({ filePath } = {}) {
    // default: dist/data in build, src/data in dev
    this.filePath =
      filePath ??
      path.resolve(__dirname, "..", "..", "data", "fallback-forecast.json");
    this.data = null;
  }

  load() {
    if (this.data) return;
    if (!fs.existsSync(this.filePath)) {
      this.data = { cities: {} };
      return;
    }
    this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
  }

  getCityForecast(city) {
    this.load();
    const key = String(city || "").trim().toLowerCase();
    return this.data?.cities?.[key] ?? null;
  }
}

