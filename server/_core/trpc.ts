import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { isAccessExpired } from "../db";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;

// ─── Procedure Pública ────────────────────────
// Sem autenticação (ex: login, registro, landing page)
export const publicProcedure = t.procedure;

// ─── Middleware: Usuário Autenticado ──────────
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Não autenticado. Faça login para continuar. (10001)",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Middleware: Usuário Ativo ─────────────────
const isActive = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado. (10001)" });
  }
  if (ctx.user.status === "pending") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sua conta está aguardando aprovação do administrador.",
    });
  }
  if (ctx.user.status === "blocked") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sua conta foi bloqueada. Entre em contato com o suporte.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Middleware: Acesso não expirado ──────────
// Bloqueia usuários com acesso expirado (exceto master_admin)
const isNotExpired = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado. (10001)" });
  }
  if (ctx.user.role !== "master_admin" && isAccessExpired(ctx.user)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seu período de acesso expirou. Entre em contato com o administrador para renovar. (10004)",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Middleware: Admin Master ──────────────────
const isMasterAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "master_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores master. (10002)",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Middleware: Dono de Loja ou Admin ────────
const isStoreOwnerOrAdmin = t.middleware(async ({ ctx, next }) => {
  if (
    !ctx.user ||
    (ctx.user.role !== "store_owner" && ctx.user.role !== "master_admin")
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a donos de loja ou administradores. (10003)",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Procedures Exportadas ────────────────────

/** Exige usuário logado, ativo e com acesso não expirado */
export const protectedProcedure = t.procedure.use(isAuthed).use(isActive).use(isNotExpired);

/** Exige usuário logado, ativo e com role 'master_admin' */
export const masterAdminProcedure = t.procedure
  .use(isAuthed)
  .use(isActive)
  .use(isMasterAdmin);

/** Exige usuário logado, ativo e com role 'store_owner' ou 'master_admin' */
export const storeOwnerProcedure = t.procedure
  .use(isAuthed)
  .use(isActive)
  .use(isStoreOwnerOrAdmin);

/**
 * @deprecated Use masterAdminProcedure para novos endpoints.
 * Mantido por compatibilidade com rotas legadas.
 */
export const adminProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (
      !ctx.user ||
      (ctx.user.role !== "master_admin" && (ctx.user.role as string) !== "admin")
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Acesso restrito a administradores. (10002)",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
