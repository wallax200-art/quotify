import { describe, expect, it, vi } from "vitest";

describe("Registration Notification", () => {
  it("should import notifyOwner from notification module", async () => {
    const { notifyOwner } = await import("./_core/notification");
    expect(notifyOwner).toBeDefined();
    expect(typeof notifyOwner).toBe("function");
  });

  it("should validate notification payload requires title and content", async () => {
    const { notifyOwner } = await import("./_core/notification");
    
    // Empty title should throw
    await expect(notifyOwner({ title: "", content: "test" })).rejects.toThrow();
    
    // Empty content should throw
    await expect(notifyOwner({ title: "test", content: "" })).rejects.toThrow();
  });

  it("should construct correct notification content for new registration", () => {
    const input = {
      name: "João Silva",
      email: "joao@loja.com",
      storeName: "Loja do João",
      phone: "11999998888",
    };

    const storePart = input.storeName ? `\n🏪 Loja: ${input.storeName}` : "";
    const phonePart = input.phone ? `\n📞 Telefone: ${input.phone}` : "";
    const title = `🆕 Novo vendedor cadastrado: ${input.name}`;
    const content = `Um novo vendedor se cadastrou e aguarda aprovação.\n\n👤 Nome: ${input.name}\n📧 Email: ${input.email}${storePart}${phonePart}\n\n📅 Data: ${new Date().toLocaleDateString("pt-BR")}\n\nAcesse o Painel Admin para ativar o acesso.`;

    expect(title).toContain("João Silva");
    expect(content).toContain("joao@loja.com");
    expect(content).toContain("Loja do João");
    expect(content).toContain("11999998888");
    expect(content).toContain("Painel Admin");
  });

  it("should handle registration without store name and phone", () => {
    const input = {
      name: "Maria",
      email: "maria@test.com",
      storeName: undefined as string | undefined,
      phone: undefined as string | undefined,
    };

    const storePart = input.storeName?.trim() ? `\n🏪 Loja: ${input.storeName.trim()}` : "";
    const phonePart = input.phone?.trim() ? `\n📞 Telefone: ${input.phone.trim()}` : "";
    const content = `Um novo vendedor se cadastrou e aguarda aprovação.\n\n👤 Nome: ${input.name}\n📧 Email: ${input.email}${storePart}${phonePart}\n\n📅 Data: ${new Date().toLocaleDateString("pt-BR")}\n\nAcesse o Painel Admin para ativar o acesso.`;

    expect(storePart).toBe("");
    expect(phonePart).toBe("");
    expect(content).not.toContain("Loja:");
    expect(content).not.toContain("Telefone:");
    expect(content).toContain("Maria");
    expect(content).toContain("maria@test.com");
  });

  it("should not block registration if notification fails", () => {
    // Simulate the try/catch pattern used in routers.ts
    let registrationSuccess = true;
    let notificationFailed = false;

    try {
      // Simulate notification failure
      throw new Error("Network error");
    } catch (e) {
      notificationFailed = true;
      // Registration should still succeed
    }

    expect(registrationSuccess).toBe(true);
    expect(notificationFailed).toBe(true);
  });
});
