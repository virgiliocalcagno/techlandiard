/* ═══════════════════════════════════════════════════════
   PDF GENERATOR — Techlandiard Professional Estimates
   White/light background — print-ready professional design
   Uses jsPDF + autoTable for branded document export
   ═══════════════════════════════════════════════════════ */

interface PDFItem {
  name: string;
  description: string;
  qty: number;
  rate: number;
  tax: number;
  unit: string;
}

interface PDFEstimateData {
  estimateNumber: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientCompany: string;
  headerNote: string;
  items: PDFItem[];
  subtotal: number;
  discountAmt: number;
  taxAmt: number;
  paypalFee: number;
  total: number;
  terms: { text: string }[];
  paymentMethod: "bank" | "paypal" | "none" | "both";
  bankInfo?: {
    bankName: string;
    accountNo: string;
    accountType: string;
    currency: string;
    swift: string;
    titular: string;
  } | null;
  paypalEmail?: string;
  locale: string;
}

// Professional print palette — white background, dark text, brand accents
const C = {
  white:      [255, 255, 255] as [number, number, number],
  black:      [20,  20,  20 ] as [number, number, number],
  bodyText:   [40,  40,  40 ] as [number, number, number],
  muted:      [110, 110, 110] as [number, number, number],
  light:      [245, 246, 248] as [number, number, number],   // row alt / box bg
  border:     [220, 220, 225] as [number, number, number],
  // Brand accents (from logo palette)
  cyan:       [0,   168, 216] as [number, number, number],   // #00a8d8
  blue:       [46,  59,  181] as [number, number, number],   // #2e3bb5
  magenta:    [232, 0,   122] as [number, number, number],   // #e8007a
  yellow:     [245, 200, 0  ] as [number, number, number],   // #f5c800
  green:      [34,  170, 100] as [number, number, number],   // positive amounts
};

export async function generateEstimatePDF(data: PDFEstimateData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF("p", "mm", "letter");
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const l = data.locale === "en" ? labels.en : labels.es;

  // ── WHITE PAGE BACKGROUND ──
  doc.setFillColor(...C.white);
  doc.rect(0, 0, pageW, pageH, "F");

  // ── HEADER: top cyan accent bar (thin) ──
  doc.setFillColor(...C.cyan);
  doc.rect(0, 0, pageW, 3, "F");

  // ── BRAND NAME + SUBTITLE ──
  doc.setTextColor(...C.blue);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("TECHLANDIARD", margin, 18);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text(l.subtitle, margin, 24);

  // ── ESTIMATE BADGE (right side) ──
  const badgeW = 60;
  const badgeX = pageW - margin - badgeW;
  doc.setFillColor(...C.blue);
  doc.roundedRect(badgeX, 8, badgeW, 20, 3, 3, "F");
  doc.setTextColor(...C.white);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(l.estimateLabel, badgeX + badgeW / 2, 16, { align: "center" });
  doc.setFontSize(11);
  doc.text(data.estimateNumber, badgeX + badgeW / 2, 24, { align: "center" });

  // ── SEPARATOR LINE (cyan) ──
  doc.setDrawColor(...C.cyan);
  doc.setLineWidth(0.6);
  doc.line(margin, 33, pageW - margin, 33);

  let y = 40;

  // ── CLIENT INFO BOX ──
  doc.setFillColor(...C.light);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, "FD");

  // Client (left)
  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(l.clientLabel, margin + 5, y + 7);

  doc.setTextColor(...C.bodyText);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.clientName, margin + 5, y + 15);

  doc.setTextColor(...C.muted);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(data.clientCompany || "", margin + 5, y + 22);

  // Date info (right)
  const rCol = pageW - margin - 55;
  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(l.dateLabel, rCol, y + 7);

  doc.setTextColor(...C.bodyText);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.date, rCol, y + 15);

  doc.setTextColor(...C.muted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`${l.validLabel}: ${data.validUntil}`, rCol, y + 22);

  y += 35;

  // ── HEADER NOTE ──
  if (data.headerNote) {
    doc.setFillColor(240, 248, 255);  // very light blue tint
    doc.setDrawColor(...C.cyan);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentW, 13, 2, 2, "FD");
    // Left cyan accent bar
    doc.setFillColor(...C.cyan);
    doc.rect(margin, y, 2.5, 13, "F");

    doc.setTextColor(...C.blue);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(data.headerNote, margin + 6, y + 8);
    y += 18;
  }

  // ── ITEMS TABLE ──
  const tableHeaders = [[
    l.itemCol, l.descCol, l.qtyCol, l.rateCol, l.taxCol, l.amountCol,
  ]];

  const tableRows = data.items.map((item, idx) => [
    `${idx + 1}. ${item.name}`,
    item.description || "—",
    `${item.qty} ${item.unit}`,
    `$${item.rate.toFixed(2)}`,
    `${item.tax}%`,
    `$${(item.qty * item.rate).toFixed(2)}`,
  ]);

  autoTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fillColor: C.white,
      textColor: C.bodyText,
      fontSize: 9,
      cellPadding: 4,
      lineColor: C.border,
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: C.blue,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: C.light,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── TOTALS BOX ──
  const totalsW = 88;
  const totalsX = pageW - margin - totalsW;
  const totalsH = data.discountAmt > 0 ? 58 : 48;

  doc.setFillColor(...C.light);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsX, y, totalsW, totalsH, 3, 3, "FD");

  let ty = y + 10;
  const labelX = totalsX + 8;
  const valueX = totalsX + totalsW - 8;

  // Subtotal row
  doc.setTextColor(...C.muted);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(l.subtotalLabel, labelX, ty);
  doc.setTextColor(...C.bodyText);
  doc.text(`$${data.subtotal.toFixed(2)}`, valueX, ty, { align: "right" });

  ty += 10;

  // Discount row
  if (data.discountAmt > 0) {
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "normal");
    doc.text(l.discountLabel, labelX, ty);
    doc.setTextColor(...C.magenta);
    doc.text(`-$${data.discountAmt.toFixed(2)}`, valueX, ty, { align: "right" });
    ty += 10;
  }

  // Tax row
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "normal");
  doc.text(l.taxLabel, labelX, ty);
  doc.setTextColor(...C.green);
  doc.text(`+$${data.taxAmt.toFixed(2)}`, valueX, ty, { align: "right" });

  if (data.paypalFee > 0) {
    ty += 10;
    doc.setTextColor(...C.muted);
    doc.text(l.paypalFeeLabel, labelX, ty);
    doc.setTextColor(...C.magenta);
    doc.text(`+$${data.paypalFee.toFixed(2)}`, valueX, ty, { align: "right" });
  }

  // Divider
  ty += 5;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.4);
  doc.line(totalsX + 5, ty, totalsX + totalsW - 5, ty);
  ty += 7;

  // Total row — highlighted
  doc.setFillColor(...C.cyan);
  doc.roundedRect(totalsX + 5, ty - 5, totalsW - 10, 12, 2, 2, "F");

  doc.setTextColor(...C.black);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", labelX, ty + 3.5);
  doc.text(`$${data.total.toFixed(2)}`, valueX, ty + 3.5, { align: "right" });

  y += totalsH + 10;

  // ── TERMS & CONDITIONS ──
  if (data.terms.length > 0) {
    doc.setTextColor(...C.blue);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(l.termsLabel, margin, y);
    y += 5;

    // Cyan underline
    doc.setDrawColor(...C.cyan);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + 50, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    data.terms.forEach((term) => {
      doc.text(`• ${term.text}`, margin + 2, y);
      y += 5;
    });
    y += 5;
  }

  // ── PAYMENT INFORMATION ──
  if (data.paymentMethod !== "none") {
    doc.setFillColor(...C.light);
    doc.setDrawColor(...C.border);
    doc.roundedRect(margin, y, 100, data.paymentMethod === "bank" ? 42 : 18, 2, 2, "FD");

    doc.setTextColor(...C.blue);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(l.paymentInfoLabel, margin + 5, y + 7);

    doc.setTextColor(...C.bodyText);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    
    if (data.paymentMethod === "bank" && data.bankInfo) {
      doc.text(`${l.bankLabel}: ${data.bankInfo.bankName}`, margin + 5, y + 15);
      doc.text(`${l.titularLabel}: ${data.bankInfo.titular}`, margin + 5, y + 20);
      doc.text(`${l.accountLabel}: ${data.bankInfo.accountNo}`, margin + 5, y + 25);
      doc.text(`${l.accountTypeLabel}: ${data.bankInfo.accountType}`, margin + 5, y + 30);
      doc.text(`${l.currencyLabel}: ${data.bankInfo.currency}`, margin + 5, y + 35);
      doc.text(`${l.swiftLabel}: ${data.bankInfo.swift}`, margin + 5, y + 40);
    } else if (data.paymentMethod === "paypal") {
      doc.text(`${l.paypalEmailLabel}: ${data.paypalEmail || "—"}`, margin + 5, y + 15);
    }
  }

  // ── FOOTER ──
  const footerY = pageH - 14;

  // Thin cyan line above footer
  doc.setDrawColor(...C.cyan);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 5, pageW - margin, footerY - 5);

  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TECHLANDIARD — Smart Domotics Solutions", margin, footerY);
  doc.text(l.generatedLabel, pageW - margin, footerY, { align: "right" });

  // Bottom cyan accent bar
  doc.setFillColor(...C.cyan);
  doc.rect(0, pageH - 3, pageW, 3, "F");

  // ── SAVE ──
  doc.save(`${data.estimateNumber}_${data.clientName.replace(/\s/g, "_")}.pdf`);
}

const labels = {
  es: {
    subtitle: "Soluciones Domóticas Inteligentes",
    estimateLabel: "ESTIMACIÓN",
    clientLabel: "CLIENTE",
    dateLabel: "FECHA",
    validLabel: "Válido hasta",
    itemCol: "PRODUCTO",
    descCol: "DESCRIPCIÓN",
    qtyCol: "CANT",
    rateCol: "PRECIO",
    taxCol: "IMP",
    amountCol: "MONTO",
    subtotalLabel: "Subtotal",
    discountLabel: "Descuento",
    taxLabel: "Impuesto",
    termsLabel: "TÉRMINOS Y CONDICIONES",
    paymentInfoLabel: "INFORMACIÓN DE PAGO",
    bankLabel: "Banco",
    titularLabel: "Titular",
    accountLabel: "Cuenta",
    accountTypeLabel: "Tipo de cuenta",
    currencyLabel: "Moneda",
    swiftLabel: "SWIFT/BIC",
    paypalEmailLabel: "Correo PayPal",
    paypalFeeLabel: "Comisión PayPal (5.7%)",
    generatedLabel: "Generado automáticamente por Techlandiard",
  },
  en: {
    subtitle: "Smart Domotics Solutions",
    estimateLabel: "ESTIMATE",
    clientLabel: "CLIENT",
    dateLabel: "DATE",
    validLabel: "Valid until",
    itemCol: "PRODUCT",
    descCol: "DESCRIPTION",
    qtyCol: "QTY",
    rateCol: "RATE",
    taxCol: "TAX",
    amountCol: "AMOUNT",
    subtotalLabel: "Subtotal",
    discountLabel: "Discount",
    taxLabel: "Tax",
    termsLabel: "TERMS & CONDITIONS",
    paymentInfoLabel: "PAYMENT INFORMATION",
    bankLabel: "Bank",
    titularLabel: "Account Holder",
    accountLabel: "Account",
    accountTypeLabel: "Account Type",
    currencyLabel: "Currency",
    swiftLabel: "SWIFT/BIC",
    paypalEmailLabel: "PayPal Email",
    paypalFeeLabel: "PayPal Fee (5.7%)",
    generatedLabel: "Auto-generated by Techlandiard",
  },
};
