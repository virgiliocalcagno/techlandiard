"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import EstimateProForm from "@/components/EstimateProForm";
import { COLLECTIONS, getDocument } from "@/lib/firestore";

function DuplicateQuoteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const id = searchParams.get("id");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
       setLoading(false);
       return;
    }
    async function load() {
      try {
        const doc = await getDocument(COLLECTIONS.ESTIMATES, id as string);
        setData(doc);
      } catch (e) {
        console.error("Error loading quote for duplication:", e);
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

  return <EstimateProForm locale={locale} initialData={data} isDuplicate={true} />;
}

export default function DuplicateQuotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DuplicateQuoteContent />
    </Suspense>
  );
}
