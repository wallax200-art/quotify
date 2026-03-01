/**
 * Tests for store name in quote text generation (gerarOrcamentoTexto)
 * Verifies that the storeName parameter correctly replaces "Quotify" in the header
 */
import { describe, it, expect } from "vitest";

// We test the pure logic of gerarOrcamentoTexto by importing from client lib
// Since this is a pure function with no DOM dependencies, it works in vitest
import { gerarOrcamentoTexto, Product, InstallmentRate } from "../client/src/lib/data";

const mockProduct: Product = {
  id: "test-iphone-16",
  name: "iPhone 16 Pro Max",
  storage: "256GB",
  color: "Titânio Natural",
  price: 9499,
  condition: "novo",
  category: "iPhone 16 Pro Max",
  productCategory: "iPhones",
};

const mockRates: InstallmentRate[] = [
  { installments: 8, rate: 0.0963, label: "8x" },
  { installments: 10, rate: 0.1076, label: "10x" },
];

const closingText = "O que achou dessa proposta?";

describe("gerarOrcamentoTexto - storeName", () => {
  it("uses 'Quotify' as default when storeName is not provided", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText);
    expect(text).toContain("📱 Orçamento – Quotify");
  });

  it("uses 'Quotify' as default when storeName is undefined", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, undefined);
    expect(text).toContain("📱 Orçamento – Quotify");
  });

  it("uses 'Quotify' as default when storeName is empty string", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, "");
    expect(text).toContain("📱 Orçamento – Quotify");
  });

  it("uses 'Quotify' as default when storeName is only whitespace", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, "   ");
    expect(text).toContain("📱 Orçamento – Quotify");
  });

  it("uses custom store name when provided", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, "Tio Sam Imports");
    expect(text).toContain("📱 Orçamento – Tio Sam Imports");
    expect(text).not.toContain("Quotify");
  });

  it("trims whitespace from store name", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, "  Minha Loja  ");
    expect(text).toContain("📱 Orçamento – Minha Loja");
  });

  it("works with store name containing special characters", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, "Loja & Cia - Importados");
    expect(text).toContain("📱 Orçamento – Loja & Cia - Importados");
  });

  it("still includes product details when store name is custom", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, "Minha Loja");
    expect(text).toContain("📲 iPhone 16 Pro Max");
    expect(text).toContain("256GB");
    expect(text).toContain("Titânio Natural");
    expect(text).toContain("Lacrado");
    expect(text).toContain(closingText);
  });

  it("still includes installment rates when store name is custom", () => {
    const text = gerarOrcamentoTexto(mockProduct, null, 9499, mockRates, closingText, "Minha Loja");
    expect(text).toContain("💳 8x de");
    expect(text).toContain("💳 10x de");
  });
});
