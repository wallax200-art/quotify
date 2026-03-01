import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { isAccessExpired } from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@quotify.com",
    name: "Admin User",
    loginMethod: "email",
    role: "admin",
    status: "active",
    password: null,
    storeName: "Quotify HQ",
    phone: "5511999999999",
    accessGrantedAt: null,
    accessDays: 0,
    accessExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(overrides: Partial<AuthenticatedUser> = {}): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@quotify.com",
    name: "Regular User",
    loginMethod: "email",
    role: "user",
    status: "active",
    password: null,
    storeName: "Loja Teste",
    phone: "5511888888888",
    accessGrantedAt: null,
    accessDays: 0,
    accessExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };

  return { ctx };
}

describe("isAccessExpired", () => {
  it("returns false for admin users regardless of expiry", () => {
    const result = isAccessExpired({
      role: "admin",
      accessExpiresAt: new Date("2020-01-01"), // past date
      accessDays: 30,
    });
    expect(result).toBe(false);
  });

  it("returns false when no access has been granted (accessDays = 0)", () => {
    const result = isAccessExpired({
      role: "user",
      accessExpiresAt: null,
      accessDays: 0,
    });
    expect(result).toBe(false);
  });

  it("returns false when accessExpiresAt is null", () => {
    const result = isAccessExpired({
      role: "user",
      accessExpiresAt: null,
      accessDays: 30,
    });
    expect(result).toBe(false);
  });

  it("returns false when access is still valid (future expiry)", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const result = isAccessExpired({
      role: "user",
      accessExpiresAt: futureDate,
      accessDays: 30,
    });
    expect(result).toBe(false);
  });

  it("returns true when access has expired (past expiry)", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = isAccessExpired({
      role: "user",
      accessExpiresAt: pastDate,
      accessDays: 30,
    });
    expect(result).toBe(true);
  });

  it("returns true when access expired exactly 1 second ago", () => {
    const justExpired = new Date(Date.now() - 1000);
    const result = isAccessExpired({
      role: "user",
      accessExpiresAt: justExpired,
      accessDays: 1,
    });
    expect(result).toBe(true);
  });
});

describe("auth.me - access expiry info", () => {
  it("includes accessExpired: false for user with no access set", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.accessExpired).toBe(false);
  });

  it("includes accessExpired: false for user with valid access", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const { ctx } = createUserContext({
      accessGrantedAt: new Date(),
      accessDays: 30,
      accessExpiresAt: futureDate,
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.accessExpired).toBe(false);
  });

  it("includes accessExpired: true for user with expired access", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const grantedDate = new Date();
    grantedDate.setDate(grantedDate.getDate() - 35);
    const { ctx } = createUserContext({
      accessGrantedAt: grantedDate,
      accessDays: 30,
      accessExpiresAt: pastDate,
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.accessExpired).toBe(true);
  });

  it("includes accessExpired: false for admin even with expired dates", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const { ctx } = createAdminContext();
    // Override admin with expired dates
    (ctx.user as any).accessExpiresAt = pastDate;
    (ctx.user as any).accessDays = 30;
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.accessExpired).toBe(false);
  });

  it("does not include password in auth.me response", async () => {
    const { ctx } = createUserContext({ password: "hashed_secret_password" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect((result as any)?.password).toBeUndefined();
  });
});

describe("admin.grantAccess - access control", () => {
  it("admin can call grantAccess procedure", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.grantAccess({ userId: 999, days: 30 });
    } catch (e: any) {
      // DB errors are OK (no DB in test), but auth errors are not
      expect(e.code).not.toBe("FORBIDDEN");
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("regular user cannot call grantAccess", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.grantAccess({ userId: 999, days: 30 });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });

  it("rejects invalid days (0)", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.grantAccess({ userId: 999, days: 0 });
      expect(true).toBe(false);
    } catch (e: any) {
      // Should fail validation (min 1)
      expect(e.code).toBe("BAD_REQUEST");
    }
  });

  it("rejects invalid days (>365)", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.grantAccess({ userId: 999, days: 400 });
      expect(true).toBe(false);
    } catch (e: any) {
      // Should fail validation (max 365)
      expect(e.code).toBe("BAD_REQUEST");
    }
  });
});

describe("admin.updateAccessDays - access control", () => {
  it("admin can call updateAccessDays procedure", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.updateAccessDays({ userId: 999, days: 60 });
    } catch (e: any) {
      expect(e.code).not.toBe("FORBIDDEN");
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("regular user cannot call updateAccessDays", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.updateAccessDays({ userId: 999, days: 60 });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });
});

describe("admin.updateSetting - access control", () => {
  it("admin can call updateSetting", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.updateSetting({ key: "admin_whatsapp", value: "5511999999999" });
    } catch (e: any) {
      expect(e.code).not.toBe("FORBIDDEN");
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("regular user cannot call updateSetting", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.updateSetting({ key: "admin_whatsapp", value: "5511999999999" });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });
});
