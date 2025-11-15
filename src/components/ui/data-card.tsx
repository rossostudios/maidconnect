import type { ReactNode } from "react";
import { DASHBOARD } from "@/lib/shared/config/dashboard-tokens";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./section-header";

type DataCardProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  // Optional section header
  category?: string;
  title?: string;
  description?: string;
  // Card variant
  variant?: "default" | "interactive" | "table";
};

export function DataCard({
  children,
  className,
  contentClassName,
  category,
  title,
  description,
  variant = "default",
}: DataCardProps) {
  const hasHeader = title !== undefined;

  return (
    <div className={cn(DASHBOARD.cards[variant], DASHBOARD.spacing.cardPadding, className)}>
      {hasHeader && <SectionHeader category={category} description={description} title={title} />}
      <div className={cn(hasHeader && "mt-5", contentClassName)}>{children}</div>
    </div>
  );
}
