import Link from "next/link";

interface Props {
  params: Promise<{ locale: string }>;
}

const t = {
  es: {
    tagline: "DOMÓTICA INTELIGENTE",
    headline: "Conecta tu\nMundo",
    sub: "Automatización de alto rendimiento para espacios residenciales y comerciales de vanguardia.",
    catalog: "Ver Catálogo",
    quote: "Crear Cotización",
    admin: "Panel Admin",
    features: [
      { icon: "home_iot_device", title: "Automatización Total", desc: "Control centralizado de todos tus dispositivos desde un solo punto." },
      { icon: "security", title: "Seguridad Avanzada", desc: "Sistemas biométricos y vigilancia 24/7 con IA integrada." },
      { icon: "bolt", title: "Eficiencia Energética", desc: "Optimización automática para reducir consumo hasta 40%." },
    ],
  },
  en: {
    tagline: "SMART DOMOTICS",
    headline: "Connect Your\nWorld",
    sub: "High-performance automation for cutting-edge residential and commercial spaces.",
    catalog: "View Catalog",
    quote: "Create Quote",
    admin: "Admin Panel",
    features: [
      { icon: "home_iot_device", title: "Total Automation", desc: "Centralized control of all your devices from a single point." },
      { icon: "security", title: "Advanced Security", desc: "Biometric systems and 24/7 AI-powered surveillance." },
      { icon: "bolt", title: "Energy Efficiency", desc: "Automatic optimization to reduce consumption by up to 40%." },
    ],
  },
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const txt = locale === "en" ? t.en : t.es;
  const other = locale === "es" ? "en" : "es";

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-[#484847]/20 shadow-[0_0_40px_-5px_rgba(0,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#00FFFF] text-2xl">grid_view</span>
          <span className="text-xl font-bold tracking-tighter text-[#00FFFF] uppercase font-[var(--font-headline)]">
            Techlandiard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/${other}`}
            className="text-xs font-bold uppercase tracking-widest border border-[#484847] rounded-lg px-3 py-1.5 text-[#adaaaa] hover:text-[#c1fffe] hover:border-[#c1fffe]/40 transition-all"
          >
            {other === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}
          </Link>
          <Link
            href={`/${locale}/admin`}
            className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-[#adaaaa] hover:text-[#c1fffe] transition-colors"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            {txt.admin}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          <div>
            <span className="inline-block text-[10px] font-[var(--font-label)] uppercase tracking-[0.3em] text-[#8eff71] mb-6 border border-[#8eff71]/30 rounded-full px-4 py-1.5">
              {txt.tagline}
            </span>
            <h1 className="font-[var(--font-headline)] text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 whitespace-pre-line leading-none">
              {txt.headline}
            </h1>
            <p className="text-[#adaaaa] text-lg leading-relaxed max-w-md mb-10">{txt.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/catalog`}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#c1fffe] text-[#006767] font-[var(--font-headline)] font-black text-sm uppercase tracking-tight hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">router</span>
                {txt.catalog}
              </Link>
              <Link
                href={`/${locale}/quote`}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[#484847] text-white font-[var(--font-headline)] font-bold text-sm uppercase tracking-tight hover:border-[#c1fffe]/40 hover:bg-[#1a1a1a] transition-all"
              >
                <span className="material-symbols-outlined text-base">calculate</span>
                {txt.quote}
              </Link>
            </div>
          </div>

          {/* Visual panel */}
          <div className="relative hidden lg:block">
            <div className="aspect-square rounded-2xl bg-[#1a1a1a] border border-[#484847]/20 overflow-hidden flex items-center justify-center shadow-[0_0_80px_-10px_rgba(0,255,255,0.15)]">
              <div className="grid grid-cols-2 gap-4 p-8 w-full">
                {[
                  { icon: "home_iot_device", label: "Hub Central", val: "Online", color: "#c1fffe" },
                  { icon: "security", label: "Seguridad", val: "Activa", color: "#8eff71" },
                  { icon: "thermostat", label: "Clima", val: "22°C", color: "#6e9bff" },
                  { icon: "bolt", label: "Energía", val: "-38%", color: "#c1fffe" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="bg-[#0e0e0e] rounded-xl p-4 border border-[#484847]/20 flex flex-col gap-2"
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ color: card.color, fontVariationSettings: "'FILL' 1" }}
                    >
                      {card.icon}
                    </span>
                    <p className="text-[#adaaaa] text-xs font-[var(--font-label)] uppercase tracking-wider">{card.label}</p>
                    <p className="text-white font-[var(--font-headline)] font-bold text-lg">{card.val}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#8eff71] animate-pulse opacity-60" />
            <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-[#c1fffe] animate-pulse opacity-40" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {txt.features.map((f) => (
            <div
              key={f.title}
              className="bg-[#1a1a1a] rounded-xl p-6 border border-[#484847]/10 hover:border-[#c1fffe]/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#c1fffe]/10 flex items-center justify-center mb-4 group-hover:bg-[#c1fffe]/20 transition-all">
                <span
                  className="material-symbols-outlined text-[#c1fffe]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {f.icon}
                </span>
              </div>
              <h3 className="font-[var(--font-headline)] font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-[#adaaaa] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-[#131313]/90 backdrop-blur-2xl border-t border-[#484847]/20 z-50">
        <Link href={`/${locale}/catalog`} className="flex flex-col items-center text-[#adaaaa] hover:text-[#c1fffe]">
          <span className="material-symbols-outlined text-xl">router</span>
          <span className="text-[9px] uppercase tracking-widest mt-0.5 font-[var(--font-label)]">
            {locale === "es" ? "Catálogo" : "Catalog"}
          </span>
        </Link>
        <Link href={`/${locale}/quote`} className="flex flex-col items-center text-[#adaaaa] hover:text-[#c1fffe]">
          <span className="material-symbols-outlined text-xl">calculate</span>
          <span className="text-[9px] uppercase tracking-widest mt-0.5 font-[var(--font-label)]">
            {locale === "es" ? "Cotizar" : "Quote"}
          </span>
        </Link>
        <Link href={`/${locale}/admin`} className="flex flex-col items-center text-[#adaaaa] hover:text-[#c1fffe]">
          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          <span className="text-[9px] uppercase tracking-widest mt-0.5 font-[var(--font-label)]">Admin</span>
        </Link>
      </nav>
    </div>
  );
}
