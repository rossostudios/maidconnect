import { Metadata } from "next";
import {
  Database02Icon,
  FirewallIcon,
  LockKeyIcon,
  SecurityCheckIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Container } from "@/components/ui/container";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === "es";

  return {
    title: isSpanish ? "Seguridad | Casaora" : "Security | Casaora",
    description: isSpanish
      ? "Conozca las medidas técnicas de seguridad que protegen su información en Casaora."
      : "Learn about the technical security measures that protect your information on Casaora.",
  };
}

export default async function SecurityPage({ params }: Props) {
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
                <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={SecurityCheckIcon} />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {isSpanish ? "Seguridad en Casaora" : "Security at Casaora"}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              {isSpanish
                ? "Protegemos su información con múltiples capas de seguridad técnica, cifrado avanzado y monitoreo continuo."
                : "We protect your information with multiple layers of technical security, advanced encryption, and continuous monitoring."}
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              <strong>{isSpanish ? "Última actualización:" : "Last updated:"}</strong> {lastUpdated}
            </p>
          </div>

          {/* Security Layers */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <HugeiconsIcon className="h-7 w-7 text-green-600" icon={Shield01Icon} />
                </div>
              </div>
              <h3 className="mb-2 font-bold text-neutral-900">
                {isSpanish ? "Certificado" : "Certified"}
              </h3>
              <p className="text-sm text-neutral-600">
                SOC 2 Type II, ISO 27001, PCI DSS Level 1
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <HugeiconsIcon className="h-7 w-7 text-blue-600" icon={LockKeyIcon} />
                </div>
              </div>
              <h3 className="mb-2 font-bold text-neutral-900">
                {isSpanish ? "Cifrado" : "Encrypted"}
              </h3>
              <p className="text-sm text-neutral-600">
                TLS 1.3 {isSpanish ? "en tránsito, AES-256 en reposo" : "in transit, AES-256 at rest"}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                  <HugeiconsIcon className="h-7 w-7 text-purple-600" icon={FirewallIcon} />
                </div>
              </div>
              <h3 className="mb-2 font-bold text-neutral-900">
                {isSpanish ? "Monitoreado" : "Monitored"}
              </h3>
              <p className="text-sm text-neutral-600">
                {isSpanish ? "Detección de amenazas 24/7" : "24/7 threat detection"}
              </p>
            </div>
          </div>

          {/* Security Sections */}
          <div className="space-y-12">
            {/* Encryption */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <HugeiconsIcon className="h-6 w-6 text-blue-600" icon={LockKeyIcon} />
                </div>
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                    {isSpanish ? "Cifrado de Datos" : "Data Encryption"}
                  </h2>
                  <p className="text-neutral-600">
                    {isSpanish
                      ? "Todos sus datos están protegidos con cifrado de nivel empresarial tanto en tránsito como en reposo."
                      : "All your data is protected with enterprise-level encryption both in transit and at rest."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "En Tránsito (HTTPS/TLS 1.3)" : "In Transit (HTTPS/TLS 1.3)"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Todas las comunicaciones cifradas con TLS 1.3 (Transport Layer Security)"
                        : "All communications encrypted with TLS 1.3 (Transport Layer Security)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Certificados SSL renovados automáticamente"
                        : "Automatically renewed SSL certificates"}
                    </li>
                    <li>
                      {isSpanish
                        ? "HTTP Strict Transport Security (HSTS) habilitado"
                        : "HTTP Strict Transport Security (HSTS) enabled"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Perfect Forward Secrecy (PFS) para protección contra ataques futuros"
                        : "Perfect Forward Secrecy (PFS) for protection against future attacks"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "En Reposo (AES-256)" : "At Rest (AES-256)"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Base de datos cifrada con AES-256 (Advanced Encryption Standard)"
                        : "Database encrypted with AES-256 (Advanced Encryption Standard)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Archivos y documentos cifrados en almacenamiento"
                        : "Files and documents encrypted in storage"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Respaldos cifrados con las mismas claves rotadas periódicamente"
                        : "Backups encrypted with periodically rotated keys"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Authentication & Access Control */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <HugeiconsIcon className="h-6 w-6 text-green-600" icon={Shield01Icon} />
                </div>
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                    {isSpanish ? "Autenticación y Control de Acceso" : "Authentication & Access Control"}
                  </h2>
                  <p className="text-neutral-600">
                    {isSpanish
                      ? "Implementamos controles de acceso estrictos para garantizar que solo usuarios autorizados accedan a sus datos."
                      : "We implement strict access controls to ensure only authorized users access your data."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Autenticación de Usuario" : "User Authentication"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Autenticación multifactor (MFA) disponible para todas las cuentas"
                        : "Multi-factor authentication (MFA) available for all accounts"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Tokens JWT (JSON Web Tokens) con expiración automática"
                        : "JWT (JSON Web Tokens) with automatic expiration"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Políticas de contraseñas fuertes (mínimo 8 caracteres, mayúsculas, números, símbolos)"
                        : "Strong password policies (minimum 8 characters, uppercase, numbers, symbols)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Verificación de email obligatoria al registro"
                        : "Mandatory email verification on registration"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Control de Acceso a Base de Datos" : "Database Access Control"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Row Level Security (RLS) - Los usuarios solo ven sus propios datos"
                        : "Row Level Security (RLS) - Users only see their own data"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Control de acceso basado en roles (RBAC): Usuario, Profesional, Administrador"
                        : "Role-Based Access Control (RBAC): User, Professional, Administrator"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Principio de mínimo privilegio - Acceso limitado por necesidad"
                        : "Principle of least privilege - Limited access by necessity"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Infrastructure Security */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <HugeiconsIcon className="h-6 w-6 text-purple-600" icon={Database02Icon} />
                </div>
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                    {isSpanish ? "Seguridad de Infraestructura" : "Infrastructure Security"}
                  </h2>
                  <p className="text-neutral-600">
                    {isSpanish
                      ? "Nuestra infraestructura cloud está diseñada con múltiples capas de seguridad y resiliencia."
                      : "Our cloud infrastructure is designed with multiple layers of security and resilience."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Protección de Red" : "Network Protection"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Firewall de aplicaciones web (WAF) para bloquear ataques comunes"
                        : "Web Application Firewall (WAF) to block common attacks"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Protección DDoS (Distributed Denial of Service) integrada"
                        : "Integrated DDoS (Distributed Denial of Service) protection"}
                    </li>
                    <li>
                      {isSpanish
                        ? "CDN global (Content Delivery Network) para velocidad y seguridad"
                        : "Global CDN (Content Delivery Network) for speed and security"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Aislamiento de red entre componentes críticos"
                        : "Network isolation between critical components"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Respaldos y Recuperación" : "Backups & Recovery"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Respaldos automáticos diarios de toda la base de datos"
                        : "Automatic daily backups of entire database"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Retención de respaldos: 7 días para recuperación rápida"
                        : "Backup retention: 7 days for quick recovery"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Respaldos almacenados en ubicaciones geográficas separadas"
                        : "Backups stored in separate geographic locations"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Pruebas de recuperación periódicas para validar integridad"
                        : "Periodic recovery testing to validate integrity"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Application Security */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                  {isSpanish ? "Seguridad de Aplicación" : "Application Security"}
                </h2>
                <p className="text-neutral-600">
                  {isSpanish
                    ? "Implementamos prácticas de desarrollo seguro y herramientas automatizadas para prevenir vulnerabilidades."
                    : "We implement secure development practices and automated tools to prevent vulnerabilities."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Prevención de Vulnerabilidades" : "Vulnerability Prevention"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      <strong>XSS Prevention:</strong>{" "}
                      {isSpanish
                        ? "Sanitización de entrada con DOMPurify"
                        : "Input sanitization with DOMPurify"}
                    </li>
                    <li>
                      <strong>SQL Injection:</strong>{" "}
                      {isSpanish
                        ? "Consultas parametrizadas (prepared statements)"
                        : "Parameterized queries (prepared statements)"}
                    </li>
                    <li>
                      <strong>CSRF Protection:</strong>{" "}
                      {isSpanish
                        ? "Tokens anti-CSRF en todos los formularios"
                        : "Anti-CSRF tokens on all forms"}
                    </li>
                    <li>
                      <strong>SSRF Prevention:</strong>{" "}
                      {isSpanish
                        ? "Validación de URLs y lista blanca de hosts"
                        : "URL validation and host allowlist"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Escaneo de Seguridad Continuo" : "Continuous Security Scanning"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      <strong>Snyk:</strong>{" "}
                      {isSpanish
                        ? "Escaneo automático de dependencias y análisis de código estático (SAST)"
                        : "Automatic dependency scanning and static analysis (SAST)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Alertas en tiempo real de vulnerabilidades conocidas (CVE)"
                        : "Real-time alerts for known vulnerabilities (CVE)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Actualización automática de dependencias con vulnerabilidades críticas"
                        : "Automatic updates for dependencies with critical vulnerabilities"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Monitoring & Logging */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                  {isSpanish ? "Monitoreo y Registro" : "Monitoring & Logging"}
                </h2>
                <p className="text-neutral-600">
                  {isSpanish
                    ? "Monitoreamos toda la actividad de la plataforma 24/7 para detectar comportamientos anómalos."
                    : "We monitor all platform activity 24/7 to detect anomalous behavior."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Detección de Amenazas" : "Threat Detection"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Monitoreo de logs en tiempo real con Better Stack"
                        : "Real-time log monitoring with Better Stack"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Alertas automáticas de actividad sospechosa (intentos de login fallidos, accesos inusuales)"
                        : "Automatic alerts for suspicious activity (failed login attempts, unusual access)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Análisis de comportamiento de usuarios para detectar fraude"
                        : "User behavior analysis to detect fraud"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Registro de Auditoría" : "Audit Logging"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Registro de todos los accesos a datos sensibles"
                        : "Logging of all sensitive data access"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Retención de logs de seguridad por 1 año (cumplimiento GDPR)"
                        : "Security log retention for 1 year (GDPR compliance)"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Logs inmutables para investigaciones forenses"
                        : "Immutable logs for forensic investigations"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Secure Development */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-neutral-900">
                  {isSpanish ? "Desarrollo Seguro (SDLC)" : "Secure Development (SDLC)"}
                </h2>
                <p className="text-neutral-600">
                  {isSpanish
                    ? "Seguimos prácticas de desarrollo seguro en todo el ciclo de vida del software."
                    : "We follow secure development practices throughout the software development lifecycle."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                    1
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-neutral-900">
                      {isSpanish ? "Revisión de Código" : "Code Review"}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isSpanish
                        ? "Todo código es revisado por al menos un desarrollador antes de ser desplegado"
                        : "All code is reviewed by at least one developer before deployment"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                    2
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-neutral-900">
                      {isSpanish ? "Pruebas Automatizadas" : "Automated Testing"}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isSpanish
                        ? "Pruebas unitarias, de integración y E2E antes de cada despliegue"
                        : "Unit, integration, and E2E testing before each deployment"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                    3
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-neutral-900">
                      {isSpanish ? "Despliegue Gradual" : "Gradual Deployment"}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isSpanish
                        ? "Despliegues canary y feature flags para rollback rápido si es necesario"
                        : "Canary deployments and feature flags for quick rollback if needed"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Responsible Disclosure */}
            <section className="rounded-xl border-2 border-orange-500 bg-orange-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                {isSpanish ? "Divulgación Responsable de Vulnerabilidades" : "Responsible Vulnerability Disclosure"}
              </h2>
              <p className="mb-4 text-neutral-700">
                {isSpanish
                  ? "Si descubre una vulnerabilidad de seguridad en Casaora, por favor repórtela de manera responsable. Valoramos su colaboración."
                  : "If you discover a security vulnerability in Casaora, please report it responsibly. We value your collaboration."}
              </p>
              <div className="space-y-3">
                <div className="rounded-lg bg-white p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Cómo Reportar" : "How to Report"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish ? "Envíe un email a:" : "Send an email to:"}{" "}
                      <a href="mailto:security@casaora.com" className="font-semibold text-orange-600 hover:underline">
                        security@casaora.com
                      </a>
                    </li>
                    <li>
                      {isSpanish
                        ? "Incluya una descripción detallada del problema"
                        : "Include a detailed description of the issue"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Proporcione pasos para reproducir la vulnerabilidad"
                        : "Provide steps to reproduce the vulnerability"}
                    </li>
                    <li>
                      {isSpanish
                        ? "NO divulgue públicamente la vulnerabilidad hasta que la hayamos solucionado"
                        : "DO NOT publicly disclose the vulnerability until we've fixed it"}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    {isSpanish ? "Nuestro Compromiso" : "Our Commitment"}
                  </h3>
                  <ul className="ml-6 list-disc space-y-1 text-sm text-neutral-600">
                    <li>
                      {isSpanish
                        ? "Responderemos dentro de 48 horas hábiles"
                        : "We'll respond within 48 business hours"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Investigaremos y resolveremos el problema lo antes posible"
                        : "We'll investigate and resolve the issue as soon as possible"}
                    </li>
                    <li>
                      {isSpanish
                        ? "Daremos crédito a los investigadores que reporten responsablemente"
                        : "We'll credit researchers who report responsibly"}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                {isSpanish ? "¿Preguntas de Seguridad?" : "Security Questions?"}
              </h2>
              <p className="mb-6 text-neutral-600">
                {isSpanish
                  ? "Para preguntas sobre nuestras prácticas de seguridad o para reportar un problema, contáctenos:"
                  : "For questions about our security practices or to report an issue, contact us:"}
              </p>
              <a
                href="mailto:security@casaora.com"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                security@casaora.com
              </a>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
