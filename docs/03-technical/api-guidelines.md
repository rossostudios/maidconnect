# API Guidelines

Conventions for building robust Next.js API routes backed by Supabase.

## Routing & Middleware
- Define handlers under `src/app/api/.../route.ts`.
- Wrap handlers with `withAuth` or role-specific wrappers (`withProfessional`, `withCustomer`, `withAdmin`).
- Use response helpers (`ok`, `created`, `noContent`) from `@/lib/api`.

## Validation
- Validate request bodies with `zod`; fail fast with clear messages.
- Never trust client input; validate all path/query params.

## Errors
- Throw typed errors: `AuthenticationError`, `UnauthorizedError`, `NotFoundError`, `ValidationError`.
- Middleware will map to HTTP status codes and a consistent JSON shape.

## Pagination & Filtering
- Accept `page`, `limit`, and filters via query params; return a `paginated` response when applicable.
- Prefer index-backed queries and apply `select(..., { count: "exact", head: true })` when counting.

## Security
- Enforce auth via middleware; rely on Supabase RLS for data access control.
- Never return sensitive fields (service keys, PII beyond necessity).

## Versioning
- Prefer additive changes; avoid breaking response shapes.
- If breaking changes are needed, introduce a new route segment (e.g., `/v2/...`) or feature-flag behavior.

## Examples
```ts
import { withProfessional, ok } from "@/lib/api";
import { z } from "zod";

const schema = z.object({ bookingId: z.string().uuid() });

export const POST = withProfessional(async ({ supabase, user }, req: Request) => {
  const body = await req.json();
  const { bookingId } = schema.parse(body);

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("professional_id", user.id)
    .single();

  if (error || !data) throw new NotFoundError("Booking", bookingId);
  return ok(data);
});
```

