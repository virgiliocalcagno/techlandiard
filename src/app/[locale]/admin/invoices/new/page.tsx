import InvoiceForm from "@/components/InvoiceForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewInvoicePage({ params }: Props) {
  const { locale } = await params;
  return <InvoiceForm locale={locale} />;
}
