import { createApp } from "./app.js";
import { env } from "./config/env.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const port = Number(env("PORT", { defaultValue: "3000" }));

const app = createApp();
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

