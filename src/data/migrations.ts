import type { SQLiteDatabase } from 'expo-sqlite';

const MIGRATIONS: { version: number; sql: string[] }[] = [
  {
    version: 1,
    sql: [
      `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)`,
      `INSERT OR IGNORE INTO schema_version VALUES (0)`,
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        notes TEXT,
        column_name TEXT NOT NULL CHECK(column_name IN ('do_first', 'do_later', 'do_free')),
        created_at INTEGER NOT NULL,
        due_at INTEGER,
        completed_at INTEGER,
        difficulty INTEGER NOT NULL DEFAULT 1 CHECK(difficulty IN (1, 2, 3)),
        tags TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS completion_events (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        xp_awarded INTEGER NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id)
      )`,
      `CREATE TABLE IF NOT EXISTS streak (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        current INTEGER NOT NULL DEFAULT 0,
        best INTEGER NOT NULL DEFAULT 0,
        last_completion_date TEXT
      )`,
      `INSERT OR IGNORE INTO streak (id, current, best) VALUES (1, 0, 0)`,
      `CREATE TABLE IF NOT EXISTS quests (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        target INTEGER NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        reward_xp INTEGER NOT NULL,
        completed_at INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL UNIQUE,
        unlocked_at INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        xp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1
      )`,
      `INSERT OR IGNORE INTO user_progress (id, xp, level) VALUES (1, 0, 1)`,
    ],
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  let currentVersion = 0;
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version LIMIT 1'
    );
    currentVersion = result?.version ?? 0;
  } catch {
    // Table does not exist yet
  }

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;
    for (const sql of migration.sql) {
      await db.execAsync(sql);
    }
    await db.runAsync('UPDATE schema_version SET version = ?', [migration.version]);
  }
}
