"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  section?: string;
}

interface AppSidebarProps {
  locale: string;
}

const navItems: Record<string, NavItem[]> = {
  es: [
    { icon: "dashboard", label: "Panel Principal", href: "/es/admin" },
    { icon: "router", label: "Catálogo", href: "/es/catalog" },
    // Finanzas
    { icon: "payments", label: "Finanzas", href: "/es/admin/finance", section: "Finanzas" },
    { icon: "receipt_long", label: "Facturas", href: "/es/admin/invoices" },
    { icon: "description", label: "Cotizaciones", href: "/es/admin/quotes" },
    // Marketing & Redes
    { icon: "campaign", label: "Marketing", href: "/es/admin/marketing", section: "Marketing & Social" },
    { icon: "share", label: "Redes Sociales", href: "/es/admin/marketing" },
  ],
  en: [
    { icon: "dashboard", label: "Dashboard", href: "/en/admin" },
    { icon: "router", label: "Catalog", href: "/en/catalog" },
    // Finance
    { icon: "payments", label: "Finance", href: "/en/admin/finance", section: "Finance" },
    { icon: "receipt_long", label: "Invoices", href: "/en/admin/invoices" },
    { icon: "description", label: "Quotes", href: "/en/admin/quotes" },
    // Marketing & Social
    { icon: "campaign", label: "Social Hub", href: "/en/admin/marketing", section: "Marketing & Social" },
    { icon: "share", label: "Social Media", href: "/en/admin/marketing" },
  ],
};

export default function AppSidebar({ locale }: AppSidebarProps) {
  const pathname = usePathname();
  const items = navItems[locale] ?? navItems.es;

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-[60] flex-col h-screen w-72 border-r border-[#484847]/20 bg-[#0e0e0e] overflow-y-auto">
      <div className="p-8 flex flex-col h-full">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Techlandiard Logo"
            width={44}
            height={44}
            className="rounded-xl object-contain"
            priority
          />
          <div>
            <p className="text-[#00FFFF] font-bold font-[var(--font-headline)] text-base tracking-wider leading-tight">
              TECHLANDIARD
            </p>
            <p className="text-[#adaaaa] text-[10px] tracking-wide">
              {locale === "es" ? "Gestión Domótica" : "Domotics Mgmt"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${locale}/admin` && pathname.startsWith(item.href));
            return (
              <div key={item.href + item.label}>
                {item.section && (
                  <p className="text-[#484847] text-[9px] uppercase tracking-[0.2em] px-4 pt-5 pb-1 font-[var(--font-label)]">
                    {item.section}
                  </p>
                )}
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-[#00FFFF] font-bold bg-[#1a1a1a] border-l-2 border-[#00FFFF]"
                      : "text-[#adaaaa] hover:bg-[#131313] hover:text-white"
                  }`}
                >
                  <span className={`material-symbols-outlined text-xl ${isActive ? "icon-filled" : ""}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Quick action */}
        <Link
          href={`/${locale}/admin/quotes/new`}
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#c1fffe]/10 border border-[#c1fffe]/20 text-[#c1fffe] hover:bg-[#c1fffe]/20 transition-all group"
        >
          <span className="material-symbols-outlined text-xl icon-filled">add_circle</span>
          <span className="text-sm font-bold">
            {locale === "es" ? "Nueva Estimación" : "New Estimate"}
          </span>
        </Link>

        <div className="mt-6 pt-6 border-t border-[#484847]/20">
          <p className="text-[#adaaaa] text-[10px] tracking-widest uppercase">Version</p>
          <p className="text-[#c1fffe] font-[var(--font-headline)] font-bold">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
