import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { quotes, quoteItems, tradeIns } from "../../../drizzle/schema";
import type {
  InsertQuote,
  Quote,
  InsertQuoteItem,
  QuoteItem,
  InsertTradeIn,
  TradeIn,
} from "../../../drizzle/schema";

export async function findQuotesByStore(storeId: number): Promise<Quote[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.storeId, storeId));
}

export async function findQuoteById(id: number): Promise<Quote | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createQuote(data: InsertQuote): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const result = await db.insert(quotes).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateQuote(id: number, data: Partial<InsertQuote>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(quotes).set(data).where(eq(quotes.id, id));
}

export async function createQuoteItem(data: InsertQuoteItem): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(quoteItems).values(data);
}

export async function findQuoteItems(quoteId: number): Promise<QuoteItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
}

export async function createTradeIn(data: InsertTradeIn): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(tradeIns).values(data);
}

export async function findTradeInsByQuote(quoteId: number): Promise<TradeIn[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tradeIns).where(eq(tradeIns.quoteId, quoteId));
}
