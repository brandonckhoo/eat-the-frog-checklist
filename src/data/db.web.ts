/**
 * Web stub for expo-sqlite.
 * Uses localStorage so data persists across page refreshes.
 */

const STORAGE_KEY = 'etf_db_v1';

type Row = Record<string, unknown>;
type Store = Record<string, Row[]>;

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function save(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

const mockDb = {
  async getAllAsync<T extends Row>(sql: string, params: unknown[] = []): Promise<T[]> {
    const store = load();
    const table = sql.match(/FROM\s+(\w+)/i)?.[1];
    if (!table) return [];

    // COUNT(*)
    if (/SELECT\s+COUNT\(\*\)/i.test(sql)) {
      let rows = store[table] ?? [];
      if (/completed_at\s+IS\s+NOT\s+NULL/i.test(sql)) rows = rows.filter(r => r.completed_at != null);
      if (/completed_at\s+IS\s+NULL/i.test(sql)) rows = rows.filter(r => r.completed_at == null);
      return [{ count: rows.length }] as unknown as T[];
    }

    let rows = [...(store[table] ?? [])] as T[];

    // WHERE filters
    if (/completed_at\s+IS\s+NULL/i.test(sql)) rows = rows.filter(r => r.completed_at == null);
    if (/completed_at\s+IS\s+NOT\s+NULL/i.test(sql)) rows = rows.filter(r => r.completed_at != null);
    if (/WHERE\s+id\s*=\s*1/i.test(sql)) rows = rows.filter(r => r.id === 1);
    if (/WHERE\s+id\s*=\s*\?/i.test(sql)) rows = rows.filter(r => r.id === params[0]);
    if (/WHERE\s+type\s*=\s*\?/i.test(sql)) rows = rows.filter(r => r.type === params[0]);
    if (/end_date\s*>=\s*\?/i.test(sql)) rows = rows.filter(r => (r.end_date as string) >= (params[0] as string));

    // ORDER BY
    const order = sql.match(/ORDER\s+BY\s+(\w+)\s*(DESC|ASC)?/i);
    if (order) {
      const col = order[1];
      const desc = (order[2] ?? 'ASC').toUpperCase() === 'DESC';
      rows = rows.sort((a, b) => {
        const av = (a[col] as number) ?? 0;
        const bv = (b[col] as number) ?? 0;
        return desc ? bv - av : av - bv;
      });
    }

    // LIMIT ?
    if (/LIMIT\s+\?/i.test(sql)) {
      const limit = params[params.length - 1] as number;
      rows = rows.slice(0, limit);
    }

    return rows;
  },

  async getFirstAsync<T extends Row>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = await mockDb.getAllAsync<T>(sql, params);
    return rows[0] ?? null;
  },

  async runAsync(sql: string, params: unknown[] = []): Promise<void> {
    const store = load();
    const upper = sql.trim().toUpperCase();

    if (upper.startsWith('INSERT')) {
      const m = sql.match(/INTO\s+(\w+)\s*\(([^)]+)\)/i);
      if (!m) return;
      const [, table, colStr] = m;
      const cols = colStr.split(',').map(c => c.trim());
      const row: Row = {};
      cols.forEach((col, i) => { row[col] = params[i] ?? null; });
      if (!store[table]) store[table] = [];

      if (upper.includes('OR REPLACE')) {
        const idx = store[table].findIndex(r => r.id === row.id);
        if (idx >= 0) store[table][idx] = row; else store[table].push(row);
      } else if (upper.includes('OR IGNORE')) {
        const exists = store[table].some(r => r.id === row.id || (row.type && r.type === row.type));
        if (!exists) store[table].push(row);
      } else {
        store[table].push(row);
      }

    } else if (upper.startsWith('UPDATE')) {
      // UPDATE table SET col1=?, col2=? WHERE whereCol=?
      const m = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(\w+)\s*=\s*\?/i);
      if (!m) return;
      const [, table, setStr, whereCol] = m;
      const setCols = setStr.split(',').map(s => s.split('=')[0].trim());
      const whereVal = params[params.length - 1];
      if (!store[table]) return;
      store[table] = store[table].map(row => {
        if (row[whereCol] !== whereVal) return row;
        const updated = { ...row };
        setCols.forEach((col, i) => { updated[col] = params[i] ?? null; });
        return updated;
      });

    } else if (upper.startsWith('DELETE')) {
      const m = sql.match(/FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*\?/i);
      if (!m) return;
      const [, table, whereCol] = m;
      if (store[table]) store[table] = store[table].filter(r => r[whereCol] !== params[0]);
    }
    // DDL (CREATE TABLE, etc.) — ignore on web

    save(store);
  },
};

let resolved = false;

export async function getDb() {
  if (!resolved) resolved = true;
  return mockDb;
}
