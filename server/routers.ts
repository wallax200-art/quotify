import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getAllUsers, updateUserStatus, updateUserRole, updateUserProfile, getSetting, setSetting, getAllSettings, registerUser, loginUser, seedAdminUser, grantUserAccess, updateUserAccessDays, isAccessExpired } from "./db";
import { sdk } from "./_core/sdk";
import { z } from "zod";

// Seed admin user on startup
// Seed admin from env vars
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  seedAdminUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME).catch(err => {
    console.error("[Seed] Failed to seed admin:", err);
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      if (!opts.ctx.user) return null;
      const { password, ...safeUser } = opts.ctx.user as any;
      // Add computed access expiry info
      const accessExpired = isAccessExpired(opts.ctx.user);
      return { ...safeUser, accessExpired };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Email/Password Registration
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        storeName: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await registerUser({
          email: input.email.toLowerCase().trim(),
          password: input.password,
          name: input.name.trim(),
          storeName: input.storeName?.trim(),
          phone: input.phone?.trim(),
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return { success: true, message: "Cadastro enviado. Aguarde liberação do administrador." };
      }),

    // Email/Password Login
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(1, "Senha é obrigatória"),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await loginUser(input.email.toLowerCase().trim(), input.password);

        if (!result.success || !result.user) {
          return { success: false, error: result.error };
        }

        const user = result.user;

        // Create session token using the openId
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          success: true,
          token: sessionToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
        };
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
      return userList.map(({ password, ...u }: any) => u);
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

    // Grant access to a user for N days (also activates the user)
    grantAccess: adminProcedure
      .input(z.object({
        userId: z.number(),
        days: z.number().min(1, "Mínimo 1 dia").max(365, "Máximo 365 dias"),
      }))
      .mutation(async ({ input }) => {
        await grantUserAccess(input.userId, input.days);
        return { success: true };
      }),

    // Update access days for a user (recomputes expiry from original grant date)
    updateAccessDays: adminProcedure
      .input(z.object({
        userId: z.number(),
        days: z.number().min(1, "Mínimo 1 dia").max(365, "Máximo 365 dias"),
      }))
      .mutation(async ({ input }) => {
        await updateUserAccessDays(input.userId, input.days);
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
