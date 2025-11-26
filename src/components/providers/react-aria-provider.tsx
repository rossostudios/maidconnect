"use client";

/**
 * React Aria Provider for Next.js App Router
 *
 * Wraps the application with React Aria's RouterProvider to:
 * 1. Enable client-side navigation for React Aria Link components
 * 2. Ensure consistent ID generation between server and client (fixes hydration mismatches)
 *
 * @see https://react-spectrum.adobe.com/react-aria/routing.html
 */

import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  type RouterConfig = {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  };
}

type ReactAriaProviderProps = {
  children: React.ReactNode;
};

export function ReactAriaProvider({ children }: ReactAriaProviderProps) {
  const router = useRouter();

  return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}
