import { requireUser } from "@/lib/auth";
import { MessagingInterface } from "@/components/messaging/messaging-interface";

export default async function CustomerMessagesPage() {
  const user = await requireUser({ allowedRoles: ["customer"] });

  return <MessagingInterface userId={user.id} userRole="customer" />;
}
