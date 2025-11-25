import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { env, envBool } from "./config/env.js";
import { openapi } from "./openapi.js";
import { HttpError } from "./lib/httpError.js";
import { MemoryCache } from "./infra/cache/memoryCache.js";
import { OpenWeatherClient } from "./infra/providers/openWeatherClient.js";
import { FallbackRepository } from "./infra/repositories/fallbackRepository.js";
import { RulesEngine } from "./domain/rules/rulesEngine.js";
import { defaultAdvisoryRules } from "./domain/rules/advisoryRules.js";
import { GetForecast } from "./application/getForecast.js";
import path from "node:path";
import fs from "node:fs";

function parseBool(v) {
  if (v === undefined) return false;
  if (typeof v === "boolean") return v;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
}

export function createApp({ fetchImpl } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "64kb" }));
  app.use(morgan("tiny"));

  const baseUrl = env("PUBLIC_BASE_URL", { defaultValue: "http://localhost:3000" });
  const offlineByEnv = envBool("OFFLINE_MODE", { defaultValue: false });
  const cacheTtlMs = Number(env("CACHE_TTL_MS", { defaultValue: String(10 * 60 * 1000) }));

  const cache = new MemoryCache();
  const providerClient = new OpenWeatherClient({ fetchImpl });
  const fallbackRepository = new FallbackRepository();
  const rulesEngine = new RulesEngine(defaultAdvisoryRules());
  const getForecast = new GetForecast({
    providerClient,
    cache,
    fallbackRepository,
    rulesEngine,
    cacheTtlMs
  });

  app.get("/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  app.get("/openapi.json", (req, res) => res.json(openapi));

  const webDist = env("WEB_DIST_DIR", { defaultValue: "" });
  if (webDist && fs.existsSync(webDist)) {
    app.use(express.static(webDist, { maxAge: "1h", etag: true, index: false }));
    app.get("/", (req, res) => res.sendFile(path.join(webDist, "index.html")));
  }

  app.get("/api/forecast", async (req, res, next) => {
    try {
      const city = req.query.city;
      const days = req.query.days;
      const offline = offlineByEnv || parseBool(req.query.offline) || parseBool(req.header("x-offline-mode"));

      const result = await getForecast.execute({ city, days, offline });

      res.json({
        ...result,
        links: {
          self: `${baseUrl}/api/forecast?city=${encodeURIComponent(String(city))}&days=${encodeURIComponent(
            String(days ?? 3)
          )}&offline=${offline ? "true" : "false"}`,
          docs: `${baseUrl}/docs`,
          openapi: `${baseUrl}/openapi.json`
        }
      });
    } catch (e) {
      next(e);
    }
  });

  // Centralized error handler (production-friendly shape)
  app.use((err, req, res, next) => {
    const isHttp = err instanceof HttpError;
    const status = isHttp ? err.status : 500;
    const payload = isHttp
      ? { error: err.error, message: err.message, details: err.details }
      : { error: "InternalServerError", message: "Unexpected error" };

    if (status >= 500) {
      // avoid leaking sensitive details to clients
      // eslint-disable-next-line no-console
      console.error(err);
    }
    res.status(status).json(payload);
  });

  return app;
}

