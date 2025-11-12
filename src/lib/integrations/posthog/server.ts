/**
 * PostHog Server Configuration
 * Server-side analytics for API routes and server actions
 */

import { PostHog } from "posthog-node";

let posthogInstance: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (posthogInstance) {
    return posthogInstance;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey) {
    console.warn("PostHog: Missing NEXT_PUBLIC_POSTHOG_KEY");
    return null;
  }

  posthogInstance = new PostHog(apiKey, {
    host,
    flushAt: 1, // Flush immediately in serverless
    flushInterval: 0,
  });

  return posthogInstance;
}

/**
 * Track server-side event
 */
export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const client = getPostHogClient();
  if (!client) return;

  client.capture({
    distinctId,
    event,
    properties,
  });

  await client.flush();
}

/**
 * Identify user on server
 */
export async function identifyUser(distinctId: string, properties?: Record<string, any>) {
  const client = getPostHogClient();
  if (!client) return;

  client.identify({
    distinctId,
    properties,
  });

  await client.flush();
}
