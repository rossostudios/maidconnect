import { requireUser } from "@/lib/auth";
import { MessagingInterface } from "@/components/messaging/messaging-interface";

export default async function ProMessagesPage() {
  const user = await requireUser({ allowedRoles: ["professional"] });

  return <MessagingInterface userId={user.id} userRole="professional" />;
}
