import { MessagingInterface } from "@/components/messaging/messaging-interface";
import { requireUser } from "@/lib/auth";

export default async function CustomerMessagesPage() {
  const user = await requireUser({ allowedRoles: ["customer"] });

  return <MessagingInterface userId={user.id} userRole="customer" />;
}
