import {
  Database02Icon,
  FirewallIcon,
  LockKeyIcon,
  SecurityCheckIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Metadata } from "next";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
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

type GridCard = {
  title: string;
  description: string;
  icon: typeof Shield01Icon;
  bg: string;
  color: string;
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
          <SecurityHero isSpanish={isSpanish} lastUpdated={lastUpdated} />
          <SecurityLayerGrid isSpanish={isSpanish} />
          <div className="space-y-12">
            <EncryptionSection isSpanish={isSpanish} />
            <AuthenticationSection isSpanish={isSpanish} />
            <SecurityInfrastructureSection isSpanish={isSpanish} />
            <ApplicationSecuritySection isSpanish={isSpanish} />
            <MonitoringSection isSpanish={isSpanish} />
            <SecureDevelopmentSection isSpanish={isSpanish} />
            <DisclosureSection isSpanish={isSpanish} />
            <SecurityContactSection isSpanish={isSpanish} />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

function SecurityHero({ isSpanish, lastUpdated }: HeroProps) {
  return (
    <div className="mb-16 text-center">
      <div className="mb-6 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center bg-orange-100">
          <HugeiconsIcon className="h-10 w-10 text-orange-600" icon={SecurityCheckIcon} />
        </div>
      </div>
      <h1 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
        {isSpanish ? "Seguridad en Casaora" : "Security at Casaora"}
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-neutral-600">
        {isSpanish
          ? "Protegemos su información con múltiples capas de seguridad técnica, cifrado avanzado y monitoreo continuo."
          : "We protect your information with multiple layers of technical security, advanced encryption, and continuous monitoring."}
      </p>
      <p className="mt-4 text-neutral-500 text-sm">
        <strong>{isSpanish ? "Última actualización:" : "Last updated:"}</strong> {lastUpdated}
      </p>
    </div>
  );
}

function SecurityLayerGrid({ isSpanish }: SectionProps) {
  const cards: GridCard[] = [
    {
      title: isSpanish ? "Certificado" : "Certified",
      description: "SOC 2 Type II, ISO 27001, PCI DSS Level 1",
      icon: Shield01Icon,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: isSpanish ? "Cifrado" : "Encrypted",
      description: isSpanish
        ? "TLS 1.3 en tránsito, AES-256 en reposo"
        : "TLS 1.3 in transit, AES-256 at rest",
      icon: LockKeyIcon,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: isSpanish ? "Monitoreado" : "Monitored",
      description: isSpanish ? "Detección de amenazas 24/7" : "24/7 threat detection",
      icon: FirewallIcon,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="mb-12 grid gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <div
          className="border border-neutral-200 bg-white p-6 text-center shadow-sm"
          key={card.title}
        >
          <div className="mb-4 flex justify-center">
            <div className={`flex h-14 w-14 items-center justify-center ${card.bg}`}>
              <HugeiconsIcon className={`h-7 w-7 ${card.color}`} icon={card.icon} />
            </div>
          </div>
          <h3 className="mb-2 font-bold text-neutral-900">{card.title}</h3>
          <p className="text-neutral-600 text-sm">{card.description}</p>
        </div>
      ))}
    </div>
  );
}

function EncryptionSection({ isSpanish }: SectionProps) {
  const inTransitItems = isSpanish
    ? [
        "Todas las comunicaciones cifradas con TLS 1.3 (Transport Layer Security)",
        "Certificados SSL renovados automáticamente",
        "HTTP Strict Transport Security (HSTS) habilitado",
        "Perfect Forward Secrecy (PFS) para protección contra ataques futuros",
      ]
    : [
        "All communications encrypted with TLS 1.3 (Transport Layer Security)",
        "Automatically renewed SSL certificates",
        "HTTP Strict Transport Security (HSTS) enabled",
        "Perfect Forward Secrecy (PFS) for protection against future attacks",
      ];

  const atRestItems = isSpanish
    ? [
        "Base de datos cifrada con AES-256 (Advanced Encryption Standard)",
        "Archivos y documentos cifrados en almacenamiento",
        "Respaldos cifrados con las mismas claves rotadas periódicamente",
      ]
    : [
        "Database encrypted with AES-256 (Advanced Encryption Standard)",
        "Files and documents encrypted in storage",
        "Backups encrypted with periodically rotated keys",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <SectionHeader
        description={
          isSpanish
            ? "Todos sus datos están protegidos con cifrado de nivel empresarial tanto en tránsito como en reposo."
            : "All your data is protected with enterprise-level encryption both in transit and at rest."
        }
        icon={LockKeyIcon}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        title={isSpanish ? "Cifrado de Datos" : "Data Encryption"}
      />
      <div className="space-y-4">
        <BulletCard
          items={inTransitItems}
          title={isSpanish ? "En Tránsito (HTTPS/TLS 1.3)" : "In Transit (HTTPS/TLS 1.3)"}
        />
        <BulletCard
          items={atRestItems}
          title={isSpanish ? "En Reposo (AES-256)" : "At Rest (AES-256)"}
        />
      </div>
    </section>
  );
}

function AuthenticationSection({ isSpanish }: SectionProps) {
  const userAuthItems = isSpanish
    ? [
        "Autenticación multifactor (MFA) disponible para todas las cuentas",
        "Tokens JWT (JSON Web Tokens) con expiración automática",
        "Políticas de contraseñas fuertes (mínimo 8 caracteres, mayúsculas, números, símbolos)",
        "Verificación de email obligatoria al registro",
      ]
    : [
        "Multi-factor authentication (MFA) available for all accounts",
        "JWT (JSON Web Tokens) with automatic expiration",
        "Strong password policies (minimum 8 characters, uppercase, numbers, symbols)",
        "Mandatory email verification on registration",
      ];

  const dbAccessItems = isSpanish
    ? [
        "Row Level Security (RLS) - Los usuarios solo ven sus propios datos",
        "Control de acceso basado en roles (RBAC): Usuario, Profesional, Administrador",
        "Principio de mínimo privilegio - Acceso limitado por necesidad",
      ]
    : [
        "Row Level Security (RLS) - Users only see their own data",
        "Role-Based Access Control (RBAC): User, Professional, Administrator",
        "Principle of least privilege - Limited access by necessity",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <SectionHeader
        description={
          isSpanish
            ? "Implementamos controles de acceso estrictos para garantizar que solo usuarios autorizados accedan a sus datos."
            : "We implement strict access controls to ensure only authorized users access your data."
        }
        icon={Shield01Icon}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        title={isSpanish ? "Autenticación y Control de Acceso" : "Authentication & Access Control"}
      />
      <div className="space-y-4">
        <BulletCard
          items={userAuthItems}
          title={isSpanish ? "Autenticación de Usuario" : "User Authentication"}
        />
        <BulletCard
          items={dbAccessItems}
          title={isSpanish ? "Control de Acceso a Base de Datos" : "Database Access Control"}
        />
      </div>
    </section>
  );
}

function SecurityInfrastructureSection({ isSpanish }: SectionProps) {
  const networkItems = isSpanish
    ? [
        "Firewall de aplicaciones web (WAF) para bloquear ataques comunes",
        "Protección DDoS (Distributed Denial of Service) integrada",
        "CDN global (Content Delivery Network) para velocidad y seguridad",
        "Aislamiento de red entre componentes críticos",
      ]
    : [
        "Web Application Firewall (WAF) to block common attacks",
        "Integrated DDoS (Distributed Denial of Service) protection",
        "Global CDN (Content Delivery Network) for speed and security",
        "Network isolation between critical components",
      ];

  const backupItems = isSpanish
    ? [
        "Respaldos automáticos diarios de toda la base de datos",
        "Retención de respaldos: 7 días para recuperación rápida",
        "Respaldos almacenados en ubicaciones geográficas separadas",
        "Pruebas de recuperación periódicas para validar integridad",
      ]
    : [
        "Automatic daily backups of entire database",
        "Backup retention: 7 days for quick recovery",
        "Backups stored in separate geographic locations",
        "Periodic recovery testing to validate integrity",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <SectionHeader
        description={
          isSpanish
            ? "Nuestra infraestructura cloud está diseñada con múltiples capas de seguridad y resiliencia."
            : "Our cloud infrastructure is designed with multiple layers of security and resilience."
        }
        icon={Database02Icon}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        title={isSpanish ? "Seguridad de Infraestructura" : "Infrastructure Security"}
      />
      <div className="space-y-4">
        <BulletCard
          items={networkItems}
          title={isSpanish ? "Protección de Red" : "Network Protection"}
        />
        <BulletCard
          items={backupItems}
          title={isSpanish ? "Respaldos y Recuperación" : "Backups & Recovery"}
        />
      </div>
    </section>
  );
}

function ApplicationSecuritySection({ isSpanish }: SectionProps) {
  const preventionItems = [
    {
      title: "XSS Prevention",
      description: isSpanish
        ? "Sanitización de entrada con DOMPurify"
        : "Input sanitization with DOMPurify",
    },
    {
      title: "SQL Injection",
      description: isSpanish
        ? "Consultas parametrizadas (prepared statements)"
        : "Parameterized queries (prepared statements)",
    },
    {
      title: "CSRF Protection",
      description: isSpanish
        ? "Tokens anti-CSRF en todos los formularios"
        : "Anti-CSRF tokens on all forms",
    },
    {
      title: "SSRF Prevention",
      description: isSpanish
        ? "Validación de URLs y lista blanca de hosts"
        : "URL validation and host allowlist",
    },
  ];

  const scanningItems = isSpanish
    ? [
        "Escaneo automático de dependencias y análisis de código estático (SAST)",
        "Alertas en tiempo real de vulnerabilidades conocidas (CVE)",
        "Actualización automática de dependencias con vulnerabilidades críticas",
      ]
    : [
        "Automatic dependency scanning and static analysis (SAST)",
        "Real-time alerts for known vulnerabilities (CVE)",
        "Automatic updates for dependencies with critical vulnerabilities",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 font-bold text-2xl text-neutral-900">
          {isSpanish ? "Seguridad de Aplicación" : "Application Security"}
        </h2>
        <p className="text-neutral-600">
          {isSpanish
            ? "Implementamos prácticas de desarrollo seguro y herramientas automatizadas para prevenir vulnerabilidades."
            : "We implement secure development practices and automated tools to prevent vulnerabilities."}
        </p>
      </div>
      <div className="space-y-4">
        <div className="border border-neutral-100 bg-neutral-50 p-4">
          <h3 className="mb-2 font-semibold text-neutral-900">
            {isSpanish ? "Prevención de Vulnerabilidades" : "Vulnerability Prevention"}
          </h3>
          <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {preventionItems.map((item) => (
              <li key={item.title}>
                <strong>{item.title}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </div>
        <BulletCard
          items={scanningItems}
          title={isSpanish ? "Escaneo de Seguridad Continuo" : "Continuous Security Scanning"}
        />
      </div>
    </section>
  );
}

function MonitoringSection({ isSpanish }: SectionProps) {
  const detectionItems = isSpanish
    ? [
        "Monitoreo de logs en tiempo real con Better Stack",
        "Alertas automáticas de actividad sospechosa (intentos de login fallidos, accesos inusuales)",
        "Análisis de comportamiento de usuarios para detectar fraude",
      ]
    : [
        "Real-time log monitoring with Better Stack",
        "Automatic alerts for suspicious activity (failed login attempts, unusual access)",
        "User behavior analysis to detect fraud",
      ];

  const auditItems = isSpanish
    ? [
        "Registro de todos los accesos a datos sensibles",
        "Retención de logs de seguridad por 1 año (cumplimiento GDPR)",
        "Logs inmutables para investigaciones forenses",
      ]
    : [
        "Logging of all sensitive data access",
        "Security log retention for 1 year (GDPR compliance)",
        "Immutable logs for forensic investigations",
      ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 font-bold text-2xl text-neutral-900">
          {isSpanish ? "Monitoreo y Registro" : "Monitoring & Logging"}
        </h2>
        <p className="text-neutral-600">
          {isSpanish
            ? "Monitoreamos toda la actividad de la plataforma 24/7 para detectar comportamientos anómalos."
            : "We monitor all platform activity 24/7 to detect anomalous behavior."}
        </p>
      </div>
      <div className="space-y-4">
        <BulletCard
          items={detectionItems}
          title={isSpanish ? "Detección de Amenazas" : "Threat Detection"}
        />
        <BulletCard
          items={auditItems}
          title={isSpanish ? "Registro de Auditoría" : "Audit Logging"}
        />
      </div>
    </section>
  );
}

function SecureDevelopmentSection({ isSpanish }: SectionProps) {
  const steps = [
    {
      label: "1",
      title: isSpanish ? "Revisión de Código" : "Code Review",
      description: isSpanish
        ? "Todo código es revisado por al menos un desarrollador antes de ser desplegado"
        : "All code is reviewed by at least one developer before deployment",
    },
    {
      label: "2",
      title: isSpanish ? "Pruebas Automatizadas" : "Automated Testing",
      description: isSpanish
        ? "Pruebas unitarias, de integración y E2E antes de cada despliegue"
        : "Unit, integration, and E2E testing before each deployment",
    },
    {
      label: "3",
      title: isSpanish ? "Despliegue Gradual" : "Gradual Deployment",
      description: isSpanish
        ? "Despliegues canary y feature flags para rollback rápido si es necesario"
        : "Canary deployments and feature flags for quick rollback if needed",
    },
  ];

  return (
    <section className="border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 font-bold text-2xl text-neutral-900">
          {isSpanish ? "Desarrollo Seguro (SDLC)" : "Secure Development (SDLC)"}
        </h2>
        <p className="text-neutral-600">
          {isSpanish
            ? "Seguimos prácticas de desarrollo seguro en todo el ciclo de vida del software."
            : "We follow secure development practices throughout the software development lifecycle."}
        </p>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <div className="flex items-start gap-3" key={step.label}>
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center bg-green-100 font-bold text-green-600 text-xs">
              {step.label}
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-neutral-900">{step.title}</h3>
              <p className="text-neutral-600 text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DisclosureSection({ isSpanish }: SectionProps) {
  const howToReport = isSpanish
    ? [
        "Envíe un email a security@casaora.co",
        "Incluya una descripción detallada del problema",
        "Proporcione pasos para reproducir la vulnerabilidad",
        "NO divulgue públicamente la vulnerabilidad hasta que la hayamos solucionado",
      ]
    : [
        "Send an email to security@casaora.co",
        "Include a detailed description of the issue",
        "Provide steps to reproduce the vulnerability",
        "DO NOT publicly disclose the vulnerability until we've fixed it",
      ];

  const commitment = isSpanish
    ? [
        "Responderemos dentro de 48 horas hábiles",
        "Investigaremos y resolveremos el problema lo antes posible",
        "Daremos crédito a los investigadores que reporten responsablemente",
      ]
    : [
        "We'll respond within 48 business hours",
        "We'll investigate and resolve the issue as soon as possible",
        "We'll credit researchers who report responsibly",
      ];

  return (
    <section className="border-2 border-orange-500 bg-orange-50 p-8">
      <h2 className="mb-4 font-bold text-2xl text-neutral-900">
        {isSpanish
          ? "Divulgación Responsable de Vulnerabilidades"
          : "Responsible Vulnerability Disclosure"}
      </h2>
      <p className="mb-4 text-neutral-700">
        {isSpanish
          ? "Si descubre una vulnerabilidad de seguridad en Casaora, por favor repórtela de manera responsable. Valoramos su colaboración."
          : "If you discover a security vulnerability in Casaora, please report it responsibly. We value your collaboration."}
      </p>
      <div className="space-y-3">
        <div className="bg-white p-4">
          <h3 className="mb-2 font-semibold text-neutral-900">
            {isSpanish ? "Cómo Reportar" : "How to Report"}
          </h3>
          <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {howToReport.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4">
          <h3 className="mb-2 font-semibold text-neutral-900">
            {isSpanish ? "Nuestro Compromiso" : "Our Commitment"}
          </h3>
          <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
            {commitment.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SecurityContactSection({ isSpanish }: SectionProps) {
  return (
    <section className="border border-neutral-200 bg-white p-8 text-center shadow-sm">
      <h2 className="mb-4 font-bold text-2xl text-neutral-900">
        {isSpanish ? "¿Preguntas de Seguridad?" : "Security Questions?"}
      </h2>
      <p className="mb-6 text-neutral-600">
        {isSpanish
          ? "Para preguntas sobre nuestras prácticas de seguridad o para reportar un problema, contáctenos:"
          : "For questions about our security practices or to report an issue, contact us:"}
      </p>
      <a
        className="inline-flex items-center gap-2 bg-orange-500 px-8 py-3 font-semibold text-white transition hover:bg-orange-600"
        href="mailto:security@casaora.co"
      >
        security@casaora.co
      </a>
    </section>
  );
}

function SectionHeader({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: typeof LockKeyIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  const Icon = icon;
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center ${iconBg}`}>
        <HugeiconsIcon className={`h-6 w-6 ${iconColor}`} icon={Icon} />
      </div>
      <div>
        <h2 className="mb-2 font-bold text-2xl text-neutral-900">{title}</h2>
        <p className="text-neutral-600">{description}</p>
      </div>
    </div>
  );
}

function BulletCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-neutral-100 bg-neutral-50 p-4">
      <h3 className="mb-2 font-semibold text-neutral-900">{title}</h3>
      <ul className="ml-6 list-disc space-y-1 text-neutral-600 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
