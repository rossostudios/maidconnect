import { CheckmarkCircle02Icon, SecurityCheckIcon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Metadata } from "next";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

type Props = {
  params: Promise<{ locale: string }>;
};

type SectionProps = {
  isSpanish: boolean;
};

type HeroProps = SectionProps & {
  lastUpdated: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === "es";

  return {
    title: isSpanish
      ? "Cumplimiento y Certificaciones | Casaora"
      : "Compliance & Certifications | Casaora",
    description: isSpanish
      ? "Conozca nuestras certificaciones de seguridad, cumplimiento normativo y estándares de protección de datos."
      : "Learn about our security certifications, regulatory compliance, and data protection standards.",
  };
}

export default async function CompliancePage({ params }: Props) {
  const { locale } = await params;
  const isSpanish = locale === "es";
  const lastUpdated = isSpanish ? "13 de Enero de 2025" : "January 13, 2025";

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />
      <main className="px-4 py-16">
        <Container className="mx-auto max-w-5xl">
          <ComplianceHero isSpanish={isSpanish} lastUpdated={lastUpdated} />
          <div className="space-y-12">
            <PaymentSecuritySection isSpanish={isSpanish} />
            <InfrastructureSecuritySection isSpanish={isSpanish} />
            <DataPrivacySection isSpanish={isSpanish} />
            <SecurityMonitoringSection isSpanish={isSpanish} />
            <ThirdPartyAuditsSection isSpanish={isSpanish} />
            <IncidentResponseSection isSpanish={isSpanish} />
            <QuestionsSection isSpanish={isSpanish} />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

function ComplianceHero({ isSpanish, lastUpdated }: HeroProps) {
  return (
    <div className="mb-16 text-center">
      <div className="mb-6 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center bg-orange-100">
          <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={Shield01Icon} />
        </div>
      </div>
      <h1 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
        {isSpanish ? "Cumplimiento y Certificaciones" : "Compliance & Certifications"}
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-neutral-600">
        {isSpanish
          ? "Casaora cumple con los más altos estándares internacionales de seguridad, privacidad y protección de datos."
          : "Casaora complies with the highest international standards for security, privacy, and data protection."}
      </p>
      <p className="mt-4 text-neutral-500 text-sm">
        <strong>{isSpanish ? "Última actualización:" : "Last updated:"}</strong> {lastUpdated}
      </p>
    </div>
  );
}

function PaymentSecuritySection({ isSpanish }: SectionProps) {
  const pciItems = isSpanish
    ? [
        "NO almacenamos números de tarjeta de crédito",
        "Autenticación 3D Secure 2.0 cuando está disponible",
        "Tokens cifrados para pagos guardados",
      ]
    : [
        "We do NOT store credit card numbers",
        "3D Secure 2.0 authentication when available",
        "Encrypted tokens for stored payments",
      ];

  const fraudControls = isSpanish
    ? [
        "Verificación automática de discrepancias BIN/IP",
        "Detección de fraude en tiempo real",
        "Challenge adicional para transacciones sospechosas",
      ]
    : [
        "Automatic BIN/IP mismatch checks",
        "Real-time fraud detection",
        "Step-up challenges for suspicious transactions",
      ];

  const protectionItems = isSpanish
    ? [
        "Revisión manual de disputas",
        "Monitoreo de chargebacks",
        "Reembolsos procesados dentro de 5 días hábiles",
      ]
    : [
        "Manual review of disputes",
        "Chargeback monitoring",
        "Refunds processed within 5 business days",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-orange-100">
          <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={SecurityCheckIcon} />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="font-bold text-2xl text-neutral-900">
              {isSpanish ? "Seguridad de Pagos" : "Payment Security"}
            </h2>
            <Badge className="bg-green-100 text-green-700">
              {isSpanish ? "Certificado" : "Certified"}
            </Badge>
          </div>
          <p className="text-neutral-600">
            {isSpanish
              ? "Todos los pagos son procesados por Stripe, líder mundial en procesamiento de pagos en línea."
              : "All payments are processed by Stripe, a global leader in online payment processing."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-green-600" icon={CheckmarkCircle02Icon} />
            <h3 className="font-semibold text-neutral-900">PCI DSS Level 1 Certified</h3>
          </div>
          <p className="text-neutral-600 text-sm">
            {isSpanish
              ? "Stripe cumple con el nivel más alto de certificación de seguridad de la industria de tarjetas de pago (Payment Card Industry Data Security Standard)."
              : "Stripe complies with the highest level of Payment Card Industry Data Security Standard certification."}
          </p>
          <ul className="mt-3 ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {pciItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-neutral-100 bg-neutral-50 p-4">
            <h3 className="mb-2 font-semibold text-neutral-900">
              {isSpanish ? "Controles Anti-Fraude" : "Fraud Controls"}
            </h3>
            <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
              {fraudControls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="border border-neutral-100 bg-neutral-50 p-4">
            <h3 className="mb-2 font-semibold text-neutral-900">
              {isSpanish ? "Protección de Pagos" : "Payment Protection"}
            </h3>
            <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
              {protectionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfrastructureSecuritySection({ isSpanish }: SectionProps) {
  const supabaseItems = isSpanish
    ? [
        "Base de datos cifrada en reposo (AES-256)",
        "Cifrado en tránsito (TLS 1.3)",
        "Respaldos automáticos diarios con retención de 7 días",
        "Row Level Security (RLS) para aislamiento de datos por usuario",
      ]
    : [
        "Database encrypted at rest (AES-256)",
        "Encryption in transit (TLS 1.3)",
        "Automatic daily backups with 7-day retention",
        "Row Level Security (RLS) for user data isolation",
      ];

  const vercelItems = isSpanish
    ? [
        "CDN global con protección DDoS integrada",
        "Certificados SSL/TLS automáticos y renovación",
        "Firewall de aplicaciones web (WAF)",
      ]
    : [
        "Global CDN with integrated DDoS protection",
        "Automatic SSL/TLS certificates and renewal",
        "Web Application Firewall (WAF)",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="font-bold text-2xl text-neutral-900">
            {isSpanish ? "Seguridad de Infraestructura" : "Infrastructure Security"}
          </h2>
          <Badge className="bg-green-100 text-green-700">SOC 2 Type II</Badge>
        </div>
        <p className="text-neutral-600">
          {isSpanish
            ? "Nuestra infraestructura está alojada en servicios cloud certificados con los más altos estándares de seguridad."
            : "Our infrastructure is hosted on certified cloud services with the highest security standards."}
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Supabase (Database & Auth)</h3>
            <div className="flex gap-2">
              <Badge className="text-xs" variant="secondary">
                SOC 2 Type II
              </Badge>
              <Badge className="text-xs" variant="secondary">
                ISO 27001
              </Badge>
            </div>
          </div>
          <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {supabaseItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Vercel (Application Hosting)</h3>
            <div className="flex gap-2">
              <Badge className="text-xs" variant="secondary">
                SOC 2 Type II
              </Badge>
              <Badge className="text-xs" variant="secondary">
                ISO 27001
              </Badge>
            </div>
          </div>
          <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {vercelItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function DataPrivacySection({ isSpanish }: SectionProps) {
  const colombianItems = isSpanish
    ? [
        "Autorización expresa e informada para el tratamiento de datos",
        "Derecho de acceso, rectificación y eliminación de datos",
        "Notificación a la Superintendencia de Industria y Comercio (SIC)",
      ]
    : [
        "Express and informed authorization for data processing",
        "Right to access, rectify, and delete data",
        "Notification to Colombian Superintendence of Industry and Commerce (SIC)",
      ];

  const gdprItems = isSpanish
    ? [
        "Derecho al olvido y portabilidad de datos",
        "Evaluación de impacto de protección de datos (DPIA)",
        "Notificación de brechas de seguridad dentro de 72 horas",
      ]
    : [
        "Right to be forgotten and data portability",
        "Data Protection Impact Assessment (DPIA)",
        "Security breach notification within 72 hours",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="font-bold text-2xl text-neutral-900">
            {isSpanish ? "Cumplimiento de Privacidad" : "Data Privacy Compliance"}
          </h2>
          <Badge className="bg-blue-100 text-blue-700">GDPR</Badge>
        </div>
        <p className="text-neutral-600">
          {isSpanish
            ? "Cumplimos con las regulaciones internacionales de protección de datos y privacidad."
            : "We comply with international data protection and privacy regulations."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-blue-600" icon={CheckmarkCircle02Icon} />
            <h3 className="font-semibold text-neutral-900">
              {isSpanish ? "Ley 1581 de 2012 (Colombia)" : "Colombian Law 1581 of 2012"}
            </h3>
          </div>
          <p className="text-neutral-600 text-sm">
            {isSpanish
              ? "Cumplimiento total con la ley colombiana de protección de datos personales."
              : "Full compliance with Colombian personal data protection law."}
          </p>
          <ul className="mt-3 ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {colombianItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-blue-600" icon={CheckmarkCircle02Icon} />
            <h3 className="font-semibold text-neutral-900">
              GDPR (General Data Protection Regulation)
            </h3>
          </div>
          <p className="text-neutral-600 text-sm">
            {isSpanish
              ? "Cumplimiento con el Reglamento General de Protección de Datos de la Unión Europea."
              : "Compliance with the European Union's General Data Protection Regulation."}
          </p>
          <ul className="mt-3 ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {gdprItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SecurityMonitoringSection({ isSpanish }: SectionProps) {
  const snykItems = isSpanish
    ? [
        "Escaneo automático de dependencias en busca de vulnerabilidades conocidas",
        "Análisis estático de código (SAST) para detectar fallos de seguridad",
        "Alertas en tiempo real de nuevas vulnerabilidades",
      ]
    : [
        "Automatic dependency scanning for known vulnerabilities",
        "Static Application Security Testing (SAST) to detect security flaws",
        "Real-time alerts for new vulnerabilities",
      ];

  const loggingItems = isSpanish
    ? [
        "Monitoreo de logs en tiempo real 24/7",
        "Alertas automáticas de comportamiento anómalo",
        "Retención de logs de seguridad por 1 año",
      ]
    : [
        "24/7 real-time log monitoring",
        "Automatic anomaly detection alerts",
        "Security log retention for 1 year",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 font-bold text-2xl text-neutral-900">
          {isSpanish ? "Monitoreo de Seguridad Continuo" : "Continuous Security Monitoring"}
        </h2>
        <p className="text-neutral-600">
          {isSpanish
            ? "Utilizamos herramientas automatizadas para detectar y prevenir vulnerabilidades de seguridad."
            : "We use automated tools to detect and prevent security vulnerabilities."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-purple-600" icon={CheckmarkCircle02Icon} />
            <h3 className="font-semibold text-neutral-900">Snyk Security</h3>
          </div>
          <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {snykItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-5 w-5 text-purple-600" icon={CheckmarkCircle02Icon} />
            <h3 className="font-semibold text-neutral-900">Better Stack Logging</h3>
          </div>
          <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {loggingItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ThirdPartyAuditsSection({ isSpanish }: SectionProps) {
  const audits = [
    {
      title: "SOC 2 Type II",
      description: isSpanish
        ? "Auditoría anual de controles de seguridad, disponibilidad, confidencialidad, integridad de procesamiento y privacidad."
        : "Annual audit of security, availability, confidentiality, processing integrity, and privacy controls.",
    },
    {
      title: "ISO 27001",
      description: isSpanish
        ? "Certificación internacional de sistemas de gestión de seguridad de la información (ISMS)."
        : "International certification for Information Security Management Systems (ISMS).",
    },
    {
      title: "PCI DSS",
      description: isSpanish
        ? "Auditoría trimestral de cumplimiento de estándares de seguridad de datos de la industria de tarjetas de pago."
        : "Quarterly audit of Payment Card Industry Data Security Standards compliance.",
    },
  ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 font-bold text-2xl text-neutral-900">
          {isSpanish ? "Auditorías de Terceros" : "Third-Party Audits"}
        </h2>
        <p className="text-neutral-600">
          {isSpanish
            ? "Nuestros proveedores de infraestructura se someten a auditorías regulares por parte de auditores independientes."
            : "Our infrastructure providers undergo regular audits by independent auditors."}
        </p>
      </div>

      <div className="space-y-3">
        {audits.map((audit) => (
          <div
            className="flex items-start gap-3 border border-neutral-100 bg-neutral-50 p-4"
            key={audit.title}
          >
            <HugeiconsIcon
              className="mt-1 h-5 w-5 shrink-0 text-green-600"
              icon={CheckmarkCircle02Icon}
            />
            <div>
              <h3 className="mb-1 font-semibold text-neutral-900">{audit.title}</h3>
              <p className="text-neutral-600 text-sm">{audit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IncidentResponseSection({ isSpanish }: SectionProps) {
  const steps = [
    {
      title: isSpanish ? "Detección" : "Detection",
      description: isSpanish
        ? "Monitoreo 24/7 con alertas automáticas para actividad sospechosa"
        : "24/7 monitoring with automatic alerts for suspicious activity",
    },
    {
      title: isSpanish ? "Contención" : "Containment",
      description: isSpanish
        ? "Aislamiento inmediato de sistemas comprometidos"
        : "Immediate isolation of compromised systems",
    },
    {
      title: isSpanish ? "Notificación" : "Notification",
      description: isSpanish
        ? "Notificación a usuarios afectados dentro de 72 horas (GDPR)"
        : "Notification to affected users within 72 hours (GDPR)",
    },
    {
      title: isSpanish ? "Recuperación" : "Recovery",
      description: isSpanish
        ? "Restauración de servicios y mejoras de seguridad"
        : "Service restoration and security improvements",
    },
  ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 font-bold text-2xl text-neutral-900">
          {isSpanish ? "Respuesta a Incidentes" : "Incident Response"}
        </h2>
        <p className="text-neutral-600">
          {isSpanish
            ? "Contamos con procedimientos formales para detectar, responder y notificar incidentes de seguridad."
            : "We have formal procedures to detect, respond to, and report security incidents."}
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div className="border-orange-500 border-l-4 bg-orange-50 p-4" key={step.title}>
            <h3 className="mb-2 font-semibold text-neutral-900">{step.title}</h3>
            <p className="text-neutral-600 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuestionsSection({ isSpanish }: SectionProps) {
  return (
    <section className="border-2 border-orange-500 bg-orange-50 p-8">
      <h2 className="mb-4 font-bold text-2xl text-neutral-900">
        {isSpanish ? "¿Tiene Preguntas?" : "Have Questions?"}
      </h2>
      <p className="mb-4 text-neutral-700">
        {isSpanish
          ? "Si tiene preguntas sobre nuestras certificaciones, cumplimiento normativo o prácticas de seguridad, no dude en contactarnos."
          : "If you have questions about our certifications, compliance, or security practices, please don't hesitate to contact us."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <a className="font-semibold text-orange-600" href="mailto:security@casaora.com">
          security@casaora.com
        </a>
        <span className="hidden text-neutral-400 sm:block">•</span>
        <a className="font-semibold text-orange-600" href="/legal/security">
          {isSpanish ? "Ver Prácticas de Seguridad" : "View Security Practices"}
        </a>
      </div>
    </section>
  );
}
