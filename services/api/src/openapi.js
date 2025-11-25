export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Weather Prediction API",
    version: "1.0.0",
    description:
      "Microservice that returns the next 3 days high/low temperatures and advisories for a given city."
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [{ name: "Forecast" }, { name: "Health" }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      }
    },
    "/api/forecast": {
      get: {
        tags: ["Forecast"],
        summary: "3-day forecast with advisories",
        description:
          "Returns highs/lows for the next 3 days. Can be forced into offline mode with the offline flag.",
        parameters: [
          {
            name: "city",
            in: "query",
            required: true,
            schema: { type: "string", example: "London" }
          },
          {
            name: "days",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 3, default: 3 }
          },
          {
            name: "offline",
            in: "query",
            required: false,
            schema: { type: "boolean", default: false }
          }
        ],
        responses: {
          "200": {
            description: "Forecast response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ForecastResponse" }
              }
            }
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          "502": {
            description: "Upstream provider unavailable and no fallback",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        required: ["error", "message"],
        properties: {
          error: { type: "string", example: "BadRequest" },
          message: { type: "string", example: "city is required" },
          details: { type: "object", additionalProperties: true }
        }
      },
      ForecastDay: {
        type: "object",
        required: ["date", "highC", "lowC", "window", "advice"],
        properties: {
          date: { type: "string", example: "2026-02-20" },
          highC: { type: "number", example: 12.3 },
          lowC: { type: "number", example: 4.8 },
          window: {
            type: "object",
            required: ["from", "to"],
            properties: {
              from: { type: "string", example: "2026-02-20 00:00:00" },
              to: { type: "string", example: "2026-02-20 21:00:00" }
            }
          },
          signals: {
            type: "object",
            description:
              "Facts derived from forecast entries, used by advisory rules.",
            additionalProperties: true
          },
          advice: {
            type: "array",
            items: { type: "string" },
            example: ["Carry umbrella"]
          }
        }
      },
      ForecastResponse: {
        type: "object",
        required: ["city", "days", "source", "links"],
        properties: {
          city: { type: "string", example: "London" },
          days: { type: "array", items: { $ref: "#/components/schemas/ForecastDay" } },
          source: {
            type: "object",
            required: ["mode", "provider"],
            properties: {
              mode: { type: "string", enum: ["online", "offline"] },
              provider: { type: "string", enum: ["openweather", "cache", "fallback"] }
            }
          },
          links: {
            type: "object",
            description: "HATEOAS links",
            additionalProperties: { type: "string" }
          }
        }
      }
    }
  }
};

