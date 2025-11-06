import { unstable_noStore } from "next/cache";
import { MessagingInterface } from "@/components/messaging/messaging-interface";
import { requireUser } from "@/lib/auth";

export default async function ProMessagesPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  const user = await requireUser({ allowedRoles: ["professional"] });

  return <MessagingInterface userId={user.id} userRole="professional" />;
}
