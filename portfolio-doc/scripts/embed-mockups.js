const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "Aura-AI-Product-Case-Study.html");
const mockDir = path.join(root, "mockups");

let html = fs.readFileSync(htmlPath, "utf8");

function dataUrl(file) {
  const buf = fs.readFileSync(path.join(mockDir, file));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const mac = dataUrl("macbook-frame.png");
const phone = dataUrl("iphone-frame.png");

html = html.split('src="mockups/macbook.png"').join(`src="${mac}"`);
html = html.split('src="mockups/iphone-16-pro-max.png"').join(`src="${phone}"`);

// Also replace if already base64 from prior patch (skip)

fs.writeFileSync(htmlPath, html);

const outMac = path.join(root, "..", "mockups", "macbook.png");
const outPhone = path.join(root, "..", "mockups", "iphone-16-pro-max.png");
fs.copyFileSync(path.join(mockDir, "macbook-frame.png"), outMac);
fs.copyFileSync(path.join(mockDir, "iphone-frame.png"), outPhone);

console.log("embedded + synced mockups");
