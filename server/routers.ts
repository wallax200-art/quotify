import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getAllUsers, updateUserStatus, updateUserRole, updateUserProfile, getSetting, setSetting, getAllSettings, registerUser, loginUser, seedAdminUser, grantUserAccess, updateUserAccessDays, isAccessExpired, deleteUser } from "./db";
import { sdk } from "./_core/sdk";
import { notifyOwner } from "./_core/notification";
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

        // Notificar admin sobre novo cadastro
        try {
          const storePart = input.storeName?.trim() ? `\n🏪 Loja: ${input.storeName.trim()}` : "";
          const phonePart = input.phone?.trim() ? `\n📞 Telefone: ${input.phone.trim()}` : "";
          await notifyOwner({
            title: `🆕 Novo vendedor cadastrado: ${input.name.trim()}`,
            content: `Um novo vendedor se cadastrou e aguarda aprovação.\n\n👤 Nome: ${input.name.trim()}\n📧 Email: ${input.email.toLowerCase().trim()}${storePart}${phonePart}\n\n📅 Data: ${new Date().toLocaleDateString("pt-BR")}\n\nAcesse o Painel Admin para ativar o acesso.`,
          });
        } catch (e) {
          // Não bloquear o cadastro se a notificação falhar
          console.warn("[Register] Falha ao notificar admin:", e);
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

    // Delete a user (admins cannot be deleted)
    deleteUser: adminProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await deleteUser(input.userId);
        if (!result.success) {
          throw new Error(result.error || "Erro ao excluir usuário");
        }
        return { success: true };
      }),

    // Export contacts for remarketing (returns data, PDF generated on client)
    exportContacts: adminProcedure.query(async () => {
      const userList = await getAllUsers();
      return userList
        .filter((u: any) => u.role !== "admin")
        .map((u: any) => ({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          storeName: u.storeName || "",
          status: u.status || "pending",
          createdAt: u.createdAt,
        }));
    }),
  }),

  // Public settings (e.g., admin WhatsApp number for contact button)
  settings: router({
    getPublic: publicProcedure.query(async () => {
      const whatsapp = await getSetting("admin_whatsapp");
      return {
        adminWhatsapp: whatsapp ?? "16562426925",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
