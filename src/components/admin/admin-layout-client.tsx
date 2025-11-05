"use client";

import { type ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
};

export function AdminLayoutClient({ children }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Save collapse state to localStorage
  const _handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", String(newState));
  };

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return <>{children}</>;
}
