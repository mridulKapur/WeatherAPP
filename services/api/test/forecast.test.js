import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import { createApp } from "../src/app.js";

function listen(app) {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`
      });
    });
  });
}

test("GET /api/forecast returns fallback data in offline mode", async () => {
  const app = createApp({
    fetchImpl: async () => {
      throw new Error("should not be called in offline mode");
    }
  });
  const { server, baseUrl } = await listen(app);
  try {
    const res = await fetch(`${baseUrl}/api/forecast?city=London&days=3&offline=true`);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.city, "London");
    assert.equal(body.source.mode, "offline");
    assert.ok(["fallback", "cache"].includes(body.source.provider));
    assert.equal(body.days.length, 3);

    const [d1, d2] = body.days;
    assert.ok(d1.advice.includes("Carry umbrella"));
    assert.ok(d2.advice.includes("Don’t step out! A Storm is brewing!"));
  } finally {
    server.close();
  }
});

test("GET /api/forecast falls back when provider is down", async () => {
  process.env.OPENWEATHER_API_KEY = "x"; // required when attempting online fetch
  const app = createApp({
    fetchImpl: async () => {
      const e = new Error("provider down");
      e.status = 503;
      throw e;
    }
  });
  const { server, baseUrl } = await listen(app);
  try {
    const res = await fetch(`${baseUrl}/api/forecast?city=London&days=3`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.city, "London");
    assert.ok(["fallback", "cache"].includes(body.source.provider));
  } finally {
    server.close();
  }
});

