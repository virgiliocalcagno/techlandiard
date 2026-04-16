import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";
import QuotesDashboard from "@/components/QuotesDashboard";

interface Props {
  params: Promise<{ locale: string }>;
}

const t = {
  es: {
    title: "Gestión de Estimaciones",
    sub: "Administra, rastrea y convierte tus cotizaciones activas con el nuevo visor inteligente.",
    newQuote: "Nueva Cotización",
    search: "Buscar cotización, cliente o ID...",
    all: "Todas",
    pending: "Pendientes",
    approved: "Aprobadas",
    rejected: "Rechazadas",
    quotes: [],
    cols: ["ID / Versión", "Cliente", "Monto", "Fecha", "Estado", "Acciones"],
    view: "Ver Visor",
    edit: "Editar",
  },
  en: {
    title: "Quote Management",
    sub: "Manage, track and convert your active quotes with the new smart viewer.",
    newQuote: "New Quote",
    search: "Search quote, client or ID...",
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    quotes: [],
    cols: ["ID / Version", "Client", "Amount", "Date", "Status", "Actions"],
    view: "Open Viewer",
    edit: "Edit",
  },
};

export default async function AdminQuotesPage({ params }: Props) {
  const { locale } = await params;
  const txt = locale === "en" ? t.en : t.es;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title={locale === "es" ? "Domótica Pro" : "Domotics Pro"} />
      <AppSidebar locale={locale} />

      <main className="md:ml-72 pt-24 pb-32 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#8eff71] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#8eff71] uppercase tracking-[0.3em]">Live Management</span>
            </div>
            <h2 className="font-[var(--font-headline)] text-4xl md:text-5xl font-bold tracking-tighter mb-2">{txt.title}</h2>
            <p className="text-[#adaaaa] text-sm max-w-md">{txt.sub}</p>
          </div>
          <Link
            href={`/${locale}/admin/quotes/new`}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#c1fffe] text-[#006767] font-[var(--font-headline)] font-black text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all active:scale-95 whitespace-nowrap primary-glow"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {txt.newQuote}
          </Link>
        </div>

        <QuotesDashboard locale={locale} t={txt} />
      </main>

      <BottomNav locale={locale} variant="admin" />
    </div>
  );
}
