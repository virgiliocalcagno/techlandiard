"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { COLLECTIONS, getDocument, updateDocument } from "@/lib/firestore";

const PAYPAL_FEE = 0.057; // 5.7%

interface LineItem {
  name: string;
  description?: string;
  qty: number;
  rate: number;
  tax: number;
  unit?: string;
}

interface BankInfo {
  bankName: string;
  accountNo: string;
  accountType: string;
  currency: string;
  swift: string;
  titular: string;
}

interface Estimate {
  id: string;
  estimateNumber: string;
  clientName: string;
  clientCompany?: string;
  date: string;
  validUntil: string;
  headerNote?: string;
  items: LineItem[];
  subtotal: number;
  discountAmt: number;
  taxAmt: number;
  total: number;
  paymentMethod: "bank" | "paypal" | "both" | "none";
  bankInfo?: BankInfo | null;
  paypalEmail?: string;
  terms?: { text: string }[];
  status: string;
}

export default function QuoteViewClient() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const isES = locale !== "en";

  useEffect(() => {
    getDocument<Estimate>(COLLECTIONS.ESTIMATES, id)
      .then((doc) => setEstimate(doc))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const paypalTotal = estimate ? +(estimate.total * (1 + PAYPAL_FEE)).toFixed(2) : 0;
  const paypalFeeAmt = estimate ? +(estimate.total * PAYPAL_FEE).toFixed(2) : 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Called when PayPal confirms the order
  const handlePaypalApprove = async (orderId: string) => {
    setPayStatus("processing");
    try {
      await updateDocument(COLLECTIONS.ESTIMATES, id, {
        status: "paid",
        paypalOrderId: orderId,
        paidAt: new Date().toISOString(),
      });
      setPayStatus("success");
      setEstimate((prev) => prev ? { ...prev, status: "paid" } : prev);
    } catch {
      setPayStatus("error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#c1fffe]/20 border-t-[#c1fffe] rounded-full animate-spin" />
        <p className="text-[#adaaaa] text-sm font-bold uppercase tracking-widest">
          {isES ? "Cargando cotización..." : "Loading quote..."}
        </p>
      </div>
    </div>
  );

  if (!estimate) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-[#ff7171] mb-4 block">error</span>
        <p className="text-white text-xl font-bold mb-2">
          {isES ? "Cotización no encontrada" : "Quote not found"}
        </p>
        <p className="text-[#adaaaa] text-sm">
          {isES ? "El enlace puede haber expirado." : "The link may have expired."}
        </p>
      </div>
    </div>
  );

  const showBank = estimate.paymentMethod === "bank" || estimate.paymentMethod === "both";
  const showPaypal = estimate.paymentMethod === "paypal" || estimate.paymentMethod === "both";
  const alreadyPaid = estimate.status === "paid";

  return (
    <PayPalScriptProvider options={{
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      currency: "USD",
    }}>
      <div className="min-h-screen bg-[#0e0e0e] text-white">

        {/* Top Bar */}
        <header className="fixed top-0 w-full z-50 bg-[#0e0e0e]/90 backdrop-blur-xl border-b border-[#484847]/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Techlandiard" width={32} height={32} className="rounded-lg object-contain" />
            <span className="text-[#00FFFF] font-bold tracking-wider text-sm font-[var(--font-headline)]">TECHLANDIARD</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] border border-[#484847]/40 rounded-lg px-3 py-1">
            {isES ? "Vista de Cotización" : "Quote View"}
          </span>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-6 max-w-3xl mx-auto">

          {/* Already paid banner */}
          {alreadyPaid && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-[#8eff71]/10 border border-[#8eff71]/20">
              <span className="material-symbols-outlined text-[#8eff71] icon-filled text-2xl">check_circle</span>
              <div>
                <p className="font-bold text-[#8eff71]">
                  {isES ? "¡Esta cotización ya fue pagada!" : "This quote has been paid!"}
                </p>
                <p className="text-xs text-[#adaaaa]">
                  {isES ? "El pago fue recibido y registrado exitosamente." : "Payment was received and recorded successfully."}
                </p>
              </div>
            </div>
          )}

          {/* Hero Card */}
          <div className="bg-[#131313] rounded-3xl border border-[#c1fffe]/10 p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mb-1">
                  {isES ? "Cotización" : "Estimate"}
                </p>
                <h1 className="text-3xl font-black font-[var(--font-headline)] text-[#c1fffe]">
                  {estimate.estimateNumber}
                </h1>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                alreadyPaid
                  ? "bg-[#8eff71]/10 text-[#8eff71] border border-[#8eff71]/20"
                  : "bg-[#6e9bff]/10 text-[#6e9bff] border border-[#6e9bff]/20"
              }`}>
                {alreadyPaid ? (isES ? "Pagada" : "Paid") : (isES ? "Pendiente" : "Pending")}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e0e0e] border border-[#484847]/10 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#c1fffe]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c1fffe] icon-filled">person</span>
              </div>
              <div>
                <p className="font-bold text-lg">{estimate.clientName}</p>
                {estimate.clientCompany && <p className="text-[#adaaaa] text-sm">{estimate.clientCompany}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0e0e0e] rounded-xl p-3 border border-[#484847]/10">
                <p className="text-[10px] text-[#767575] uppercase tracking-widest mb-1">{isES ? "Fecha" : "Date"}</p>
                <p className="font-bold text-sm">{estimate.date}</p>
              </div>
              <div className="bg-[#0e0e0e] rounded-xl p-3 border border-[#484847]/10">
                <p className="text-[10px] text-[#767575] uppercase tracking-widest mb-1">{isES ? "Válida hasta" : "Valid until"}</p>
                <p className="font-bold text-sm text-[#c1fffe]">{estimate.validUntil}</p>
              </div>
            </div>

            {estimate.headerNote && (
              <div className="flex gap-3 p-4 rounded-xl bg-[#6e9bff]/5 border border-[#6e9bff]/20">
                <span className="material-symbols-outlined text-[#6e9bff] text-base mt-0.5">info</span>
                <p className="text-sm text-[#adaaaa] italic">{estimate.headerNote}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-[#484847]/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c1fffe] text-base icon-filled">receipt_long</span>
              <h2 className="font-bold text-sm uppercase tracking-widest text-[#adaaaa]">
                {isES ? "Detalle de Servicios" : "Service Details"}
              </h2>
            </div>
            <div className="divide-y divide-[#484847]/10">
              {estimate.items.map((item, idx) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      <span className="text-[#767575] mr-2 text-xs">{idx + 1}.</span>
                      {item.name}
                    </p>
                    {item.description && <p className="text-xs text-[#adaaaa] mt-0.5 truncate">{item.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">${fmt(item.qty * item.rate)}</p>
                    <p className="text-[10px] text-[#767575]">{item.qty} {item.unit || "u"} × ${fmt(item.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#484847]/20 bg-[#0e0e0e]/50 px-6 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#adaaaa]">Subtotal</span>
                <span>${fmt(estimate.subtotal)}</span>
              </div>
              {estimate.discountAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#adaaaa]">{isES ? "Descuento" : "Discount"}</span>
                  <span className="text-[#ff7171]">-${fmt(estimate.discountAmt)}</span>
                </div>
              )}
              {estimate.taxAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#adaaaa]">{isES ? "Impuesto" : "Tax"}</span>
                  <span className="text-[#8eff71]">+${fmt(estimate.taxAmt)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-[#484847]/20">
                <span className="font-black uppercase tracking-wider text-sm">TOTAL</span>
                <span className="text-2xl font-black text-[#c1fffe]">USD {fmt(estimate.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {(showBank || showPaypal) && !alreadyPaid && (
            <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-[#484847]/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8eff71] text-base icon-filled">payments</span>
                <h2 className="font-bold text-sm uppercase tracking-widest text-[#adaaaa]">
                  {isES ? "Métodos de Pago" : "Payment Methods"}
                </h2>
              </div>
              <div className="p-6 space-y-4">

                {/* Bank Transfer */}
                {showBank && estimate.bankInfo && (
                  <div className="rounded-2xl border border-[#6e9bff]/20 bg-[#6e9bff]/5 overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#6e9bff]/10 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#6e9bff] icon-filled">account_balance</span>
                      <div>
                        <p className="font-bold text-sm">{isES ? "Transferencia Bancaria" : "Bank Transfer"}</p>
                        <p className="text-[10px] text-[#adaaaa]">{isES ? "Local o internacional" : "Local or international"}</p>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      {[
                        { label: isES ? "Banco" : "Bank", value: estimate.bankInfo.bankName },
                        { label: isES ? "Titular" : "Account Holder", value: estimate.bankInfo.titular },
                        { label: isES ? "N° de Cuenta" : "Account No.", value: estimate.bankInfo.accountNo },
                        { label: isES ? "Tipo" : "Type", value: estimate.bankInfo.accountType },
                        { label: "SWIFT / BIC", value: estimate.bankInfo.swift },
                        { label: isES ? "Moneda" : "Currency", value: estimate.bankInfo.currency },
                      ].filter(r => r.value).map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-xs text-[#767575] uppercase tracking-wider">{row.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-medium">{row.value}</span>
                            <button
                              type="button"
                              onClick={() => copy(row.value, row.label)}
                              className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                              <span className="material-symbols-outlined text-[11px] text-[#adaaaa]">
                                {copied === row.label ? "check" : "content_copy"}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 pt-3 border-t border-[#6e9bff]/10 flex items-center justify-between">
                        <span className="text-xs text-[#767575] uppercase tracking-wider">
                          {isES ? "Monto exacto" : "Exact amount"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#c1fffe]">USD {fmt(estimate.total)}</span>
                          <button onClick={() => copy(estimate.total.toFixed(2), "amount")}
                            className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[11px] text-[#adaaaa]">
                              {copied === "amount" ? "check" : "content_copy"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Smart Buttons */}
                {showPaypal && (
                  <div className="rounded-2xl border border-[#003087]/40 bg-[#003087]/10 overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#003087]/20 flex items-center gap-3">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#009cde]">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.433-8.558 6.433H9.828l-1.126 7.136h4.127l.597-3.784h1.946c4.016 0 6.962-2.02 7.85-6.498z"/>
                      </svg>
                      <div>
                        <p className="font-bold text-sm text-[#009cde]">PayPal</p>
                        <p className="text-[10px] text-[#adaaaa]">{isES ? "Pago seguro directo" : "Secure direct payment"}</p>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      {/* Fee breakdown */}
                      <div className="bg-[#003087]/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[#009cde] text-base mt-0.5">info</span>
                        <div className="text-xs text-[#adaaaa]">
                          <p className="font-bold text-[#009cde] mb-0.5">
                            {isES ? "Cargo por procesamiento: 5.7%" : "Processing fee: 5.7%"}
                          </p>
                          <p>{isES
                            ? `Se agregan USD ${fmt(paypalFeeAmt)} al total por el procesamiento de PayPal.`
                            : `USD ${fmt(paypalFeeAmt)} added to cover PayPal processing fees.`}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-[#adaaaa]">{isES ? "Cotización" : "Quote total"}</span>
                        <span>USD {fmt(estimate.total)}</span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-[#adaaaa]">+ {isES ? "Cargo PayPal" : "PayPal fee"} (5.7%)</span>
                        <span className="text-[#ffd140]">+USD {fmt(paypalFeeAmt)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-y border-[#003087]/20 mb-4">
                        <span className="font-black text-sm">{isES ? "Total a cobrar" : "Total charged"}</span>
                        <span className="text-xl font-black text-[#009cde]">USD {fmt(paypalTotal)}</span>
                      </div>

                      {/* PayPal status messages */}
                      {payStatus === "processing" && (
                        <div className="flex items-center justify-center gap-2 py-3 text-[#adaaaa] text-sm">
                          <div className="w-4 h-4 border-2 border-[#009cde]/40 border-t-[#009cde] rounded-full animate-spin" />
                          {isES ? "Procesando pago..." : "Processing payment..."}
                        </div>
                      )}
                      {payStatus === "success" && (
                        <div className="flex items-center justify-center gap-2 py-3 text-[#8eff71] text-sm font-bold">
                          <span className="material-symbols-outlined icon-filled">check_circle</span>
                          {isES ? "¡Pago completado con éxito!" : "Payment completed successfully!"}
                        </div>
                      )}
                      {payStatus === "error" && (
                        <div className="text-center py-3 text-[#ff7171] text-xs">
                          {isES ? "Error al registrar el pago. Por favor contáctenos." : "Error recording payment. Please contact us."}
                        </div>
                      )}

                      {/* Smart Buttons — server-side order creation */}
                      {payStatus === "idle" && (
                        <PayPalButtons
                          style={{ layout: "vertical", color: "blue", shape: "pill", label: "pay" }}
                          createOrder={async () => {
                            // Order created on the server — amount & secret never exposed to browser
                            const res = await fetch("/api/paypal/create-order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                amount: paypalTotal.toFixed(2),
                                estimateNumber: estimate.estimateNumber,
                                estimateId: estimate.id,
                              }),
                            });
                            const { orderId, error } = await res.json();
                            if (error || !orderId) throw new Error(error ?? "No orderId returned");
                            return orderId;
                          }}
                          onApprove={async (data) => {
                            // Capture also happens on the server
                            const res = await fetch("/api/paypal/capture-order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ orderId: data.orderID }),
                            });
                            const result = await res.json();
                            if (result.status === "COMPLETED") {
                              await handlePaypalApprove(data.orderID);
                            } else {
                              setPayStatus("error");
                            }
                          }}
                          onError={(err) => {
                            console.error("PayPal error:", err);
                            setPayStatus("error");
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Terms */}
          {estimate.terms && estimate.terms.length > 0 && (
            <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 p-6 mb-6">
              <h2 className="font-bold text-xs uppercase tracking-widest text-[#adaaaa] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">gavel</span>
                {isES ? "Términos y Condiciones" : "Terms & Conditions"}
              </h2>
              <ul className="space-y-2">
                {estimate.terms.map((term, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#adaaaa]">
                    <span className="text-[#c1fffe] mt-0.5 flex-shrink-0">•</span>
                    {term.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-6">
            <p className="text-[#484847] text-xs">
              {isES ? "Generado por" : "Powered by"}{" "}
              <span className="text-[#c1fffe] font-bold">TECHLANDIARD</span>
              {" — "}
              {isES ? "Soluciones Domóticas Inteligentes" : "Smart Domotics Solutions"}
            </p>
          </div>

        </main>
      </div>
    </PayPalScriptProvider>
  );
}
