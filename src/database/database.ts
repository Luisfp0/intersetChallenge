import { SQLiteDatabase } from "expo-sqlite";

export const migrateDbIfNeeded = async (db: SQLiteDatabase) => {
  const DATABASE_VERSION = 1;

  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );

  const currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';

      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY NOT NULL,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT
      );

      CREATE TABLE IF NOT EXISTS vistorias (
        id INTEGER PRIMARY KEY NOT NULL,
        dataHora TEXT NOT NULL,
        contemAnomalia INTEGER,
        anomalia_id INTEGER,
        tipo TEXT,
        categoria TEXT,
        observacao TEXT,
        fotos TEXT
      );
    `);

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }
};
