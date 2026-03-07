import { z } from "zod";
import { router, protectedProcedure, masterAdminProcedure } from "../../_core/trpc";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  setUserStatus,
  setUserRole,
  removeUser,
} from "./users.service";
import { updateUser } from "./users.repository";
import { setSetting, getSetting } from "../stores/support-settings.repository";

export const usersRouter = router({
  // ─── Perfil do usuário logado ─────────────────
  profile: router({
    update: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).optional(),
          phone: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ─── Administração (Master Admin) ─────────────
  admin: router({
    listUsers: masterAdminProcedure.query(async () => {
      return getAllUsers();
    }),

    updateStatus: masterAdminProcedure
      .input(
        z.object({
          userId: z.number(),
          status: z.enum(["pending", "active", "blocked"]),
        }),
      )
      .mutation(async ({ input }) => {
        await setUserStatus(input.userId, input.status);
        return { success: true };
      }),

    updateRole: masterAdminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["master_admin", "store_owner", "seller"]),
        }),
      )
      .mutation(async ({ input }) => {
        await setUserRole(input.userId, input.role);
        return { success: true };
      }),

    /** Concede acesso por N dias e ativa o usuário (contado a partir de agora) */
    grantAccess: masterAdminProcedure
      .input(
        z.object({
          userId: z.number(),
          days: z.number().min(1, "Mínimo 1 dia").max(730, "Máximo 730 dias"),
        }),
      )
      .mutation(async ({ input }) => {
        const grantedAt = new Date();
        const expiresAt = new Date(grantedAt.getTime() + input.days * 24 * 60 * 60 * 1000);
        await updateUser(input.userId, {
          status: "active",
          accessGrantedAt: grantedAt,
          accessDays: input.days,
          accessExpiresAt: expiresAt,
        });
        return { success: true };
      }),

    /** Renova o acesso adicionando N dias a partir da data de expiração atual (ou de hoje) */
    renewAccess: masterAdminProcedure
      .input(
        z.object({
          userId: z.number(),
          days: z.number().min(1, "Mínimo 1 dia").max(730, "Máximo 730 dias"),
        }),
      )
      .mutation(async ({ input }) => {
        const user = await getUserById(input.userId);
        // Renovar a partir da expiração atual (se ainda válida) ou de hoje
        const baseDate = user.accessExpiresAt && new Date(user.accessExpiresAt) > new Date()
          ? new Date(user.accessExpiresAt)
          : new Date();
        const expiresAt = new Date(baseDate.getTime() + input.days * 24 * 60 * 60 * 1000);
        const totalDays = (user.accessDays ?? 0) + input.days;
        await updateUser(input.userId, {
          status: "active",
          accessDays: totalDays,
          accessExpiresAt: expiresAt,
        });
        return { success: true };
      }),

    /** Remove o acesso do usuário (revoga) */
    revokeAccess: masterAdminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await updateUser(input.userId, {
          status: "blocked",
          accessDays: 0,
          accessExpiresAt: new Date(), // expira imediatamente
        });
        return { success: true };
      }),

    updateAccessDays: masterAdminProcedure
      .input(
        z.object({
          userId: z.number(),
          days: z.number().min(1, "Mínimo 1 dia").max(730, "Máximo 730 dias"),
        }),
      )
      .mutation(async ({ input }) => {
        const user = await getUserById(input.userId);
        const grantedAt = user.accessGrantedAt ?? new Date();
        const expiresAt = new Date(grantedAt.getTime() + input.days * 24 * 60 * 60 * 1000);
        await updateUser(input.userId, {
          accessGrantedAt: grantedAt,
          accessDays: input.days,
          accessExpiresAt: expiresAt,
        });
        return { success: true };
      }),

    deleteUser: masterAdminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await removeUser(input.userId);
        return { success: true };
      }),

    exportContacts: masterAdminProcedure.query(async () => {
      const userList = await getAllUsers();
      return userList
        .filter((u) => u.role !== "master_admin")
        .map((u) => ({
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          status: u.status,
          role: u.role,
          accessDays: u.accessDays,
          accessExpiresAt: u.accessExpiresAt,
          createdAt: u.createdAt,
        }));
    }),

    // ─── Configurações do sistema ──────────────
    /** Retorna as configurações gerais do sistema (trial, whatsapp, etc.) */
    getSystemSettings: masterAdminProcedure.query(async () => {
      const [trialDays, adminWhatsapp] = await Promise.all([
        getSetting("free_trial_days"),
        getSetting("admin_whatsapp"),
      ]);
      return {
        freeTrialDays: trialDays ? parseInt(trialDays, 10) : 7,
        adminWhatsapp: adminWhatsapp ?? "",
      };
    }),

    /** Atualiza configurações gerais do sistema */
    updateSystemSettings: masterAdminProcedure
      .input(
        z.object({
          freeTrialDays: z.number().min(0).max(365).optional(),
          adminWhatsapp: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        if (input.freeTrialDays !== undefined) {
          await setSetting("free_trial_days", String(input.freeTrialDays));
        }
        if (input.adminWhatsapp !== undefined) {
          await setSetting("admin_whatsapp", input.adminWhatsapp);
        }
        return { success: true };
      }),
  }),
});
