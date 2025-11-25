import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const srcDir = path.join(pkgRoot, "src");

const banned = [
  { re: /\bTODO\b/i, msg: "TODO found (use issues/trackers instead)." }
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && p.endsWith(".js")) out.push(p);
  }
  return out;
}

let ok = true;
for (const file of walk(srcDir)) {
  const content = fs.readFileSync(file, "utf8");
  for (const b of banned) {
    if (b.re.test(content)) {
      ok = false;
      console.error(`[lint] ${b.msg} in ${file}`);
    }
  }
}

if (!ok) process.exit(1);
console.log("lint: ok");
