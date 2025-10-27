import type { NextRequest } from "next/server";

const POLAR_BASE_URL = process.env.POLAR_BASE_URL ?? "https://api.polar.sh/v2024-06-01";
const POLAR_SECRET_KEY = process.env.POLAR_SECRET_KEY;
const POLAR_PUBLIC_KEY = process.env.POLAR_PUBLIC_KEY;

if (!POLAR_SECRET_KEY) {
  throw new Error(
    "POLAR_SECRET_KEY is not set. Add it to your environment to enable payment integration.",
  );
}

export type PolarRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  query?: Record<string, string | number | undefined>;
};

export interface PolarApiError {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
}

function buildQueryString(query?: PolarRequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function polarRequest<TResponse>(
  path: string,
  options: PolarRequestOptions = {},
): Promise<TResponse> {
  const { query, headers, ...init } = options;
  const url = `${POLAR_BASE_URL}${path}${buildQueryString(query)}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${POLAR_SECRET_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "maidconnect/0.1.0 (+https://maidconnect.com)",
      ...headers,
    },
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      // ignore
    }

    const error: PolarApiError = {
      status: response.status,
      message:
        (errorBody as { message?: string } | undefined)?.message ??
        `Polar request failed with status ${response.status}`,
      code: (errorBody as { code?: string } | undefined)?.code,
      requestId: response.headers.get("x-request-id") ?? undefined,
    };
    throw error;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export function getPolarPublicKey() {
  if (!POLAR_PUBLIC_KEY) {
    throw new Error("POLAR_PUBLIC_KEY is not set in the environment.");
  }
  return POLAR_PUBLIC_KEY;
}

export function assertPolarSignature(request: NextRequest) {
  const signature = request.headers.get("polar-signature");
  if (!signature) {
    throw new Error("Missing Polar signature header.");
  }
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("POLAR_WEBHOOK_SECRET is not configured.");
  }
  // Polar provides the JoSE header; verification should happen within the webhook handler.
  return { signature, secret: webhookSecret };
}
