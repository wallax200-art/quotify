import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { sdk } from "../../_core/sdk";
import { getSessionCookieOptions } from "../../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { notifyOwner } from "../../_core/notification";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from "../users/users.service";
import { getSetting } from "../stores/support-settings.repository";
import { isAccessExpired, getDb } from "../../db";
import { storeUsers } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const authRouter = router({
  // ─── Sessão Atual ────────────────────────────
  me: protectedProcedure.query(async ({ ctx }) => {
    const { password, ...user } = ctx.user as any;
    const accessExpired = isAccessExpired(user);

    // Buscar a primeira loja vinculada ao usuário
    let storeId: number | null = null;
    try {
      const db = await getDb();
      if (db) {
        const links = await db
          .select()
          .from(storeUsers)
          .where(eq(storeUsers.userId, user.id))
          .limit(1);
        if (links.length > 0) storeId = links[0].storeId;
      }
    } catch { /* ignore */ }

    return { ...user, accessExpired, storeId };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME);
    return { success: true };
  }),

  // ─── Registro ────────────────────────────────
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, openId } = await registerUser({
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
      });

      // Notificar admin sobre novo cadastro
      try {
        const phonePart = input.phone ? `\n📞 Telefone: ${input.phone}` : "";
        await notifyOwner({
          title: `🆕 Novo vendedor cadastrado: ${input.name}`,
          content: `Um novo vendedor se cadastrou e aguarda aprovação.\n\n👤 Nome: ${input.name}\n📧 E-mail: ${input.email}${phonePart}\n\n📅 Data: ${new Date().toLocaleDateString("pt-BR")}\n\nAcesse o Painel Admin para ativar o acesso.`,
        });
      } catch (e) {
        console.warn("[Register] Falha ao notificar admin:", e);
      }

      return {
        success: true,
        message: "Cadastro enviado. Aguarde liberação do administrador.",
      };
    }),

  // ─── Login ───────────────────────────────────
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string().min(1, "Senha é obrigatória"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await loginUser(input.email, input.password);

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name ?? "",
      });

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

  // ─── Recuperação de Senha ─────────────────────
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email("E-mail inválido") }))
    .mutation(async ({ input }) => {
      await requestPasswordReset(input.email);
      return {
        success: true,
        message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve.",
      };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        openId: z.string().min(1),
        newPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      }),
    )
    .mutation(async ({ input }) => {
      await resetPassword(input.openId, input.newPassword);
      return { success: true, message: "Senha atualizada com sucesso." };
    }),
});
