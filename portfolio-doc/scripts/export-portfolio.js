/**
 * Generates:
 *  - portfolio-doc/Aura-AI-Portfolio-Presentation.pdf (A4 landscape)
 *  - mockups/macbook.png
 *  - mockups/iphone-16-pro-max.png
 *
 * Run: node portfolio-doc/scripts/export-portfolio.js
 */
const path = require("path");
const fs = require("fs");

async function main() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.error("Installing puppeteer…");
    const { execSync } = require("child_process");
    execSync("npm install puppeteer --no-save", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, "../.."),
    });
    puppeteer = require("puppeteer");
  }

  const root = path.resolve(__dirname, "../..");
  const htmlPath = path.join(root, "portfolio-doc", "Aura-AI-Portfolio-Presentation.html");
  const pdfPath = path.join(root, "portfolio-doc", "Aura-AI-Portfolio-Presentation.pdf");
  const mockupsDir = path.join(root, "mockups");
  fs.mkdirSync(mockupsDir, { recursive: true });

  const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 120000 });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 800));

  // PDF — landscape A4
  await page.pdf({
    path: pdfPath,
    printBackground: true,
    preferCSSPageSize: true,
    landscape: true,
    format: "A4",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  console.log("PDF →", pdfPath);

  // Device mockup screenshots from the kit (populated clones on slide 1)
  const heroStage = await page.$("#s1 .device-stage, #s1 [data-mount='hero'] > div");
  if (heroStage) {
    const mac = await page.$("#s1 .macbook");
    const phone = await page.$("#s1 .iphone");
    if (mac) {
      const macOut = path.join(mockupsDir, "macbook.png");
      await mac.screenshot({ path: macOut, omitBackground: true });
      console.log("Mockup →", macOut);
    }
    if (phone) {
      const phoneOut = path.join(mockupsDir, "iphone-16-pro-max.png");
      await phone.screenshot({ path: phoneOut, omitBackground: true });
      console.log("Mockup →", phoneOut);
    }
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
