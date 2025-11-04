"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ApiMutationOptions<TData = any, TResult = any> = {
  url: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
  refreshOnSuccess?: boolean;
  successMessage?: string;
};

export type ApiMutationResult<TData, TResult> = {
  mutate: (data: TData) => Promise<TResult>;
  isLoading: boolean;
  error: string | null;
  data: TResult | null;
  reset: () => void;
};

/**
 * useApiMutation - API mutation hook with loading/error states
 *
 * Features:
 * - Automatic loading state management
 * - Error handling
 * - Success callbacks
 * - Optional router refresh
 * - Type-safe request/response
 *
 * @example
 * ```tsx
 * const cancelBooking = useApiMutation({
 *   url: "/api/bookings/cancel",
 *   method: "POST",
 *   refreshOnSuccess: true,
 *   onSuccess: () => console.log("Cancelled!"),
 * });
 *
 * await cancelBooking.mutate({ bookingId: "123" });
 * ```
 */
export function useApiMutation<TData = any, TResult = any>({
  url,
  method = "POST",
  onSuccess,
  onError,
  refreshOnSuccess = false,
  successMessage,
}: ApiMutationOptions<TData, TResult>): ApiMutationResult<TData, TResult> {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  const mutate = async (requestData: TData): Promise<TResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Request failed with status ${response.status}`);
      }

      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      if (refreshOnSuccess) {
        router.refresh();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);

      if (onError && err instanceof Error) {
        onError(err);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
    error,
    data,
    reset,
  };
}

/**
 * useApiMutationWithToast - API mutation with toast notifications
 * (Placeholder for future implementation with toast system)
 */
export function useApiMutationWithToast<TData = any, TResult = any>(
  options: ApiMutationOptions<TData, TResult>
) {
  // This can be enhanced later with a toast notification system
  return useApiMutation(options);
}
