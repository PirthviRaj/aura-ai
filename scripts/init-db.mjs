/**
 * Initialize SQLite database from sql/schema.sql
 * Run: node scripts/init-db.mjs
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "aura.sqlite");
const schemaPath = path.join(root, "sql", "schema.sql");

fs.mkdirSync(dataDir, { recursive: true });
const schema = fs.readFileSync(schemaPath, "utf8");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(schema);
db.close();

console.log("Database ready →", dbPath);
