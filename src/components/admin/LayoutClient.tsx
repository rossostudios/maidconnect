"use client";

import { type ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
};

export function AdminLayoutClient({ children }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return <>{children}</>;
}
