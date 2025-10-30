# DIY Compliance Implementation - Bootstrap Guide

## 🎯 Goal: Safe Launch Without Legal Fees

This guide provides **actionable implementation steps** for compliance requirements you can do yourself. We'll use research, templates, and open-source tools to replace expensive lawyers and services.

**⚠️ Important Disclaimer:**
- This is NOT legal advice
- Self-implementation has risks
- Consider lawyer review when revenue allows
- Many successful startups launch this way and iterate

**Timeline:** 2-3 weeks
**Cost:** $0-$500 (mostly free tools)

---

## 🇨🇴 Part 1: Colombian Data Protection (Ley 1581 de 2012)

### What You Need to Know

**Core Requirements:**
1. **Inform users** what data you collect and why
2. **Get consent** before collecting personal data
3. **Allow users** to access, correct, and delete their data
4. **Secure the data** with reasonable measures
5. **Have a privacy policy** in Spanish

**Good News:** This is mostly about transparency and good practices, not complex legal structures.

### Implementation Steps

#### Step 1: Update Privacy Policy (2-3 hours)

**Use this template structure:**

```markdown
# Política de Privacidad - MaidConnect

**Última actualización:** [Date]

## 1. Responsable del Tratamiento
- **Razón Social:** [Your company name]
- **Domicilio:** [Address in Colombia]
- **Email:** privacy@maidconnect.com
- **Teléfono:** [Phone]

## 2. Datos Personales que Recopilamos

### 2.1 Datos de Identificación
- Nombre completo
- Correo electrónico
- Número de teléfono
- Dirección física

### 2.2 Datos de Ubicación
- Coordenadas GPS durante check-in/check-out de servicios
- **Finalidad:** Verificar presencia del profesional en la ubicación del servicio

### 2.3 Datos Financieros
- Historial de pagos (NO guardamos números de tarjeta)
- Información de cuenta bancaria (para profesionales que reciben pagos)
- **Proveedor:** Stripe Inc. (procesador de pagos)

### 2.4 Datos de Uso
- Historial de servicios
- Mensajes entre clientes y profesionales
- Preferencias del servicio

## 3. Finalidades del Tratamiento

Utilizamos sus datos personales para:
- **Prestación del servicio:** Conectar clientes con profesionales
- **Procesamiento de pagos:** Facilitar transacciones seguras
- **Comunicación:** Notificaciones de servicios, mensajes
- **Seguridad:** Verificación de identidad, prevención de fraude
- **Mejora del servicio:** Análisis de uso (anónimo)

## 4. Sus Derechos (Ley 1581 de 2012)

Usted tiene derecho a:
- **Conocer, actualizar y rectificar** sus datos personales
- **Solicitar prueba** de la autorización otorgada
- **Ser informado** sobre el uso de sus datos
- **Revocar la autorización** y/o solicitar la supresión del dato
- **Acceder gratuitamente** a sus datos personales

### Cómo Ejercer Sus Derechos
- **Email:** privacy@maidconnect.com
- **Tiempo de respuesta:** Máximo 15 días hábiles
- **Costo:** Gratuito

## 5. Seguridad de los Datos

Implementamos medidas de seguridad:
- Cifrado HTTPS para todas las comunicaciones
- Bases de datos cifradas
- Acceso restringido por roles
- Respaldo regular de datos

## 6. Compartir Datos con Terceros

Compartimos datos solo con:
- **Stripe:** Procesamiento de pagos (USA) - Certified PCI DSS
- **Supabase:** Almacenamiento de base de datos (USA) - SOC 2 Type II
- **Vercel:** Hosting de aplicación (USA) - SOC 2 Type II

**NO vendemos** sus datos personales a terceros.

## 7. Retención de Datos

- **Cuentas activas:** Mientras la cuenta esté activa
- **Cuentas cerradas:** 5 años (requerido para fines legales/tributarios)
- **Mensajes:** 2 años desde última actividad
- **Logs de seguridad:** 1 año

## 8. Cookies y Tecnologías Similares

Usamos cookies para:
- Mantener su sesión activa
- Recordar preferencias de idioma
- Análisis de uso (Google Analytics - opcional)

Puede desactivar cookies en su navegador.

## 9. Menores de Edad

MaidConnect requiere ser mayor de 18 años. No recopilamos intencionalmente datos de menores.

## 10. Cambios a Esta Política

Notificaremos cambios materiales por email con 30 días de anticipación.

## 11. Contacto

Para preguntas sobre esta política:
- **Email:** privacy@maidconnect.com
- **Dirección:** [Your address]

---

**Consentimiento:**
Al usar MaidConnect, usted consiente esta política de privacidad y el tratamiento de sus datos personales conforme a la Ley 1581 de 2012.
```

**Where to add:** `src/app/[locale]/privacy/page.tsx`

**Action:** Replace current content with above template, fill in your details.

---

#### Step 2: Create Terms of Service (2-3 hours)

**Use this template:**

```markdown
# Términos de Servicio - MaidConnect

**Última actualización:** [Date]

## 1. Aceptación de Términos

Al usar MaidConnect, usted acepta estos términos. Si no está de acuerdo, no use el servicio.

## 2. Descripción del Servicio

MaidConnect es una plataforma que **conecta** clientes con profesionales del hogar independientes.

**Importante:**
- MaidConnect NO es empleador de los profesionales
- MaidConnect NO presta servicios de limpieza directamente
- Los profesionales son **contratistas independientes**

## 3. Registro y Cuenta

### 3.1 Elegibilidad
- Debe ser mayor de 18 años
- Debe proporcionar información veraz
- Responsable de mantener contraseña segura

### 3.2 Tipos de Cuenta
- **Cliente:** Contrata servicios
- **Profesional:** Ofrece servicios

## 4. Para Clientes

### 4.1 Reservas
- Las reservas están sujetas a disponibilidad del profesional
- El profesional puede aceptar o rechazar su solicitud
- Debe proporcionar acceso adecuado a su propiedad

### 4.2 Pagos
- Autorizamos su tarjeta al hacer la reserva
- El cargo se realiza solo después de completar el servicio
- Si cancela con <24 horas, puede aplicar cargo de cancelación

### 4.3 Responsabilidades
- Proporcionar información precisa (dirección, acceso)
- Estar presente o facilitar acceso durante el servicio
- Tratar al profesional con respeto

## 5. Para Profesionales

### 5.1 Relación Contractual
Los profesionales son **contratistas independientes**, NO empleados de MaidConnect.

Esto significa:
- ✅ Establece sus propias tarifas (dentro de rangos)
- ✅ Acepta o rechaza trabajos libremente
- ✅ Define su propio horario
- ✅ Puede trabajar para otras plataformas
- ✅ Es responsable de sus impuestos

### 5.2 Verificación
- Debe proporcionar identificación válida
- Sujeto a verificación de antecedentes
- Puede ser desactivado por violaciones

### 5.3 Comisión de Plataforma
- MaidConnect retiene [X]% del valor del servicio
- Los pagos se procesan semanalmente
- Responsable de declarar ingresos ante DIAN

### 5.4 Obligaciones
- Completar servicios aceptados profesionalmente
- Respetar la propiedad del cliente
- Cumplir con horarios acordados

## 6. Pagos y Tarifas

### 6.1 Procesamiento
- Pagos procesados por Stripe
- Autorización al reservar
- Cargo al completar servicio

### 6.2 Reembolsos
- Servicio no completado: Reembolso completo
- Cancelación por cliente (<24h): Cargo de [X]%
- Cancelación por cliente (>24h): Sin cargo
- Disputas revisadas caso por caso

## 7. Cancelaciones

### 7.1 Por Cliente
- Más de 24 horas antes: Sin cargo
- Menos de 24 horas: Cargo del [30]%
- No presentarse: Cargo del [50]%

### 7.2 Por Profesional
- Más de 24 horas antes: Sin penalización
- Menos de 24 horas: Marca negativa en perfil
- Cancelaciones frecuentes: Suspensión de cuenta

## 8. Calificaciones y Reseñas

- Ambas partes pueden calificar después del servicio
- Las reseñas deben ser honestas y respetuosas
- MaidConnect puede remover reseñas ofensivas

## 9. Prohibiciones

NO está permitido:
- Usar la plataforma para actividades ilegales
- Acoso o discriminación
- Contactar usuarios fuera de la plataforma (evasión de comisión)
- Proporcionar información falsa
- Compartir credenciales de cuenta

## 10. Propiedad Intelectual

MaidConnect, su logo, y contenido son propiedad de [Your Company].

## 11. Limitación de Responsabilidad

MaidConnect actúa como **intermediario** únicamente.

**NO somos responsables por:**
- Calidad del servicio prestado
- Daños a propiedad durante el servicio
- Lesiones durante el servicio
- Disputas entre clientes y profesionales

**Recomendamos:**
- Clientes: Asegurar objetos de valor
- Profesionales: Tener seguro de responsabilidad civil

## 12. Indemnización

Usted acepta indemnizar a MaidConnect de reclamaciones relacionadas con su uso del servicio.

## 13. Modificaciones

Podemos modificar estos términos con 30 días de aviso.

## 14. Terminación

Podemos suspender/terminar cuentas que violen estos términos.

## 15. Ley Aplicable

Estos términos se rigen por las leyes de Colombia.

## 16. Resolución de Disputas

- Primero: Intentar resolución directa (support@maidconnect.com)
- Si no se resuelve: Arbitraje o jurisdicción de [City], Colombia

## 17. Contacto

**Email:** support@maidconnect.com
**Teléfono:** [Your phone]
**Dirección:** [Your address]

---

**Al usar MaidConnect, acepta estos términos.**
```

**Where to add:** `src/app/[locale]/terms/page.tsx`

---

#### Step 3: Add Consent Management (4-6 hours coding)

**Create consent component:**

```typescript
// src/components/auth/consent-checkboxes.tsx
"use client";

import { useState } from "react";

type ConsentState = {
  required_service: boolean;
  optional_marketing: boolean;
  optional_analytics: boolean;
};

type ConsentCheckboxesProps = {
  onConsentChange: (consents: ConsentState) => void;
};

export function ConsentCheckboxes({ onConsentChange }: ConsentCheckboxesProps) {
  const [consents, setConsents] = useState<ConsentState>({
    required_service: false,
    optional_marketing: false,
    optional_analytics: false,
  });

  const handleChange = (key: keyof ConsentState, value: boolean) => {
    const newConsents = { ...consents, [key]: value };
    setConsents(newConsents);
    onConsentChange(newConsents);
  };

  return (
    <div className="space-y-4 rounded-lg border border-[#e5dfd4] bg-white p-6">
      <h3 className="font-semibold text-[#211f1a]">Autorización de Datos Personales</h3>

      {/* Required Consent */}
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={consents.required_service}
          onChange={(e) => handleChange("required_service", e.target.checked)}
          required
          className="mt-1 h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-[#ff5d46]"
        />
        <div className="flex-1">
          <span className="text-[#211f1a] text-sm">
            Autorizo a MaidConnect para recopilar y procesar mis datos personales (nombre, email,
            teléfono, dirección) para la prestación del servicio de conexión con profesionales del hogar.
            <span className="text-red-600"> *</span>
          </span>
          <p className="mt-1 text-[#7d7566] text-xs">
            Requerido para usar el servicio. Ver{" "}
            <a href="/privacy" className="text-[#ff5d46] hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </label>

      {/* Optional: Marketing */}
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={consents.optional_marketing}
          onChange={(e) => handleChange("optional_marketing", e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-[#ff5d46]"
        />
        <div className="flex-1">
          <span className="text-[#211f1a] text-sm">
            Acepto recibir comunicaciones promocionales, ofertas especiales, y noticias sobre
            MaidConnect por email y SMS. (Opcional)
          </span>
          <p className="mt-1 text-[#7d7566] text-xs">
            Puedes darte de baja en cualquier momento
          </p>
        </div>
      </label>

      {/* Optional: Analytics */}
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={consents.optional_analytics}
          onChange={(e) => handleChange("optional_analytics", e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-[#ff5d46]"
        />
        <div className="flex-1">
          <span className="text-[#211f1a] text-sm">
            Acepto que MaidConnect use datos de uso anónimos para mejorar el servicio. (Opcional)
          </span>
        </div>
      </label>

      <p className="text-[#7d7566] text-xs">
        Conforme a la Ley 1581 de 2012 de Protección de Datos Personales.
        Puedes revocar estas autorizaciones en cualquier momento contactando a privacy@maidconnect.com
      </p>
    </div>
  );
}
```

**Add to signup form:**

```typescript
// In your signup page/component
import { ConsentCheckboxes } from "@/components/auth/consent-checkboxes";

// Add to signup form state
const [consents, setConsents] = useState({
  required_service: false,
  optional_marketing: false,
  optional_analytics: false,
});

// Store in database
await supabase.from("profiles").insert({
  // ... other fields
  consent_service: consents.required_service,
  consent_marketing: consents.optional_marketing,
  consent_analytics: consents.optional_analytics,
  consent_date: new Date().toISOString(),
});
```

**Database migration:**

```sql
-- Add to profiles table
ALTER TABLE profiles
ADD COLUMN consent_service BOOLEAN DEFAULT false,
ADD COLUMN consent_marketing BOOLEAN DEFAULT false,
ADD COLUMN consent_analytics BOOLEAN DEFAULT false,
ADD COLUMN consent_date TIMESTAMPTZ,
ADD COLUMN consent_ip_address TEXT;
```

---

#### Step 4: Data Subject Rights (Self-Service) (6-8 hours)

**Create data export page:**

```typescript
// src/app/[locale]/dashboard/customer/data/page.tsx
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataExportButton } from "@/components/data-rights/data-export-button";
import { AccountDeletionButton } from "@/components/data-rights/account-deletion-button";

export default async function DataRightsPage() {
  const { user } = await getSession();
  const supabase = await createSupabaseServerClient();

  // Get user's data summary
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", user.id);

  const { count: messagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#211f1a]">Mis Datos Personales</h1>
        <p className="text-[#7d7566]">
          Conforme a la Ley 1581 de 2012, puedes acceder, corregir o eliminar tus datos
        </p>
      </div>

      {/* Data Summary */}
      <div className="rounded-lg border border-[#e5dfd4] bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#211f1a]">Resumen de Datos</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#7d7566]">Nombre:</dt>
            <dd className="font-medium text-[#211f1a]">{profile?.full_name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#7d7566]">Email:</dt>
            <dd className="font-medium text-[#211f1a]">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#7d7566]">Reservas:</dt>
            <dd className="font-medium text-[#211f1a]">{bookingsCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#7d7566]">Mensajes:</dt>
            <dd className="font-medium text-[#211f1a]">{messagesCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#7d7566]">Cuenta creada:</dt>
            <dd className="font-medium text-[#211f1a]">
              {new Date(profile?.created_at).toLocaleDateString("es-CO")}
            </dd>
          </div>
        </dl>
      </div>

      {/* Export Data */}
      <div className="rounded-lg border border-[#e5dfd4] bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold text-[#211f1a]">Exportar Mis Datos</h2>
        <p className="mb-4 text-[#7d7566] text-sm">
          Descarga una copia de todos tus datos personales en formato JSON
        </p>
        <DataExportButton userId={user.id} />
      </div>

      {/* Delete Account */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900">Eliminar Mi Cuenta</h2>
        <p className="mb-4 text-red-700 text-sm">
          Esta acción es permanente. Todos tus datos serán eliminados después de 30 días.
        </p>
        <AccountDeletionButton userId={user.id} />
      </div>

      {/* Contact for Rights */}
      <div className="rounded-lg border border-[#e5dfd4] bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold text-[#211f1a]">Otros Derechos</h2>
        <p className="mb-4 text-[#7d7566] text-sm">
          Para ejercer otros derechos (rectificación, revocación, etc.):
        </p>
        <a
          href="mailto:privacy@maidconnect.com"
          className="text-[#ff5d46] hover:underline"
        >
          privacy@maidconnect.com
        </a>
      </div>
    </div>
  );
}
```

**Export API endpoint:**

```typescript
// src/app/api/user/data-export/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const { user } = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  // Gather all user data
  const [profile, bookings, messages, addresses, favorites] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("bookings").select("*").eq("customer_id", user.id),
    supabase.from("messages").select("*").eq("sender_id", user.id),
    supabase.from("customer_addresses").select("*").eq("customer_id", user.id),
    supabase.from("customer_favorites").select("*").eq("customer_id", user.id),
  ]);

  const exportData = {
    export_date: new Date().toISOString(),
    user_id: user.id,
    profile: profile.data,
    bookings: bookings.data,
    messages: messages.data,
    addresses: addresses.data,
    favorites: favorites.data,
  };

  // Log export for audit trail
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "data_export",
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(exportData, {
    headers: {
      "Content-Disposition": `attachment; filename="maidconnect-data-${user.id}.json"`,
    },
  });
}
```

---

## 🔒 Part 2: Security Hardening (Free)

### Step 1: Security Headers (30 minutes)

**Add to `next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

**Test:** https://securityheaders.com/

---

### Step 2: Rate Limiting (1-2 hours)

**Use Vercel's built-in rate limiting (free):**

```typescript
// src/lib/rate-limit.ts
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (upgrade to Redis/Upstash for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: NextRequest, limit = 10, window = 60000) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  const record = rateLimitMap.get(ip);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return { success: true };
  }

  if (record.count >= limit) {
    return {
      success: false,
      error: "Too many requests",
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count++;
  return { success: true };
}

// Middleware helper
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limit = 10
) {
  return async (req: NextRequest) => {
    const { success, error, retryAfter } = rateLimit(req, limit);

    if (!success) {
      return NextResponse.json(
        { error },
        {
          status: 429,
          headers: { "Retry-After": retryAfter!.toString() },
        }
      );
    }

    return handler(req);
  };
}
```

**Apply to sensitive endpoints:**

```typescript
// src/app/api/auth/sign-in/route.ts
import { withRateLimit } from "@/lib/rate-limit";

async function handler(request: NextRequest) {
  // ... sign in logic
}

export const POST = withRateLimit(handler, 5); // 5 attempts per minute
```

---

### Step 3: Environment Variable Security (15 minutes)

**Audit `.env` files:**

```bash
# Check for accidentally committed secrets
git log --all --full-history -- .env

# Ensure .env is in .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

**Create `.env.example` template:**

```bash
# .env.example - Safe to commit
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Verify no secrets in client code:**

```bash
# Search for potential leaked secrets
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/
grep -r "STRIPE_SECRET_KEY" src/
grep -r "sk_live" src/
```

---

### Step 4: Dependency Security (30 minutes)

**Enable GitHub Dependabot:**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-github-username"
    labels:
      - "dependencies"
      - "security"
```

**Run security audit now:**

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Review and manually fix critical issues
npm audit fix --force  # Use with caution
```

**Set up automated checks:**

```bash
# Add to package.json scripts
"scripts": {
  "security-check": "npm audit --audit-level=moderate"
}

# Run before deploy
npm run security-check
```

---

## 📊 Part 3: Free Monitoring Alternatives

### Option 1: LogSnag (Free tier)

**Why:** Simple, beautiful, affordable
- **Free:** 1,000 events/month
- **Paid:** $10/month for 50k events
- **Features:** Event tracking, channels, real-time notifications

**Setup:**

```bash
npm install logsnag
```

```typescript
// src/lib/monitoring/logsnag.ts
import { LogSnag } from "logsnag";

const logsnag = new LogSnag({
  token: process.env.LOGSNAG_API_KEY!,
  project: "maidconnect",
});

export async function trackEvent(
  channel: string,
  event: string,
  description?: string,
  notify?: boolean
) {
  if (process.env.NODE_ENV === "production") {
    await logsnag.track({
      channel,
      event,
      description,
      icon: "🔔",
      notify: notify ?? false,
    });
  }
}

// Usage examples
export const monitoring = {
  // Errors
  error: (message: string, userId?: string) =>
    trackEvent("errors", "Error Occurred", `${message} | User: ${userId}`, true),

  // Security
  suspiciousActivity: (type: string, userId: string) =>
    trackEvent("security", "Suspicious Activity", `${type} | User: ${userId}`, true),

  // Business metrics
  bookingCreated: (bookingId: string, amount: number) =>
    trackEvent("bookings", "New Booking", `ID: ${bookingId} | Amount: $${amount}`),

  paymentFailed: (bookingId: string, reason: string) =>
    trackEvent("payments", "Payment Failed", `Booking: ${bookingId} | ${reason}`, true),
};
```

---

### Option 2: Better Stack (Logtail) (Free tier)

**Why:** Generous free tier, great for logging
- **Free:** 1GB/month, 7-day retention
- **Paid:** $5/month for 3GB

**Setup:**

```bash
npm install @logtail/node @logtail/winston
```

```typescript
// src/lib/monitoring/logger.ts
import { Logtail } from "@logtail/node";
import { createLogger, format, transports } from "winston";
import { LogtailTransport } from "@logtail/winston";

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

export const logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [
    new transports.Console(),
    new LogtailTransport(logtail),
  ],
});

// Usage
logger.error("Payment failed", {
  bookingId: "123",
  userId: "user_456",
  amount: 50000,
  error: "Card declined",
});
```

---

### Option 3: Highlight.io (Free tier)

**Why:** Session replay + error tracking
- **Free:** 1,000 sessions/month
- **Features:** Session replay, error tracking, console logs

**Setup:**

```bash
npm install @highlight-run/next
```

```typescript
// src/app/layout.tsx
import { HighlightInit } from "@highlight-run/next/highlight-init";

export default function RootLayout({ children }) {
  return (
    <>
      <HighlightInit
        projectId={process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!}
        serviceName="maidconnect"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
        }}
      />
      {children}
    </>
  );
}
```

---

### Option 4: Axiom (Free tier)

**Why:** Generous free tier, great for structured logs
- **Free:** 0.5 GB/month, 30-day retention
- **Features:** Fast queries, dashboards, alerts

**Setup:**

```bash
npm install next-axiom
```

```typescript
// next.config.js
const { withAxiom } = require("next-axiom");

module.exports = withAxiom({
  // ... your config
});
```

---

### Option 5: DIY with Supabase (Totally Free)

**Why:** You already have Supabase, use it!

**Create logs table:**

```sql
CREATE TABLE app_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  level TEXT NOT NULL, -- 'info', 'warn', 'error', 'critical'
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  url TEXT,
  ip_address TEXT
);

CREATE INDEX idx_app_logs_level ON app_logs(level);
CREATE INDEX idx_app_logs_created_at ON app_logs(created_at);
CREATE INDEX idx_app_logs_user_id ON app_logs(user_id);
```

**Logger implementation:**

```typescript
// src/lib/monitoring/supabase-logger.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LogLevel = "info" | "warn" | "error" | "critical";

async function log(
  level: LogLevel,
  message: string,
  metadata?: Record<string, any>,
  userId?: string
) {
  try {
    const supabase = await createSupabaseServerClient();

    await supabase.from("app_logs").insert({
      level,
      message,
      user_id: userId,
      metadata: metadata || {},
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
  } catch (err) {
    // Fallback to console if logging fails
    console.error("Logging failed:", err);
  }
}

export const logger = {
  info: (message: string, metadata?: Record<string, any>, userId?: string) =>
    log("info", message, metadata, userId),

  warn: (message: string, metadata?: Record<string, any>, userId?: string) =>
    log("warn", message, metadata, userId),

  error: (message: string, metadata?: Record<string, any>, userId?: string) =>
    log("error", message, metadata, userId),

  critical: (message: string, metadata?: Record<string, any>, userId?: string) =>
    log("critical", message, metadata, userId),
};

// Usage
await logger.error("Payment processing failed", {
  bookingId: booking.id,
  amount: booking.amount,
  stripeError: error.message,
}, userId);
```

**Dashboard in Supabase Studio:**

```sql
-- View recent errors
SELECT * FROM app_logs
WHERE level IN ('error', 'critical')
ORDER BY created_at DESC
LIMIT 50;

-- Error rate by day
SELECT
  DATE(created_at) as date,
  COUNT(*) as error_count
FROM app_logs
WHERE level = 'error'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🎯 My Recommendation: Best Budget Stack

**For monitoring:**
1. **Better Stack (Logtail)** - Free tier (1GB/month)
2. **DIY Supabase Logger** - Backup/supplement (totally free)
3. **Vercel Analytics** - Already included with Vercel hosting

**Total cost:** $0/month initially, $5-10/month when you need more

---

## 📝 Part 4: Implementation Checklist

### Week 1: Legal Compliance
- [ ] Day 1-2: Write Privacy Policy (Spanish) using template
- [ ] Day 3-4: Write Terms of Service using template
- [ ] Day 5: Add consent checkboxes to signup
- [ ] Day 6-7: Create data export page

### Week 2: Security Hardening
- [ ] Day 1: Add security headers to next.config.js
- [ ] Day 2: Implement rate limiting on auth endpoints
- [ ] Day 3: Audit .env files, create .env.example
- [ ] Day 4: Enable GitHub Dependabot
- [ ] Day 5: Run npm audit and fix issues
- [ ] Day 6: Set up monitoring (choose one from above)
- [ ] Day 7: Test everything

### Week 3: Testing & Polish
- [ ] Test consent flow (signup/login)
- [ ] Test data export functionality
- [ ] Verify security headers (securityheaders.com)
- [ ] Check rate limiting works
- [ ] Review all pages for privacy/terms links
- [ ] Add privacy/terms links to footer
- [ ] Final security audit

---

## ⚠️ Risks & Limitations

**What you're trading off:**
- **Legal review:** Your policies may have gaps a lawyer would catch
- **Professional language:** Legal jargon may be less precise
- **Regional compliance:** Nuances of Colombian law may be missed
- **Liability:** If something goes wrong, you own it

**When to get a lawyer:**
1. **Before serious revenue** ($10k+/month)
2. **If you get a complaint** from user or regulator
3. **Before raising investment** (VCs will require it)
4. **If you expand internationally**

**Estimated cost when you're ready:** $2,000-$5,000 for full legal review

---

## 🚀 Launch Readiness Checklist

Before going public:

**Legal:**
- [ ] Privacy policy live in Spanish
- [ ] Terms of service live in Spanish
- [ ] Consent checkboxes on signup
- [ ] Data export functionality working
- [ ] Links to privacy/terms in footer

**Security:**
- [ ] Security headers configured
- [ ] Rate limiting on auth endpoints
- [ ] No secrets in code/git history
- [ ] Dependabot enabled
- [ ] Monitoring set up

**Testing:**
- [ ] Can create account with consent
- [ ] Can export personal data
- [ ] Rate limiting blocks rapid requests
- [ ] Security headers pass basic tests

---

## 💰 Total Budget Summary

**Required Costs:**
- Domain email (privacy@maidconnect.com): $0 (use Google Workspace free trial or Zoho Mail free)
- Monitoring: $0-10/month (Better Stack free tier → paid later)

**Optional Costs:**
- Better Stack paid: $5/month (when outgrow free tier)
- LogSnag paid: $10/month (alternative)
- Legal review later: $2,000-5,000 (one-time, when revenue allows)

**Total to launch:** $0-10/month

---

## 📚 Additional Resources

**Colombian Law Research:**
- [Ley 1581 Full Text](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981)
- [SIC Data Protection Portal](https://www.sic.gov.co/proteccion-de-datos-personales)
- [SIC FAQs](https://www.sic.gov.co/preguntas-frecuentes-habeas-data)

**Privacy Policy Templates:**
- [TermsFeed Generator](https://www.termsfeed.com/privacy-policy-generator/) (free)
- [GetTerms.io](https://getterms.io/) (free with customization)

**Security Testing:**
- [Security Headers](https://securityheaders.com/) - Test headers
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test HTTPS
- [OWASP ZAP](https://www.zaproxy.org/) - Free security scanner

---

## 🎓 Learning Resources

**Watch these (free):**
- [Web Security Fundamentals](https://www.youtube.com/watch?v=dBuykrdhK-A) (1 hour)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) (read docs)
- [Data Privacy 101](https://www.privacyshield.gov/article?id=Requirements-of-Participation) (1 hour read)

---

**Remember:** Thousands of startups launch this way. You can always improve compliance as you grow. The important thing is:
1. Be transparent with users
2. Implement reasonable security
3. Respect user data
4. Plan to improve over time

Good luck with your launch! 🚀
