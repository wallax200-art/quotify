import jsPDF from "jspdf";
import type { Product } from "./data";
import { formatCurrency } from "./data";

interface WarrantyPdfOptions {
  product: Product;
  storeName: string;
  logoBase64?: string | null;
  warrantyText: string;
  warrantyDays: number;
  customerName?: string;
  customerPhone?: string;
  sellerName?: string;
}

const DEFAULT_WARRANTY_TEXT = `Este termo garante que o produto adquirido está coberto contra defeitos de fabricação pelo período especificado acima, a contar da data de emissão deste documento.

A garantia cobre:
• Defeitos de fabricação
• Problemas de hardware não causados por mau uso
• Falhas no funcionamento normal do aparelho

A garantia NÃO cobre:
• Danos causados por queda, impacto ou pressão
• Danos causados por líquidos ou umidade
• Tentativa de reparo por terceiros não autorizados
• Uso indevido ou negligência
• Desgaste natural do produto (riscos, marcas de uso)
• Problemas de software ou atualizações do sistema

Condições gerais:
• O cliente deve apresentar este termo para acionar a garantia
• O prazo para análise técnica é de até 30 dias úteis
• A loja reserva-se o direito de reparar, substituir ou reembolsar o produto conforme análise técnica`;

export function getDefaultWarrantyText(): string {
  return DEFAULT_WARRANTY_TEXT;
}

export function generateWarrantyPdf(options: WarrantyPdfOptions): void {
  const {
    product,
    storeName,
    logoBase64,
    warrantyText,
    warrantyDays,
    customerName,
    customerPhone,
    sellerName,
  } = options;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ─── Cores ───
  const primaryColor: [number, number, number] = [30, 58, 138];
  const darkText: [number, number, number] = [31, 41, 55];
  const grayText: [number, number, number] = [107, 114, 128];
  const lightBg: [number, number, number] = [243, 244, 246];

  // ─── Header ───
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", margin, 8, 28, 28, undefined, "FAST");
    } catch {
      // Logo inválida
    }
  }

  const logoOffset = logoBase64 ? margin + 32 : margin;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(storeName || "Quotify", logoOffset, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TERMO DE GARANTIA", logoOffset, 30);

  // Número do termo
  const termoNum = `TG-${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(8);
  doc.text(`N.º ${termoNum}`, pageWidth - margin, 30, { align: "right" });

  y = 55;

  // ─── Informações do Produto ───
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "F");

  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO PRODUTO", margin + 5, y + 7);

  doc.setTextColor(...darkText);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(product.name, margin + 5, y + 16);

  const details: string[] = [];
  if (product.storage !== "-") details.push(product.storage);
  if (product.color) details.push(product.color);
  if (product.specs) details.push(product.specs);
  details.push(product.condition === "seminovo" ? "Seminovo" : "Lacrado");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayText);
  doc.text(details.join("  •  "), margin + 5, y + 24);

  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  doc.text(`Valor: ${formatCurrency(product.price)}`, margin + 5, y + 32);

  y += 46;

  // ─── Dados do Cliente e Garantia ───
  const dataEmissao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const dataVencimento = new Date(Date.now() + warrantyDays * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Grid de informações
  const colWidth = contentWidth / 2;

  doc.setFillColor(239, 246, 255); // azul claro
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");

  // Coluna esquerda
  doc.setTextColor(...grayText);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE", margin + 5, y + 7);
  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(customerName || "Não informado", margin + 5, y + 14);

  if (customerPhone) {
    doc.setTextColor(...grayText);
    doc.setFontSize(8);
    doc.text("TELEFONE", margin + 5, y + 21);
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.text(customerPhone, margin + 5, y + 28);
  }

  // Coluna direita
  doc.setTextColor(...grayText);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DATA DE EMISSÃO", margin + colWidth + 5, y + 7);
  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(dataEmissao, margin + colWidth + 5, y + 14);

  doc.setTextColor(...grayText);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("VÁLIDO ATÉ", margin + colWidth + 5, y + 21);
  doc.setTextColor(22, 101, 52); // verde
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${dataVencimento} (${warrantyDays} dias)`, margin + colWidth + 5, y + 28);

  y += 40;

  // ─── Vendedor ───
  if (sellerName) {
    doc.setTextColor(...grayText);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("VENDEDOR RESPONSÁVEL", margin, y + 4);
    doc.setTextColor(...darkText);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(sellerName, margin, y + 11);
    y += 16;
  }

  // ─── Texto da Garantia ───
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TERMOS E CONDIÇÕES", margin, y + 4);
  y += 10;

  doc.setTextColor(...darkText);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const textToUse = warrantyText || DEFAULT_WARRANTY_TEXT;
  const lines = textToUse.split("\n");

  for (const line of lines) {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("•")) {
      // Bullet point
      doc.setFont("helvetica", "normal");
      const splitLine = doc.splitTextToSize(trimmed, contentWidth - 8);
      doc.text(splitLine, margin + 4, y);
      y += splitLine.length * 4 + 1;
    } else if (trimmed.endsWith(":") && trimmed.length < 60) {
      // Subtítulo
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(trimmed, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...darkText);
      y += 5;
    } else if (trimmed === "") {
      y += 3;
    } else {
      // Parágrafo normal
      const splitLine = doc.splitTextToSize(trimmed, contentWidth);
      doc.text(splitLine, margin, y);
      y += splitLine.length * 4 + 1;
    }
  }

  y += 10;

  // ─── Assinaturas ───
  if (y > pageHeight - 45) {
    doc.addPage();
    y = margin + 10;
  }

  const signY = Math.max(y + 10, pageHeight - 40);

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);

  // Assinatura do cliente
  doc.line(margin, signY, margin + 70, signY);
  doc.setTextColor(...grayText);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura do Cliente", margin, signY + 5);

  // Assinatura da loja
  doc.line(pageWidth - margin - 70, signY, pageWidth - margin, signY);
  doc.text(`Assinatura - ${storeName || "Loja"}`, pageWidth - margin - 70, signY + 5);

  // ─── Rodapé ───
  const footerY = pageHeight - 8;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setTextColor(...grayText);
  doc.setFontSize(7);
  doc.text(`Termo de Garantia emitido por ${storeName || "Quotify"} em ${dataEmissao}`, margin, footerY);
  doc.text(`Ref: ${termoNum}`, pageWidth - margin, footerY, { align: "right" });

  // ─── Salvar ───
  const fileName = `Garantia_${product.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
