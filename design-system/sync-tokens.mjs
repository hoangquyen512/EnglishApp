import { copyFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "design-system", "tokens.css");
const dest = join(root, "docs", "uiux-demo", "tokens.css");
const check = process.argv.includes("--check");

if (check) {
  const a = readFileSync(src, "utf8");
  const b = readFileSync(dest, "utf8");
  if (a !== b) {
    console.error("docs/uiux-demo/tokens.css is out of date. Run: pnpm design:sync");
    process.exit(1);
  }
  const tokens = JSON.parse(readFileSync(join(root, "design-system", "tokens.json"), "utf8"));
  if (tokens.locks.primaryFill !== "#c2410c") {
    console.error("locks.primaryFill must stay #c2410c");
    process.exit(1);
  }
  if (tokens.locks.petHasBackgroundPlate !== false) {
    console.error("locks.petHasBackgroundPlate must stay false");
    process.exit(1);
  }
  if (!a.includes(tokens.locks.primaryFill)) {
    console.error("tokens.css must define primary fill", tokens.locks.primaryFill);
    process.exit(1);
  }
  console.log("design-system tokens OK");
  process.exit(0);
}

copyFileSync(src, dest);
console.log("synced design-system/tokens.css → docs/uiux-demo/tokens.css");
