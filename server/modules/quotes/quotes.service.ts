import {
  createQuote,
  createQuoteItem,
  createTradeIn,
  findQuoteById,
  findQuoteItems,
  findQuotesByStore,
  findTradeInsByQuote,
  updateQuote,
} from "./quotes.repository";
import { NotFoundError } from "../../errors/AppError";

export async function getStoreQuotes(storeId: number) {
  return findQuotesByStore(storeId);
}

export async function getQuoteDetails(quoteId: number) {
  const quote = await findQuoteById(quoteId);
  if (!quote) throw new NotFoundError("Orçamento não encontrado.");
  const items = await findQuoteItems(quoteId);
  const tradeIns = await findTradeInsByQuote(quoteId);
  return { quote, items, tradeIns };
}

export async function createNewQuote(data: {
  storeId: number;
  sellerId: number;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  generatedText?: string;
  items: Array<{
    storeProductId: number;
    unitPrice: number;
    quantity?: number;
    installments?: number;
    installmentValue?: number;
  }>;
  tradeIn?: {
    productId?: number;
    productName?: string;
    productStorage?: string;
    evaluationValue: number;
    appliedConditionsJson?: unknown;
  };
}): Promise<number> {
  const quoteId = await createQuote({
    storeId: data.storeId,
    sellerId: data.sellerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    totalAmount: String(data.totalAmount),
    generatedText: data.generatedText,
    status: "pending",
  });

  for (const item of data.items) {
    await createQuoteItem({
      quoteId,
      storeProductId: item.storeProductId,
      unitPrice: String(item.unitPrice),
      quantity: item.quantity ?? 1,
      installments: item.installments,
      installmentValue: item.installmentValue ? String(item.installmentValue) : undefined,
    });
  }

  if (data.tradeIn) {
    await createTradeIn({
      quoteId,
      productId: data.tradeIn.productId,
      productName: data.tradeIn.productName,
      productStorage: data.tradeIn.productStorage,
      evaluationValue: String(data.tradeIn.evaluationValue),
      appliedConditionsJson: data.tradeIn.appliedConditionsJson,
    });
  }

  return quoteId;
}

export async function updateQuoteStatus(
  quoteId: number,
  status: "pending" | "accepted" | "rejected" | "expired",
): Promise<void> {
  const quote = await findQuoteById(quoteId);
  if (!quote) throw new NotFoundError("Orçamento não encontrado.");
  await updateQuote(quoteId, { status });
}
