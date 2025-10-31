# Monitoring Setup for MaidConnect

This document outlines how to set up monitoring for the MaidConnect platform using free/low-cost solutions.

## Recommended Solution: Better Stack (Logtail)

Better Stack offers a generous free tier (1GB/month) perfect for launch and early growth.

### Setup Steps

1. **Create Account**
   - Go to [betterstack.com/logtail](https://betterstack.com/logtail)
   - Sign up for free account
   - Create a new source for "MaidConnect"

2. **Get Source Token**
   - Copy your Logtail source token
   - Add to `.env`:
     ```
     LOGTAIL_SOURCE_TOKEN=your-source-token-here
     ```

3. **Install Package**
   ```bash
   npm install @logtail/node @logtail/winston
   ```

4. **Create Logger Utility** (`src/lib/logger.ts`)
   ```typescript
   import { Logtail } from "@logtail/node";
   import { createLogger, format, transports } from "winston";
   import { LogtailTransport } from "@logtail/winston";

   const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN || "");

   export const logger = createLogger({
     level: "info",
     format: format.combine(
       format.timestamp(),
       format.errors({ stack: true }),
       format.json()
     ),
     transports: [
       new LogtailTransport(logtail),
       new transports.Console({
         format: format.combine(
           format.colorize(),
           format.simple()
         )
       })
     ]
   });
   ```

5. **Usage in Your Code**
   ```typescript
   import { logger } from "@/lib/logger";

   // Log errors
   try {
     // Your code
   } catch (error) {
     logger.error("Something went wrong", {
       error: error instanceof Error ? error.message : "Unknown error",
       stack: error instanceof Error ? error.stack : undefined,
       userId: user?.id,
       context: "booking-creation"
     });
   }

   // Log important events
   logger.info("User signed up", {
     userId: user.id,
     role: user.role,
     timestamp: new Date().toISOString()
   });

   // Log warnings
   logger.warn("Rate limit approaching", {
     ip: clientIp,
       remaining: rateLimit.remaining
   });
   ```

## Alternative: DIY Supabase Logger ($0 forever)

If you want a completely free solution, use Supabase itself for logging.

### Setup Steps

1. **Create Logs Table**
   ```sql
   CREATE TABLE IF NOT EXISTS public.application_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     level TEXT NOT NULL, -- 'info', 'warn', 'error'
     message TEXT NOT NULL,
     context JSONB,
     user_id UUID REFERENCES auth.users(id),
     ip_address TEXT,
     user_agent TEXT
   );

   -- Index for faster queries
   CREATE INDEX idx_logs_created_at ON public.application_logs(created_at DESC);
   CREATE INDEX idx_logs_level ON public.application_logs(level);
   CREATE INDEX idx_logs_user_id ON public.application_logs(user_id);

   -- RLS policies (logs should only be readable by admins)
   ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Admins can view all logs" ON public.application_logs
   FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'admin'
     )
   );

   CREATE POLICY "Service role can insert logs" ON public.application_logs
   FOR INSERT
   WITH CHECK (true);
   ```

2. **Create Logger Utility** (`src/lib/supabase-logger.ts`)
   ```typescript
   import { createSupabaseServerClient } from "./supabase/server-client";

   type LogLevel = "info" | "warn" | "error";

   export async function logToSupabase(
     level: LogLevel,
     message: string,
     context?: Record<string, unknown>
   ) {
     try {
       const supabase = await createSupabaseServerClient();

       await supabase.from("application_logs").insert({
         level,
         message,
         context: context || {},
         created_at: new Date().toISOString()
       });
     } catch (error) {
       // Fallback to console if Supabase logging fails
       console.error("Failed to log to Supabase:", error);
       console.log({ level, message, context });
     }
   }
   ```

3. **Usage**
   ```typescript
   import { logToSupabase } from "@/lib/supabase-logger";

   await logToSupabase("error", "Payment failed", {
     userId: user.id,
     bookingId: booking.id,
     amount: payment.amount,
     error: error.message
   });
   ```

## What to Monitor

### Critical Errors (Always Log)
- Authentication failures
- Payment processing errors
- Database connection failures
- API endpoint errors
- Booking creation/update failures

### Important Events (Log for Analytics)
- User signups
- Booking completions
- Payout processing
- Account deletions
- Rate limit hits

### Performance Metrics (Optional)
- API response times
- Database query performance
- Third-party API latencies (Stripe, Supabase)

## Viewing Logs

### Better Stack
- Dashboard: [logs.betterstack.com](https://logs.betterstack.com)
- Real-time log streaming
- Search and filter by level, user, context
- Set up alerts for critical errors

### Supabase Logs
- Query via dashboard: Supabase → Table Editor → application_logs
- Or create a custom admin page:
  ```typescript
  const { data: logs } = await supabase
    .from("application_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  ```

## Alerting (Better Stack Only)

Configure alerts in Better Stack:
1. Go to Alerts section
2. Create new alert
3. Set conditions:
   - Error level = "error"
   - Count > 10 in 5 minutes
4. Set notification channel (Email, Slack, etc.)

## Cost Comparison

| Solution | Free Tier | Paid | Best For |
|----------|-----------|------|----------|
| Better Stack | 1GB/month | $5-20/mo | Production with alerts |
| Supabase Logger | ♾️ Unlimited | $0 | Budget-conscious startups |
| Both | Best of both | $5/mo | Redundancy + alerts |

## Recommendation

**For Launch**: Start with **both** solutions
- Use Better Stack for errors/warnings (stays under 1GB free)
- Use Supabase for info logs and analytics
- Cost: $0/month
- Upgrade to Better Stack paid when you need alerts

## Next Steps

1. ✅ Choose your monitoring solution
2. ✅ Set up account and get credentials
3. ✅ Install packages (if using Better Stack)
4. ✅ Create logger utility
5. ✅ Add logging to critical paths (auth, payments, bookings)
6. ✅ Test logging in development
7. ✅ Configure alerts (Better Stack)
8. ✅ Deploy to production

## Resources

- [Better Stack Docs](https://betterstack.com/docs/logs/)
- [Supabase Logging Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#logging-and-monitoring)
- [Winston Logger Docs](https://github.com/winstonjs/winston)
