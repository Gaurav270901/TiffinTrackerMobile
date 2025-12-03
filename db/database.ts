import { Platform } from "react-native";
import { DayEntry, Settings, MealType } from "@/types";

const DB_NAME = "tiffintracker.db";

let db: any = null;
let isWebPlatform = Platform.OS === "web";
let webStorage: {
  entries: Map<string, DayEntry>;
  settings: Settings;
} = {
  entries: new Map(),
  settings: {
    halfPrice: 50,
    fullPrice: 60,
    currency: "INR",
    displayName: "User",
    hasDemoData: false,
  },
};

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDatabase(): Promise<any> {
  if (isWebPlatform) {
    return null;
  }

  if (!db) {
    const SQLite = await import("expo-sqlite");
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: any): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS day_entries (
      id TEXT PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      lunch_type TEXT NOT NULL DEFAULT 'None',
      dinner_type TEXT NOT NULL DEFAULT 'None',
      lunch_price REAL,
      dinner_price REAL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      half_price REAL NOT NULL DEFAULT 50,
      full_price REAL NOT NULL DEFAULT 60,
      currency TEXT NOT NULL DEFAULT 'INR',
      display_name TEXT NOT NULL DEFAULT 'User',
      has_demo_data INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO settings (id, half_price, full_price, currency, display_name, has_demo_data)
    VALUES (1, 50, 60, 'INR', 'User', 0);
  `);
}

export async function getEntryByDate(date: string): Promise<DayEntry | null> {
  if (isWebPlatform) {
    return webStorage.entries.get(date) || null;
  }

  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    id: string;
    date: string;
    lunch_type: string;
    dinner_type: string;
    lunch_price: number | null;
    dinner_price: number | null;
    notes: string;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM day_entries WHERE date = ?", [date]);

  if (!result) return null;

  return {
    id: result.id,
    date: result.date,
    lunchType: result.lunch_type as MealType,
    dinnerType: result.dinner_type as MealType,
    lunchPrice: result.lunch_price,
    dinnerPrice: result.dinner_price,
    notes: result.notes || "",
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

export async function upsertEntry(
  entry: Partial<DayEntry> & { date: string }
): Promise<DayEntry> {
  const now = new Date().toISOString();

  if (isWebPlatform) {
    const existing = webStorage.entries.get(entry.date);
    const newEntry: DayEntry = {
      id: existing?.id || generateId(),
      date: entry.date,
      lunchType: entry.lunchType ?? existing?.lunchType ?? "None",
      dinnerType: entry.dinnerType ?? existing?.dinnerType ?? "None",
      lunchPrice: entry.lunchPrice ?? existing?.lunchPrice ?? null,
      dinnerPrice: entry.dinnerPrice ?? existing?.dinnerPrice ?? null,
      notes: entry.notes ?? existing?.notes ?? "",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    webStorage.entries.set(entry.date, newEntry);
    return newEntry;
  }

  const database = await getDatabase();
  const existing = await getEntryByDate(entry.date);

  if (existing) {
    await database.runAsync(
      `UPDATE day_entries SET
        lunch_type = ?,
        dinner_type = ?,
        lunch_price = ?,
        dinner_price = ?,
        notes = ?,
        updated_at = ?
      WHERE date = ?`,
      [
        entry.lunchType ?? existing.lunchType,
        entry.dinnerType ?? existing.dinnerType,
        entry.lunchPrice ?? existing.lunchPrice,
        entry.dinnerPrice ?? existing.dinnerPrice,
        entry.notes ?? existing.notes,
        now,
        entry.date,
      ]
    );
    return (await getEntryByDate(entry.date))!;
  } else {
    const id = generateId();
    await database.runAsync(
      `INSERT INTO day_entries (id, date, lunch_type, dinner_type, lunch_price, dinner_price, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        entry.date,
        entry.lunchType ?? "None",
        entry.dinnerType ?? "None",
        entry.lunchPrice ?? null,
        entry.dinnerPrice ?? null,
        entry.notes ?? "",
        now,
        now,
      ]
    );
    return (await getEntryByDate(entry.date))!;
  }
}

export async function deleteEntry(date: string): Promise<void> {
  if (isWebPlatform) {
    webStorage.entries.delete(date);
    return;
  }

  const database = await getDatabase();
  await database.runAsync("DELETE FROM day_entries WHERE date = ?", [date]);
}

export async function getEntriesInRange(
  startDate: string,
  endDate: string
): Promise<DayEntry[]> {
  if (isWebPlatform) {
    return Array.from(webStorage.entries.values()).filter(
      (e) => e.date >= startDate && e.date <= endDate
    ).sort((a, b) => a.date.localeCompare(b.date));
  }

  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    date: string;
    lunch_type: string;
    dinner_type: string;
    lunch_price: number | null;
    dinner_price: number | null;
    notes: string;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM day_entries WHERE date >= ? AND date <= ? ORDER BY date", [
    startDate,
    endDate,
  ]);

  return results.map((r) => ({
    id: r.id,
    date: r.date,
    lunchType: r.lunch_type as MealType,
    dinnerType: r.dinner_type as MealType,
    lunchPrice: r.lunch_price,
    dinnerPrice: r.dinner_price,
    notes: r.notes || "",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getAllEntries(): Promise<DayEntry[]> {
  if (isWebPlatform) {
    return Array.from(webStorage.entries.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }

  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    date: string;
    lunch_type: string;
    dinner_type: string;
    lunch_price: number | null;
    dinner_price: number | null;
    notes: string;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM day_entries ORDER BY date DESC");

  return results.map((r) => ({
    id: r.id,
    date: r.date,
    lunchType: r.lunch_type as MealType,
    dinnerType: r.dinner_type as MealType,
    lunchPrice: r.lunch_price,
    dinnerPrice: r.dinner_price,
    notes: r.notes || "",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getSettings(): Promise<Settings> {
  if (isWebPlatform) {
    return webStorage.settings;
  }

  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    half_price: number;
    full_price: number;
    currency: string;
    display_name: string;
    has_demo_data: number;
  }>("SELECT * FROM settings WHERE id = 1");

  if (!result) {
    return {
      halfPrice: 50,
      fullPrice: 60,
      currency: "INR",
      displayName: "User",
      hasDemoData: false,
    };
  }

  return {
    halfPrice: result.half_price,
    fullPrice: result.full_price,
    currency: result.currency,
    displayName: result.display_name,
    hasDemoData: result.has_demo_data === 1,
  };
}

export async function updateSettings(
  settings: Partial<Settings>
): Promise<Settings> {
  if (isWebPlatform) {
    webStorage.settings = {
      ...webStorage.settings,
      ...settings,
    };
    return webStorage.settings;
  }

  const database = await getDatabase();
  const current = await getSettings();

  await database.runAsync(
    `UPDATE settings SET
      half_price = ?,
      full_price = ?,
      currency = ?,
      display_name = ?,
      has_demo_data = ?
    WHERE id = 1`,
    [
      settings.halfPrice ?? current.halfPrice,
      settings.fullPrice ?? current.fullPrice,
      settings.currency ?? current.currency,
      settings.displayName ?? current.displayName,
      (settings.hasDemoData ?? current.hasDemoData) ? 1 : 0,
    ]
  );

  return getSettings();
}

export async function clearAllData(): Promise<void> {
  if (isWebPlatform) {
    webStorage.entries.clear();
    webStorage.settings.hasDemoData = false;
    return;
  }

  const database = await getDatabase();
  await database.execAsync("DELETE FROM day_entries");
  await database.runAsync(
    "UPDATE settings SET has_demo_data = 0 WHERE id = 1"
  );
}

export async function seedDemoData(): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const mealTypes: MealType[] = ["None", "Half", "Full"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (isWebPlatform) {
    for (let day = 1; day <= Math.min(daysInMonth, now.getDate()); day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const lunchType = mealTypes[Math.floor(Math.random() * 3)];
      const dinnerType = mealTypes[Math.floor(Math.random() * 3)];
      const timestamp = new Date().toISOString();

      webStorage.entries.set(date, {
        id: generateId(),
        date,
        lunchType,
        dinnerType,
        lunchPrice: null,
        dinnerPrice: null,
        notes: "",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    webStorage.settings.hasDemoData = true;
    return;
  }

  const database = await getDatabase();

  for (let day = 1; day <= Math.min(daysInMonth, now.getDate()); day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const lunchType = mealTypes[Math.floor(Math.random() * 3)];
    const dinnerType = mealTypes[Math.floor(Math.random() * 3)];
    const timestamp = new Date().toISOString();

    await database.runAsync(
      `INSERT OR REPLACE INTO day_entries (id, date, lunch_type, dinner_type, lunch_price, dinner_price, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        date,
        lunchType,
        dinnerType,
        null,
        null,
        "",
        timestamp,
        timestamp,
      ]
    );
  }

  await database.runAsync(
    "UPDATE settings SET has_demo_data = 1 WHERE id = 1"
  );
}
