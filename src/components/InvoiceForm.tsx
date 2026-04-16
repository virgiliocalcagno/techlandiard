"use client";

import { useState, useCallback } from "react";

interface LineItem {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
}

interface Props {
  locale: string;
}

const labels = {
  es: {
    from: "De (Empresa Emisora)",
    to: "Para (Cliente)",
    invoiceNum: "N° Factura",
    invoiceDate: "Fecha Emisión",
    dueDate: "Fecha Vencimiento",
    fromName: "Techlandiard S.A. de C.V.",
    fromAddress: "Av. Innovación 220, CDMX",
    fromEmail: "facturacion@techlandiard.com",
    fromPhone: "+52 55 1234 5678",
    clientName: "Nombre del Cliente",
    clientCompany: "Empresa del Cliente",
    clientAddress: "Dirección del Cliente",
    clientEmail: "correo@cliente.com",
    description: "Descripción",
    qty: "Cant.",
    unitPrice: "Precio Unit.",
    total: "Total",
    addLine: "Agregar Línea",
    notes: "Notas / Condiciones de Pago",
    notesPlaceholder: "Ej: Pago a 30 días. Transferencia bancaria o cheque certificado.",
    subtotal: "Subtotal",
    discount: "Descuento",
    tax: "IVA (16%)",
    grandTotal: "TOTAL",
    print: "Imprimir / PDF",
    save: "Guardar Borrador",
    newInvoice: "Nueva Factura",
    currency: "MXN",
    taxRate: 0.16,
  },
  en: {
    from: "From (Issuer)",
    to: "To (Client)",
    invoiceNum: "Invoice #",
    invoiceDate: "Issue Date",
    dueDate: "Due Date",
    fromName: "Techlandiard Corp.",
    fromAddress: "Innovation Ave 220, Mexico City",
    fromEmail: "billing@techlandiard.com",
    fromPhone: "+52 55 1234 5678",
    clientName: "Client Name",
    clientCompany: "Client Company",
    clientAddress: "Client Address",
    clientEmail: "client@company.com",
    description: "Description",
    qty: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    addLine: "Add Line",
    notes: "Notes / Payment Terms",
    notesPlaceholder: "E.g.: Net 30. Bank transfer or certified check.",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax (16%)",
    grandTotal: "TOTAL",
    print: "Print / PDF",
    save: "Save Draft",
    newInvoice: "New Invoice",
    currency: "USD",
    taxRate: 0.16,
  },
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let nextId = 4;

export default function InvoiceForm({ locale }: Props) {
  const l = locale === "en" ? labels.en : labels.es;

  const [invoiceNum, setInvoiceNum] = useState(locale === "es" ? "FAC-2024-090" : "INV-2024-090");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: locale === "es" ? "Hub de Iluminación Neon-Core" : "Neon-Core Lighting Hub", qty: 1, unitPrice: 499 },
    { id: 2, description: locale === "es" ? "Instalación y Configuración" : "Installation & Configuration", qty: 1, unitPrice: 850 },
    { id: 3, description: locale === "es" ? "Soporte Técnico 12 meses" : "12-Month Technical Support", qty: 1, unitPrice: 360 },
  ]);

  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const addLine = useCallback(() => {
    setItems((prev) => [...prev, { id: nextId++, description: "", qty: 1, unitPrice: 0 }]);
  }, []);

  const removeLine = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateLine = useCallback((id: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxBase = subtotal - discountAmt;
  const taxAmt = taxBase * l.taxRate;
  const total = taxBase + taxAmt;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* Print-only header */}
      <div className="hidden print:block print:mb-8">
        <div className="flex justify-between items-start border-b-2 border-[#c1fffe] pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tighter">TECHLANDIARD</h1>
            <p className="text-sm text-gray-600">{l.fromAddress}</p>
            <p className="text-sm text-gray-600">{l.fromEmail}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-black">{locale === "es" ? "FACTURA" : "INVOICE"}</h2>
            <p className="font-mono text-lg text-teal-700">#{invoiceNum}</p>
          </div>
        </div>
      </div>

      {/* Screen toolbar — hidden on print */}
      <div className="print:hidden sticky top-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-[#484847]/20 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#c1fffe] icon-filled">receipt_long</span>
          <span className="font-[var(--font-headline)] font-bold text-[#c1fffe]">
            {locale === "es" ? "Nueva Factura" : "New Invoice"}
          </span>
          <span className="font-mono text-[#adaaaa] text-sm ml-2">#{invoiceNum}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#484847]/30 text-[#adaaaa] hover:text-white hover:border-[#484847]/60 transition-all text-sm font-[var(--font-headline)] font-bold uppercase tracking-tight">
            <span className="material-symbols-outlined text-base">save</span>
            {l.save}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#c1fffe] text-[#006767] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all text-sm font-[var(--font-headline)] font-black uppercase tracking-tight active:scale-95"
          >
            <span className="material-symbols-outlined text-base icon-filled">print</span>
            {l.print}
          </button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:px-0 print:py-0">
        <div className="bg-[#131313] print:bg-white rounded-2xl border border-[#484847]/10 print:border-0 overflow-hidden">

          {/* Invoice header */}
          <div className="p-8 print:p-0 bg-gradient-to-br from-[#1a1a1a] to-[#131313] print:bg-white border-b border-[#484847]/10 print:border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* From */}
              <div>
                <p className="text-[10px] font-[var(--font-label)] uppercase tracking-[0.2em] text-[#adaaaa] print:text-gray-400 mb-3">{l.from}</p>
                <div className="space-y-1">
                  <p className="font-[var(--font-headline)] font-bold text-[#c1fffe] print:text-teal-700 text-lg">{l.fromName}</p>
                  <p className="text-sm text-[#adaaaa] print:text-gray-600">{l.fromAddress}</p>
                  <p className="text-sm text-[#adaaaa] print:text-gray-600">{l.fromEmail}</p>
                  <p className="text-sm text-[#adaaaa] print:text-gray-600">{l.fromPhone}</p>
                </div>
              </div>
              {/* Invoice meta */}
              <div className="flex flex-col items-start md:items-end gap-4">
                <div className="text-right">
                  <p className="font-[var(--font-headline)] text-3xl font-black text-white print:text-black uppercase tracking-tight">
                    {locale === "es" ? "FACTURA" : "INVOICE"}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className="text-[#adaaaa] print:text-gray-400 text-sm">#</span>
                    <input
                      value={invoiceNum}
                      onChange={(e) => setInvoiceNum(e.target.value)}
                      className="bg-transparent text-[#c1fffe] print:text-teal-700 font-mono font-bold text-lg text-right outline-none border-b border-transparent focus:border-[#c1fffe]/50 w-36 print:pointer-events-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] print:text-gray-400 mb-1">{l.invoiceDate}</p>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="bg-[#0e0e0e] print:bg-transparent border border-[#484847]/30 print:border-0 rounded-lg px-3 py-1.5 text-white print:text-black outline-none focus:ring-1 focus:ring-[#c1fffe] text-sm print:pointer-events-none"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] print:text-gray-400 mb-1">{l.dueDate}</p>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-[#0e0e0e] print:bg-transparent border border-[#484847]/30 print:border-0 rounded-lg px-3 py-1.5 text-white print:text-black outline-none focus:ring-1 focus:ring-[#c1fffe] text-sm print:pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill to */}
          <div className="p-8 print:p-0 print:mt-6 border-b border-[#484847]/10 print:border-gray-200">
            <p className="text-[10px] font-[var(--font-label)] uppercase tracking-[0.2em] text-[#adaaaa] print:text-gray-400 mb-4">{l.to}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { val: clientName, set: setClientName, placeholder: l.clientName },
                { val: clientCompany, set: setClientCompany, placeholder: l.clientCompany },
                { val: clientAddress, set: setClientAddress, placeholder: l.clientAddress },
                { val: clientEmail, set: setClientEmail, placeholder: l.clientEmail },
              ].map((field, i) => (
                <input
                  key={i}
                  type={i === 3 ? "email" : "text"}
                  value={field.val}
                  onChange={(e) => field.set(e.target.value)}
                  placeholder={field.placeholder}
                  className="bg-[#0e0e0e] print:bg-transparent border border-[#484847]/20 print:border-0 print:border-b print:border-gray-200 rounded-lg px-4 py-2.5 text-white print:text-black placeholder:text-[#484847] focus:ring-1 focus:ring-[#c1fffe] outline-none text-sm transition-all print:rounded-none print:px-0"
                />
              ))}
            </div>
          </div>

          {/* Line items */}
          <div className="p-8 print:p-0 print:mt-6">
            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-[#484847]/20 print:border-gray-200">
                  <th className="text-left pb-3 text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] print:text-gray-400">{l.description}</th>
                  <th className="text-center pb-3 text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] print:text-gray-400 w-20">{l.qty}</th>
                  <th className="text-right pb-3 text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] print:text-gray-400 w-32">{l.unitPrice}</th>
                  <th className="text-right pb-3 text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] print:text-gray-400 w-32">{l.total}</th>
                  <th className="print:hidden w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#484847]/10 print:divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-3 pr-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLine(item.id, "description", e.target.value)}
                        placeholder={l.description}
                        className="w-full bg-transparent border-b border-transparent focus:border-[#c1fffe]/50 outline-none text-sm text-white print:text-black placeholder:text-[#484847] py-1 transition-all print:pointer-events-none"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateLine(item.id, "qty", parseFloat(e.target.value) || 0)}
                        min={1}
                        className="w-16 bg-transparent border-b border-transparent focus:border-[#c1fffe]/50 outline-none text-sm text-white print:text-black text-center py-1 transition-all print:pointer-events-none"
                      />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLine(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        className="w-28 bg-transparent border-b border-transparent focus:border-[#c1fffe]/50 outline-none text-sm text-white print:text-black text-right py-1 transition-all print:pointer-events-none"
                      />
                    </td>
                    <td className="py-3 pl-2 text-right text-sm font-[var(--font-headline)] font-bold text-[#c1fffe] print:text-teal-700 whitespace-nowrap">
                      ${fmt(item.qty * item.unitPrice)}
                    </td>
                    <td className="py-3 pl-2 print:hidden">
                      <button
                        onClick={() => removeLine(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#ff716c]/20 text-[#484847] hover:text-[#ff716c] transition-all"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add line button */}
            <button
              onClick={addLine}
              className="print:hidden flex items-center gap-2 text-sm text-[#adaaaa] hover:text-[#c1fffe] border border-dashed border-[#484847]/30 hover:border-[#c1fffe]/30 rounded-lg px-4 py-2 transition-all mb-8"
            >
              <span className="material-symbols-outlined text-base">add</span>
              {l.addLine}
            </button>

            {/* Totals + notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Notes */}
              <div>
                <p className="text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] print:text-gray-400 mb-2">{l.notes}</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={l.notesPlaceholder}
                  rows={4}
                  className="w-full bg-[#0e0e0e] print:bg-transparent border border-[#484847]/20 print:border-gray-200 rounded-lg px-4 py-3 text-sm text-white print:text-black placeholder:text-[#484847] focus:ring-1 focus:ring-[#c1fffe] outline-none resize-none print:pointer-events-none"
                />
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#adaaaa] print:text-gray-500">{l.subtotal}</span>
                  <span className="font-mono text-sm">${fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#adaaaa] print:text-gray-500">{l.discount}</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      min={0}
                      max={100}
                      className="w-14 bg-[#0e0e0e] print:bg-transparent border border-[#484847]/20 print:border-0 rounded px-2 py-0.5 text-xs text-center text-white print:text-black outline-none focus:ring-1 focus:ring-[#c1fffe] print:pointer-events-none"
                    />
                    <span className="text-sm text-[#adaaaa]">%</span>
                  </div>
                  <span className="font-mono text-sm text-[#ff716c]">-${fmt(discountAmt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#adaaaa] print:text-gray-500">{l.tax}</span>
                  <span className="font-mono text-sm">${fmt(taxAmt)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-[#c1fffe]/30 print:border-teal-700">
                  <span className="font-[var(--font-headline)] font-black text-lg">{l.grandTotal}</span>
                  <span className="font-[var(--font-headline)] font-black text-2xl text-[#c1fffe] print:text-teal-700">
                    ${fmt(total)} <span className="text-xs font-normal text-[#adaaaa] print:text-gray-400">{l.currency}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-[#0e0e0e] print:bg-white border-t border-[#484847]/10 print:border-gray-100 flex justify-between items-center">
            <p className="text-[10px] text-[#484847] print:text-gray-400 font-[var(--font-label)] uppercase tracking-widest">
              {locale === "es" ? "Techlandiard — Domótica Inteligente" : "Techlandiard — Smart Domotics"}
            </p>
            <p className="text-[10px] text-[#484847] print:text-gray-400 font-mono">#{invoiceNum}</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
