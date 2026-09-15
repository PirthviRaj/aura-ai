/**
 * Export Aura AI thumbnail for Upwork (4:3, crisp HiDPI render)
 * Capture: 2000×1500 layout via deviceScaleFactor (no CSS zoom — sharper text)
 * Output:  4000×3000 HD, 1000×750 preview, 8000×6000 ultra
 *
 * Run: node thumbnails/export-thumbnail.mjs
 */
import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(__dirname, "Aura-AI-Thumbnail.html");
const pngPath = path.join(__dirname, "Aura-AI-Thumbnail.png");
const pngPreviewPath = path.join(__dirname, "Aura-AI-Thumbnail-1000x750.png");
const pngUltraPath = path.join(__dirname, "Aura-AI-Thumbnail-Ultra.png");

const BASE_WIDTH = 2000;
const BASE_HEIGHT = 1500;

const require = createRequire(import.meta.url);

const BROWSER_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function findBrowser() {
  return BROWSER_PATHS.find((p) => fs.existsSync(p));
}

async function loadPuppeteer() {
  try {
    return { lib: require("puppeteer"), executablePath: undefined };
  } catch {
    try {
      const executablePath = findBrowser();
      if (!executablePath) throw new Error("No Chrome/Edge browser found");
      return { lib: require("puppeteer-core"), executablePath };
    } catch {
      const { execSync } = require("child_process");
      execSync("npm install --no-save puppeteer-core", { cwd: root, stdio: "inherit" });
      const executablePath = findBrowser();
      if (!executablePath) throw new Error("Install Chrome/Edge or run: npm install puppeteer");
      return { lib: require("puppeteer-core"), executablePath };
    }
  }
}

async function capture(page, { deviceScaleFactor, outPath }) {
  await page.setViewport({
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    deviceScaleFactor,
  });
  await page.evaluate(() => {
    document.body.style.zoom = "";
  });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: outPath,
    type: "png",
    clip: { x: 0, y: 0, width: BASE_WIDTH, height: BASE_HEIGHT },
  });
}

async function main() {
  if (!fs.existsSync(htmlPath)) throw new Error(`Missing ${htmlPath}`);

  const { lib: puppeteer, executablePath } = await loadPuppeteer();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--force-color-profile=srgb",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 800));

    await capture(page, { deviceScaleFactor: 2, outPath: pngPath });
    await capture(page, { deviceScaleFactor: 4, outPath: pngUltraPath });
    await capture(page, { deviceScaleFactor: 0.5, outPath: pngPreviewPath });

    const hi = fs.statSync(pngPath);
    const lo = fs.statSync(pngPreviewPath);
    const ultra = fs.statSync(pngUltraPath);

    console.log(`Upwork HD    → ${pngPath} (${BASE_WIDTH * 2}×${BASE_HEIGHT * 2}, ${(hi.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Upwork 1k    → ${pngPreviewPath} (${BASE_WIDTH / 2}×${BASE_HEIGHT / 2}, ${(lo.size / 1024).toFixed(0)} KB)`);
    console.log(`Ultra master → ${pngUltraPath} (${BASE_WIDTH * 4}×${BASE_HEIGHT * 4}, ${(ultra.size / 1024 / 1024).toFixed(2)} MB)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
