import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@quotify.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    status: "active",
    storeName: "Quotify HQ",
    phone: "5511999999999",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@quotify.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    status: "active",
    storeName: "Loja Teste",
    phone: "5511888888888",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Regular User");
    expect(result?.role).toBe("user");
    expect(result?.status).toBe("active");
  });

  it("returns admin data for admin users", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.role).toBe("admin");
  });
});

describe("admin routes - access control", () => {
  it("admin can access listUsers", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    // This will try to hit the DB, but we're testing that the middleware doesn't block
    // In a real test, we'd mock the DB. Here we just verify no FORBIDDEN error.
    try {
      await caller.admin.listUsers();
    } catch (e: any) {
      // DB errors are OK (no DB in test), but FORBIDDEN is not
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("regular user cannot access admin routes", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.listUsers();
      // Should not reach here
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });

  it("unauthenticated user cannot access admin routes", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.listUsers();
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });
});

describe("settings.getPublic", () => {
  it("returns public settings for unauthenticated users", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.settings.getPublic();
      // Should return default value if DB not available
      expect(result).toBeDefined();
      expect(result.adminWhatsapp).toBeDefined();
    } catch (e: any) {
      // DB errors are OK in test environment
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("admin.deleteUser - access control", () => {
  it("admin can call deleteUser procedure", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.deleteUser({ userId: 999 });
    } catch (e: any) {
      // DB errors are OK (user not found), but FORBIDDEN is not
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("regular user cannot call deleteUser", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.deleteUser({ userId: 999 });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });

  it("unauthenticated user cannot call deleteUser", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.deleteUser({ userId: 999 });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });
});

describe("admin.exportContacts - access control", () => {
  it("admin can call exportContacts", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.admin.exportContacts();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      // DB errors OK, but FORBIDDEN is not
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("regular user cannot call exportContacts", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.exportContacts();
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("FORBIDDEN");
    }
  });
});

describe("profile.update - access control", () => {
  it("authenticated user can update profile", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.profile.update({ name: "New Name", storeName: "New Store" });
    } catch (e: any) {
      // DB errors OK, but auth errors are not
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("unauthenticated user cannot update profile", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.profile.update({ name: "Hacker" });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.code).toBe("UNAUTHORIZED");
    }
  });
});
