"use client";

import { HugeiconsIcon as HugeiconsIconBase } from "@hugeicons/react";
import type { ComponentProps } from "react";

/**
 * Client-side icon wrapper that can be imported in server components
 *
 * Usage:
 * ```tsx
 * import { Icon } from "@/components/ui/icon";
 * import { Video01Icon } from "@hugeicons/core-free-icons";
 *
 * <Icon icon={Video01Icon} className="h-6 w-6" />
 * ```
 */
export function Icon(props: ComponentProps<typeof HugeiconsIconBase>) {
  return <HugeiconsIconBase {...props} />;
}
