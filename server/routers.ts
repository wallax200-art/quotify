import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getAllUsers, updateUserStatus, updateUserRole, updateUserProfile, getSetting, setSetting, getAllSettings } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // User profile update (any authenticated user)
  profile: router({
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        storeName: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Admin routes for user management
  admin: router({
    listUsers: adminProcedure.query(async () => {
      const userList = await getAllUsers();
      return userList;
    }),

    updateUserStatus: adminProcedure
      .input(z.object({
        userId: z.number(),
        status: z.enum(["pending", "active", "blocked"]),
      }))
      .mutation(async ({ input }) => {
        await updateUserStatus(input.userId, input.status);
        return { success: true };
      }),

    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    // App settings management
    getSettings: adminProcedure.query(async () => {
      return getAllSettings();
    }),

    updateSetting: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await setSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // Public settings (e.g., admin WhatsApp number for contact button)
  settings: router({
    getPublic: publicProcedure.query(async () => {
      const whatsapp = await getSetting("admin_whatsapp");
      return {
        adminWhatsapp: whatsapp ?? "5500000000000",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
