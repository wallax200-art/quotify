import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { users, storeUsers } from "../../../drizzle/schema";
import type { InsertUser, User } from "../../../drizzle/schema";

export async function findUserById(id: number): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function findUserByOpenId(openId: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function findAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

export async function createUser(data: InsertUser): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const result = await db.insert(users).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateUser(id: number, data: Partial<InsertUser>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUserById(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, id));
}

export async function findUserStores(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeUsers).where(eq(storeUsers.userId, userId));
}
