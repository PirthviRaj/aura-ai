/**
 * Export Aura AI portfolio thumbnail → PNG (1920×1080)
 * Run: node portfolio-doc/scripts/export-thumbnail.mjs
 */
import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const htmlPath = path.join(root, "portfolio-doc", "Aura-AI-Portfolio-Thumbnail.html");
const outDir = path.join(root, "portfolio-doc");
const pngPath = path.join(outDir, "Aura-AI-Portfolio-Thumbnail.png");

const require = createRequire(import.meta.url);

async function loadPuppeteer() {
  try {
    return require("puppeteer");
  } catch {
    const { execSync } = require("child_process");
    execSync("npm install --no-save puppeteer", { cwd: root, stdio: "inherit" });
    return require("puppeteer");
  }
}

async function main() {
  if (!fs.existsSync(htmlPath)) throw new Error(`Missing ${htmlPath}`);

  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await page.screenshot({
      path: pngPath,
      type: "png",
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
    console.log("Thumbnail saved →", pngPath);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
