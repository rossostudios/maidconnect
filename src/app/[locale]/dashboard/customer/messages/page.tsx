import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { MessagingInterface } from "@/components/messaging/messaging-interface";

export default async function CustomerMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.customer.messagesPage" });
  const user = await requireUser({ allowedRoles: ["customer"] });

  return <MessagingInterface userId={user.id} userRole="customer" />;
}
