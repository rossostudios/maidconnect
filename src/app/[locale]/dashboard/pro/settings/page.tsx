import { redirect } from "next/navigation";

export default async function ProSettingsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/pro/settings/profile`);
}
