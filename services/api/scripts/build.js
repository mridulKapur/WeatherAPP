import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const srcDir = path.join(pkgRoot, "src");
const distDir = path.join(pkgRoot, "dist");

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else if (entry.isFile()) fs.copyFileSync(src, dst);
  }
}

rmrf(distDir);
copyDir(srcDir, distDir);

const dataSrc = path.join(pkgRoot, "data");
const dataDst = path.join(pkgRoot, "dist", "data");
if (fs.existsSync(dataSrc)) copyDir(dataSrc, dataDst);

console.log("Built to dist/ (copy-based build).");
