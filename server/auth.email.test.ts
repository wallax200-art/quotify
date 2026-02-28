import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./db";

describe("Email/Password Auth", () => {
  it("should hash and verify passwords correctly", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await verifyPassword("WrongPassword", hash);
    expect(isInvalid).toBe(false);
  });

  it("should have ADMIN_EMAIL env var set", () => {
    expect(process.env.ADMIN_EMAIL).toBeDefined();
    expect(process.env.ADMIN_EMAIL).toContain("@");
  });

  it("should have ADMIN_PASSWORD env var set", () => {
    expect(process.env.ADMIN_PASSWORD).toBeDefined();
    expect(process.env.ADMIN_PASSWORD!.length).toBeGreaterThan(0);
  });

  it("should have ADMIN_NAME env var set", () => {
    expect(process.env.ADMIN_NAME).toBeDefined();
    expect(process.env.ADMIN_NAME!.length).toBeGreaterThan(0);
  });
});
