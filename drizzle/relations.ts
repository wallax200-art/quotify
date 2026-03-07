import { relations } from "drizzle-orm";
import {
  activityLogs,
  deviceConditions,
  machineFees,
  plans,
  products,
  quoteItems,
  quotes,
  storeProducts,
  storeSettings,
  storeUsers,
  stores,
  subscriptions,
  tradeInRules,
  tradeIns,
  users,
} from "./schema";

export const storesRelations = relations(stores, ({ many, one }) => ({
  storeUsers: many(storeUsers),
  storeProducts: many(storeProducts),
  machineFees: many(machineFees),
  deviceConditions: many(deviceConditions),
  tradeInRules: many(tradeInRules),
  quotes: many(quotes),
  subscriptions: many(subscriptions),
  activityLogs: many(activityLogs),
  settings: one(storeSettings, {
    fields: [stores.id],
    references: [storeSettings.storeId],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  storeUsers: many(storeUsers),
  quotes: many(quotes),
  activityLogs: many(activityLogs),
}));

export const storeUsersRelations = relations(storeUsers, ({ one }) => ({
  store: one(stores, {
    fields: [storeUsers.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [storeUsers.userId],
    references: [users.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  store: one(stores, {
    fields: [subscriptions.storeId],
    references: [stores.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  storeProducts: many(storeProducts),
  tradeIns: many(tradeIns),
}));

export const storeProductsRelations = relations(storeProducts, ({ one, many }) => ({
  store: one(stores, {
    fields: [storeProducts.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [storeProducts.productId],
    references: [products.id],
  }),
  quoteItems: many(quoteItems),
}));

export const machineFeesRelations = relations(machineFees, ({ one }) => ({
  store: one(stores, {
    fields: [machineFees.storeId],
    references: [stores.id],
  }),
}));

export const deviceConditionsRelations = relations(deviceConditions, ({ one }) => ({
  store: one(stores, {
    fields: [deviceConditions.storeId],
    references: [stores.id],
  }),
}));

export const tradeInRulesRelations = relations(tradeInRules, ({ one }) => ({
  store: one(stores, {
    fields: [tradeInRules.storeId],
    references: [stores.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  store: one(stores, {
    fields: [quotes.storeId],
    references: [stores.id],
  }),
  seller: one(users, {
    fields: [quotes.sellerId],
    references: [users.id],
  }),
  items: many(quoteItems),
  tradeIns: many(tradeIns),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
  storeProduct: one(storeProducts, {
    fields: [quoteItems.storeProductId],
    references: [storeProducts.id],
  }),
}));

export const tradeInsRelations = relations(tradeIns, ({ one }) => ({
  quote: one(quotes, {
    fields: [tradeIns.quoteId],
    references: [quotes.id],
  }),
  product: one(products, {
    fields: [tradeIns.productId],
    references: [products.id],
  }),
}));

export const storeSettingsRelations = relations(storeSettings, ({ one }) => ({
  store: one(stores, {
    fields: [storeSettings.storeId],
    references: [stores.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  store: one(stores, {
    fields: [activityLogs.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
