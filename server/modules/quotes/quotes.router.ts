import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import {
  getStoreQuotes,
  getQuoteDetails,
  createNewQuote,
  updateQuoteStatus,
} from "./quotes.service";

export const quotesRouter = router({
  list: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      return getStoreQuotes(input.storeId);
    }),

  get: protectedProcedure
    .input(z.object({ quoteId: z.number() }))
    .query(async ({ input }) => {
      return getQuoteDetails(input.quoteId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        totalAmount: z.number(),
        generatedText: z.string().optional(),
        items: z.array(
          z.object({
            storeProductId: z.number(),
            unitPrice: z.number(),
            quantity: z.number().optional(),
            installments: z.number().optional(),
            installmentValue: z.number().optional(),
          }),
        ),
        tradeIn: z
          .object({
            productId: z.number().optional(),
            productName: z.string().optional(),
            productStorage: z.string().optional(),
            evaluationValue: z.number(),
            appliedConditionsJson: z.any().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const quoteId = await createNewQuote({
        ...input,
        sellerId: ctx.user.id,
      });
      return { success: true, quoteId };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        quoteId: z.number(),
        status: z.enum(["pending", "accepted", "rejected", "expired"]),
      }),
    )
    .mutation(async ({ input }) => {
      await updateQuoteStatus(input.quoteId, input.status);
      return { success: true };
    }),
});
