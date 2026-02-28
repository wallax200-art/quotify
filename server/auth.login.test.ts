import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

/**
 * Creates a mock context for testing login (no authenticated user).
 */
function createPublicContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      hostname: "localhost",
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies };
}

// Mock the db module to avoid real database calls
vi.mock("./db", () => ({
  loginUser: vi.fn(),
  seedAdminUser: vi.fn().mockResolvedValue(undefined),
  getSetting: vi.fn().mockResolvedValue(null),
  setSetting: vi.fn().mockResolvedValue(undefined),
  getAllSettings: vi.fn().mockResolvedValue([]),
  registerUser: vi.fn(),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateUserStatus: vi.fn(),
  updateUserRole: vi.fn(),
  updateUserProfile: vi.fn(),
}));

// Mock the sdk to avoid real JWT operations
vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-jwt-token-12345"),
    authenticateRequest: vi.fn().mockResolvedValue(null),
  },
}));

describe("auth.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success=true with token and user data on valid credentials", async () => {
    const { loginUser } = await import("./db");
    (loginUser as any).mockResolvedValue({
      success: true,
      user: {
        id: 1,
        openId: "email:test@example.com",
        name: "Test User",
        email: "test@example.com",
        role: "admin",
        status: "active",
        password: "$2a$12$hashedpassword",
      },
    });

    const { ctx, setCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: "test@example.com",
      password: "TestPassword123",
    });

    expect(result.success).toBe(true);
    // Verify token is returned in the response body
    expect(result).toHaveProperty("token");
    expect((result as any).token).toBe("mock-jwt-token-12345");
    // Verify user data is returned
    expect((result as any).user).toMatchObject({
      id: 1,
      name: "Test User",
      email: "test@example.com",
      role: "admin",
      status: "active",
    });
    // Verify cookie is also set
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
    expect(setCookies[0]?.value).toBe("mock-jwt-token-12345");
    expect(setCookies[0]?.options).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });

  it("returns success=false with error on invalid credentials", async () => {
    const { loginUser } = await import("./db");
    (loginUser as any).mockResolvedValue({
      success: false,
      error: "Email ou senha incorretos",
    });

    const { ctx, setCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: "wrong@example.com",
      password: "WrongPassword",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email ou senha incorretos");
    // No cookie should be set on failed login
    expect(setCookies).toHaveLength(0);
  });

  it("normalizes email to lowercase", async () => {
    const { loginUser } = await import("./db");
    (loginUser as any).mockResolvedValue({
      success: false,
      error: "Email ou senha incorretos",
    });

    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.auth.login({
      email: "Test@Example.COM",
      password: "password",
    });

    expect(loginUser).toHaveBeenCalledWith("test@example.com", "password");
  });

  it("rejects email with leading/trailing whitespace", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "  test@example.com  ",
        password: "password",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email format", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "not-an-email",
        password: "password",
      })
    ).rejects.toThrow();
  });

  it("rejects empty password", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "test@example.com",
        password: "",
      })
    ).rejects.toThrow();
  });
});
