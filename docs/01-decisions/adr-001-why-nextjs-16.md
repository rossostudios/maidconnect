# ADR-001: Why Next.js 16 for Casaora Platform

**Date:** 2025-01-06
**Status:** Accepted
**Deciders:** Technical Leadership Team
**Tags:** `framework`, `react`, `nextjs`, `architecture`

---

## Context

Casaora is a two-sided marketplace connecting Colombian homeowners with verified cleaning professionals. The platform requires:

- **High performance** for both customers and professionals across desktop and mobile devices
- **SEO optimization** for marketing pages to attract organic traffic in Colombian market
- **Real-time features** for messaging, booking updates, and notifications
- **Scalability** to handle growing user base (target: 10,000+ monthly bookings)
- **Developer productivity** to iterate quickly on features and maintain competitive advantage
- **i18n support** for Spanish-first content with English fallback
- **Integration capabilities** with Supabase (database), Stripe (payments), and third-party APIs

We evaluated four modern React meta-frameworks as the foundation for our platform:

1. **Next.js 16** - Full-stack React framework by Vercel
2. **Remix** - Server-side rendering focused framework
3. **SvelteKit** - Compiler-based framework with Svelte
4. **Astro** - Static-first framework with optional interactivity

---

## Decision

**We chose Next.js 16 as our application framework.**

Specifically, we use:
- **Next.js 16.0+** with App Router
- **Turbopack** for development and production builds
- **React 19.2** with Server Components
- **proxy.ts pattern** for request interception (replaces middleware.ts)
- **Partial Pre-Rendering (PPR)** for optimal performance
- **Cache Components** for explicit caching strategies

---

## Consequences

### Positive

#### 1. **Unmatched Ecosystem and Community**
- **31M+ weekly npm downloads** (vs Remix: 500k, SvelteKit: 800k)
- **Largest community** for troubleshooting, plugins, and integrations
- **Extensive documentation** and learning resources in Spanish and English
- **Enterprise adoption** provides stability and long-term support

#### 2. **Performance Optimizations Out-of-the-Box**
- **Turbopack**: 2-5x faster builds, up to 10x faster Fast Refresh vs Webpack
- **Automatic code splitting** reduces initial bundle size
- **Image optimization** with `next/image` component (automatic WebP/AVIF)
- **Font optimization** with `next/font` (zero layout shift)
- **Edge Runtime support** for ~41 of 42 API routes (low latency globally)

#### 3. **Flexible Rendering Strategies**
Next.js supports all rendering modes in a single application:
- **SSG (Static Site Generation)** for marketing pages (`/about`, `/pricing`)
- **SSR (Server-Side Rendering)** for dynamic dashboards
- **ISR (Incremental Static Regeneration)** for professional profiles
- **PPR (Partial Pre-Rendering)** combines static shell with streaming dynamic content
- **Client-side rendering** for highly interactive components

This flexibility is critical for a marketplace with both static content (marketing) and dynamic data (bookings, messaging).

#### 4. **First-Class Supabase Integration**
- **Official Supabase Next.js helpers** (`@supabase/ssr`)
- **Seamless authentication** with Server Components and Server Actions
- **Cookie-based session management** works perfectly with proxy.ts
- **RLS (Row Level Security)** policies enforced server-side

Example:
```typescript
// Server Component - Direct database access
export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*');

  return <BookingList bookings={bookings} />;
}
```

#### 5. **Modern React 19 Features**
- **Server Components** reduce client bundle size by 40-60%
- **Server Actions** eliminate API route boilerplate for mutations
- **`useOptimistic`** for instant UI updates before server confirmation
- **React Compiler** for automatic memoization (performance gains)

#### 6. **Built-in i18n Routing**
- **Locale detection** via headers and cookies
- **Automatic route prefixing** (`/es/about`, `/en/about`)
- **SEO-friendly** with proper `hreflang` tags
- Works seamlessly with `next-intl` for Spanish-first strategy

#### 7. **Vercel Deployment Integration**
- **Zero-config deployments** with automatic CI/CD
- **Preview deployments** for every PR
- **Edge Network** for global low latency
- **Analytics** and **Web Vitals** monitoring built-in
- **Automatic HTTPS** and CDN optimization

#### 8. **Developer Experience**
- **Fast Refresh** with Turbopack (instant feedback)
- **TypeScript-first** design with excellent type inference
- **File-based routing** (intuitive and predictable)
- **Built-in linting** and error overlays
- **Rich debugging tools** (React DevTools, Performance Profiler)

### Negative

#### 1. **Learning Curve**
- **App Router complexity** requires understanding Server vs Client Components
- **New concepts** (Server Actions, `proxy.ts`, PPR) take time to master
- **Breaking changes** between Next.js versions (though 16 is now stable)

**Mitigation:** We document all patterns in [CLAUDE.md](/CLAUDE.md) and [docs/03-technical/architecture.md](/docs/03-technical/architecture.md).

#### 2. **Vendor Lock-in to Vercel Ecosystem**
- **Best experience** is on Vercel hosting (though self-hosting is possible)
- **Some features** (Middleware, Edge Runtime) optimized for Vercel infrastructure
- **Pricing** can increase with scale (though free tier is generous)

**Mitigation:** We can migrate to self-hosted Next.js on AWS/DigitalOcean if needed. Core codebase remains portable.

#### 3. **Bundle Size**
- **Next.js runtime** adds ~80KB gzipped to client bundle
- **React 19** is larger than alternatives like Svelte (~20KB)

**Mitigation:** For a marketplace with rich features, the developer productivity and ecosystem value outweigh the bundle size cost. We optimize with:
- Dynamic imports for heavy components
- Server Components for non-interactive content
- Image and font optimizations

#### 4. **Framework Churn**
- **Rapid evolution** (Pages Router → App Router → PPR) can cause confusion
- **Deprecations** require periodic updates (e.g., `middleware.ts` → `proxy.ts`)

**Mitigation:** We stay on LTS versions and use Exa MCP to research before implementing new patterns.

---

## Alternatives Considered

### Remix
**Strengths:**
- Excellent server-side rendering and data loading patterns
- Web standards-first approach (native FormData, HTTP caching)
- Simpler mental model (no Client/Server Component split)
- Built-in error boundaries and optimistic UI

**Why we didn't choose it:**
- **Smaller ecosystem** (500k vs 31M weekly downloads)
- **Fewer integrations** with third-party services
- **Limited static optimization** (not ideal for marketing pages)
- **Smaller talent pool** (harder to hire experienced Remix developers)
- **Less mature** for complex marketplace requirements (bookings, payments, messaging)

**Verdict:** Great for server-rendered apps, but Next.js offers more flexibility for our mixed content (static marketing + dynamic app).

---

### SvelteKit
**Strengths:**
- **Best performance** due to compiler approach (no virtual DOM)
- **Smaller bundle sizes** (~20KB vs ~80KB)
- **Simpler syntax** and shorter learning curve
- **Great developer experience** with reactive state management

**Why we didn't choose it:**
- **Svelte paradigm shift** (different from React ecosystem)
- **Smaller community** (800k weekly downloads)
- **Fewer component libraries** (no equivalent to shadcn/ui, Radix)
- **Limited hiring pool** in Latin America (React dominates)
- **Less mature integrations** with Supabase, Stripe
- **Risk of ecosystem fragmentation** (Svelte 4 → Svelte 5 migration)

**Verdict:** Excellent framework, but React's ecosystem and hiring advantages are critical for a fast-growing startup.

---

### Astro
**Strengths:**
- **Zero JavaScript by default** (best for static content)
- **Multi-framework support** (can use React, Svelte, Vue in same app)
- **Fastest load times** for content-heavy sites
- **Excellent for blogs/docs**

**Why we didn't choose it:**
- **Not designed for SPAs** or highly interactive apps
- **Weak real-time capabilities** (no built-in WebSocket support)
- **No Server Actions equivalent** (need separate API routes)
- **Overkill for static content** when we also need dynamic features

**Verdict:** Perfect for marketing sites, but Casaora is a full-featured marketplace requiring rich interactivity, authentication, and real-time features.

---

## Technical Comparison

| Feature | Next.js 16 | Remix | SvelteKit | Astro |
|---------|-----------|-------|-----------|-------|
| **Ecosystem Size** | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ |
| **Performance** | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★★ |
| **Developer Experience** | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| **Static Generation** | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★★★★ |
| **Server Rendering** | ★★★★★ | ★★★★★ | ★★★★☆ | ★★☆☆☆ |
| **Real-time Features** | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★☆☆☆☆ |
| **Learning Curve** | ★★★☆☆ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| **Supabase Integration** | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★☆☆☆ |
| **Stripe Integration** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |
| **i18n Support** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ |
| **Deployment Options** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★☆ |
| **Hiring Pool** | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ | ★★☆☆☆ |

---

## Business Impact

### Time to Market
- **Faster development** with rich ecosystem (component libraries, integrations)
- **Pre-built solutions** for authentication, payments, analytics
- **Rapid prototyping** with Server Components and Server Actions

### Cost Efficiency
- **Free Vercel tier** for small teams (generous limits)
- **Predictable scaling costs** as we grow
- **Reduced maintenance burden** with automatic updates

### Hiring and Team Growth
- **Largest React talent pool** globally and in Latin America
- **Easier onboarding** for new developers (abundant tutorials, courses)
- **Future-proof skills** (React dominates job market)

### Scalability
- **Proven at scale** by companies like Netflix, Hulu, TikTok, Twitch
- **Edge deployment** for global low latency
- **Incremental adoption** of new features (PPR, React Compiler)

---

## Implementation Details

### File Structure
```
maidconnect/
├── proxy.ts                  # Request interception (auth, i18n, CSRF)
├── next.config.ts            # Turbopack, PPR, environment config
├── src/
│   ├── app/                  # App Router pages
│   │   ├── [locale]/         # i18n routes (es, en)
│   │   │   ├── page.tsx      # Home page (SSG)
│   │   │   ├── about/        # Marketing pages (SSG)
│   │   │   ├── professionals/# Professional listings (ISR)
│   │   │   └── dashboard/    # User dashboards (SSR)
│   │   └── api/              # API routes (Edge Runtime)
│   ├── components/           # React components
│   ├── lib/                  # Utilities, Supabase client
│   └── types/                # TypeScript types
└── supabase/
    └── migrations/           # Database migrations
```

### Key Configuration
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: 'incremental',        // Partial Pre-Rendering
    reactCompiler: true,       // React Compiler for auto-memoization
  },
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
};

export default nextConfig;
```

### proxy.ts Pattern (Next.js 16)
```typescript
// proxy.ts (replaces middleware.ts)
export default async function proxy(request: NextRequest) {
  // 1. CSRF Protection
  if (!validateCSRF(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Supabase Session Management
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();

  // 3. RBAC (Role-Based Access Control)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // 4. Route Protection
  if (protectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // 5. i18n Detection
  const locale = detectLocale(request); // es or en

  return NextResponse.next();
}
```

---

## Success Metrics

We will measure the success of this decision by:

1. **Performance**
   - Lighthouse scores > 90 on all metrics
   - First Contentful Paint (FCP) < 1.5s
   - Time to Interactive (TTI) < 3s
   - Core Web Vitals passing

2. **Developer Productivity**
   - Feature development velocity (story points per sprint)
   - Time to onboard new developers < 2 weeks
   - Build times < 30s for development, < 3min for production

3. **Business Outcomes**
   - SEO rankings for target keywords ("servicio de limpieza en Colombia")
   - Conversion rates from landing pages to bookings
   - User retention and engagement metrics

4. **Scalability**
   - Support 10,000+ monthly bookings without performance degradation
   - Handle 100+ concurrent users without crashes
   - Database query performance < 100ms average

---

## References

1. **Next.js 16 Release Notes**
   https://nextjs.org/blog/next-16

2. **Next.js vs Remix 2025 Comparison (Strapi)**
   https://strapi.io/blog/next-js-vs-remix-2025-developer-framework-showdown

3. **Remix vs NextJS 2025 Comparison (Merge Rocks)**
   https://merge.rocks/blog/remix-vs-nextjs-2025-comparison

4. **Next.js vs Remix vs Astro vs SvelteKit (Medium)**
   https://medium.com/better-dev-nextjs-react/next-js-vs-remix-vs-astro-vs-sveltekit-the-2025-showdown-9ee0fe140033

5. **SvelteKit vs Next.js Comparison (Superflex)**
   https://www.superflex.ai/blog/sveltekit-vs-next-js

6. **Next.js 16 Comprehensive Guide (Nandann.com)**
   https://www.nandann.com/blog/nextjs-16-release-comprehensive-guide

7. **Next.js Documentation**
   https://nextjs.org/docs

8. **Supabase Next.js Integration Guide**
   https://supabase.com/docs/guides/auth/server-side/nextjs

9. **Vercel Next.js Analytics**
   https://vercel.com/docs/analytics

10. **React 19 Documentation**
    https://react.dev

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-06 | 1.0.0 | Initial ADR created | Technical Leadership Team |

---

**Related ADRs:**
- [ADR-002: Why proxy.ts Pattern](./adr-002-why-proxy-ts-pattern.md) *(Next)*
- [ADR-003: Why Supabase](./adr-003-why-supabase.md)
- [ADR-005: Why Tailwind CSS 4.1](./adr-005-why-tailwind-css-4.1.md)
