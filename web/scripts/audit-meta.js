// Dev-only: P2-9/P2-10 audit of meta description lengths in data files.
const fs = require("fs");
for (const f of ["src/lib/cities.ts", "src/lib/services.ts", "src/lib/posts.ts"]) {
  const t = fs.readFileSync(f, "utf8");
  const re = /(metaDescription|answerBlock):\s*\r?\n?\s*"((?:[^"\\]|\\.)*)"/g;
  let m, i = 0;
  console.log("== " + f);
  while ((m = re.exec(t))) {
    i++;
    const flag = m[2].length < 120 ? "  <-- SHORT" : m[2].length > 160 ? "  <-- LONG" : "";
    console.log(`${i} [${m[1]}]: ${m[2].length}${flag}  ${m[2].slice(0, 60)}`);
  }
}
