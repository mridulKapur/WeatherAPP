import { env } from "../../config/env.js";

function toUrl({ city, cnt, apiKey }) {
  const u = new URL("https://api.openweathermap.org/data/2.5/forecast");
  u.searchParams.set("q", city);
  u.searchParams.set("appid", '05841dddde724429143b716a50123977');
  u.searchParams.set("cnt", String(cnt));
  console.log(u);
  return u.toString();
}

export class OpenWeatherClient {
  constructor({ fetchImpl = fetch } = {}) {
    this.fetch = fetchImpl;
  }

  async forecast({ city, cnt }) {
    const apiKey = env("OPENWEATHER_API_KEY", { required: true });
    const url = toUrl({ city, cnt, apiKey });

    const res = await this.fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const err = new Error(`OpenWeather error: ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return await res.json();
  }
}

