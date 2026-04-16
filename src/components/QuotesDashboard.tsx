"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { COLLECTIONS, getDocuments } from "@/lib/firestore";

interface Quote {
  id: string; // This is estimateNumber
  dbId: string; // This is firestore document id
  client: string;
  email?: string;
  phone?: string;
  amount: string;
  date: string;
  status: string;
  statusColor: string;
}

interface QuoteItem {
  id: string;
  client: string;
  amount: string;
  date: string;
  status: string;
  statusColor: string;
}

interface Translations {
  search: string;
  all: string;
  approved: string;
  pending: string;
  rejected: string;
  cols: string[];
  edit: string;
  quotes: QuoteItem[];
}

interface Props {
  locale: string;
  t: Translations;
}

export default function QuotesDashboard({ locale, t }: Props) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>(t.quotes || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const estimates = await getDocuments(COLLECTIONS.ESTIMATES, undefined, { field: "createdAt", direction: "desc" });
        if (estimates && estimates.length > 0) {
          const mappedQuotes: Quote[] = estimates.map((est: Record<string, unknown>) => {
            const estStatus = est.status as string | undefined;
            let statusColor = "#adaaaa"; // draft
            let displayStatus = locale === "es" ? "Borrador" : "Draft";

            if (estStatus === "sent" || estStatus === "pending") {
              statusColor = "#c1fffe";
              displayStatus = locale === "es" ? "Pendiente" : "Pending";
            } else if (estStatus === "approved") {
              statusColor = "#8eff71";
              displayStatus = locale === "es" ? "Aprobado" : "Approved";
            } else if (estStatus === "rejected") {
              statusColor = "#ff7171";
              displayStatus = locale === "es" ? "Rechazado" : "Rejected";
            }

            const total = typeof est.total === "number" ? est.total : 0;
            const formatted = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            return {
              id: String(est.estimateNumber || ""),
              dbId: String(est.id || ""),
              client: String(est.clientName || (locale === "es" ? "Cliente General" : "General Client")),
              email: est.clientEmail as string || "",
              phone: est.clientPhone as string || "",
              amount: `$${formatted}`,
              date: String(est.date || ""),
              status: displayStatus,
              statusColor,
            };
          });
          setQuotes(mappedQuotes);
        }
      } catch (err) {
        console.error("Error loading estimates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [locale]);

  const filteredQuotes = quotes.filter((q: Quote) => {
    const matchesSearch = q.client.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filter !== "all") {
      const qStatus = q.status.toLowerCase();
      if (filter === "pending") {
        matchesFilter = qStatus === "pendiente" || qStatus === "pending" || qStatus === "borrador" || qStatus === "draft";
      } else if (filter === "approved") {
        matchesFilter = qStatus === "aprobado" || qStatus === "approved";
      } else if (filter === "rejected") {
        matchesFilter = qStatus === "rechazado" || qStatus === "rejected";
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculate dynamic stats
  const totalAmount = quotes.reduce((acc, q) => acc + parseFloat(q.amount.replace(/[^0-9.-]+/g,"")), 0);
  const pendingCount = quotes.filter(q => q.status.toLowerCase() === "pendiente" || q.status.toLowerCase() === "pending" || q.status.toLowerCase() === "borrador" || q.status.toLowerCase() === "draft").length;
  const approvedCount = quotes.filter(q => q.status.toLowerCase() === "aprobado" || q.status.toLowerCase() === "approved").length;
  const convRate = quotes.length > 0 ? Math.round((approvedCount / quotes.length) * 100) : 0;

  const handleShareWhatsApp = () => {
    if (!selectedQuote) return;
    const viewLink = selectedQuote.dbId
      ? `${window.location.origin}/${locale}/quote/${selectedQuote.dbId}`
      : "";
    const lines = [
      `Estimado/a *${selectedQuote.client}*,`,
      ``,
      `Le comparto la cotización *${selectedQuote.id}* de *Techlandiard*.`,
      ``,
      `📋 *Ver cotización completa y métodos de pago:*`,
      viewLink,
      ``,
      `*Total:* ${selectedQuote.amount}`,
      `*Fecha:* ${selectedQuote.date}`,
      ``,
      `Quedamos a su disposición.`,
      `— Equipo Techlandiard`,
    ];
    const msg = encodeURIComponent(lines.join("\n"));
    const phone = selectedQuote.phone?.replace(/\D/g, "");
    window.open(`https://wa.me/${phone || ""}?text=${msg}`, "_blank");
  };

  const handleShareEmail = () => {
    if (!selectedQuote) return;
    const viewLink = selectedQuote.dbId
      ? `${window.location.origin}/${locale}/quote/${selectedQuote.dbId}`
      : "";
    const subject = encodeURIComponent(`Cotización ${selectedQuote.id} - Techlandiard`);
    const body = encodeURIComponent(
      `Estimado/a ${selectedQuote.client},\n\nAdjunto el enlace a su cotización ${selectedQuote.id}.\n\nVer cotización y opciones de pago: ${viewLink}\n\nTotal: ${selectedQuote.amount}\nFecha: ${selectedQuote.date}\n\nSaludos cordiales,\nEquipo Techlandiard`
    );
    window.location.href = `mailto:${selectedQuote.email || ""}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: locale === "es" ? "Total Estimado" : "Total Estimated", val: `$${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}`, color: "#c1fffe", icon: "analytics" },
          { label: locale === "es" ? "Pendientes" : "Pending", val: pendingCount.toString(), color: "#6e9bff", icon: "pending_actions" },
          { label: locale === "es" ? "Tasa Conversión" : "Conv. Rate", val: `${convRate}%`, color: "#8eff71", icon: "insights" },
          { label: locale === "es" ? "Proyectos" : "Projects", val: quotes.length.toString(), color: "#c1fffe", icon: "folder_open" },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl p-5 border border-[#484847]/10 flex flex-col gap-2 primary-glow">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">{s.label}</span>
              <span className="material-symbols-outlined text-sm" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <span className="font-[var(--font-headline)] text-2xl font-black" style={{ color: s.color }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131313] border border-[#484847]/20 rounded-xl py-3 px-12 text-white placeholder:text-[#767575] focus:ring-1 focus:ring-[#c1fffe] outline-none text-sm transition-all"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767575]">search</span>
        </div>
        
        <div className="flex items-center gap-2 bg-[#131313] p-1.5 rounded-2xl border border-[#484847]/10">
          {[
            { id: "all", label: t.all },
            { id: "approved", label: t.approved },
            { id: "pending", label: t.pending },
            { id: "rejected", label: t.rejected }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f.id
                  ? "bg-[#c1fffe] text-[#006767]"
                  : "text-[#adaaaa] hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden mb-12 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#484847]/10 bg-[#1a1a1a]/50">
                {t.cols.map((col: string) => (
                  <th key={col} className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#767575]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#484847]/5">
              {filteredQuotes.map((q: Quote) => (
                <tr
                  key={q.id}
                  className="group hover:bg-[#1a1a1a] transition-all cursor-pointer"
                  onClick={() => setSelectedQuote(q)}
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-[#c1fffe] font-bold">{q.id}</span>
                      <span className="text-[10px] text-[#767575] uppercase tracking-tighter">Draft v2.1</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c1fffe]/20 to-[#6e9bff]/20 flex items-center justify-center text-[10px] font-bold text-[#c1fffe]">
                        {q.client.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold">{q.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 leading-none">
                    <div className="text-sm font-bold font-[var(--font-headline)]">{q.amount}</div>
                    <div className="text-[9px] text-[#767575] uppercase mt-1">IVA Incluido</div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#adaaaa] whitespace-nowrap">{q.date}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: q.statusColor + "1a", color: q.statusColor, border: `1px solid ${q.statusColor}33` }}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-xl hover:bg-[#262626] text-[#adaaaa] hover:text-[#c1fffe] transition-all" title={locale === "es" ? "Vista Previa" : "Preview"}>
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <Link href={`/${locale}/admin/quotes/${q.dbId}/edit`} className="p-2 rounded-xl hover:bg-[#262626] text-[#adaaaa] hover:text-white transition-all" title={t.edit} onClick={(e) => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <Link href={`/${locale}/admin/quotes/${q.dbId}/duplicate`} className="p-2 rounded-xl hover:bg-[#262626] text-[#adaaaa] hover:text-[#c1fffe] transition-all" title={locale === "es" ? "Duplicar" : "Duplicate"} onClick={(e) => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                      </Link>
                      <button className="p-2 rounded-xl hover:bg-[#262626] text-[#adaaaa] hover:text-[#8eff71] transition-all" title={locale === "es" ? "Convertir a Factura" : "Convert to Invoice"} onClick={(e) => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-lg">task_alt</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar Visor (Preview) */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#1a1a1a] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[100] transition-transform duration-500 transform ${selectedQuote ? "translate-x-0" : "translate-x-full"} border-l border-[#c1fffe]/10`}>
        {selectedQuote && (
          <div className="h-full flex flex-col">
            <header className="p-6 border-b border-[#484847]/20 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-[var(--font-headline)]">{selectedQuote.id}</h3>
                <p className="text-xs text-[#adaaaa] uppercase tracking-widest">{locale === "es" ? "Detalles del Presupuesto" : "Quote Details"}</p>
              </div>
              <button 
                onClick={() => setSelectedQuote(null)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="flex items-center gap-4 bg-[#0e0e0e] p-4 rounded-2xl border border-[#484847]/10">
                <div className="w-12 h-12 rounded-full bg-[#c1fffe]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#c1fffe]">person</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#767575] uppercase tracking-tighter">{locale === "es" ? "Cliente Final" : "Final Client"}</div>
                  <div className="font-bold flex items-center gap-2">
                    {selectedQuote.client}
                    <span className="material-symbols-outlined text-[10px] text-[#8eff71] icon-filled">verified</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-[#adaaaa] uppercase font-bold tracking-widest">{locale === "es" ? "Configuración Técnica" : "Technical Configuration"}</span>
                  <span className="text-[10px] text-[#c1fffe] font-mono">ID-MOD-772</span>
                </div>
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-[#484847]/20 rounded-xl">
                  <span className="material-symbols-outlined text-[#484847] mb-2">inventory_2</span>
                  <span className="text-[10px] text-[#767575] uppercase">{locale === "es" ? "Sin detalles de artículos" : "No item details"}</span>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs text-[#adaaaa] uppercase font-bold tracking-widest">{locale === "es" ? "Historial de Actividad" : "Activity History"}</span>
                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#484847]/30">
                  <div className="flex flex-col items-center justify-center py-4">
                    <span className="text-[10px] text-[#767575] ml-4">{locale === "es" ? "Sin actividad reciente" : "No recent activity"}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#c1fffe]/5 to-[#6e9bff]/5 border border-[#c1fffe]/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-[#adaaaa]">{locale === "es" ? "Subtotal" : "Subtotal"}</span>
                  <span className="font-bold">--</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-[#adaaaa]">{locale === "es" ? "Impuestos" : "Taxes"}</span>
                  <span className="font-bold text-[#8eff71]">--</span>
                </div>
                <div className="h-px bg-[#484847]/20 mb-6"></div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black font-[var(--font-headline)] uppercase tracking-tighter">Total</span>
                  <span className="text-3xl font-black text-[#c1fffe]">{selectedQuote.amount}</span>
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-[#484847]/20 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleShareEmail}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">mail</span> Email
                </button>
                <button 
                  onClick={handleShareWhatsApp}
                  className="py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-bold text-xs uppercase tracking-widest hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm icon-filled">chat_bubble</span> WhatsApp
                </button>
              </div>
              <button className="w-full py-4 rounded-xl bg-[#c1fffe] text-[#006767] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,255,255,0.2)]">
                <span className="material-symbols-outlined text-base icon-filled">send</span> {locale === "es" ? "Enviar Link de Pago" : "Send Payment Link"}
              </button>
            </footer>
          </div>
        )}
      </div>

      {/* Overlay for sidebar */}
      {selectedQuote && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity cursor-pointer"
          onClick={() => setSelectedQuote(null)}
        ></div>
      )}
    </div>
  );
}
