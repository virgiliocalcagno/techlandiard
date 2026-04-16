"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface AppHeaderProps {
  locale: string;
  title?: string;
}

export default function AppHeader({ locale, title }: AppHeaderProps) {
  const otherLocale = locale === "es" ? "en" : "es";
  const pathname = usePathname();
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-[#484847]/20 shadow-[0_0_40px_-5px_rgba(0,255,255,0.08)]">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Techlandiard Logo"
          width={38}
          height={38}
          className="rounded-lg object-contain"
          priority
        />
        <h1 className="text-xl font-bold tracking-tighter text-[#00FFFF] font-[var(--font-headline)]">
          {title ?? "Domótica Pro"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Language switch */}
        <Link
          href={switchPath}
          className="text-xs font-bold uppercase tracking-widest border border-[#484847] rounded-lg px-3 py-1.5 text-[#adaaaa] hover:text-[#c1fffe] hover:border-[#c1fffe]/40 transition-all"
        >
          {otherLocale === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}
        </Link>
        <span className="material-symbols-outlined text-[#adaaaa] hover:text-[#c1fffe] transition-colors cursor-pointer">
          notifications
        </span>
        <span className="material-symbols-outlined text-[#00FFFF] hover:text-[#c1fffe] transition-colors cursor-pointer">
          settings
        </span>
      </div>
    </header>
  );
}
