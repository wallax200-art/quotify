import { z } from "zod";
import { router, protectedProcedure, storeOwnerProcedure, masterAdminProcedure } from "../../_core/trpc";
import {
  getAllStores,
  getStoreById,
  createNewStore,
  updateStoreInfo,
  getStoreUsers,
  addSellerToStore,
  getStoreSettings,
  updateStoreSettings,
  getStoreMachineFees,
  saveStoreMachineFee,
  removeStoreMachineFee,
  getStoreDeviceConditions,
  saveStoreDeviceCondition,
  removeStoreDeviceCondition,
  getStoreTradeInRules,
  getStoreProducts,
  saveStoreProduct,
} from "./stores.service";
import {
  getAllSettings,
  getSetting,
  setSetting,
  getAllSupportSettings,
  setSupportSetting,
} from "./support-settings.repository";
import { getDb } from "../../db";
import { storeUsers } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const storesRouter = router({
  // ─── Configurações Públicas ───────────────────
  publicSettings: router({
    get: protectedProcedure.query(async () => {
      const whatsapp = await getSetting("admin_whatsapp");
      return { adminWhatsapp: whatsapp ?? "16562426925" };
    }),
  }),

  // ─── Loja do usuário logado ───────────────────
  my: router({
    /** Retorna o storeId da primeira loja vinculada ao usuário logado */
    getStoreId: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { storeId: null };
      const links = await db
        .select()
        .from(storeUsers)
        .where(eq(storeUsers.userId, ctx.user.id))
        .limit(1);
      return { storeId: links.length > 0 ? links[0].storeId : null };
    }),

    /** Retorna todas as configurações da loja do usuário logado */
    getConfig: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const links = await db
        .select()
        .from(storeUsers)
        .where(eq(storeUsers.userId, ctx.user.id))
        .limit(1);
      if (links.length === 0) return null;
      const storeId = links[0].storeId;
      const [settings, machineFees, deviceConditions, tradeInRules, products] = await Promise.all([
        getStoreSettings(storeId).catch(() => null),
        getStoreMachineFees(storeId).catch(() => []),
        getStoreDeviceConditions(storeId).catch(() => []),
        getStoreTradeInRules(storeId).catch(() => []),
        getStoreProducts(storeId).catch(() => []),
      ]);
      return { storeId, settings, machineFees, deviceConditions, tradeInRules, products };
    }),

    /** Sincroniza em lote as configurações da loja (taxas, condições, produtos, texto) */
    syncConfig: storeOwnerProcedure
      .input(
        z.object({
          storeId: z.number(),
          quoteClosingText: z.string().optional(),
          storeName: z.string().optional(),
          whatsapp: z.string().optional(),
          machineFees: z
            .array(
              z.object({
                installments: z.number().min(1),
                ratePercentage: z.string(),
                label: z.string().optional(),
                isActive: z.boolean().optional(),
              }),
            )
            .optional(),
          deviceConditions: z
            .array(
              z.object({
                conditionKey: z.string(),
                label: z.string(),
                description: z.string().optional(),
                deductionValue: z.string(),
                category: z.enum(["estetica", "funcionalidade", "garantia"]),
                icon: z.string().optional(),
                isActive: z.boolean().optional(),
              }),
            )
            .optional(),
          products: z
            .array(
              z.object({
                productId: z.number(),
                price: z.string(),
                condition: z.enum(["novo", "seminovo"]).optional(),
                isActive: z.boolean().optional(),
              }),
            )
            .optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { storeId, quoteClosingText, storeName, whatsapp, machineFees, deviceConditions, products } = input;

        // Atualizar configurações da loja
        if (quoteClosingText !== undefined) {
          await updateStoreSettings(storeId, { quoteClosingText });
        }
        if (storeName !== undefined || whatsapp !== undefined) {
          await updateStoreInfo(storeId, { name: storeName, whatsapp });
        }

        // Sincronizar taxas
        if (machineFees) {
          for (const fee of machineFees) {
            await saveStoreMachineFee(storeId, fee as any);
          }
        }

        // Sincronizar condições
        if (deviceConditions) {
          for (const condition of deviceConditions) {
            await saveStoreDeviceCondition(storeId, condition as any);
          }
        }

        // Sincronizar produtos
        if (products) {
          for (const product of products) {
            await saveStoreProduct(storeId, product as any);
          }
        }

        return { success: true };
      }),
  }),

  // ─── Admin Master: Gestão Global de Lojas ─────
  admin: router({
    listStores: masterAdminProcedure.query(async () => {
      return getAllStores();
    }),

    createStore: masterAdminProcedure
      .input(
        z.object({
          name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
          slug: z.string().min(2, "Slug deve ter pelo menos 2 caracteres").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
          whatsapp: z.string().optional(),
          ownerId: z.number(),
        }),
      )
      .mutation(async ({ input }) => {
        const storeId = await createNewStore(input);
        return { success: true, storeId };
      }),

    getSettings: masterAdminProcedure.query(async () => {
      return getAllSettings();
    }),

    updateSetting: masterAdminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setSetting(input.key, input.value);
        return { success: true };
      }),

    getSupportSettings: masterAdminProcedure.query(async () => {
      return getAllSupportSettings();
    }),

    updateSupportSetting: masterAdminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setSupportSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // ─── Dono da Loja: Configurações da Loja ──────
  store: router({
    get: storeOwnerProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return getStoreById(input.storeId);
      }),

    update: storeOwnerProcedure
      .input(
        z.object({
          storeId: z.number(),
          name: z.string().optional(),
          whatsapp: z.string().optional(),
          logoUrl: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { storeId, ...data } = input;
        await updateStoreInfo(storeId, data);
        return { success: true };
      }),

    getUsers: storeOwnerProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return getStoreUsers(input.storeId);
      }),

    addSeller: storeOwnerProcedure
      .input(z.object({ storeId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        await addSellerToStore(input.storeId, input.userId);
        return { success: true };
      }),

    getSettings: storeOwnerProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return getStoreSettings(input.storeId);
      }),

    updateSettings: storeOwnerProcedure
      .input(
        z.object({
          storeId: z.number(),
          quoteClosingText: z.string().optional(),
          themePreference: z.enum(["light", "dark", "system"]).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { storeId, ...data } = input;
        await updateStoreSettings(storeId, data);
        return { success: true };
      }),

    // ─── Taxas da Maquininha ──────────────────
    getMachineFees: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return getStoreMachineFees(input.storeId);
      }),

    saveMachineFee: storeOwnerProcedure
      .input(
        z.object({
          storeId: z.number(),
          installments: z.number().min(1),
          ratePercentage: z.string(),
          label: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { storeId, ...data } = input;
        await saveStoreMachineFee(storeId, data as any);
        return { success: true };
      }),

    deleteMachineFee: storeOwnerProcedure
      .input(z.object({ storeId: z.number(), feeId: z.number() }))
      .mutation(async ({ input }) => {
        await removeStoreMachineFee(input.storeId, input.feeId);
        return { success: true };
      }),

    // ─── Condições de Aparelhos ───────────────
    getDeviceConditions: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return getStoreDeviceConditions(input.storeId);
      }),

    saveDeviceCondition: storeOwnerProcedure
      .input(
        z.object({
          storeId: z.number(),
          conditionKey: z.string(),
          label: z.string(),
          description: z.string().optional(),
          deductionValue: z.string(),
          category: z.enum(["estetica", "funcionalidade", "garantia"]),
          icon: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { storeId, ...data } = input;
        await saveStoreDeviceCondition(storeId, data as any);
        return { success: true };
      }),

    deleteDeviceCondition: storeOwnerProcedure
      .input(z.object({ storeId: z.number(), conditionId: z.number() }))
      .mutation(async ({ input }) => {
        await removeStoreDeviceCondition(input.storeId, input.conditionId);
        return { success: true };
      }),

    // ─── Regras de Abatimento ─────────────────
    getTradeInRules: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return getStoreTradeInRules(input.storeId);
      }),

    // ─── Produtos da Loja ─────────────────────
    getProducts: protectedProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return getStoreProducts(input.storeId);
      }),

    saveProduct: storeOwnerProcedure
      .input(
        z.object({
          storeId: z.number(),
          productId: z.number(),
          price: z.string(),
          condition: z.enum(["novo", "seminovo"]).optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { storeId, ...data } = input;
        await saveStoreProduct(storeId, data as any);
        return { success: true };
      }),
  }),
});
