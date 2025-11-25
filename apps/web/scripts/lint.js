import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && (p.endsWith(".js") || p.endsWith(".jsx"))) out.push(p);
  }
  return out;
}

const banned = [{ re: /\bTODO\b/i, msg: "TODO found (use issues/trackers instead)." }];

let ok = true;
for (const f of walk(srcDir)) {
  const content = fs.readFileSync(f, "utf8");
  for (const b of banned) {
    if (b.re.test(content)) {
      ok = false;
      console.error(`[lint] ${b.msg} in ${f}`);
    }
  }
}

if (!ok) process.exit(1);
console.log("lint: ok");

