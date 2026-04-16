import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

interface Props {
  params: Promise<{ locale: string }>;
}

const t = {
  es: {
    title: "Resumen Operativo",
    sub: "Monitoreo en tiempo real de la infraestructura comercial y flujo de inventario inteligente.",
    sync: "Sincronización Activa",
    monthlySales: "Ventas Mensuales",
    salesVal: "$0.00",
    stockVelocity: "Velocidad de Stock",
    newQuote: "Nueva Cotización",
    newQuoteSub: "Generar presupuesto instantáneo",
    criticalStock: "Stock Crítico",
    viewAll: "Ver Inventario Completo",
    recentActivity: "Actividad Reciente",
    satisfaction: "Satisfacción Cliente",
    items: [],
    activities: [],
  },
  en: {
    title: "Operational Summary",
    sub: "Real-time monitoring of commercial infrastructure and smart inventory flow.",
    sync: "Active Sync",
    monthlySales: "Monthly Sales",
    salesVal: "$0.00",
    stockVelocity: "Stock Velocity",
    newQuote: "New Quote",
    newQuoteSub: "Generate instant estimate",
    criticalStock: "Critical Stock",
    viewAll: "View Full Inventory",
    recentActivity: "Recent Activity",
    satisfaction: "Customer Satisfaction",
    items: [],
    activities: [],
  },
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const txt = locale === "en" ? t.en : t.es;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title={locale === "es" ? "Domótica Pro" : "Domotics Pro"} />
      <AppSidebar locale={locale} />

      <main className="md:ml-72 pt-24 pb-32 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8">
            <h2 className="font-[var(--font-headline)] text-5xl md:text-6xl font-bold tracking-tight mb-2">{txt.title}</h2>
            <p className="text-[#adaaaa] max-w-xl text-lg">{txt.sub}</p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#484847]/10 primary-glow flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-[#8eff71] animate-pulse"></div>
              <span className="text-sm font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa]">{txt.sync}</span>
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {/* Sales card */}
          <div className="md:col-span-2 bg-[#1a1a1a] rounded-xl p-8 border border-[#484847]/10 flex flex-col justify-between group hover:bg-[#2c2c2c] transition-all">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[#adaaaa] font-[var(--font-label)] text-xs uppercase tracking-[0.1em] mb-1">{txt.monthlySales}</p>
                <h3 className="text-4xl font-[var(--font-headline)] font-bold text-[#c1fffe]">{txt.salesVal}</h3>
              </div>
              <span className="material-symbols-outlined text-[#8eff71] bg-[#8eff71]/10 p-2 rounded-lg">trending_up</span>
            </div>
            <div className="h-24 w-full flex items-end gap-1">
              {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-all bg-[#c1fffe]/20 group-hover:bg-[#c1fffe]/40`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Stock velocity */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#484847]/10 flex flex-col">
            <p className="text-[#adaaaa] font-[var(--font-label)] text-xs uppercase tracking-[0.1em] mb-6">{txt.stockVelocity}</p>
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="#262626" strokeWidth="8" />
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="#6e9bff" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="100" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-[var(--font-headline)] font-bold">0%</span>
                <span className="text-[10px] text-[#adaaaa] uppercase">{locale === "es" ? "Pendiente" : "Pending"}</span>
              </div>
            </div>
            <p className="text-xs text-[#adaaaa] flex justify-between mt-auto">
              <span>{locale === "es" ? "Eficiencia" : "Efficiency"}</span>
              <span className="text-[#6e9bff] font-bold">--</span>
            </p>
          </div>

          {/* Quick action */}
          <Link
            href={`/${locale}/quote`}
            className="bg-[#00ffff] rounded-xl p-6 border border-[#c1fffe]/20 flex flex-col justify-center items-center text-center group cursor-pointer active:scale-95 transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]"
          >
            <div className="w-14 h-14 rounded-full bg-[#005d5d]/20 flex items-center justify-center mb-4 group-hover:bg-[#005d5d]/30">
              <span className="material-symbols-outlined text-[#006767] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            </div>
            <h4 className="text-[#006767] font-[var(--font-headline)] font-bold text-lg">{txt.newQuote}</h4>
            <p className="text-[#006767]/70 text-sm mt-1">{txt.newQuoteSub}</p>
          </Link>
        </div>

        {/* Inventory + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 bg-[#131313] rounded-2xl p-8 border border-[#484847]/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-[var(--font-headline)] text-xl font-bold">{txt.criticalStock}</h3>
              <button className="text-[#c1fffe] text-sm font-[var(--font-label)] uppercase tracking-widest hover:underline">{txt.viewAll}</button>
            </div>
            <div className="space-y-8">
              {txt.items.map((item) => (
                <div key={item.sku} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg border border-[#484847]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#adaaaa]" style={{ fontVariationSettings: "'FILL' 1" }}>devices</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{item.name}</h5>
                        <p className="text-xs text-[#adaaaa] uppercase tracking-tighter">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.status}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#484847]/10 flex-1">
              <h3 className="font-[var(--font-headline)] text-lg font-bold mb-6">{txt.recentActivity}</h3>
              <div className="space-y-4">
                {txt.activities.map((act) => (
                  <div key={act.title} className="flex gap-4 p-3 rounded-lg hover:bg-[#2c2c2c] transition-colors cursor-default">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: act.color + "1a" }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: act.color }}>{act.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium truncate">{act.title}</p>
                        <span className="text-[10px] text-[#adaaaa] uppercase whitespace-nowrap">{act.time}</span>
                      </div>
                      <p className="text-xs text-[#adaaaa] truncate">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#262626]/40 backdrop-blur-md rounded-2xl p-6 border border-[#484847]/10 flex items-center justify-between">
              <div>
                <p className="text-[#adaaaa] text-[10px] uppercase tracking-widest mb-1">{txt.satisfaction}</p>
                <h4 className="text-2xl font-[var(--font-headline)] font-bold">-- / 5.0</h4>
              </div>
              <div className="flex -space-x-2">
                {["#c1fffe", "#6e9bff", "#8eff71", "#ff716c"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0e0e0e] flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: c + "33", borderColor: "#0e0e0e" }}>
                    <span className="material-symbols-outlined text-base" style={{ color: c }}>person</span>
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#0e0e0e] bg-[#262626] flex items-center justify-center text-[10px] font-bold text-[#adaaaa]">0</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <Link
        href={`/${locale}/quote`}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 primary-gradient text-[#006767] rounded-xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]"
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </Link>

      <BottomNav locale={locale} variant="admin" />
    </div>
  );
}
