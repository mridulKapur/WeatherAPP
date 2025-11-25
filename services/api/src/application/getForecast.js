import { HttpError } from "../lib/httpError.js";
import { mapToDailyForecast } from "../domain/forecast/forecastMapper.js";

export class GetForecast {
  constructor({ providerClient, cache, fallbackRepository, rulesEngine, cacheTtlMs }) {
    this.providerClient = providerClient;
    this.cache = cache;
    this.fallbackRepository = fallbackRepository;
    this.rulesEngine = rulesEngine;
    this.cacheTtlMs = cacheTtlMs;
  }

  async execute({ city, days, offline }) {
    const normCity = String(city || "").trim();
    if (!normCity) throw new HttpError(400, "BadRequest", "city is required");
    const nDays = Number(days ?? 3);
    if (!Number.isInteger(nDays) || nDays < 1 || nDays > 3) {
      throw new HttpError(400, "BadRequest", "days must be an integer 1..3");
    }

    const cacheKey = `forecast:raw:${normCity.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);

    let raw = null;
    let provider = null;

    if (offline) {
      if (cached) {
        raw = cached;
        provider = "cache";
      } else {
        raw = this.fallbackRepository.getCityForecast(normCity);
        provider = raw ? "fallback" : null;
      }
    } else {
      try {
        raw = await this.providerClient.forecast({ city: normCity, cnt: 10 });
        provider = "openweather";
        this.cache.set(cacheKey, raw, { ttlMs: this.cacheTtlMs });
      } catch (e) {
        if (cached) {
          raw = cached;
          provider = "cache";
        } else {
          raw = this.fallbackRepository.getCityForecast(normCity);
          provider = raw ? "fallback" : null;
        }
      }
    }

    if (!raw) {
      throw new HttpError(
        502,
        "BadGateway",
        "Forecast provider unavailable and no fallback data is available for this city.",
        { city: normCity }
      );
    }

    const daily = mapToDailyForecast({ raw, days: nDays });
    const daysOut = daily.map((d) => ({
      date: d.date,
      highC: d.highC,
      lowC: d.lowC,
      window: d.window,
      signals: {
        hasRain: d.facts.hasRain,
        hasThunderstorm: d.facts.hasThunderstorm,
        maxWindMph: d.facts.maxWindMph
      },
      advice: this.rulesEngine.evaluate(d.facts)
    }));

    return {
      city: raw?.city?.name ?? normCity,
      days: daysOut,
      source: {
        mode: offline ? "offline" : "online",
        provider: provider ?? "fallback"
      }
    };
  }
}

