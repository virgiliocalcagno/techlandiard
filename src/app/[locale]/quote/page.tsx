import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

interface Props {
  params: Promise<{ locale: string }>;
}

const t = {
  es: {
    step1: "01. Definir Zonas",
    step2: "02. Seleccionar Módulos",
    headline: "Crea Tu",
    headlineAccent: "Inteligencia",
    sub: "Automatización arquitectónica modular. Selecciona zonas y hardware para generar una especificación técnica.",
    zones: [
      { name: "Sala de Estar", modules: "4 Módulos Activos", active: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBMvADXCmq6DpWKPafyNd_uG10STlKFQIkG3JPsZv8HqGT_qiFP_vA8nOtqRaJBgMbsJdyfOZlTErfulbbi2n997Gy-mLpRwlaiJN8dy_ZeG_Ye4akuoZfWCurrqLbHb9tCyWzk3WCnkQFE_hze-TQwD4Rmfg_F4aT99mHUXAMZVxiuJ_Mz83QfHGfklRHsDQCuiR_hX_c4TVyuXfNSxSvSKpq2BBWxu9BThPZy9zyfz9xP1ngMUJa1mgBTnqoKPBfgVIAYHFuddU" },
      { name: "Cocina de Autor", modules: "0 Módulos Seleccionados", active: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhFZQ3Ge-m4qiTeP5ojbNcZQNiQneJqo-V7WFxyiJ5kP3on9YvKt-Ocljl7tYpMQ09SQPdmvgYJHs3XHmWq5NX2T7HXny5_kAx-53D_OrQ52BwZK6kMpcS0hGwPiowNlV96N0zMSf8CeTwjJe6S9tHm3mpPGJ2omndPbmrmHt8M4R93ix4fRcl-Ukvh3c41n54yp0vrFHEyr_hCV_5CVoZ3Ja3mq_JDGOf9X8_WeXI5-S9B3yPU4A7sbMg93LznBFW9D2gyR2iHUM" },
      { name: "Defensa Perimetral", modules: "No Configurado", active: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9stYNELwt3l0kF0Z5KyR7zAyqCgm88bcJkRtvMvxo17553Z805jJlHlTTLz4j5MLGkVh7QOPcEWGy-Q_1nGy88vOx-m1-u0UvoIhiW3bwXg_XeAPItGDpGgRQqwvllawiar1V61i3QS7PbVJ9Sk0EaKBpNHoyHAfLcnbdUSYpbgy30STyYpvBSq5BNfhANSD28OkvUv_z_PVui0eNUpn3Wnpu50WqXfRMUC_zbOtalAZgCn3oGOtb0f8kvQ3If7mHJuldoK_PeD8" },
    ],
    modules: [
      { name: "Iluminación Inteligente", desc: "Preajustes de ritmo circadiano adaptativo y control de escenas.", price: "$2,450.00", icon: "light_mode", selected: true, color: "primary" },
      { name: "Matriz Climática", desc: "Gestión de humedad y temperatura multizona mediante IA.", price: "$1,800.00", icon: "thermostat", selected: false, color: "outline" },
      { name: "Motor de Medios", desc: "Integración envolvente 7.2 invisible y despliegue automático.", price: "$8,900.00", icon: "theater_comedy", selected: true, color: "secondary" },
      { name: "Acceso Biométrico", desc: "Entrada encriptada mediante reconocimiento facial.", price: "$1,200.00", icon: "shield", selected: false, color: "outline" },
    ],
    project: "Skyline Penthouse",
    budget: "Presupuesto Estimado",
    save: "Guardar Borrador",
    generate: "Generar Especificaciones",
    total: "$11,350.00",
    selected: "Seleccionado",
    addZone: "Añadir a Zona",
  },
  en: {
    step1: "01. Define Zones",
    step2: "02. Select Modules",
    headline: "Build Your",
    headlineAccent: "Intelligence",
    sub: "Modular architectural automation. Select zones and hardware to generate a technical specification.",
    zones: [
      { name: "Living Room", modules: "4 Active Modules", active: true, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBMvADXCmq6DpWKPafyNd_uG10STlKFQIkG3JPsZv8HqGT_qiFP_vA8nOtqRaJBgMbsJdyfOZlTErfulbbi2n997Gy-mLpRwlaiJN8dy_ZeG_Ye4akuoZfWCurrqLbHb9tCyWzk3WCnkQFE_hze-TQwD4Rmfg_F4aT99mHUXAMZVxiuJ_Mz83QfHGfklRHsDQCuiR_hX_c4TVyuXfNSxSvSKpq2BBWxu9BThPZy9zyfz9xP1ngMUJa1mgBTnqoKPBfgVIAYHFuddU" },
      { name: "Designer Kitchen", modules: "0 Modules Selected", active: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhFZQ3Ge-m4qiTeP5ojbNcZQNiQneJqo-V7WFxyiJ5kP3on9YvKt-Ocljl7tYpMQ09SQPdmvgYJHs3XHmWq5NX2T7HXny5_kAx-53D_OrQ52BwZK6kMpcS0hGwPiowNlV96N0zMSf8CeTwjJe6S9tHm3mpPGJ2omndPbmrmHt8M4R93ix4fRcl-Ukvh3c41n54yp0vrFHEyr_hCV_5CVoZ3Ja3mq_JDGOf9X8_WeXI5-S9B3yPU4A7sbMg93LznBFW9D2gyR2iHUM" },
      { name: "Perimeter Defense", modules: "Not Configured", active: false, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9stYNELwt3l0kF0Z5KyR7zAyqCgm88bcJkRtvMvxo17553Z805jJlHlTTLz4j5MLGkVh7QOPcEWGy-Q_1nGy88vOx-m1-u0UvoIhiW3bwXg_XeAPItGDpGgRQqwvllawiar1V61i3QS7PbVJ9Sk0EaKBpNHoyHAfLcnbdUSYpbgy30STyYpvBSq5BNfhANSD28OkvUv_z_PVui0eNUpn3Wnpu50WqXfRMUC_zbOtalAZgCn3oGOtb0f8kvQ3If7mHJuldoK_PeD8" },
    ],
    modules: [
      { name: "Smart Lighting", desc: "Adaptive circadian rhythm presets and architectural scene control.", price: "$2,450.00", icon: "light_mode", selected: true, color: "primary" },
      { name: "Climate Matrix", desc: "AI-powered multi-zone humidity and temperature management.", price: "$1,800.00", icon: "thermostat", selected: false, color: "outline" },
      { name: "Media Engine", desc: "Invisible 7.2 surround integration and automated screen deployment.", price: "$8,900.00", icon: "theater_comedy", selected: true, color: "secondary" },
      { name: "Biometric Access", desc: "Encrypted entry via facial recognition and mobile link.", price: "$1,200.00", icon: "shield", selected: false, color: "outline" },
    ],
    project: "Skyline Penthouse",
    budget: "Estimated Budget",
    save: "Save Draft",
    generate: "Generate Specs",
    total: "$11,350.00",
    selected: "Selected",
    addZone: "Add to Zone",
  },
};

export default async function QuotePage({ params }: Props) {
  const { locale } = await params;
  const txt = locale === "en" ? t.en : t.es;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title="Techlandiard" />

      {/* Desktop sidebar */}
      <aside className="h-full w-64 fixed left-0 top-0 hidden md:flex flex-col p-6 space-y-2 bg-[#131313] z-40 pt-24">
        <div className="text-lg font-black text-[#c1fffe] mb-6 font-[var(--font-headline)] uppercase">
          {locale === "es" ? "EL SANTUARIO" : "THE SANCTUARY"}
        </div>
        {[
          { icon: "shopping_bag", label: locale === "es" ? "Catálogo" : "Catalog", href: `/${locale}/catalog`, active: false },
          { icon: "calculate", label: locale === "es" ? "Cotizador" : "Quote Builder", href: `/${locale}/quote`, active: true },
          { icon: "shopping_cart", label: locale === "es" ? "Pago" : "Checkout", href: `/${locale}/checkout`, active: false },
          { icon: "dashboard", label: "Admin", href: `/${locale}/admin`, active: false },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${item.active ? "text-[#00FFFF] font-bold bg-[#1a1a1a] rounded-r-full" : "text-[#adaaaa] hover:bg-[#1a1a1a] hover:text-[#c1fffe]"}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-[var(--font-headline)] uppercase text-xs tracking-[0.05em]">{item.label}</span>
          </Link>
        ))}
      </aside>

      <main className="md:ml-64 pt-24 pb-40 px-6 lg:px-12 min-h-screen">
        <header className="mb-12 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-[#8eff71]"></span>
            <span className="font-[var(--font-label)] text-[10px] uppercase tracking-[0.2em] text-[#8eff71]">
              {locale === "es" ? "Configuración del Sistema" : "System Configuration"}
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-[var(--font-headline)] font-bold tracking-tighter mb-4">
            {txt.headline}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c1fffe] to-[#6e9bff]">
              {txt.headlineAccent}
            </span>
          </h2>
          <p className="text-[#adaaaa] text-lg max-w-2xl">{txt.sub}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Zone selector */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-[var(--font-headline)] text-xs uppercase tracking-widest text-[#adaaaa] mb-4 flex items-center gap-2">
              {txt.step1} <span className="h-px flex-grow bg-[#484847]/20"></span>
            </h3>
            {txt.zones.map((zone) => (
              <div
                key={zone.name}
                className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all ${zone.active ? "bg-[#1a1a1a] ring-1 ring-[#c1fffe]/20" : "bg-[#131313] ring-1 ring-[#484847]/10 hover:bg-[#1a1a1a]"}`}
              >
                <div className="h-28 w-full relative">
                  <img alt={zone.name} src={zone.img} className={`w-full h-full object-cover transition-opacity ${zone.active ? "opacity-60" : "opacity-30 group-hover:opacity-50"}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                </div>
                <div className="p-4 -mt-8 relative flex justify-between items-start">
                  <div>
                    <h4 className="font-[var(--font-headline)] text-xl font-bold">{zone.name}</h4>
                    <p className="text-xs text-[#adaaaa]">{zone.modules}</p>
                  </div>
                  {zone.active ? (
                    <div className="w-6 h-6 rounded-full bg-[#c1fffe] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#006767] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-[#767575] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#767575] text-sm">add</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Module configurator */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-[var(--font-headline)] text-xs uppercase tracking-widest text-[#adaaaa]">
                {txt.step2} <span className="text-[#00e6e6] ml-2">[{txt.zones[0].name}]</span>
              </h3>
              <span className="font-[var(--font-label)] text-[10px] text-[#adaaaa]">4/12</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {txt.modules.map((mod) => (
                <div
                  key={mod.name}
                  className={`p-6 rounded-xl cursor-pointer relative overflow-hidden group transition-transform hover:scale-[1.02] ${
                    mod.selected
                      ? `border-l-4 ${mod.color === "primary" ? "border-l-[#c1fffe] bg-[#1a1a1a]" : "border-l-[#6e9bff] bg-[#1a1a1a]"}`
                      : "border border-[#484847]/10 bg-[#131313]"
                  }`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">{mod.icon}</span>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mod.selected ? (mod.color === "primary" ? "bg-[#c1fffe]/20" : "bg-[#6e9bff]/20") : "bg-[#484847]/20"}`}>
                        <span className={`material-symbols-outlined ${mod.selected ? (mod.color === "primary" ? "text-[#c1fffe]" : "text-[#6e9bff]") : "text-[#adaaaa]"}`} style={mod.selected ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {mod.icon}
                        </span>
                      </div>
                      <span className="font-[var(--font-headline)] font-bold">{mod.name}</span>
                    </div>
                    <p className="text-sm text-[#adaaaa] mb-4 leading-snug">{mod.desc}</p>
                    <div className="flex justify-between items-center">
                      <span className={`font-[var(--font-headline)] font-bold ${mod.selected ? (mod.color === "primary" ? "text-[#c1fffe]" : "text-[#6e9bff]") : "text-[#adaaaa]"}`}>
                        {mod.price}
                      </span>
                      <span className={`text-[10px] font-[var(--font-label)] uppercase tracking-tighter px-2 py-1 rounded ${
                        mod.selected
                          ? (mod.color === "primary" ? "bg-[#c1fffe]/10 text-[#c1fffe]" : "bg-[#6e9bff]/10 text-[#6e9bff]")
                          : "border border-[#484847]/30 text-[#adaaaa]"
                      }`}>
                        {mod.selected ? txt.selected : txt.addZone}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating budget bar */}
      <div className="fixed bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 w-full md:w-[90%] max-w-5xl z-50 px-4">
        <div className="bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl md:rounded-full px-6 py-4 md:py-3 ring-1 ring-[#c1fffe]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="hidden md:flex flex-col">
              <span className="text-[9px] font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa]">
                {locale === "es" ? "Configuración" : "Configuration"}
              </span>
              <span className="text-sm font-[var(--font-headline)] font-bold">{txt.project}</span>
            </div>
            <div className="h-8 w-px bg-[#484847]/20 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#c1fffe] border-t-transparent animate-spin flex items-center justify-center" style={{ animationDuration: "3s" }}>
                <span className="text-xs font-bold text-[#c1fffe]">02</span>
              </div>
              <div>
                <span className="text-[9px] font-[var(--font-label)] uppercase tracking-widest text-[#adaaaa] block">{txt.budget}</span>
                <span className="text-xl font-[var(--font-headline)] font-black text-[#c1fffe]">{txt.total}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-5 py-2 rounded-full border border-[#484847]/30 text-[#adaaaa] font-[var(--font-headline)] text-sm font-bold hover:bg-[#262626] transition-colors uppercase tracking-tight">
              {txt.save}
            </button>
            <Link
              href={`/${locale}/checkout`}
              className="flex-1 md:flex-none px-7 py-3 rounded-full bg-gradient-to-tr from-[#c1fffe] to-[#00ffff] text-[#006767] font-[var(--font-headline)] text-sm font-black shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 transition-all uppercase tracking-tight text-center"
            >
              {txt.generate}
            </Link>
          </div>
        </div>
      </div>

      <BottomNav locale={locale} variant="client" />
    </div>
  );
}
