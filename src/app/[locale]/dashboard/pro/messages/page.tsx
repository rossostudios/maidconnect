import { MessagingInterface } from "@/components/messaging/messaging-interface";
import { requireUser } from "@/lib/auth";

export default async function ProMessagesPage() {
  const user = await requireUser({ allowedRoles: ["professional"] });

  return <MessagingInterface userId={user.id} userRole="professional" />;
}
