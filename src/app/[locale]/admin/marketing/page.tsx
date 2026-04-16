import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";
import SocialMediaHub from "@/components/SocialMediaHub";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminMarketingPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <AppHeader locale={locale} title={locale === "es" ? "Domótica Pro" : "Domotics Pro"} />
      <AppSidebar locale={locale} />

      <main className="md:ml-72 pt-24 pb-32 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
        <SocialMediaHub locale={locale} />
      </main>

      <BottomNav locale={locale} variant="admin" />
    </div>
  );
}
