import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./modules/auth/auth.router";
import { usersRouter } from "./modules/users/users.router";
import { storesRouter } from "./modules/stores/stores.router";
import { quotesRouter } from "./modules/quotes/quotes.router";
import { seedAdminUser } from "./db";

// ─── Seed do Admin Master na inicialização ────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  seedAdminUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME).catch((err) => {
    console.error("[Seed] Failed to seed admin:", err);
  });
}

// ─── Router Principal ─────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  users: usersRouter,
  stores: storesRouter,
  quotes: quotesRouter,
});

export type AppRouter = typeof appRouter;
