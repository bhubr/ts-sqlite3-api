import sqlite3 from "sqlite3";

import { dbFile } from "./settings";

// console.log(`Running server with database "${dbFile}"`);

const { Database } = sqlite3.verbose();
const db = new Database(dbFile);

export type QueryArg = number | string | boolean | null;

export async function query<T>(sql: string, ...args: QueryArg[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql);
    stmt.all(...args, (err: Error, rows: T[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
