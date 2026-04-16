import LoginForm from "@/components/LoginForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;

  return <LoginForm locale={locale} />;
}
