import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import {
  stores,
  storeUsers,
  storeSettings,
  machineFees,
  deviceConditions,
  tradeInRules,
  storeProducts,
} from "../../../drizzle/schema";
import type {
  InsertStore,
  Store,
  InsertStoreUser,
  StoreUser,
  InsertStoreSetting,
  StoreSetting,
  InsertMachineFee,
  MachineFee,
  InsertDeviceCondition,
  DeviceCondition,
  InsertTradeInRule,
  TradeInRule,
  InsertStoreProduct,
  StoreProduct,
} from "../../../drizzle/schema";

// ─── Stores ───────────────────────────────────

export async function findAllStores(): Promise<Store[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stores);
}

export async function findStoreById(id: number): Promise<Store | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return result[0] ?? null;
}

export async function findStoreBySlug(slug: string): Promise<Store | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function createStore(data: InsertStore): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const result = await db.insert(stores).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateStore(id: number, data: Partial<InsertStore>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(stores).set(data).where(eq(stores.id, id));
}

// ─── StoreUsers ───────────────────────────────

export async function findStoreUsers(storeId: number): Promise<StoreUser[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeUsers).where(eq(storeUsers.storeId, storeId));
}

export async function addUserToStore(data: InsertStoreUser): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(storeUsers).values(data);
}

export async function removeUserFromStore(storeId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(storeUsers)
    .where(eq(storeUsers.storeId, storeId));
}

// ─── StoreSettings ────────────────────────────

export async function findStoreSettings(storeId: number): Promise<StoreSetting | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(storeSettings).where(eq(storeSettings.storeId, storeId)).limit(1);
  return result[0] ?? null;
}

export async function upsertStoreSettings(storeId: number, data: Partial<InsertStoreSetting>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await findStoreSettings(storeId);
  if (existing) {
    await db.update(storeSettings).set(data).where(eq(storeSettings.storeId, storeId));
  } else {
    await db.insert(storeSettings).values({ storeId, ...data });
  }
}

// ─── MachineFees ──────────────────────────────

export async function findMachineFees(storeId: number): Promise<MachineFee[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(machineFees).where(eq(machineFees.storeId, storeId));
}

export async function upsertMachineFee(data: InsertMachineFee): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(machineFees).values(data).onDuplicateKeyUpdate({ set: data });
}

export async function deleteMachineFee(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(machineFees).where(eq(machineFees.id, id));
}

// ─── DeviceConditions ─────────────────────────

export async function findDeviceConditions(storeId: number): Promise<DeviceCondition[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deviceConditions).where(eq(deviceConditions.storeId, storeId));
}

export async function upsertDeviceCondition(data: InsertDeviceCondition): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(deviceConditions).values(data).onDuplicateKeyUpdate({ set: data });
}

export async function deleteDeviceCondition(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(deviceConditions).where(eq(deviceConditions.id, id));
}

// ─── TradeInRules ─────────────────────────────

export async function findTradeInRules(storeId: number): Promise<TradeInRule[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tradeInRules).where(eq(tradeInRules.storeId, storeId));
}

// ─── StoreProducts ────────────────────────────

export async function findStoreProducts(storeId: number): Promise<StoreProduct[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeProducts).where(eq(storeProducts.storeId, storeId));
}

export async function upsertStoreProduct(data: InsertStoreProduct): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(storeProducts).values(data).onDuplicateKeyUpdate({ set: data });
}
