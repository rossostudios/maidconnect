/**
 * Loader Component - Lia Design System
 *
 * Animated RV loader for loading states.
 * Uses Casaora's custom RV graphic with pulse animation.
 */

import Image from "next/image";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export const Loader = ({ className, size = 16, ...props }: LoaderProps) => (
  <div
    className={cn("relative inline-flex items-center justify-center", className)}
    style={{ width: size, height: size }}
    {...props}
  >
    <Image alt="Loading..." className="animate-pulse" fill priority src="/loading.svg" />
  </div>
);
