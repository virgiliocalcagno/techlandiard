"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  locale: string;
  variant?: "client" | "admin";
}

export default function BottomNav({ locale, variant = "client" }: BottomNavProps) {
  const pathname = usePathname();

  const adminItems = [
    { icon: "payments", label: locale === "es" ? "Ventas" : "Sales", href: `/${locale}/admin` },
    { icon: "inventory_2", label: locale === "es" ? "Inventario" : "Inventory", href: `/${locale}/admin` },
    { icon: "request_quote", label: locale === "es" ? "Cotizar" : "Quote", href: `/${locale}/admin/quotes` },
    { icon: "campaign", label: "Marketing", href: `/${locale}/admin/marketing` },
  ];

  const clientItems = [
    { icon: "router", label: locale === "es" ? "Catálogo" : "Catalog", href: `/${locale}/catalog` },
    { icon: "calculate", label: locale === "es" ? "Cotizar" : "Quote", href: `/${locale}/quote` },
    { icon: "shopping_cart", label: locale === "es" ? "Pagar" : "Checkout", href: `/${locale}/checkout` },
    { icon: "person", label: locale === "es" ? "Perfil" : "Profile", href: `/${locale}` },
  ];

  const items = variant === "admin" ? adminItems : clientItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 bg-[#131313]/90 backdrop-blur-2xl z-50 rounded-t-xl border-t border-[#484847]/20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all active:scale-90 duration-300 ${
              isActive
                ? "text-[#00FFFF] bg-[#1a1a1a]"
                : "text-[#adaaaa] hover:bg-[#262626]"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-[var(--font-label)] uppercase tracking-[0.05em] text-[10px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
