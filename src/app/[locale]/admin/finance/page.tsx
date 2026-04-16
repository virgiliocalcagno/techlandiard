import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

interface Props {
  params: Promise<{ locale: string }>;
}

const t = {
  es: {
    title: "Dashboard Financiero",
    sub: "Resumen de ingresos, facturas y flujo de caja en tiempo real.",
    newInvoice: "Nueva Factura",
    kpis: [
      { label: "Ingresos del Mes", value: "$0.00", change: "Sin datos", up: true, icon: "trending_up", color: "#c1fffe" },
      { label: "Facturas Pendientes", value: "0", change: "$0.00 en espera", up: false, icon: "pending_actions", color: "#6e9bff" },
      { label: "Facturas Pagadas", value: "0", change: "este mes", up: true, icon: "task_alt", color: "#8eff71" },
      { label: "Facturas Vencidas", value: "0", change: "$0.00 en riesgo", up: false, icon: "warning", color: "#ff716c" },
    ],
    recentInvoices: "Facturas Recientes",
    viewAll: "Ver todas",
    invoices: [],
    cashflow: "Flujo de Caja — Últimos 6 meses",
    months: ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr"],
    income: [0, 0, 0, 0, 0, 0],
    expenses: [0, 0, 0, 0, 0, 0],
    incomeLabel: "Ingresos",
    expenseLabel: "Gastos",
    topClients: "Top Clientes",
    clients: [],
  },
  en: {
    title: "Finance Dashboard",
    sub: "Real-time summary of revenue, invoices and cash flow.",
    newInvoice: "New Invoice",
    kpis: [
      { label: "Monthly Revenue", value: "$0.00", change: "No data", up: true, icon: "trending_up", color: "#c1fffe" },
      { label: "Pending Invoices", value: "0", change: "$0.00 waiting", up: false, icon: "pending_actions", color: "#6e9bff" },
      { label: "Paid Invoices", value: "0", change: "this month", up: true, icon: "task_alt", color: "#8eff71" },
      { label: "Overdue Invoices", value: "0", change: "$0.00 at risk", up: false, icon: "warning", color: "#ff716c" },
    ],
    recentInvoices: "Recent Invoices",
    viewAll: "View all",
    invoices: [],
    cashflow: "Cash Flow — Last 6 months",
    months: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
    income: [0, 0, 0, 0, 0, 0],
    expenses: [0, 0, 0, 0, 0, 0],
    incomeLabel: "Revenue",
    expenseLabel: "Expenses",
    topClients: "Top Clients",
    clients: [],
  },
};

export default async function FinancePage({ params }: Props) {
  const { locale } = await params;
  const txt = locale === "en" ? t.en : t.es;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title={locale === "es" ? "Domótica Pro" : "Domotics Pro"} />
      <AppSidebar locale={locale} />

      <main className="md:ml-72 pt-24 pb-32 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="font-[var(--font-headline)] text-4xl md:text-5xl font-bold tracking-tighter mb-2">{txt.title}</h2>
            <p className="text-[#adaaaa]">{txt.sub}</p>
          </div>
          <Link
            href={`/${locale}/admin/invoices/new`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c1fffe] text-[#006767] font-[var(--font-headline)] font-bold text-sm uppercase tracking-tight hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base icon-filled">add_circle</span>
            {txt.newInvoice}
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {txt.kpis.map((kpi) => (
            <div key={kpi.label} className="bg-[#131313] rounded-xl p-5 border border-[#484847]/10 hover:border-[#484847]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa] leading-tight max-w-[120px]">{kpi.label}</p>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "1a" }}>
                  <span className="material-symbols-outlined text-lg icon-filled" style={{ color: kpi.color }}>{kpi.icon}</span>
                </div>
              </div>
              <p className="font-[var(--font-headline)] text-3xl font-black mb-1" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs text-[#adaaaa]">{kpi.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cashflow chart */}
          <div className="lg:col-span-7 bg-[#131313] rounded-xl p-6 border border-[#484847]/10">
            <h3 className="font-[var(--font-headline)] font-bold mb-6">{txt.cashflow}</h3>
            <div className="flex items-end gap-2 h-40 mb-3">
              {txt.months.map((month, i) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-32">
                    <div
                      className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${txt.income[i]}%`, backgroundColor: "#c1fffe" + "66" }}
                    />
                    <div
                      className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${txt.expenses[i]}%`, backgroundColor: "#6e9bff" + "55" }}
                    />
                  </div>
                  <span className="text-[9px] text-[#adaaaa] font-[var(--font-label)] uppercase tracking-wider">{month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#c1fffe" + "66" }} />
                <span className="text-xs text-[#adaaaa]">{txt.incomeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#6e9bff" + "55" }} />
                <span className="text-xs text-[#adaaaa]">{txt.expenseLabel}</span>
              </div>
            </div>
          </div>

          {/* Top clients */}
          <div className="lg:col-span-5 bg-[#131313] rounded-xl p-6 border border-[#484847]/10">
            <h3 className="font-[var(--font-headline)] font-bold mb-6">{txt.topClients}</h3>
            <div className="space-y-5">
              {txt.clients.map((c, i) => (
                <div key={c.name}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-medium truncate max-w-[160px]">{c.name}</span>
                    <span className="text-sm font-[var(--font-headline)] font-bold text-[#c1fffe] ml-2">{c.amount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.pct}%`,
                        backgroundColor: i === 0 ? "#c1fffe" : i === 1 ? "#6e9bff" : i === 2 ? "#8eff71" : "#484847",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent invoices */}
        <div className="mt-8 bg-[#131313] rounded-xl border border-[#484847]/10 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#484847]/10">
            <h3 className="font-[var(--font-headline)] font-bold">{txt.recentInvoices}</h3>
            <Link href={`/${locale}/admin/invoices`} className="text-sm text-[#c1fffe] hover:underline">{txt.viewAll}</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {txt.invoices.map((inv, i) => (
                  <tr key={inv.id} className={`hover:bg-[#1a1a1a] transition-colors ${i < txt.invoices.length - 1 ? "border-b border-[#484847]/5" : ""}`}>
                    <td className="px-6 py-3.5 font-mono text-sm text-[#c1fffe] whitespace-nowrap">{inv.id}</td>
                    <td className="px-6 py-3.5 text-sm font-medium">{inv.client}</td>
                    <td className="px-6 py-3.5 text-sm font-[var(--font-headline)] font-bold whitespace-nowrap">{inv.amount}</td>
                    <td className="px-6 py-3.5 text-sm text-[#adaaaa] whitespace-nowrap">{inv.date}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-[var(--font-label)] uppercase tracking-wider whitespace-nowrap" style={{ backgroundColor: inv.color + "1a", color: inv.color }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <Link href={`/${locale}/admin/invoices/new`} className="p-1.5 rounded-lg hover:bg-[#262626] transition-colors text-[#adaaaa] hover:text-white inline-flex">
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                      </Link>
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
