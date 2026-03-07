import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─────────────────────────────────────────────
// PLANOS
// ─────────────────────────────────────────────

export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  maxUsers: int("max_users").notNull().default(1),
  featuresJson: json("features_json"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

// ─────────────────────────────────────────────
// LOJAS
// ─────────────────────────────────────────────

export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  whatsapp: varchar("whatsapp", { length: 32 }),
  logoUrl: varchar("logo_url", { length: 512 }),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

// ─────────────────────────────────────────────
// USUÁRIOS
// ─────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier OR email-based unique ID */
  openId: varchar("openId", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  /** Hashed password for email/password auth (null for OAuth users) */
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /** master_admin: acesso total; store_owner: dono de loja; seller: vendedor */
  role: mysqlEnum("role", ["master_admin", "store_owner", "seller"]).notNull().default("seller"),
  status: mysqlEnum("status", ["pending", "active", "blocked"]).notNull().default("pending"),
  phone: varchar("phone", { length: 32 }),
  /** Data em que o acesso foi concedido pelo admin */
  accessGrantedAt: timestamp("accessGrantedAt"),
  /** Número de dias de acesso concedido */
  accessDays: int("accessDays").notNull().default(0),
  /** Data de expiração do acesso (accessGrantedAt + accessDays) */
  accessExpiresAt: timestamp("accessExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────
// RELAÇÃO USUÁRIOS ↔ LOJAS
// ─────────────────────────────────────────────

export const storeUsers = mysqlTable("store_users", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleInStore: mysqlEnum("role_in_store", ["owner", "seller"]).notNull().default("seller"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StoreUser = typeof storeUsers.$inferSelect;
export type InsertStoreUser = typeof storeUsers.$inferInsert;

// ─────────────────────────────────────────────
// ASSINATURAS
// ─────────────────────────────────────────────

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  planId: int("plan_id").notNull().references(() => plans.id),
  status: mysqlEnum("status", ["trialing", "active", "past_due", "canceled"]).notNull().default("trialing"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  externalSubscriptionId: varchar("external_subscription_id", { length: 255 }),
  accessDays: int("access_days").notNull().default(0),
  accessGrantedAt: timestamp("access_granted_at"),
  accessExpiresAt: timestamp("access_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─────────────────────────────────────────────
// PRODUTOS (catálogo global, mantido pelo Admin)
// ─────────────────────────────────────────────

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  storage: varchar("storage", { length: 64 }).notNull().default("-"),
  color: varchar("color", { length: 64 }),
  specs: varchar("specs", { length: 255 }),
  imageUrl: varchar("image_url", { length: 512 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─────────────────────────────────────────────
// PRODUTOS POR LOJA (preços e visibilidade)
// ─────────────────────────────────────────────

export const storeProducts = mysqlTable("store_products", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  condition: mysqlEnum("condition", ["novo", "seminovo"]).notNull().default("novo"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type StoreProduct = typeof storeProducts.$inferSelect;
export type InsertStoreProduct = typeof storeProducts.$inferInsert;

// ─────────────────────────────────────────────
// TAXAS DA MAQUININHA POR LOJA
// ─────────────────────────────────────────────

export const machineFees = mysqlTable("machine_fees", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  installments: int("installments").notNull(),
  ratePercentage: decimal("rate_percentage", { precision: 6, scale: 4 }).notNull(),
  label: varchar("label", { length: 32 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MachineFee = typeof machineFees.$inferSelect;
export type InsertMachineFee = typeof machineFees.$inferInsert;

// ─────────────────────────────────────────────
// CONDIÇÕES DE APARELHOS (para avaliação de troca)
// ─────────────────────────────────────────────

export const deviceConditions = mysqlTable("device_conditions", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  conditionKey: varchar("condition_key", { length: 64 }).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  description: text("description"),
  deductionValue: decimal("deduction_value", { precision: 10, scale: 2 }).notNull().default("0.00"),
  category: mysqlEnum("category", ["estetica", "funcionalidade", "garantia"]).notNull().default("estetica"),
  icon: varchar("icon", { length: 64 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type DeviceCondition = typeof deviceConditions.$inferSelect;
export type InsertDeviceCondition = typeof deviceConditions.$inferInsert;

// ─────────────────────────────────────────────
// REGRAS DE ABATIMENTO (Upgrade / Trade-in)
// ─────────────────────────────────────────────

export const tradeInRules = mysqlTable("trade_in_rules", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  baseDeductionPercentage: decimal("base_deduction_percentage", { precision: 5, scale: 2 }).notNull().default("0.00"),
  minAcceptableCondition: varchar("min_acceptable_condition", { length: 64 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TradeInRule = typeof tradeInRules.$inferSelect;
export type InsertTradeInRule = typeof tradeInRules.$inferInsert;

// ─────────────────────────────────────────────
// ORÇAMENTOS
// ─────────────────────────────────────────────

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  sellerId: int("seller_id").notNull().references(() => users.id),
  customerName: varchar("customer_name", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 32 }),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "expired"]).notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  generatedText: text("generated_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

// ─────────────────────────────────────────────
// ITENS DO ORÇAMENTO
// ─────────────────────────────────────────────

export const quoteItems = mysqlTable("quote_items", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  storeProductId: int("store_product_id").notNull().references(() => storeProducts.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  installments: int("installments"),
  installmentValue: decimal("installment_value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

// ─────────────────────────────────────────────
// APARELHOS DADOS COMO TROCA (Trade-in)
// ─────────────────────────────────────────────

export const tradeIns = mysqlTable("trade_ins", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  productId: int("product_id").references(() => products.id),
  productName: varchar("product_name", { length: 255 }),
  productStorage: varchar("product_storage", { length: 64 }),
  evaluationValue: decimal("evaluation_value", { precision: 10, scale: 2 }).notNull().default("0.00"),
  appliedConditionsJson: json("applied_conditions_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TradeIn = typeof tradeIns.$inferSelect;
export type InsertTradeIn = typeof tradeIns.$inferInsert;

// ─────────────────────────────────────────────
// CONFIGURAÇÕES DA LOJA
// ─────────────────────────────────────────────

export const storeSettings = mysqlTable("store_settings", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }).unique(),
  quoteClosingText: text("quote_closing_text"),
  themePreference: mysqlEnum("theme_preference", ["light", "dark", "system"]).notNull().default("system"),
  defaultWarrantyDays: int("default_warranty_days").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type StoreSetting = typeof storeSettings.$inferSelect;
export type InsertStoreSetting = typeof storeSettings.$inferInsert;

// ─────────────────────────────────────────────
// LOGS DE ATIVIDADE
// ─────────────────────────────────────────────

export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").references(() => stores.id, { onDelete: "set null" }),
  userId: int("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entity_type", { length: 64 }),
  entityId: int("entity_id"),
  oldDataJson: json("old_data_json"),
  newDataJson: json("new_data_json"),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ─────────────────────────────────────────────
// CONFIGURAÇÕES GLOBAIS DO SISTEMA (Admin Master)
// Mantida como "supportSettings" para compatibilidade com código existente
// ─────────────────────────────────────────────

export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 128 }).notNull().unique(),
  settingValue: text("settingValue"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

export const supportSettings = mysqlTable("support_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("setting_key", { length: 128 }).notNull().unique(),
  settingValue: text("setting_value"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SupportSetting = typeof supportSettings.$inferSelect;
export type InsertSupportSetting = typeof supportSettings.$inferInsert;
