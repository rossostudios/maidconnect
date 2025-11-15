/**
 * Amara Icon - Lia Design System
 *
 * Siri New Icon from Hugeicons
 * Represents the AI assistant with a modern voice assistant design
 */

import { SiriNewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type AmaraIconProps = {
  className?: string;
  size?: number;
};

export function AmaraIcon({ className, size = 32 }: AmaraIconProps) {
  return <HugeiconsIcon className={className} icon={SiriNewIcon} size={size} strokeWidth={1.5} />;
}
