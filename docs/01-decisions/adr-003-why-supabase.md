# ADR-003: Why Supabase for Backend Infrastructure

**Date:** 2025-01-06
**Status:** Accepted
**Deciders:** Technical Leadership Team
**Tags:** `database`, `backend`, `authentication`, `realtime`, `supabase`

---

## Context

Casaora requires a robust backend infrastructure to support a two-sided marketplace with:

- **User authentication** (customers, professionals, admins) with email, social login, and MFA
- **Relational data model** (bookings, payments, profiles, reviews, messages)
- **Real-time features** (instant messaging, booking status updates, notifications)
- **Row-level security** to prevent data leakage between users
- **File storage** for professional ID documents, profile pictures, service photos
- **Scalability** to handle 10,000+ monthly bookings
- **Developer productivity** with minimal backend code
- **Cost efficiency** for a startup budget

We evaluated four Backend-as-a-Service (BaaS) platforms:

1. **Supabase** - Open-source PostgreSQL-based platform
2. **Firebase** - Google's proprietary NoSQL platform
3. **AWS Amplify** - AWS-centric backend framework
4. **Custom Backend** (PostgreSQL + Express + Redis)

---

## Decision

**We chose Supabase as our backend infrastructure provider.**

Our implementation uses:
- **Supabase Database** (managed PostgreSQL 15)
- **Supabase Auth** (email/password, Google OAuth, MFA)
- **Supabase Storage** (S3-compatible file storage)
- **Supabase Realtime** (PostgreSQL logical replication for live updates)
- **Row Level Security (RLS)** policies on all tables
- **@supabase/ssr** package for Next.js integration

---

## Consequences

### Positive

#### 1. **PostgreSQL = Relational Power + SQL Flexibility**

Supabase uses **PostgreSQL 15**, the world's most advanced open-source relational database:

**Why this matters for Casaora:**

```sql
-- ✅ Complex joins are easy and performant
SELECT
  b.id,
  b.scheduled_date,
  b.total_amount,
  b.status,
  c.full_name AS customer_name,
  c.email AS customer_email,
  p.full_name AS professional_name,
  p.rating AS professional_rating,
  s.name AS service_name,
  s.category
FROM bookings b
INNER JOIN profiles c ON b.customer_id = c.id
INNER JOIN profiles p ON b.professional_id = p.id
INNER JOIN services s ON b.service_id = s.id
WHERE b.created_at > NOW() - INTERVAL '30 days'
AND b.status IN ('confirmed', 'in_progress')
ORDER BY b.scheduled_date DESC;
```

**This query is IMPOSSIBLE in Firebase Firestore** (no joins, limited filtering).

**Benefits:**
- **Complex queries** with multiple joins, aggregations, subqueries
- **ACID transactions** ensure data consistency (critical for payments)
- **Full SQL support** for reporting, analytics, and admin dashboards
- **Mature ecosystem** (40+ years of PostgreSQL development)

#### 2. **Row Level Security (RLS) = Built-In Authorization**

RLS is Supabase's **killer feature** - it enforces data access rules **at the database level** (not application level):

```sql
-- Customers can only view their own bookings
CREATE POLICY "Customers can view their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));

-- Professionals can only view their assigned bookings
CREATE POLICY "Professionals can view their assigned bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()));

-- Customers can only update PENDING bookings
CREATE POLICY "Customers can update their pending bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (customer_id = (SELECT auth.uid()) AND status = 'pending')
  WITH CHECK (customer_id = (SELECT auth.uid()));
```

**Why this is revolutionary:**

❌ **Without RLS (Firebase, traditional backends):**
```typescript
// ⚠️ Easy to forget authorization checks - security vulnerability!
export async function getBookings(userId: string) {
  // Developer must remember to filter by userId
  const bookings = await db.bookings.find({ customer_id: userId });
  return bookings;
}

// ❌ What if someone forgets the filter?
const bookings = await db.bookings.find({}); // Returns ALL bookings! 🚨
```

✅ **With RLS (Supabase):**
```typescript
// ✅ RLS automatically enforces authorization
export async function getBookings() {
  // auth.uid() is automatically injected by Supabase
  // User can ONLY see their own bookings - enforced at DB level
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*');

  return bookings; // ✅ Always safe, can't bypass RLS
}
```

**Security benefits:**
- **Zero-trust architecture** - database doesn't trust the application
- **No accidental data leaks** - impossible to query other users' data
- **Simplified code** - no authorization logic in every function
- **Single source of truth** - policies defined once, enforced everywhere

#### 3. **Seamless Next.js Integration with @supabase/ssr**

Supabase provides **official Next.js helpers** for Server Components, API routes, and middleware:

```typescript
// lib/supabase/server-client.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**Usage in Server Components:**
```typescript
// app/[locale]/dashboard/customer/bookings/page.tsx
export default async function BookingsPage() {
  const supabase = await createClient();

  // Direct database access in Server Component (no API route needed)
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, professional:profiles!professional_id(*), service:services!service_id(*)')
    .eq('customer_id', (await supabase.auth.getUser()).data.user?.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return <BookingsList bookings={bookings} />;
}
```

**Benefits:**
- **No API routes needed** for data fetching (Server Components access DB directly)
- **Automatic session refresh** (tokens expire after 1 hour)
- **Type-safe** with generated TypeScript types
- **Edge-compatible** (works with Vercel Edge Runtime)

#### 4. **Real-Time Subscriptions for Live Updates**

Supabase uses **PostgreSQL logical replication** to broadcast database changes to clients:

```typescript
// Client-side: Listen for new messages
const supabase = createClient();

useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      },
      (payload) => {
        console.log('New message:', payload.new);
        setMessages((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [bookingId]);
```

**Use cases in Casaora:**
- **Instant messaging** between customers and professionals
- **Booking status updates** (professional accepts booking → customer sees update instantly)
- **Live availability** (professional updates calendar → customer sees available slots)
- **Notifications** (new review posted → professional dashboard updates)

**Advantages over Firebase Realtime Database:**
- **Built on standard PostgreSQL** (no proprietary protocol)
- **Works with RLS** (security policies apply to subscriptions)
- **No separate NoSQL database** needed for real-time features

#### 5. **Open Source = No Vendor Lock-In**

Supabase is **100% open-source** (MIT license):

```bash
# Self-host Supabase with Docker Compose
git clone https://github.com/supabase/supabase.git
cd supabase/docker
docker-compose up -d
```

**This means:**
- ✅ **Export PostgreSQL database** anytime (standard pg_dump)
- ✅ **Migrate to any PostgreSQL provider** (Neon, RDS, DigitalOcean, Supabase Cloud)
- ✅ **Self-host** for compliance, data residency, or cost optimization
- ✅ **No proprietary APIs** (uses standard SQL, REST, and WebSockets)

**vs. Firebase:**
- ❌ **Firestore data export** requires custom scripts (no standard format)
- ❌ **Locked into Google Cloud** (can't migrate easily)
- ❌ **Proprietary SDKs** (tied to Firebase client libraries)

#### 6. **Cost Efficiency for Startups**

**Supabase Pricing (Free Tier):**
- **500MB database** (enough for 10,000+ bookings)
- **1GB file storage** (profile pictures, ID documents)
- **Unlimited API requests** (no throttling)
- **50,000 monthly active users**
- **2GB bandwidth**
- **All features included** (auth, realtime, storage)

**Paid Tier ($25/month):**
- **8GB database**
- **100GB file storage**
- **Unlimited API requests**
- **Daily backups** (point-in-time recovery)
- **No pausing** (free tier pauses after 7 days inactivity)

**vs. Firebase Pricing:**
- **Read/write costs** add up quickly (50,000 reads = $0.36/day = $10.80/month)
- **Bandwidth costs** ($0.12/GB downloaded)
- **Storage costs** ($0.18/GB/month)
- **Unpredictable billing** (usage spikes can cause surprise costs)

**For Casaora's projected usage (5,000 bookings/month):**
- **Supabase:** $25/month (fixed cost)
- **Firebase:** $150-$300/month (variable, based on reads/writes)

#### 7. **Database Migrations with SQL**

Supabase uses **standard PostgreSQL migrations** (no proprietary tools):

```sql
-- supabase/migrations/20251105120000_create_bookings_table.sql

CREATE TYPE booking_status AS ENUM (
  'pending_payment',
  'authorized',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES public.services(id),
  status booking_status NOT NULL DEFAULT 'pending_payment',
  scheduled_date TIMESTAMPTZ NOT NULL,
  total_amount INTEGER NOT NULL CHECK (total_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_professional_id ON public.bookings(professional_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- RLS Policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));
```

**Benefits:**
- **Version controlled** (migrations tracked in Git)
- **Reproducible** (same migrations work locally and in production)
- **Rollback support** (can revert to previous schema)
- **No GUI required** (migrations are code, not clicks)

#### 8. **Built-In Authentication with MFA**

Supabase Auth supports:
- ✅ **Email/password** with email verification
- ✅ **Magic links** (passwordless login)
- ✅ **Social logins** (Google, Facebook, Apple, GitHub)
- ✅ **Phone/SMS** authentication
- ✅ **Multi-Factor Authentication (MFA)** with TOTP
- ✅ **JWT tokens** with automatic refresh
- ✅ **Row Level Security integration** via `auth.uid()`

```typescript
// Sign up with email/password
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    data: {
      full_name: 'María García',
      role: 'customer',
    },
  },
});

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
});

// Enable MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
});
```

**vs. Firebase Auth:**
- **Similar features** but Supabase integrates directly with PostgreSQL (no separate user database)
- **auth.uid()** function works in SQL queries and RLS policies

#### 9. **PostgreSQL Extensions for Advanced Features**

Supabase enables **PostgreSQL extensions** for specialized use cases:

```sql
-- pg_cron: Scheduled tasks (payout processing, cleanup)
CREATE EXTENSION pg_cron;

SELECT cron.schedule(
  'process-payouts',
  '0 10 * * 2,5',  -- Every Tuesday and Friday at 10 AM
  $$
  SELECT process_professional_payouts();
  $$
);

-- pgvector: AI/ML embeddings (semantic search for help articles)
CREATE EXTENSION vector;

CREATE TABLE help_articles (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT,
  embedding VECTOR(1536)  -- OpenAI embeddings
);

-- Semantic search
SELECT title, content
FROM help_articles
ORDER BY embedding <=> $embedding_query
LIMIT 5;

-- PostGIS: Geolocation (find professionals near customer)
CREATE EXTENSION postgis;

SELECT p.id, p.full_name, ST_Distance(p.location, $customer_location) AS distance
FROM profiles p
WHERE p.role = 'professional'
AND ST_DWithin(p.location, $customer_location, 10000)  -- Within 10km
ORDER BY distance
LIMIT 10;
```

**These extensions would require custom infrastructure in Firebase.**

---

### Negative

#### 1. **Less Mature Realtime Infrastructure**

Firebase's realtime infrastructure has been **battle-tested since 2012**. Supabase Realtime (launched 2020) is newer and has some limitations:

**Firebase Realtime Database advantages:**
- **Purpose-built for real-time** (optimized for low latency)
- **Offline support** (built-in local caching and sync)
- **Presence detection** (know when users are online/offline)

**Supabase Realtime limitations:**
- **No offline support** (must implement custom caching)
- **WebSocket overhead** (requires persistent connection)
- **PostgreSQL replication lag** (~100ms vs Firebase's ~50ms)

**Mitigation:**
- For Casaora's messaging use case, **100ms latency is acceptable** (users won't notice)
- We implement **optimistic UI updates** with `useOptimistic` hook (instant UI feedback)
- Critical real-time features (payments, bookings) use **Server Actions** (not realtime subscriptions)

#### 2. **Smaller Ecosystem Compared to Firebase**

Firebase has been around since 2011 and has **extensive third-party integrations:**
- **Firebase Extensions** (Stripe, Algolia, SendGrid, etc.)
- **Larger community** (more Stack Overflow answers, tutorials)
- **More client libraries** (iOS, Android, Web, Unity, C++)

Supabase (launched 2020) has a **growing but smaller ecosystem:**
- Fewer pre-built integrations
- Limited mobile SDKs (Flutter SDK is official, React Native requires setup)

**Mitigation:**
- For Casaora (web-focused), **Next.js integration is excellent** (official Supabase helpers)
- We integrate Stripe, Resend, etc. directly via their APIs (not Supabase extensions)
- Open-source nature allows us to build custom integrations if needed

#### 3. **Learning Curve for SQL**

Firebase Firestore uses **document-based queries** (no SQL knowledge needed):

```typescript
// Firestore: Simple document queries
const bookings = await db.collection('bookings')
  .where('customerId', '==', userId)
  .where('status', 'in', ['confirmed', 'in_progress'])
  .orderBy('scheduledDate', 'desc')
  .get();
```

Supabase requires **SQL knowledge** for complex queries:

```typescript
// Supabase: SQL-based queries (more powerful but steeper learning curve)
const { data: bookings } = await supabase
  .from('bookings')
  .select('*, professional:profiles!professional_id(*)')
  .in('status', ['confirmed', 'in_progress'])
  .order('scheduled_date', { ascending: false });
```

**Mitigation:**
- **Our team has SQL experience** (common skill for backend developers)
- **Supabase Studio** (GUI) allows point-and-click query building for non-technical users
- **ChatGPT/Claude** can generate SQL queries from natural language

#### 4. **Supabase Cloud Outages Impact All Customers**

Supabase Cloud is a **shared infrastructure** (unlike AWS Amplify where you control your own AWS account):

- **Single point of failure** (if Supabase Cloud goes down, our app is down)
- **Regional limitations** (limited to US East, EU West, AP Southeast)
- **Less control** over scaling, backups, and performance tuning

**Mitigation:**
- **Supabase has 99.9% uptime SLA** (comparable to Firebase)
- **We can self-host** if reliability becomes critical (migrate to RDS, Neon, or self-managed Postgres)
- **Daily backups** (can restore to any point in time within 7 days)

---

## Alternatives Considered

### 1. Firebase (Google Cloud)

**Strengths:**
- **Mature realtime infrastructure** (12+ years)
- **Best-in-class offline support** (local caching, automatic sync)
- **Excellent mobile SDKs** (iOS, Android, Flutter)
- **Huge community** and ecosystem
- **Firebase Extensions** for pre-built integrations

**Why we didn't choose it:**

1. **NoSQL limitations** - Firestore can't handle complex queries:
   ```javascript
   // ❌ IMPOSSIBLE in Firestore
   // "Get all bookings with customer name, professional rating, and service category"
   // (Requires 3 separate queries + client-side joins)

   // ✅ TRIVIAL in Supabase PostgreSQL
   SELECT b.*, c.name, p.rating, s.category
   FROM bookings b
   JOIN profiles c ON b.customer_id = c.id
   JOIN profiles p ON b.professional_id = p.id
   JOIN services s ON b.service_id = s.id;
   ```

2. **No built-in authorization** - Must implement security rules manually:
   ```javascript
   // Firestore Security Rules (error-prone, hard to test)
   match /bookings/{bookingId} {
     allow read: if request.auth.uid == resource.data.customerId
                 || request.auth.uid == resource.data.professionalId;
   }

   // vs. Supabase RLS (SQL-based, testable, enforced at DB level)
   ```

3. **Vendor lock-in** - Firestore data is proprietary (hard to export/migrate)
4. **Unpredictable costs** - Read/write billing can spike unexpectedly

---

### 2. AWS Amplify

**Strengths:**
- **Full AWS ecosystem** (DynamoDB, S3, Lambda, Cognito, AppSync)
- **Enterprise-grade** scalability and reliability
- **GraphQL API** with automatic CRUD generation
- **Fine-grained IAM** controls

**Why we didn't choose it:**

1. **Steep learning curve** - Requires deep AWS knowledge (IAM, CloudFormation, etc.)
2. **Complex setup** - Amplify CLI generates hundreds of config files
3. **AWS lock-in** - Tied to AWS-specific services (DynamoDB, Cognito, AppSync)
4. **Higher costs** - AWS billing is complex and expensive for small startups
5. **Overkill for our use case** - Casaora doesn't need enterprise AWS complexity

**Example complexity:**
```bash
# Amplify setup (60+ files generated)
amplify init
amplify add auth      # Cognito
amplify add api       # AppSync + DynamoDB
amplify add storage   # S3
amplify push          # Deploy to AWS

# vs. Supabase setup (1 file)
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_ID
```

---

### 3. Custom Backend (PostgreSQL + Express + Redis)

**Strengths:**
- **Full control** over architecture, scaling, and costs
- **No vendor lock-in** (portable to any hosting provider)
- **Customizable** to exact needs
- **Lower long-term costs** (no BaaS markup)

**Why we didn't choose it:**

1. **Massive development time** - Building auth, file storage, realtime, and admin dashboard from scratch = 3-6 months
2. **Ongoing maintenance burden** - Security patches, backups, monitoring, scaling
3. **Distraction from core product** - Time spent on infrastructure != time building marketplace features
4. **Higher initial risk** - Custom code has bugs; battle-tested platforms are proven

**Estimated effort:**
| Feature | Custom Backend | Supabase |
|---------|----------------|----------|
| Authentication | 2-3 weeks | ✅ Built-in |
| Authorization (RLS) | 2-4 weeks | ✅ Built-in |
| File Storage | 1-2 weeks | ✅ Built-in |
| Realtime Subscriptions | 2-3 weeks | ✅ Built-in |
| Admin Dashboard | 3-4 weeks | ✅ Built-in |
| Database Backups | 1 week | ✅ Built-in |
| Monitoring & Logs | 1-2 weeks | ✅ Built-in |
| **Total** | **12-19 weeks** | **< 1 week** |

**Decision:** For a startup with limited runway, **Supabase's 12-19 week time savings is worth the BaaS fees**.

---

## Technical Implementation

### Database Schema Example

```sql
-- profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'professional', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
```

### Type-Safe Client Usage

```typescript
// Generate TypeScript types from database schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

// Type-safe queries
import type { Database } from '@/types/supabase';

const supabase = createClient<Database>();

const { data: bookings } = await supabase
  .from('bookings')
  .select('*, professional:profiles!professional_id(*)')
  .returns<BookingWithProfessional[]>();
```

---

## Success Metrics

We measure the success of this decision by:

1. **Performance**
   - Database query response time < 100ms (p95)
   - Realtime message latency < 200ms
   - Auth operations < 500ms

2. **Reliability**
   - 99.9% uptime (aligned with Supabase SLA)
   - Zero data loss incidents
   - < 1 hour recovery time for backups

3. **Developer Productivity**
   - New features ship in days, not weeks
   - < 50 lines of backend code per feature (RLS handles authorization)
   - Zero security incidents due to authorization bugs

4. **Cost Efficiency**
   - < $100/month for first 5,000 bookings/month
   - Predictable scaling costs (no surprise billing)

---

## References

1. **Supabase vs Firebase Comparison (Bytebase)**
   https://www.bytebase.com/blog/supabase-vs-firebase-2025

2. **Supabase vs Firebase (Zapier)**
   https://zapier.com/blog/supabase-vs-firebase/

3. **Supabase vs Firebase vs AWS Amplify (Medium)**
   https://medium.com/@sergey.prusov/supabase-vs-firebase-vs-aws-amplify-which-backend-as-a-service-wont-lock-you-in-4bdcaa98d1dc

4. **Supabase Row Level Security Documentation**
   https://supabase.com/docs/guides/database/postgres/row-level-security

5. **Supabase Next.js Integration Guide**
   https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

6. **PostgreSQL vs NoSQL for Marketplaces**
   https://www.prisma.io/dataguide/postgresql/benefits-of-postgresql

7. **Supabase GitHub Repository**
   https://github.com/supabase/supabase

8. **Supabase Auth Documentation**
   https://supabase.com/docs/guides/auth

9. **Supabase Realtime Documentation**
   https://supabase.com/docs/guides/realtime

10. **PostgreSQL Official Documentation**
    https://www.postgresql.org/docs/

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-06 | 1.0.0 | Initial ADR created | Technical Leadership Team |

---

**Related ADRs:**
- [ADR-001: Why Next.js 16](./adr-001-why-nextjs-16.md)
- [ADR-002: Why proxy.ts Pattern](./adr-002-why-proxy-ts-pattern.md)
- [ADR-004: Why Stripe Connect](./adr-004-why-stripe-connect.md) *(Next)*
