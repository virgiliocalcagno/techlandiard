import EstimateProForm from "@/components/EstimateProForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewEstimatePage({ params }: Props) {
  const { locale } = await params;

  return <EstimateProForm locale={locale} />;
}
