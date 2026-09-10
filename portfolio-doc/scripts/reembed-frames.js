const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "Aura-AI-Product-Case-Study.html");
const mockDir = path.join(root, "mockups");

function dataUrl(file) {
  const buf = fs.readFileSync(path.join(mockDir, file));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const mac = dataUrl("macbook-frame.png");
const phone = dataUrl("iphone-frame.png");

let html = fs.readFileSync(htmlPath, "utf8");

// Replace first laptop frame + first phone frame inside #device-kit (base64 or relative)
function replaceNthSrc(html, startMarker, data) {
  const idx = html.indexOf(startMarker);
  if (idx < 0) throw new Error("marker not found: " + startMarker);
  const srcIdx = html.indexOf('src="', idx);
  if (srcIdx < 0) throw new Error("src not found after " + startMarker);
  const valStart = srcIdx + 5;
  const valEnd = html.indexOf('"', valStart);
  return html.slice(0, valStart) + data + html.slice(valEnd);
}

html = replaceNthSrc(html, 'class="laptop"', mac);
html = replaceNthSrc(html, 'class="phone"', phone);

fs.writeFileSync(htmlPath, html);

const outMac = path.join(root, "..", "mockups", "macbook.png");
const outPhone = path.join(root, "..", "mockups", "iphone-16-pro-max.png");
fs.copyFileSync(path.join(mockDir, "macbook-frame.png"), outMac);
fs.copyFileSync(path.join(mockDir, "iphone-frame.png"), outPhone);

console.log("re-embedded frames", {
  macKB: Math.round(fs.statSync(path.join(mockDir, "macbook-frame.png")).size / 1024),
  phoneKB: Math.round(fs.statSync(path.join(mockDir, "iphone-frame.png")).size / 1024),
});
