import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { createApp } from "../src/app.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function listen(app) {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function readFeature(relPath) {
  const p = path.join(__dirname, relPath);
  return fs.readFileSync(p, "utf8");
}

test("BDD: forecast.feature scenario passes", async () => {
  const feature = readFeature("./features/forecast.feature");
  assert.match(feature, /Scenario: Offline mode uses fallback data/i);

  const app = createApp({
    fetchImpl: async () => {
      throw new Error("offline scenario should not call upstream");
    }
  });
  const { server, baseUrl } = await listen(app);
  try {
    const res = await fetch(`${baseUrl}/api/forecast?city=London&days=3&offline=true`);
    assert.equal(res.status, 200);
    const body = await res.json();
    const anyUmbrella = body.days.some((d) => Array.isArray(d.advice) && d.advice.includes("Carry umbrella"));
    assert.equal(anyUmbrella, true);
  } finally {
    server.close();
  }
});

