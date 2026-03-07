import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { appSettings, supportSettings } from "../../../drizzle/schema";

// ─── App Settings (compatibilidade legada) ────

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appSettings).where(eq(appSettings.settingKey, key)).limit(1);
  return result.length > 0 ? (result[0].settingValue ?? null) : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(appSettings)
    .values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(appSettings);
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (row.settingValue) result[row.settingKey] = row.settingValue;
  }
  return result;
}

// ─── Support Settings (novo) ──────────────────

export async function getSupportSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(supportSettings).where(eq(supportSettings.settingKey, key)).limit(1);
  return result.length > 0 ? (result[0].settingValue ?? null) : null;
}

export async function setSupportSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(supportSettings)
    .values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export async function getAllSupportSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(supportSettings);
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (row.settingValue) result[row.settingKey] = row.settingValue;
  }
  return result;
}
