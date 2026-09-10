/**
 * Export Aura AI product case study → landscape A4 PDF
 * Run: node portfolio-doc/scripts/export-portfolio.mjs
 */
import { createRequire } from "module";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const htmlPath = path.join(root, "portfolio-doc", "Aura-AI-Product-Case-Study.html");
const pdfPath = path.join(root, "portfolio-doc", "Aura-AI-Product-Case-Study.pdf");
const mockupsDir = path.join(root, "mockups");

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
  fs.mkdirSync(mockupsDir, { recursive: true });

  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: "networkidle0",
      timeout: 120000,
    });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 1000));

    await page.pdf({
      path: pdfPath,
      printBackground: true,
      preferCSSPageSize: true,
      width: "297mm",
      height: "210mm",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    console.log("PDF →", pdfPath);

    // Prefer transparent punched frames for light-theme slides
    const srcMac =
      [
        path.join(root, "portfolio-doc", "mockups", "macbook-frame.png"),
        path.join(root, "portfolio-doc", "mockups", "macbook.png"),
      ].find((p) => fs.existsSync(p));
    const srcPhone =
      [
        path.join(root, "portfolio-doc", "mockups", "iphone-frame.png"),
        path.join(root, "portfolio-doc", "mockups", "iphone-16-pro-max.png"),
      ].find((p) => fs.existsSync(p));
    if (srcMac) fs.copyFileSync(srcMac, path.join(mockupsDir, "macbook.png"));
    if (srcPhone) fs.copyFileSync(srcPhone, path.join(mockupsDir, "iphone-16-pro-max.png"));
    console.log("Mockups synced →", mockupsDir);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
