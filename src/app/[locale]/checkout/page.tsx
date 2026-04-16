import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

interface Props {
  params: Promise<{ locale: string }>;
}

const t = {
  es: {
    headline: "Confirmar Pedido",
    sub: "Revisa tu configuración antes de continuar.",
    summary: "Resumen del Pedido",
    items: [
      { name: "Iluminación Inteligente", zone: "Sala de Estar", price: "$2,450.00" },
      { name: "Motor de Medios", zone: "Sala de Estar", price: "$8,900.00" },
    ],
    subtotal: "Subtotal",
    tax: "IVA (16%)",
    total: "Total",
    subtotalVal: "$11,350.00",
    taxVal: "$1,816.00",
    totalVal: "$13,166.00",
    payment: "Método de Pago",
    card: "Tarjeta de Crédito/Débito",
    transfer: "Transferencia Bancaria",
    cash: "Pago en Efectivo",
    name: "Nombre en la Tarjeta",
    cardNum: "Número de Tarjeta",
    expiry: "Vencimiento",
    cvv: "CVV",
    confirm: "Confirmar y Procesar",
    back: "Volver al Cotizador",
    namePlaceholder: "Juan García",
    cardPlaceholder: "0000 0000 0000 0000",
    expiryPlaceholder: "MM/AA",
    installments: "Financiamiento disponible hasta 12 meses sin intereses",
  },
  en: {
    headline: "Confirm Order",
    sub: "Review your configuration before continuing.",
    summary: "Order Summary",
    items: [
      { name: "Smart Lighting", zone: "Living Room", price: "$2,450.00" },
      { name: "Media Engine", zone: "Living Room", price: "$8,900.00" },
    ],
    subtotal: "Subtotal",
    tax: "Tax (16%)",
    total: "Total",
    subtotalVal: "$11,350.00",
    taxVal: "$1,816.00",
    totalVal: "$13,166.00",
    payment: "Payment Method",
    card: "Credit / Debit Card",
    transfer: "Bank Transfer",
    cash: "Cash Payment",
    name: "Name on Card",
    cardNum: "Card Number",
    expiry: "Expiry",
    cvv: "CVV",
    confirm: "Confirm & Process",
    back: "Back to Quote",
    namePlaceholder: "John Smith",
    cardPlaceholder: "0000 0000 0000 0000",
    expiryPlaceholder: "MM/YY",
    installments: "Financing available up to 12 months interest-free",
  },
};

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const txt = locale === "en" ? t.en : t.es;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title="Techlandiard" />

      <main className="pt-24 pb-32 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="mb-10">
          <Link href={`/${locale}/quote`} className="flex items-center gap-2 text-[#adaaaa] hover:text-[#c1fffe] transition-colors text-sm mb-6">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {txt.back}
          </Link>
          <h2 className="font-[var(--font-headline)] text-4xl md:text-5xl font-bold tracking-tighter mb-2">{txt.headline}</h2>
          <p className="text-[#adaaaa]">{txt.sub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Payment form */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-[var(--font-headline)] font-bold text-lg uppercase tracking-wider">{txt.payment}</h3>

            {/* Payment methods */}
            <div className="grid grid-cols-3 gap-3">
              {[{ icon: "credit_card", label: txt.card, active: true }, { icon: "account_balance", label: txt.transfer, active: false }, { icon: "payments", label: txt.cash, active: false }].map((m) => (
                <button
                  key={m.label}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${m.active ? "border-[#c1fffe]/40 bg-[#c1fffe]/5 text-[#c1fffe]" : "border-[#484847]/20 bg-[#131313] text-[#adaaaa] hover:border-[#484847]/40"}`}
                >
                  <span className="material-symbols-outlined" style={m.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{m.icon}</span>
                  <span className="text-[10px] font-[var(--font-label)] uppercase tracking-wider text-center leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Card form */}
            <div className="bg-[#131313] rounded-xl p-6 border border-[#484847]/10 space-y-4">
              <div>
                <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa] mb-2">{txt.name}</label>
                <input
                  type="text"
                  placeholder={txt.namePlaceholder}
                  className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#767575] focus:ring-1 focus:ring-[#c1fffe] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa] mb-2">{txt.cardNum}</label>
                <input
                  type="text"
                  placeholder={txt.cardPlaceholder}
                  className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#767575] focus:ring-1 focus:ring-[#c1fffe] outline-none transition-all font-mono tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa] mb-2">{txt.expiry}</label>
                  <input
                    type="text"
                    placeholder={txt.expiryPlaceholder}
                    className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#767575] focus:ring-1 focus:ring-[#c1fffe] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa] mb-2">{txt.cvv}</label>
                  <input
                    type="text"
                    placeholder="•••"
                    className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg py-3 px-4 text-white placeholder:text-[#767575] focus:ring-1 focus:ring-[#c1fffe] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#adaaaa] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8eff71] text-base">verified_user</span>
              {txt.installments}
            </p>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#131313] rounded-xl p-6 border border-[#484847]/10 sticky top-28">
              <h3 className="font-[var(--font-headline)] font-bold text-lg uppercase tracking-wider mb-6">{txt.summary}</h3>

              <div className="space-y-4 mb-6">
                {txt.items.map((item) => (
                  <div key={item.name} className="flex justify-between items-start pb-4 border-b border-[#484847]/10">
                    <div>
                      <p className="font-[var(--font-headline)] font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-[#adaaaa]">{item.zone}</p>
                    </div>
                    <span className="text-[#c1fffe] font-bold">{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: txt.subtotal, val: txt.subtotalVal, dim: true },
                  { label: txt.tax, val: txt.taxVal, dim: true },
                  { label: txt.total, val: txt.totalVal, dim: false },
                ].map((row) => (
                  <div key={row.label} className={`flex justify-between ${!row.dim ? "pt-3 border-t border-[#484847]/20" : ""}`}>
                    <span className={`text-sm ${row.dim ? "text-[#adaaaa]" : "font-bold text-lg font-[var(--font-headline)]"}`}>{row.label}</span>
                    <span className={`font-bold ${!row.dim ? "text-[#c1fffe] text-xl font-[var(--font-headline)]" : ""}`}>{row.val}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#c1fffe] to-[#00ffff] text-[#006767] font-[var(--font-headline)] font-black text-sm uppercase tracking-tight shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] active:scale-95 transition-all">
                {txt.confirm}
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav locale={locale} variant="client" />
    </div>
  );
}
