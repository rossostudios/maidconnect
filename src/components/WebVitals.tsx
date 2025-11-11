"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportWebVitals } from "@/lib/webVitals";

/**
 * Web Vitals Reporter Component
 *
 * Add this to your root layout to enable Web Vitals monitoring:
 *
 * ```tsx
 * // app/layout.tsx
 * import { WebVitalsReporter } from "@/components/webVitals";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitalsReporter />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function WebVitalsReporter() {
  useReportWebVitals(reportWebVitals);

  // This component doesn't render anything
  return null;
}
