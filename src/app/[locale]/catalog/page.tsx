import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

interface Props {
  params: Promise<{ locale: string }>;
}

const products = {
  es: [
    {
      id: 1,
      name: "HUB DE ILUMINACIÓN NEON-CORE",
      desc: "Control centralizado para hasta 50 puntos de iluminación inteligente con latencia de submilisegundos.",
      price: "$499.00",
      tag: "Serie Premium",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChsNK1n1Ii4Si_RHjAxvnQ4x9pM2gnzq0H5AxXLavOoYQjw1a3M8sY2RtP-fuh2LrbmGd_TuPDo_z2hRkTN-xKNJYj2FVbUlj5Hef3CCF_Nciq-tzK6p9vtepWwSArm45Ru-KE1G7e1_DwhCBQzuohmYBoowc0TV2TsNZKeYAeKsM3vnGzK5zWVi5XY6Uz9qE680z6aEvCnZWTXM2awPlWOPCKp6oVGRARXz_EG2GcJe258qBbtjkpo8DOkkF71iYtT4YQ32IcvXE",
      hero: true,
    },
    {
      id: 2,
      name: "CÁMARA SENTRY X4K",
      desc: "Campo de visión ultra amplio de 180° con seguimiento térmico de movimiento impulsado por IA.",
      price: "$289.00",
      tag: "En Stock",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB44pu_p2JyBKo5ZYOiFztg0BNs5SyCR9GXn3wrgKmOC0nmRl9hHzhdWLHQHwIMRQT66gLwlafdKFwLI22ah_Z2oqhL5CAltF5SZ_5kFTBrjaDFNhLq_OKEWPZHv3KwjWMc3IeETQbJ1FvF2phpxZ30dK5uYfWVkm0AQzpEWfY3xXB-tuhi1ura1FzHmdxVRZSMV10rFsDgV49xX1Rkrq2R4cdUXlh-EaOvTGsYbURUXLRCQOVoxp-10XJYIIbe2vmpfyKiEobqK9Y",
    },
    {
      id: 3,
      name: "THERMO-V GLOW",
      desc: "Ajuste climático predictivo basado en la detección de presencia biométrica.",
      price: "$345.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOxZSd-loHbSCKbFilxxKleKbk2UDKbNVNYt4k9ib_Egtw8b52CPt3KIrmHdacA0-_0Nh9x2sr73g2heXqA1wHAPhQ9k4Uh7MkVYfwYDl-Ftntp56mayTHSu7a4FL3zoTr5WOzDnK2kgWqmdvMI_Yie3LjUUIwD5Akph-yP73n5753QeFGyAvbNa6F__12QX-OBUrhwQuCFnsXvv-oFkmQxG7eR164XdJ-RVQh1TzHms3sFU09oGbWRKjFyGsH0V9S7dpZVj3J4I4",
    },
    {
      id: 4,
      name: "ONYX BIO-LOCK",
      desc: "Seguridad de grado 3 con autenticación biométrica de doble cifrado.",
      price: "$412.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9I_Hgj2fO__DZZs72Th3BLpryyC8n3fsab-W-EOkiMjpuaqbPROw8rZLWHUt7slDNQEl-EFmvWAI_UZ0jZKZEwThVlh9_650QW6VlVkagSCq4AwDfyRsXxaYhWN6G6ukuT2Mac2yVv-IRWgMoBgdJVe_WJPSVPj-Qjq1wLgTT05HJ7_OOHZLaf670xpUvLH3w3s0_WjpE6LvcI24Z5LAUg9hRFn90u4rG9b3tRA6rqe_cMrqbf-u8faoFpgwi2QmHlpw74jjfAuo",
    },
    {
      id: 5,
      name: "AURA SOUNDSCAPE",
      desc: "Integración de audio espacial con sincronización multihabitación sin pérdidas.",
      price: "$599.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLj0nsDUG4kHIhNETEpPmh80jJmYX9GeUfZQxiQW7E8XvrhuSTLzV4xIeyw8DrSdqVessqbpi7pjlZYNdvVAQLtc1J_VenyUDKnl-ltqR0cIb_83beWnwvi70nKUgpqyEDXmr4wQZ2a4xke4RcahA-l91Cfr3vIo8gJ6YZOMgpaH-r5n3JAPYDgjArzcIPdWw6yPzfPdF1frsYuP62ANombBcUU0_B12hCtOHnz1Y6HiR9MJei0jTVRQpxCr7hXyNNeL-MaNK06tE",
    },
  ],
  en: [
    {
      id: 1,
      name: "NEON-CORE LIGHTING HUB",
      desc: "Centralized control for up to 50 smart lighting points with sub-millisecond latency.",
      price: "$499.00",
      tag: "Premium Series",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChsNK1n1Ii4Si_RHjAxvnQ4x9pM2gnzq0H5AxXLavOoYQjw1a3M8sY2RtP-fuh2LrbmGd_TuPDo_z2hRkTN-xKNJYj2FVbUlj5Hef3CCF_Nciq-tzK6p9vtepWwSArm45Ru-KE1G7e1_DwhCBQzuohmYBoowc0TV2TsNZKeYAeKsM3vnGzK5zWVi5XY6Uz9qE680z6aEvCnZWTXM2awPlWOPCKp6oVGRARXz_EG2GcJe258qBbtjkpo8DOkkF71iYtT4YQ32IcvXE",
      hero: true,
    },
    {
      id: 2,
      name: "SENTRY X4K CAMERA",
      desc: "Ultra-wide 180° field of view with AI-powered thermal motion tracking.",
      price: "$289.00",
      tag: "In Stock",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB44pu_p2JyBKo5ZYOiFztg0BNs5SyCR9GXn3wrgKmOC0nmRl9hHzhdWLHQHwIMRQT66gLwlafdKFwLI22ah_Z2oqhL5CAltF5SZ_5kFTBrjaDFNhLq_OKEWPZHv3KwjWMc3IeETQbJ1FvF2phpxZ30dK5uYfWVkm0AQzpEWfY3xXB-tuhi1ura1FzHmdxVRZSMV10rFsDgV49xX1Rkrq2R4cdUXlh-EaOvTGsYbURUXLRCQOVoxp-10XJYIIbe2vmpfyKiEobqK9Y",
    },
    {
      id: 3,
      name: "THERMO-V GLOW",
      desc: "Predictive climate adjustment based on biometric presence detection.",
      price: "$345.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOxZSd-loHbSCKbFilxxKleKbk2UDKbNVNYt4k9ib_Egtw8b52CPt3KIrmHdacA0-_0Nh9x2sr73g2heXqA1wHAPhQ9k4Uh7MkVYfwYDl-Ftntp56mayTHSu7a4FL3zoTr5WOzDnK2kgWqmdvMI_Yie3LjUUIwD5Akph-yP73n5753QeFGyAvbNa6F__12QX-OBUrhwQuCFnsXvv-oFkmQxG7eR164XdJ-RVQh1TzHms3sFU09oGbWRKjFyGsH0V9S7dpZVj3J4I4",
    },
    {
      id: 4,
      name: "ONYX BIO-LOCK",
      desc: "Grade-3 security with dual-encrypted biometric authentication.",
      price: "$412.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9I_Hgj2fO__DZZs72Th3BLpryyC8n3fsab-W-EOkiMjpuaqbPROw8rZLWHUt7slDNQEl-EFmvWAI_UZ0jZKZEwThVlh9_650QW6VlVkagSCq4AwDfyRsXxaYhWN6G6ukuT2Mac2yVv-IRWgMoBgdJVe_WJPSVPj-Qjq1wLgTT05HJ7_OOHZLaf670xpUvLH3w3s0_WjpE6LvcI24Z5LAUg9hRFn90u4rG9b3tRA6rqe_cMrqbf-u8faoFpgwi2QmHlpw74jjfAuo",
    },
    {
      id: 5,
      name: "AURA SOUNDSCAPE",
      desc: "Spatial audio integration with lossless multi-room synchronization.",
      price: "$599.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLj0nsDUG4kHIhNETEpPmh80jJmYX9GeUfZQxiQW7E8XvrhuSTLzV4xIeyw8DrSdqVessqbpi7pjlZYNdvVAQLtc1J_VenyUDKnl-ltqR0cIb_83beWnwvi70nKUgpqyEDXmr4wQZ2a4xke4RcahA-l91Cfr3vIo8gJ6YZOMgpaH-r5n3JAPYDgjArzcIPdWw6yPzfPdF1frsYuP62ANombBcUU0_B12hCtOHnz1Y6HiR9MJei0jTVRQpxCr7hXyNNeL-MaNK06tE",
    },
  ],
};

const labels = {
  es: { title: "ACTIVOS DEL SISTEMA", sub: "Módulos de automatización de alto rendimiento.", search: "Buscar componentes...", addBudget: "AÑADIR A PRESUPUESTO", add: "Añadir", all: "Todos los Módulos", lighting: "Iluminación", security: "Seguridad", climate: "Climatización", av: "Audio/Visual", createBudget: "Crear Presupuesto" },
  en: { title: "SYSTEM ASSETS", sub: "High-performance automation modules.", search: "Search components...", addBudget: "ADD TO QUOTE", add: "Add", all: "All Modules", lighting: "Lighting", security: "Security", climate: "Climate", av: "Audio/Visual", createBudget: "Create Quote" },
};

export default async function CatalogPage({ params }: Props) {
  const { locale } = await params;
  const l = locale === "en" ? labels.en : labels.es;
  const prods = locale === "en" ? products.en : products.es;
  const [hero, ...rest] = prods;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title="Techlandiard" />

      {/* Desktop Sidebar */}
      <aside className="h-full w-64 fixed left-0 top-0 hidden md:flex flex-col p-6 space-y-2 bg-[#131313] z-40 pt-24">
        <div className="text-lg font-black text-[#c1fffe] mb-6 font-[var(--font-headline)] uppercase">
          {locale === "es" ? "EL SANTUARIO" : "THE SANCTUARY"}
        </div>
        {[
          { icon: "shopping_bag", label: locale === "es" ? "Catálogo" : "Catalog", href: `/${locale}/catalog`, active: true },
          { icon: "calculate", label: locale === "es" ? "Cotizador" : "Quote Builder", href: `/${locale}/quote`, active: false },
          { icon: "shopping_cart", label: locale === "es" ? "Pago" : "Checkout", href: `/${locale}/checkout`, active: false },
          { icon: "dashboard", label: locale === "es" ? "Admin" : "Admin", href: `/${locale}/admin`, active: false },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
              item.active
                ? "text-[#00FFFF] font-bold bg-[#1a1a1a] rounded-r-full"
                : "text-[#adaaaa] hover:bg-[#1a1a1a] hover:text-[#c1fffe]"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-[var(--font-headline)] uppercase text-xs tracking-[0.05em]">{item.label}</span>
          </Link>
        ))}
      </aside>

      <main className="md:ml-64 pt-24 pb-32 px-6 md:px-12">
        {/* Hero section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
            <div className="max-w-2xl">
              <h2 className="font-[var(--font-headline)] text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                {l.title.split(" ").map((w, i) =>
                  i === l.title.split(" ").length - 1 ? (
                    <span key={i} className="text-[#c1fffe] italic"> {w}</span>
                  ) : (
                    <span key={i}>{w} </span>
                  )
                )}
              </h2>
              <p className="text-[#adaaaa] text-lg">{l.sub}</p>
            </div>
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg py-3 px-12 focus:ring-1 focus:ring-[#c1fffe] outline-none font-[var(--font-label)] text-sm uppercase tracking-wider text-white placeholder:text-[#767575]"
                  placeholder={l.search}
                  type="text"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767575]">
                  search
                </span>
              </div>
            </div>
          </div>
          {/* Category filters */}
          <div className="flex gap-3 overflow-x-auto pb-3">
            {[l.all, l.lighting, l.security, l.climate, l.av].map((cat, i) => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full text-[10px] font-[var(--font-label)] uppercase tracking-[0.15em] whitespace-nowrap transition-all ${
                  i === 0
                    ? "bg-[#c1fffe]/10 border border-[#c1fffe]/30 text-[#c1fffe]"
                    : "bg-[#1a1a1a] border border-[#484847]/10 text-[#adaaaa] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Product grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Hero card */}
          <div className="md:col-span-8 group relative overflow-hidden rounded-xl bg-[#1a1a1a] border border-[#484847]/10 hover:border-[#c1fffe]/30 transition-all duration-500 min-h-[320px]">
            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
              <img alt={hero.name} src={hero.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="relative h-full flex flex-col justify-end p-8 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/40 to-transparent min-h-[320px]">
              <div className="flex justify-between items-end">
                <div>
                  <span className="font-[var(--font-label)] text-[10px] uppercase tracking-[0.3em] text-[#c1fffe] mb-2 block">{hero.tag}</span>
                  <h3 className="font-[var(--font-headline)] text-3xl font-bold mb-2">{hero.name}</h3>
                  <p className="text-[#adaaaa] max-w-md text-sm mb-6">{hero.desc}</p>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-bold text-[#c1fffe] font-[var(--font-headline)]">{hero.price}</span>
                    <Link
                      href={`/${locale}/quote`}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#c1fffe] to-[#00e6e6] px-6 py-3 rounded-md text-[#006767] font-[var(--font-headline)] font-bold text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                      {l.addBudget}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product cards */}
          {rest.map((p) => (
            <div
              key={p.id}
              className="md:col-span-4 group flex flex-col bg-[#131313] rounded-xl border border-[#484847]/10 p-4 hover:bg-[#1a1a1a] transition-all"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <img alt={p.name} src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {p.tag && (
                  <div className="absolute top-3 left-3 bg-[#8eff71] px-2 py-1 rounded text-[10px] font-black text-[#0d6100] uppercase">
                    {p.tag}
                  </div>
                )}
              </div>
              <h4 className="font-[var(--font-headline)] text-lg font-bold mb-1 group-hover:text-[#c1fffe] transition-colors">
                {p.name}
              </h4>
              <p className="text-xs text-[#adaaaa] mb-4 flex-1">{p.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-[var(--font-headline)]">{p.price}</span>
                <button className="p-2 border border-[#484847] rounded-md hover:bg-[#c1fffe] hover:text-[#006767] hover:border-[#c1fffe] transition-all active:scale-90">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* FAB */}
      <Link
        href={`/${locale}/quote`}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-[#c1fffe] text-[#006767] rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40 group"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <div className="absolute right-16 bg-[#262626] text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-[#484847]/20 uppercase tracking-widest">
          {l.createBudget}
        </div>
      </Link>

      <BottomNav locale={locale} variant="client" />
    </div>
  );
}
