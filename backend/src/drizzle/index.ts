import { drizzle } from 'drizzle-orm/better-sqlite3';
import { products, orders, orderItems } from './schema';
import Database from 'better-sqlite3';
import { join } from 'path';

const sqlite = new Database(join(__dirname, '../../database.db'));

sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema: { products, orders, orderItems } });

console.log('Drizzle e SQLite conectado com UUID');
export type Database = typeof db;
