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

    /** Concede acesso por N dias e ativa o usuário */
    grantAccess: masterAdminProcedure
      .input(
        z.object({
          userId: z.number(),
          days: z.number().min(1, "Mínimo 1 dia").max(365, "Máximo 365 dias"),
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

    updateAccessDays: masterAdminProcedure
      .input(
        z.object({
          userId: z.number(),
          days: z.number().min(1, "Mínimo 1 dia").max(365, "Máximo 365 dias"),
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
          createdAt: u.createdAt,
        }));
    }),
  }),
});
