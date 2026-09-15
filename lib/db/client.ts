import mysql, {
  type Pool,
  type PoolConnection,
  type PoolOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __auraMysqlPool: Pool | undefined;
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing database config: set ${name} in .env.local`);
  }
  return value;
}

function poolConfig(): PoolOptions {
  return {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT || 3306),
    user: required("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: required("DB_NAME"),
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    dateStrings: true,
  };
}

export function getPool() {
  if (global.__auraMysqlPool) return global.__auraMysqlPool;
  const pool = mysql.createPool(poolConfig());
  global.__auraMysqlPool = pool;
  return pool;
}

type SqlParams = Array<string | number | boolean | Date | null | Buffer>;

export async function queryRows<T extends RowDataPacket>(sql: string, params: SqlParams = []) {
  const [rows] = await getPool().query<T[]>(sql, params);
  return rows;
}

export async function queryOne<T extends RowDataPacket>(sql: string, params: SqlParams = []) {
  const rows = await queryRows<T>(sql, params);
  return rows[0];
}

export async function execute(sql: string, params: SqlParams = []) {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const value = await fn(conn);
    await conn.commit();
    return value;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
