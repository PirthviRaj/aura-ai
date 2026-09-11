import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");
const db = new Database("data/aura.sqlite");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log("tables:", tables.map((t) => t.name).join(", "));
db.close();
