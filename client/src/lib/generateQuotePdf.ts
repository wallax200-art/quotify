import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type Product, type InstallmentRate, calcularParcela, formatCurrency } from "./data";
import type { UpgradeProduct } from "./data";

interface QuotePdfOptions {
  product: Product;
  upgrade: UpgradeProduct | null;
  amountToPay: number;
  rates: InstallmentRate[];
  closingText: string;
  storeName: string;
  logoBase64?: string | null;
  deductions?: { label: string; value: number }[];
  customerName?: string;
}

export function generateQuotePdf(options: QuotePdfOptions): void {
  const {
    product,
    upgrade,
    amountToPay,
    rates,
    closingText,
    storeName,
    logoBase64,
    deductions,
    customerName,
  } = options;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ─── Cores ───
  const primaryColor: [number, number, number] = [30, 58, 138]; // azul escuro
  const accentColor: [number, number, number] = [59, 130, 246]; // azul
  const darkText: [number, number, number] = [31, 41, 55];
  const grayText: [number, number, number] = [107, 114, 128];
  const lightBg: [number, number, number] = [243, 244, 246];

  // ─── Header com fundo ───
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", margin, 8, 28, 28, undefined, "FAST");
    } catch {
      // Logo inválida, ignora
    }
  }

  // Nome da loja
  const logoOffset = logoBase64 ? margin + 32 : margin;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(storeName || "Quotify", logoOffset, 22);

  // Subtítulo
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("ORÇAMENTO", logoOffset, 30);

  // Data
  const dataStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(9);
  doc.text(dataStr, pageWidth - margin, 30, { align: "right" });

  y = 55;

  // ─── Cliente (se informado) ───
  if (customerName) {
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.text("Cliente:", margin, y);
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.text(customerName, margin + 18, y);
    y += 10;
  }

  // ─── Produto Principal ───
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");

  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PRODUTO", margin + 5, y + 7);

  doc.setTextColor(...darkText);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(product.name, margin + 5, y + 16);

  // Detalhes do produto
  const details: string[] = [];
  if (product.storage !== "-") details.push(product.storage);
  if (product.color) details.push(product.color);
  if (product.specs) details.push(product.specs);
  details.push(product.condition === "seminovo" ? "Seminovo" : "Lacrado");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayText);
  doc.text(details.join("  •  "), margin + 5, y + 24);

  // Preço à direita
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(product.price), pageWidth - margin - 5, y + 18, { align: "right" });

  y += 40;

  // ─── Upgrade / Trade-in ───
  if (upgrade) {
    doc.setFillColor(236, 253, 245); // verde claro
    doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");

    doc.setTextColor(22, 101, 52); // verde escuro
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("APARELHO DADO COMO PARTE DE PAGAMENTO", margin + 5, y + 7);

    doc.setFontSize(12);
    doc.text(`${upgrade.name} ${upgrade.storage}`, margin + 5, y + 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Valor de avaliação: ${formatCurrency(upgrade.tradeInValue)}`, margin + 5, y + 23);

    y += 34;

    // Deduções (se houver)
    if (deductions && deductions.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...grayText);
      doc.text("DEDUÇÕES APLICADAS:", margin, y + 4);
      y += 8;

      for (const ded of deductions) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...darkText);
        doc.text(`• ${ded.label}`, margin + 3, y + 4);
        doc.setTextColor(220, 38, 38); // vermelho
        doc.text(`-${formatCurrency(ded.value)}`, pageWidth - margin, y + 4, { align: "right" });
        y += 6;
      }
      y += 4;
    }
  }

  // ─── Valor Final ───
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(upgrade ? "VALOR FINAL APÓS AVALIAÇÃO" : "VALOR À VISTA NO PIX", margin + 5, y + 9);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(amountToPay), pageWidth - margin - 5, y + 16, { align: "right" });

  y += 30;

  // ─── Tabela de Parcelamento ───
  if (rates.length > 0) {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("OPÇÕES DE PARCELAMENTO", margin, y + 4);
    y += 8;

    const tableData = rates.map((rate) => {
      const parcela = calcularParcela(amountToPay, rate.rate, rate.installments);
      const total = parcela * rate.installments;
      return [
        `${rate.installments}x`,
        formatCurrency(parcela),
        formatCurrency(total),
        rate.rate > 0 ? `${(rate.rate * 100).toFixed(1)}%` : "Sem juros",
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["Parcelas", "Valor da Parcela", "Total", "Taxa"]],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: darkText,
        lineColor: [229, 231, 235],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      theme: "grid",
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── Texto de Fechamento ───
  if (closingText) {
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin, y + 20);

    doc.setTextColor(...grayText);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const splitText = doc.splitTextToSize(closingText, contentWidth - 8);
    doc.text(splitText, margin + 4, y + 5);
    y += splitText.length * 4 + 10;
  }

  // ─── Rodapé ───
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setTextColor(...grayText);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Orçamento gerado por ${storeName || "Quotify"} em ${dataStr}`, margin, footerY);
  doc.text("Valores sujeitos a alteração sem aviso prévio", pageWidth - margin, footerY, { align: "right" });

  // ─── Salvar ───
  const fileName = `Orcamento_${product.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
