import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ComparisonTableProps = {
  children: ReactNode;
  className?: string;
};

type ComparisonTableHeaderProps = {
  children: ReactNode;
  className?: string;
};

type ComparisonTableHeaderCellProps = {
  children: ReactNode;
  className?: string;
  featured?: boolean;
};

type ComparisonTableBodyProps = {
  children: ReactNode;
  className?: string;
};

type ComparisonTableRowProps = {
  children?: ReactNode;
  className?: string;
  category?: string;
};

type ComparisonTableCellProps = {
  children?: ReactNode;
  className?: string;
  type?: "text" | "check" | "x" | "custom";
  value?: string | boolean;
  featured?: boolean;
};

export function ComparisonTable({ children, className }: ComparisonTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-[#f8fafc]",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

export function ComparisonTableHeader({ children, className }: ComparisonTableHeaderProps) {
  return (
    <thead className={cn("border-[#e2e8f0] border-b bg-[#f8fafc]", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

export function ComparisonTableHeaderCell({
  children,
  className,
  featured = false,
}: ComparisonTableHeaderCellProps) {
  return (
    <th
      className={cn(
        "px-6 py-4 text-center font-semibold text-[#0f172a] text-sm uppercase tracking-[0.1em]",
        featured && "bg-[#64748b]/100/5",
        className
      )}
    >
      {children}
    </th>
  );
}

export function ComparisonTableBody({ children, className }: ComparisonTableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function ComparisonTableRow({ children, className, category }: ComparisonTableRowProps) {
  if (category) {
    return (
      <tr className={cn("border-[#e2e8f0] border-t bg-[#f8fafc]/50", className)}>
        <td
          className="px-6 py-3 font-semibold text-[#0f172a] text-sm uppercase tracking-[0.1em]"
          colSpan={100}
        >
          {category}
        </td>
      </tr>
    );
  }

  return (
    <tr className={cn("border-[#e2e8f0] border-t transition hover:bg-[#f8fafc]", className)}>
      {children}
    </tr>
  );
}

export function ComparisonTableCell({
  children,
  className,
  type = "custom",
  value,
  featured = false,
}: ComparisonTableCellProps) {
  const renderContent = () => {
    if (type === "check") {
      return (
        <div className="flex items-center justify-center">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#64748b]/10">
            <HugeiconsIcon className="h-4 w-4 text-[#64748b]" icon={Tick02Icon} strokeWidth={3} />
          </div>
        </div>
      );
    }

    if (type === "x") {
      return (
        <div className="flex items-center justify-center">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e2e8f0]/30">
            <HugeiconsIcon
              className="h-4 w-4 text-[#94a3b8]/70"
              icon={Cancel01Icon}
              strokeWidth={3}
            />
          </div>
        </div>
      );
    }

    if (type === "text" && value !== undefined) {
      return <span className="text-[#0f172a] text-base">{String(value)}</span>;
    }

    return children;
  };

  return (
    <td
      className={cn(
        "px-6 py-4 text-center text-[#0f172a] text-base",
        featured && "bg-[#64748b]/100/5",
        className
      )}
    >
      {renderContent()}
    </td>
  );
}

// Convenience component for the first column (feature name)
ComparisonTableCell.Feature = function ComparisonTableCellFeature({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-6 py-4 text-left font-medium text-[#0f172a] text-base", className)}>
      {children}
    </td>
  );
};
