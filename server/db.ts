import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, appSettings } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from "bcryptjs";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    // Owner is always active
    if (user.openId === ENV.ownerOpenId) {
      values.status = 'active';
      updateSet.status = 'active';
    }

    if (user.status !== undefined) {
      values.status = user.status;
      updateSet.status = user.status;
    }

    if (user.password !== undefined) {
      values.password = user.password;
      updateSet.password = user.password;
    }

    if (user.storeName !== undefined) {
      values.storeName = user.storeName;
      updateSet.storeName = user.storeName;
    }

    if (user.phone !== undefined) {
      values.phone = user.phone;
      updateSet.phone = user.phone;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserStatus(userId: number, status: "pending" | "active" | "blocked") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ status }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserProfile(userId: number, data: { name?: string; storeName?: string; phone?: string }) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.storeName !== undefined) updateData.storeName = data.storeName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (Object.keys(updateData).length > 0) {
    await db.update(users).set(updateData).where(eq(users.id, userId));
  }
}

// ===== Email/Password Auth Helpers =====

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  storeName?: string;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Banco de dados indisponível" };

  // Check if email already exists
  const existing = await getUserByEmail(data.email);
  if (existing) {
    return { success: false, error: "Este email já está cadastrado" };
  }

  const hashedPassword = await hashPassword(data.password);
  const openId = `email:${data.email}`;

  await db.insert(users).values({
    openId,
    email: data.email,
    password: hashedPassword,
    name: data.name,
    storeName: data.storeName ?? null,
    phone: data.phone ?? null,
    loginMethod: "email",
    role: "user",
    status: "pending",
    lastSignedIn: new Date(),
  });

  return { success: true };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  const user = await getUserByEmail(email);
  if (!user) {
    return { success: false, error: "Email ou senha incorretos" };
  }

  if (!user.password) {
    return { success: false, error: "Email ou senha incorretos" };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { success: false, error: "Email ou senha incorretos" };
  }

  // Update last signed in
  const db = await getDb();
  if (db) {
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  }

  return { success: true, user };
}

/**
 * Seed admin user if not exists
 */
export async function seedAdminUser(email: string, password: string, name: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserByEmail(email);
  if (existing) {
    // Always ensure admin has password, correct role/status, and email login support
    const hashedPassword = await hashPassword(password);
    await db.update(users).set({ 
      password: hashedPassword, 
      role: "admin", 
      status: "active",
      loginMethod: "email",
      name: existing.name || name 
    }).where(eq(users.id, existing.id));
    console.log(`[Seed] Admin user ${email} updated (password + role + loginMethod)`);
    return;
  }

  const hashedPassword = await hashPassword(password);
  const openId = `email:${email}`;

  await db.insert(users).values({
    openId,
    email,
    password: hashedPassword,
    name,
    loginMethod: "email",
    role: "admin",
    status: "active",
    lastSignedIn: new Date(),
  });

  console.log(`[Seed] Admin user ${email} created successfully`);
}

// ===== Access Control Helpers =====

/**
 * Grant access to a user for a given number of days.
 * Sets accessGrantedAt to now, accessDays, and computes accessExpiresAt.
 * Also activates the user if they are pending.
 */
export async function grantUserAccess(userId: number, days: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  await db.update(users).set({
    accessGrantedAt: now,
    accessDays: days,
    accessExpiresAt: expiresAt,
    status: "active",
  }).where(eq(users.id, userId));
}

/**
 * Update the number of access days for a user.
 * Recomputes accessExpiresAt based on the original accessGrantedAt.
 */
export async function updateUserAccessDays(userId: number, days: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const user = await getUserById(userId);
  if (!user) return;
  const grantedAt = user.accessGrantedAt || new Date();
  const expiresAt = new Date(grantedAt.getTime() + days * 24 * 60 * 60 * 1000);
  await db.update(users).set({
    accessGrantedAt: grantedAt,
    accessDays: days,
    accessExpiresAt: expiresAt,
  }).where(eq(users.id, userId));
}

/**
 * Check if a user's access has expired.
 * Returns true if expired, false if still valid or no expiry set.
 * Admin users never expire.
 */
export function isAccessExpired(user: { role: string; accessExpiresAt: Date | null; accessDays: number }): boolean {
  if (user.role === "admin") return false;
  if (!user.accessExpiresAt || user.accessDays === 0) return false;
  return new Date() > new Date(user.accessExpiresAt);
}

// App Settings helpers
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appSettings).where(eq(appSettings.settingKey, key)).limit(1);
  return result.length > 0 ? (result[0].settingValue ?? null) : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(appSettings).values({ settingKey: key, settingValue: value })
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
