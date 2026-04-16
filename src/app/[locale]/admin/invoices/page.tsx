import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

interface Props {
  params: Promise<{ locale: string }>;
}

const t = {
  es: {
    title: "Facturas",
    sub: "Gestiona y rastrea todas tus facturas emitidas.",
    new: "Nueva Factura",
    search: "Buscar factura, cliente...",
    filters: ["Todas", "Pagadas", "Pendientes", "Vencidas"],
    cols: ["Factura", "Cliente", "Emisión", "Vencimiento", "Monto", "Estado", ""],
    invoices: [],
    view: "Ver",
    duplicate: "Duplicar",
    markPaid: "Marcar Pagada",
    total: "Total emitido",
    totalVal: "$0.00",
    pending: "Por cobrar",
    pendingVal: "$0.00",
    overdue: "Vencidas",
    overdueVal: "$0.00",
  },
  en: {
    title: "Invoices",
    sub: "Manage and track all your issued invoices.",
    new: "New Invoice",
    search: "Search invoice, client...",
    filters: ["All", "Paid", "Pending", "Overdue"],
    cols: ["Invoice", "Client", "Issued", "Due", "Amount", "Status", ""],
    invoices: [],
    view: "View",
    duplicate: "Duplicate",
    markPaid: "Mark Paid",
    total: "Total issued",
    totalVal: "$0.00",
    pending: "Receivable",
    pendingVal: "$0.00",
    overdue: "Overdue",
    overdueVal: "$0.00",
  },
};

export default async function InvoicesPage({ params }: Props) {
  const { locale } = await params;
  const txt = locale === "en" ? t.en : t.es;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title={locale === "es" ? "Domótica Pro" : "Domotics Pro"} />
      <AppSidebar locale={locale} />

      <main className="md:ml-72 pt-24 pb-32 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="font-[var(--font-headline)] text-4xl md:text-5xl font-bold tracking-tighter mb-2">{txt.title}</h2>
            <p className="text-[#adaaaa]">{txt.sub}</p>
          </div>
          <Link
            href={`/${locale}/admin/invoices/new`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c1fffe] text-[#006767] font-[var(--font-headline)] font-bold text-sm uppercase tracking-tight hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base icon-filled">add_circle</span>
            {txt.new}
          </Link>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: txt.total, val: txt.totalVal, color: "#c1fffe" },
            { label: txt.pending, val: txt.pendingVal, color: "#6e9bff" },
            { label: txt.overdue, val: txt.overdueVal, color: "#ff716c" },
          ].map((s) => (
            <div key={s.label} className="bg-[#131313] rounded-xl px-5 py-4 border border-[#484847]/10 flex flex-col gap-1">
              <span className="text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa]">{s.label}</span>
              <span className="font-[var(--font-headline)] text-xl font-bold" style={{ color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder={txt.search}
              className="w-full bg-[#131313] border border-[#484847]/20 rounded-xl py-3 px-12 text-white placeholder:text-[#767575] focus:ring-1 focus:ring-[#c1fffe] outline-none text-sm"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767575]">search</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {txt.filters.map((f, i) => (
              <button
                key={f}
                className={`px-4 py-2.5 rounded-xl text-xs font-[var(--font-label)] uppercase tracking-wider transition-all ${
                  i === 0
                    ? "bg-[#c1fffe]/10 border border-[#c1fffe]/30 text-[#c1fffe]"
                    : "bg-[#131313] border border-[#484847]/10 text-[#adaaaa] hover:text-white hover:border-[#484847]/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#131313] rounded-xl border border-[#484847]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#484847]/10">
                  {txt.cols.map((col) => (
                    <th key={col} className="text-left px-6 py-4 text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#767575] whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txt.invoices.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-[#1a1a1a] transition-colors group ${i < txt.invoices.length - 1 ? "border-b border-[#484847]/5" : ""}`}
                  >
                    <td className="px-6 py-4 font-mono text-sm text-[#c1fffe] whitespace-nowrap">{inv.id}</td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{inv.client}</td>
                    <td className="px-6 py-4 text-sm text-[#adaaaa] whitespace-nowrap">{inv.issued}</td>
                    <td className="px-6 py-4 text-sm text-[#adaaaa] whitespace-nowrap">{inv.due}</td>
                    <td className="px-6 py-4 text-sm font-[var(--font-headline)] font-bold whitespace-nowrap">{inv.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-[var(--font-label)] uppercase tracking-wider"
                        style={{ backgroundColor: inv.color + "1a", color: inv.color }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/${locale}/admin/invoices/new`}
                          className="p-1.5 rounded-lg hover:bg-[#262626] transition-colors text-[#adaaaa] hover:text-[#c1fffe]"
                          title={txt.view}
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-[#262626] transition-colors text-[#adaaaa] hover:text-white" title={txt.duplicate}>
                          <span className="material-symbols-outlined text-base">content_copy</span>
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[#262626] transition-colors text-[#adaaaa] hover:text-[#8eff71]" title={txt.markPaid}>
                          <span className="material-symbols-outlined text-base">check_circle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomNav locale={locale} variant="admin" />
    </div>
  );
}
