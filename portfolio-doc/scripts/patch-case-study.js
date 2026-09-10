const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "Aura-AI-Product-Case-Study.html");
const mockDir = path.join(root, "mockups");

let html = fs.readFileSync(htmlPath, "utf8");
const mac =
  "data:image/png;base64," +
  fs.readFileSync(path.join(mockDir, "macbook.png")).toString("base64");
const phone =
  "data:image/png;base64," +
  fs.readFileSync(path.join(mockDir, "iphone-16-pro-max.png")).toString("base64");

html = html.split('src="mockups/macbook.png"').join(`src="${mac}"`);
html = html
  .split('src="mockups/iphone-16-pro-max.png"')
  .join(`src="${phone}"`);

html = html.replace(
  "<title>Aura AI — Product Case Study</title>",
  "<title>Aura AI</title>",
);

html = html.replace(
  /\s*<div class="nav">[\s\S]*?<\/div>\s*(?=<div class="wrap hero-layout">)/,
  "\n    ",
);

html = html.replace(
  /document\.querySelectorAll\("\[data-slot\]"\)\.forEach\(\(el\) => \{[\s\S]*?\}\);/,
  `document.querySelectorAll("[data-slot]").forEach((el) => {
      const key = el.getAttribute("data-slot");
      const build = slots[key];
      if (!build) return;
      el.replaceWith(build());
    });`,
);

fs.writeFileSync(htmlPath, html);
console.log("ok", {
  hasCaseStudyLabel: html.includes("Product Case Study"),
  hasNavMeta: html.includes("nav-meta"),
  hasBase64: html.includes("data:image/png;base64,"),
  hasNavBlock: /class="nav"/.test(html),
});
