import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "aura.sqlite");
const SCHEMA_PATH = path.join(process.cwd(), "sql", "schema.sql");

declare global {
  // eslint-disable-next-line no-var
  var __auraSqlite: Database.Database | undefined;
}

function ensureDb(): Database.Database {
  if (global.__auraSqlite) return global.__auraSqlite;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);

  global.__auraSqlite = db;
  return db;
}

export function getDb() {
  return ensureDb();
}

export function dbPath() {
  return DB_PATH;
}
