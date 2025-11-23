import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { IconBox } from "./icon-box";
import { TextStack } from "./text-stack";

type CardLinkProps = {
  href: string;
  icon: React.ComponentType;
  title: string;
  description?: string;
  className?: string;
};

/**
 * CardLink - Lia Design System
 *
 * Standardized card link pattern for Quick Actions and similar UIs.
 * Composes IconBox + TextStack for consistent styling.
 *
 * Features:
 * - 8px gap between icon and text (gap-2)
 * - Tight text spacing (leading-none + mt-0.5)
 * - Orange hover border accent
 * - No underline inheritance
 *
 * Usage:
 * <CardLink
 *   href="/dashboard/bookings"
 *   icon={Calendar03Icon}
 *   title="View Bookings"
 *   description="See all your appointments"
 * />
 */
export function CardLink({ href, icon, title, description, className }: CardLinkProps) {
  return (
    <Link
      className={cn(
        "flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-4",
        "no-underline transition-all hover:border-orange-300 hover:shadow-sm",
        className
      )}
      href={href}
    >
      <IconBox icon={icon} size="md" variant="neutral" />
      <TextStack
        description={description}
        descriptionClassName="no-underline"
        title={title}
        titleClassName="no-underline"
      />
    </Link>
  );
}
