"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EstimateProForm from "@/components/EstimateProForm";
import { COLLECTIONS, getDocument } from "@/lib/firestore";

export default function EditQuoteClient() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const doc = await getDocument(COLLECTIONS.ESTIMATES, id);
        setData(doc);
      } catch (e) {
        console.error("Error loading quote:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#c1fffe]/20 border-t-[#c1fffe] rounded-full animate-spin"></div>
        <p className="text-[#adaaaa] text-sm font-bold uppercase tracking-widest">
          {locale === "es" ? "Cargando..." : "Loading..."}
        </p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <p className="text-[#ff7171]">
        {locale === "es" ? "Cotización no encontrada" : "Quote not found"}
      </p>
    </div>
  );

  return <EstimateProForm locale={locale} initialData={data} />;
}
