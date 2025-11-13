import { Metadata } from "next";
import {
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === "es";

  return {
    title: isSpanish ? "Cumplimiento y Certificaciones | Casaora" : "Compliance & Certifications | Casaora",
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
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={Shield01Icon} />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {isSpanish ? "Cumplimiento y Certificaciones" : "Compliance & Certifications"}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              {isSpanish
                ? "Casaora cumple con los más altos estándares internacionales de seguridad, privacidad y protección de datos."
                : "Casaora complies with the highest international standards for security, privacy, and data protection."}
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              <strong>{isSpanish ? "Última actualización:" : "Last updated:"}</strong> {lastUpdated}
            </p>
          </div>

          {/* Compliance Cards */}
          <div className="space-y-12">
            {/* Payment Security */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                  <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={SecurityCheckIcon} />
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-neutral-900">
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
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <HugeiconsIcon className="h-5 w-5 text-green-600" icon={CheckmarkCircle02Icon} />
                    <h3 className="font-semibold text-neutral-900">PCI DSS Level 1 Certified</h3>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {isSpanish
                      ? "Stripe cumple con el nivel más alto de certificación de seguridad de la industria de tarjetas de pago (Payment Card Industry Data Security Standard)."
                      : "Stripe complies with the highest level of Payment Card Industry Data Security Standard certification."}
                  </p>
                  <ul className="mt-3 ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "NO almacenamos números de tarjeta de crédito"
                        : "We do NOT store credit card numbers"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Cifrado de extremo a extremo en todas las transacciones"
                        : "End-to-end encryption on all transactions"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Auditorías de seguridad trimestrales por terceros certificados"
                        : "Quarterly security audits by certified third parties"}
                    </li>
                  </ul>
                </div>

                <div className="text-sm text-neutral-500">
                  <strong>{isSpanish ? "Verificación:" : "Verification:"}</strong>{" "}
                  <a
                    href="https://stripe.com/docs/security/stripe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline"
                  >
                    {isSpanish ? "Ver certificado de Stripe" : "View Stripe certificate"}
                  </a>
                </div>
              </div>
            </section>

            {/* Infrastructure Security */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-neutral-900">
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
                {/* Supabase */}
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Supabase (Database & Auth)</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        SOC 2 Type II
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ISO 27001
                      </Badge>
                    </div>
                  </div>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Base de datos cifrada en reposo (AES-256)"
                        : "Database encrypted at rest (AES-256)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Cifrado en tránsito (TLS 1.3)"
                        : "Encryption in transit (TLS 1.3)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Respaldos automáticos diarios con retención de 7 días"
                        : "Automatic daily backups with 7-day retention"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Row Level Security (RLS) para aislamiento de datos por usuario"
                        : "Row Level Security (RLS) for user data isolation"}
                    </li>
                  </ul>
                </div>

                {/* Vercel */}
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Vercel (Application Hosting)</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        SOC 2 Type II
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ISO 27001
                      </Badge>
                    </div>
                  </div>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "CDN global con protección DDoS integrada"
                        : "Global CDN with integrated DDoS protection"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Certificados SSL/TLS automáticos y renovación"
                        : "Automatic SSL/TLS certificates and renewal"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Firewall de aplicaciones web (WAF)"
                        : "Web Application Firewall (WAF)"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Privacy Compliance */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-neutral-900">
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
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <HugeiconsIcon className="h-5 w-5 text-blue-600" icon={CheckmarkCircle02Icon} />
                    <h3 className="font-semibold text-neutral-900">
                      {isSpanish ? "Ley 1581 de 2012 (Colombia)" : "Colombian Law 1581 of 2012"}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {isSpanish
                      ? "Cumplimiento total con la ley colombiana de protección de datos personales."
                      : "Full compliance with Colombian personal data protection law."}
                  </p>
                  <ul className="mt-3 ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Autorización expresa e informada para el tratamiento de datos"
                        : "Express and informed authorization for data processing"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Derecho de acceso, rectificación y eliminación de datos"
                        : "Right to access, rectify, and delete data"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Notificación a la Superintendencia de Industria y Comercio (SIC)"
                        : "Notification to Colombian Superintendence of Industry and Commerce (SIC)"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <HugeiconsIcon className="h-5 w-5 text-blue-600" icon={CheckmarkCircle02Icon} />
                    <h3 className="font-semibold text-neutral-900">
                      GDPR (General Data Protection Regulation)
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {isSpanish
                      ? "Cumplimiento con el Reglamento General de Protección de Datos de la Unión Europea."
                      : "Compliance with the European Union's General Data Protection Regulation."}
                  </p>
                  <ul className="mt-3 ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Derecho al olvido y portabilidad de datos"
                        : "Right to be forgotten and data portability"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Evaluación de impacto de protección de datos (DPIA)"
                        : "Data Protection Impact Assessment (DPIA)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Notificación de brechas de seguridad dentro de 72 horas"
                        : "Security breach notification within 72 hours"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Security Monitoring */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                  {isSpanish ? "Monitoreo de Seguridad Continuo" : "Continuous Security Monitoring"}
                </h2>
                <p className="text-neutral-600">
                  {isSpanish
                    ? "Utilizamos herramientas automatizadas para detectar y prevenir vulnerabilidades de seguridad."
                    : "We use automated tools to detect and prevent security vulnerabilities."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <HugeiconsIcon className="h-5 w-5 text-purple-600" icon={CheckmarkCircle02Icon} />
                    <h3 className="font-semibold text-neutral-900">Snyk Security</h3>
                  </div>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Escaneo automático de dependencias en busca de vulnerabilidades conocidas"
                        : "Automatic dependency scanning for known vulnerabilities"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Análisis estático de código (SAST) para detectar fallos de seguridad"
                        : "Static Application Security Testing (SAST) to detect security flaws"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Alertas en tiempo real de nuevas vulnerabilidades"
                        : "Real-time alerts for new vulnerabilities"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <HugeiconsIcon className="h-5 w-5 text-purple-600" icon={CheckmarkCircle02Icon} />
                    <h3 className="font-semibold text-neutral-900">Better Stack Logging</h3>
                  </div>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Monitoreo de logs en tiempo real 24/7"
                        : "24/7 real-time log monitoring"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Alertas automáticas de comportamiento anómalo"
                        : "Automatic anomaly detection alerts"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Retención de logs de seguridad por 1 año"
                        : "Security log retention for 1 year"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Third-Party Audits */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                  {isSpanish ? "Auditorías de Terceros" : "Third-Party Audits"}
                </h2>
                <p className="text-neutral-600">
                  {isSpanish
                    ? "Nuestros proveedores de infraestructura se someten a auditorías regulares por parte de auditores independientes."
                    : "Our infrastructure providers undergo regular audits by independent auditors."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <HugeiconsIcon
                    className="mt-1 h-5 w-5 shrink-0 text-green-600"
                    icon={CheckmarkCircle02Icon}
                  />
                  <div>
                    <h3 className="mb-1 font-semibold text-neutral-900">SOC 2 Type II</h3>
                    <p className="text-sm text-neutral-600">
                      {isSpanish
                        ? "Auditoría anual de controles de seguridad, disponibilidad, confidencialidad, integridad de procesamiento y privacidad."
                        : "Annual audit of security, availability, confidentiality, processing integrity, and privacy controls."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <HugeiconsIcon
                    className="mt-1 h-5 w-5 shrink-0 text-green-600"
                    icon={CheckmarkCircle02Icon}
                  />
                  <div>
                    <h3 className="mb-1 font-semibold text-neutral-900">ISO 27001</h3>
                    <p className="text-sm text-neutral-600">
                      {isSpanish
                        ? "Certificación internacional de sistemas de gestión de seguridad de la información (ISMS)."
                        : "International certification for Information Security Management Systems (ISMS)."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <HugeiconsIcon
                    className="mt-1 h-5 w-5 shrink-0 text-green-600"
                    icon={CheckmarkCircle02Icon}
                  />
                  <div>
                    <h3 className="mb-1 font-semibold text-neutral-900">PCI DSS</h3>
                    <p className="text-sm text-neutral-600">
                      {isSpanish
                        ? "Auditoría trimestral de cumplimiento de estándares de seguridad de datos de la industria de tarjetas de pago."
                        : "Quarterly audit of Payment Card Industry Data Security Standards compliance."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Incident Response */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                  {isSpanish ? "Respuesta a Incidentes" : "Incident Response"}
                </h2>
                <p className="text-neutral-600">
                  {isSpanish
                    ? "Contamos con procedimientos formales para detectar, responder y notificar incidentes de seguridad."
                    : "We have formal procedures to detect, respond to, and report security incidents."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Detección" : "Detection"}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {isSpanish
                      ? "Monitoreo 24/7 con alertas automáticas para actividad sospechosa"
                      : "24/7 monitoring with automatic alerts for suspicious activity"}
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Contención" : "Containment"}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {isSpanish
                      ? "Aislamiento inmediato de sistemas comprometidos"
                      : "Immediate isolation of compromised systems"}
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Notificación" : "Notification"}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {isSpanish
                      ? "Notificación a usuarios afectados dentro de 72 horas (GDPR)"
                      : "Notification to affected users within 72 hours (GDPR)"}
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Recuperación" : "Recovery"}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {isSpanish
                      ? "Restauración de servicios y mejoras de seguridad"
                      : "Service restoration and security improvements"}
                  </p>
                </div>
              </div>
            </section>

            {/* Questions */}
            <section className="rounded-xl border-2 border-orange-500 bg-orange-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                {isSpanish ? "¿Tiene Preguntas?" : "Have Questions?"}
              </h2>
              <p className="mb-4 text-neutral-700">
                {isSpanish
                  ? "Si tiene preguntas sobre nuestras certificaciones, cumplimiento normativo o prácticas de seguridad, no dude en contactarnos."
                  : "If you have questions about our certifications, compliance, or security practices, please don't hesitate to contact us."}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <a
                  href="mailto:security@casaora.com"
                  className="font-semibold text-orange-600 hover:underline"
                >
                  security@casaora.com
                </a>
                <span className="hidden text-neutral-400 sm:block">•</span>
                <a
                  href="/legal/security"
                  className="font-semibold text-orange-600 hover:underline"
                >
                  {isSpanish ? "Ver Prácticas de Seguridad" : "View Security Practices"}
                </a>
              </div>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
