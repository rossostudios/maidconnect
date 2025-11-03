import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.privacy.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  const isSpanish = locale === "es";
  const lastUpdated = "30 de Enero de 2025";

  return (
    <div className="min-h-screen bg-[#fbfaf9]">
      <SiteHeader />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] md:p-12">
            {isSpanish ? (
              <SpanishPrivacyPolicy lastUpdated={lastUpdated} />
            ) : (
              <EnglishPrivacyPolicy lastUpdated={lastUpdated} />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SpanishPrivacyPolicy({ lastUpdated }: { lastUpdated: string }) {
  return (
    <>
      <h1 className="mb-4 font-bold text-4xl text-[#211f1a]">
        Política de Privacidad y Protección de Datos Personales
      </h1>
      <p className="mb-2 text-[#7d7566]">
        <strong>Última actualización:</strong> {lastUpdated}
      </p>
      <p className="mb-8 text-[#7d7566]">
        <strong>Conforme a la Ley 1581 de 2012 de Colombia</strong>
      </p>

      <div className="prose prose-lg max-w-none space-y-8">
        {/* Section 1 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            1. Responsable del Tratamiento de Datos
          </h2>
          <div className="mb-4 rounded-lg border border-[#ebe5d8] bg-[#fbfaf9] p-4">
            <p className="mb-2 text-[#211f1a]">
              <strong>Razón Social:</strong> [Su empresa - Por completar]
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>NIT:</strong> [Por completar]
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Domicilio:</strong> [Dirección en Colombia - Por completar]
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Correo Electrónico:</strong>{" "}
              <a className="text-[#8B7355] hover:underline" href="mailto:privacy@casaora.com">
                privacy@casaora.com
              </a>
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Teléfono:</strong> [Por completar]
            </p>
          </div>
          <p className="text-[#7d7566]">
            Casaora actúa como responsable del tratamiento de sus datos personales conforme a lo
            establecido en la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            2. Datos Personales que Recopilamos
          </h2>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">2.1 Datos de Identificación</h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección física (para prestación del servicio)</li>
            <li>Documento de identidad (solo para profesionales verificados)</li>
          </ul>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">2.2 Datos de Ubicación</h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Coordenadas GPS durante check-in y check-out de servicios</li>
            <li>
              <strong>Finalidad:</strong> Verificar la presencia del profesional en la ubicación del
              servicio
            </li>
            <li>
              <strong>Base legal:</strong> Ejecución del contrato y prevención de fraude
            </li>
          </ul>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">2.3 Datos Financieros</h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Historial de pagos y transacciones</li>
            <li>Información de cuenta bancaria (solo para profesionales que reciben pagos)</li>
            <li>
              <strong>Nota importante:</strong> NO guardamos números de tarjeta de crédito. Los
              pagos son procesados por Stripe Inc., certificado PCI DSS Level 1.
            </li>
          </ul>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">
            2.4 Datos de Uso y Comunicaciones
          </h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Historial de servicios contratados</li>
            <li>Mensajes entre clientes y profesionales (solo a través de la plataforma)</li>
            <li>Calificaciones y reseñas</li>
            <li>Preferencias del servicio</li>
            <li>Datos de navegación (dirección IP, tipo de navegador, páginas visitadas)</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">3. Finalidades del Tratamiento</h2>
          <p className="mb-4 text-[#7d7566]">
            Sus datos personales son utilizados para las siguientes finalidades:
          </p>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">
            3.1 Finalidades Principales (Esenciales para el Servicio)
          </h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Prestación del servicio:</strong> Conectar clientes con profesionales del
              hogar
            </li>
            <li>
              <strong>Procesamiento de pagos:</strong> Facilitar transacciones seguras entre
              usuarios
            </li>
            <li>
              <strong>Comunicación:</strong> Enviar notificaciones sobre reservas, mensajes y
              actualizaciones del servicio
            </li>
            <li>
              <strong>Verificación de identidad:</strong> Validar la identidad de profesionales
            </li>
            <li>
              <strong>Seguridad:</strong> Prevenir fraude y garantizar la seguridad de la plataforma
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y tributarias
            </li>
          </ul>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">
            3.2 Finalidades Secundarias (Opcionales)
          </h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Marketing:</strong> Enviar promociones, ofertas especiales y noticias
              (requiere consentimiento específico)
            </li>
            <li>
              <strong>Mejora del servicio:</strong> Análisis estadístico y mejora de funcionalidades
              (datos anonimizados)
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            4. Derechos del Titular (Artículo 8, Ley 1581)
          </h2>
          <p className="mb-4 text-[#7d7566]">
            Como titular de datos personales, usted tiene los siguientes derechos:
          </p>

          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Conocer, actualizar y rectificar</strong> sus datos personales frente al
              Responsable del Tratamiento
            </li>
            <li>
              <strong>Solicitar prueba</strong> de la autorización otorgada al Responsable del
              Tratamiento
            </li>
            <li>
              <strong>Ser informado</strong> por el Responsable del Tratamiento, previa solicitud,
              respecto del uso que le ha dado a sus datos personales
            </li>
            <li>
              <strong>Presentar ante la Superintendencia de Industria y Comercio</strong> quejas por
              infracciones a lo dispuesto en la Ley 1581 de 2012
            </li>
            <li>
              <strong>Revocar la autorización</strong> y/o solicitar la supresión del dato cuando no
              se respeten los principios, derechos y garantías constitucionales y legales
            </li>
            <li>
              <strong>Acceder gratuitamente</strong> a sus datos personales que hayan sido objeto de
              Tratamiento
            </li>
          </ul>

          <div className="rounded-lg border-[#8B7355] border-l-4 bg-[#fff5f2] p-4">
            <h3 className="mb-2 font-semibold text-[#211f1a]">¿Cómo Ejercer Sus Derechos?</h3>
            <p className="mb-2 text-[#7d7566]">
              Para ejercer cualquiera de estos derechos, puede contactarnos por los siguientes
              medios:
            </p>
            <ul className="ml-6 list-disc text-[#7d7566]">
              <li>
                <strong>Correo electrónico:</strong>{" "}
                <a className="text-[#8B7355] hover:underline" href="mailto:privacy@casaora.com">
                  privacy@casaora.com
                </a>
              </li>
              <li>
                <strong>Dentro de la plataforma:</strong> Menú → Mi Cuenta → Mis Datos Personales
              </li>
            </ul>
            <p className="mt-2 text-[#7d7566]">
              <strong>Tiempo de respuesta:</strong> Máximo 15 días hábiles desde la recepción de su
              solicitud
            </p>
            <p className="text-[#7d7566]">
              <strong>Costo:</strong> Gratuito
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            5. Autorización y Consentimiento
          </h2>
          <p className="mb-4 text-[#7d7566]">
            El tratamiento de sus datos personales requiere su autorización previa, expresa e
            informada, conforme al Artículo 9 de la Ley 1581 de 2012.
          </p>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">
            5.1 Mecanismos de Autorización
          </h3>
          <p className="mb-4 text-[#7d7566]">La autorización se obtiene mediante:</p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Casillas de consentimiento al momento del registro</li>
            <li>Aceptación de estos términos al usar la plataforma</li>
            <li>Consentimiento específico para finalidades secundarias (marketing, análisis)</li>
          </ul>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">
            5.2 Revocación del Consentimiento
          </h3>
          <p className="mb-4 text-[#7d7566]">
            Puede revocar su autorización en cualquier momento contactando a
            privacy@casaora.com. La revocación no tendrá efectos retroactivos.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            6. Compartir Datos con Terceros
          </h2>
          <p className="mb-4 text-[#7d7566]">
            Compartimos sus datos personales únicamente en las siguientes circunstancias:
          </p>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">
            6.1 Proveedores de Servicios
          </h3>
          <div className="mb-4 space-y-2">
            <div className="rounded-lg border border-[#ebe5d8] bg-white p-3">
              <p className="mb-1 font-semibold text-[#211f1a]">Stripe Inc. (Estados Unidos)</p>
              <p className="text-[#7d7566] text-sm">
                Finalidad: Procesamiento de pagos | Certificación: PCI DSS Level 1
              </p>
            </div>
            <div className="rounded-lg border border-[#ebe5d8] bg-white p-3">
              <p className="mb-1 font-semibold text-[#211f1a]">Supabase Inc. (Estados Unidos)</p>
              <p className="text-[#7d7566] text-sm">
                Finalidad: Almacenamiento de base de datos | Certificación: SOC 2 Type II
              </p>
            </div>
            <div className="rounded-lg border border-[#ebe5d8] bg-white p-3">
              <p className="mb-1 font-semibold text-[#211f1a]">Vercel Inc. (Estados Unidos)</p>
              <p className="text-[#7d7566] text-sm">
                Finalidad: Hosting de aplicación | Certificación: SOC 2 Type II
              </p>
            </div>
          </div>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">6.2 Entre Usuarios</h3>
          <p className="mb-4 text-[#7d7566]">
            Para facilitar la prestación del servicio, compartimos información entre clientes y
            profesionales:
          </p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Nombre, foto de perfil y calificaciones</li>
            <li>Información de contacto (solo después de aceptar una reserva)</li>
            <li>Dirección del servicio (solo para el profesional asignado)</li>
          </ul>

          <p className="font-semibold text-[#8B7355]">
            ⚠️ NO vendemos sus datos personales a terceros bajo ninguna circunstancia.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">7. Medidas de Seguridad</h2>
          <p className="mb-4 text-[#7d7566]">
            Implementamos medidas técnicas, humanas y administrativas para proteger sus datos:
          </p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Cifrado:</strong> HTTPS (TLS 1.3) para todas las comunicaciones
            </li>
            <li>
              <strong>Base de datos:</strong> Cifrada en reposo (AES-256)
            </li>
            <li>
              <strong>Acceso:</strong> Controles basados en roles (Row Level Security)
            </li>
            <li>
              <strong>Autenticación:</strong> Tokens JWT con expiración
            </li>
            <li>
              <strong>Respaldos:</strong> Respaldo diario de datos
            </li>
            <li>
              <strong>Monitoreo:</strong> Detección de actividad sospechosa 24/7
            </li>
          </ul>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">8. Retención de Datos</h2>
          <p className="mb-4 text-[#7d7566]">
            Conservamos sus datos personales durante los siguientes períodos:
          </p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Cuentas activas:</strong> Mientras su cuenta esté activa
            </li>
            <li>
              <strong>Cuentas cerradas:</strong> 5 años después del cierre (requerido para fines
              legales y tributarios)
            </li>
            <li>
              <strong>Datos financieros:</strong> 5 años (obligación legal, Artículo 632 del
              Estatuto Tributario)
            </li>
            <li>
              <strong>Mensajes y comunicaciones:</strong> 2 años desde última actividad
            </li>
            <li>
              <strong>Logs de seguridad:</strong> 1 año
            </li>
          </ul>
          <p className="text-[#7d7566]">
            Después de estos períodos, los datos son eliminados o anonimizados de forma
            irreversible.
          </p>
        </section>

        {/* Section 9 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            9. Transferencia Internacional de Datos
          </h2>
          <p className="mb-4 text-[#7d7566]">
            Algunos de nuestros proveedores de servicios están ubicados en Estados Unidos. La
            transferencia de datos a estos países se realiza con las siguientes garantías:
          </p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              Todos los proveedores cumplen con estándares internacionales de protección de datos
            </li>
            <li>Contratos de procesamiento de datos que garantizan nivel adecuado de protección</li>
            <li>Certificaciones: SOC 2 Type II, ISO 27001, PCI DSS</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            10. Cookies y Tecnologías Similares
          </h2>
          <p className="mb-4 text-[#7d7566]">Utilizamos cookies y tecnologías similares para:</p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Esenciales:</strong> Mantener su sesión activa (no se pueden desactivar)
            </li>
            <li>
              <strong>Preferencias:</strong> Recordar idioma y configuraciones
            </li>
            <li>
              <strong>Análisis:</strong> Entender cómo usa la plataforma (opcional)
            </li>
          </ul>
          <p className="text-[#7d7566]">
            Puede gestionar sus preferencias de cookies en cualquier momento desde su navegador.
          </p>
        </section>

        {/* Section 11 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">11. Menores de Edad</h2>
          <p className="text-[#7d7566]">
            Casaora está dirigido a personas mayores de 18 años. No recopilamos intencionalmente
            información de menores de edad. Si detectamos que hemos recopilado datos de un menor,
            procederemos a eliminarlos inmediatamente.
          </p>
        </section>

        {/* Section 12 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            12. Modificaciones a Esta Política
          </h2>
          <p className="mb-4 text-[#7d7566]">
            Podemos actualizar esta Política de Privacidad ocasionalmente. En caso de cambios
            materiales:
          </p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Notificaremos por correo electrónico con 30 días de anticipación</li>
            <li>Publicaremos un aviso destacado en la plataforma</li>
            <li>Solicitaremos su consentimiento nuevamente si es requerido por ley</li>
          </ul>
        </section>

        {/* Section 13 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">13. Autoridades de Control</h2>
          <p className="mb-4 text-[#7d7566]">
            Si considera que sus derechos no han sido respetados, puede presentar una queja ante:
          </p>
          <div className="rounded-lg border border-[#ebe5d8] bg-white p-4">
            <p className="mb-2 font-semibold text-[#211f1a]">
              Superintendencia de Industria y Comercio (SIC)
            </p>
            <p className="mb-1 text-[#7d7566]">Delegatura de Protección de Datos Personales</p>
            <p className="mb-1 text-[#7d7566]">
              Carrera 13 No. 27 - 00, Pisos 3 y 4, Bogotá D.C., Colombia
            </p>
            <p className="mb-1 text-[#7d7566]">Tel: (+57) 601 5870000</p>
            <p className="text-[#7d7566]">
              Web:{" "}
              <a
                className="text-[#8B7355] hover:underline"
                href="https://www.sic.gov.co"
                rel="noopener noreferrer"
                target="_blank"
              >
                www.sic.gov.co
              </a>
            </p>
          </div>
        </section>

        {/* Section 14 */}
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">14. Contacto</h2>
          <p className="mb-4 text-[#7d7566]">
            Para preguntas, solicitudes o inquietudes sobre esta Política de Privacidad o el
            tratamiento de sus datos personales:
          </p>
          <div className="rounded-lg border border-[#ebe5d8] bg-white p-4">
            <p className="mb-2 text-[#211f1a]">
              <strong>Correo Electrónico:</strong>{" "}
              <a className="text-[#8B7355] hover:underline" href="mailto:privacy@casaora.com">
                privacy@casaora.com
              </a>
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Asunto:</strong> "Protección de Datos Personales"
            </p>
            <p className="text-[#211f1a]">
              <strong>Tiempo de respuesta:</strong> Máximo 15 días hábiles
            </p>
          </div>
        </section>

        {/* Legal Declaration */}
        <section className="rounded-lg border-2 border-[#8B7355] bg-[#fff5f2] p-6">
          <h2 className="mb-4 font-bold text-[#211f1a] text-xl">Declaración de Consentimiento</h2>
          <p className="text-[#7d7566]">Al registrarse y usar Casaora, usted declara que:</p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Ha leído y entendido esta Política de Privacidad</li>
            <li>Autoriza el tratamiento de sus datos personales conforme a lo aquí establecido</li>
            <li>Conoce sus derechos y los medios para ejercerlos</li>
            <li>Acepta el uso de sus datos para las finalidades descritas</li>
          </ul>
          <p className="font-semibold text-[#211f1a]">
            Esta Política de Privacidad cumple con la Ley 1581 de 2012, el Decreto 1377 de 2013, y
            demás normas aplicables en Colombia.
          </p>
        </section>
      </div>
    </>
  );
}

function EnglishPrivacyPolicy({ lastUpdated }: { lastUpdated: string }) {
  return (
    <>
      <h1 className="mb-4 font-bold text-4xl text-[#211f1a]">
        Privacy Policy & Personal Data Protection
      </h1>
      <p className="mb-2 text-[#7d7566]">
        <strong>Last Updated:</strong> {lastUpdated}
      </p>
      <p className="mb-8 text-[#7d7566]">
        <strong>In compliance with Colombian Law 1581 of 2012</strong>
      </p>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">1. Data Controller</h2>
          <div className="mb-4 rounded-lg border border-[#ebe5d8] bg-[#fbfaf9] p-4">
            <p className="mb-2 text-[#211f1a]">
              <strong>Company Name:</strong> [Your company - To be completed]
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Tax ID:</strong> [To be completed]
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Address:</strong> [Address in Colombia - To be completed]
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Email:</strong>{" "}
              <a className="text-[#8B7355] hover:underline" href="mailto:privacy@casaora.com">
                privacy@casaora.com
              </a>
            </p>
            <p className="mb-2 text-[#211f1a]">
              <strong>Phone:</strong> [To be completed]
            </p>
          </div>
          <p className="text-[#7d7566]">
            Casaora acts as the data controller for your personal data in accordance with
            Colombian Law 1581 of 2012 and Decree 1377 of 2013.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">2. Personal Data We Collect</h2>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">2.1 Identification Data</h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Full name, email address, phone number</li>
            <li>Physical address (for service delivery)</li>
            <li>Identity document (professionals only)</li>
          </ul>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">2.2 Location Data</h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>GPS coordinates during service check-in/check-out</li>
            <li>
              <strong>Purpose:</strong> Verify professional presence at service location
            </li>
          </ul>

          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">2.3 Financial Data</h3>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>Payment history and transactions</li>
            <li>Bank account information (professionals receiving payments)</li>
            <li>
              <strong>Note:</strong> We do NOT store credit card numbers. Payments are processed by
              Stripe Inc., PCI DSS Level 1 certified.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            3. Your Rights (Article 8, Law 1581)
          </h2>
          <p className="mb-4 text-[#7d7566]">As a data subject, you have the following rights:</p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Access:</strong> Know, update, and rectify your personal data
            </li>
            <li>
              <strong>Proof:</strong> Request proof of authorization granted
            </li>
            <li>
              <strong>Information:</strong> Be informed about data usage
            </li>
            <li>
              <strong>Complaint:</strong> File complaints with Colombian authorities
            </li>
            <li>
              <strong>Revocation:</strong> Revoke authorization and request data deletion
            </li>
            <li>
              <strong>Free Access:</strong> Access your data free of charge
            </li>
          </ul>

          <div className="rounded-lg border-[#8B7355] border-l-4 bg-[#fff5f2] p-4">
            <h3 className="mb-2 font-semibold text-[#211f1a]">How to Exercise Your Rights</h3>
            <p className="mb-2 text-[#7d7566]">Contact us at:</p>
            <ul className="ml-6 list-disc text-[#7d7566]">
              <li>
                <strong>Email:</strong>{" "}
                <a className="text-[#8B7355] hover:underline" href="mailto:privacy@casaora.com">
                  privacy@casaora.com
                </a>
              </li>
              <li>
                <strong>Response time:</strong> Maximum 15 business days
              </li>
              <li>
                <strong>Cost:</strong> Free
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">
            4. Data Sharing with Third Parties
          </h2>
          <p className="mb-4 text-[#7d7566]">We share your data only with:</p>
          <div className="mb-4 space-y-2">
            <div className="rounded-lg border border-[#ebe5d8] bg-white p-3">
              <p className="mb-1 font-semibold text-[#211f1a]">Stripe Inc. (USA)</p>
              <p className="text-[#7d7566] text-sm">
                Purpose: Payment processing | Certification: PCI DSS Level 1
              </p>
            </div>
            <div className="rounded-lg border border-[#ebe5d8] bg-white p-3">
              <p className="mb-1 font-semibold text-[#211f1a]">Supabase Inc. (USA)</p>
              <p className="text-[#7d7566] text-sm">
                Purpose: Database storage | Certification: SOC 2 Type II
              </p>
            </div>
            <div className="rounded-lg border border-[#ebe5d8] bg-white p-3">
              <p className="mb-1 font-semibold text-[#211f1a]">Vercel Inc. (USA)</p>
              <p className="text-[#7d7566] text-sm">
                Purpose: Application hosting | Certification: SOC 2 Type II
              </p>
            </div>
          </div>
          <p className="font-semibold text-[#8B7355]">
            ⚠️ We NEVER sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">5. Security Measures</h2>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Encryption:</strong> HTTPS (TLS 1.3) for all communications
            </li>
            <li>
              <strong>Database:</strong> Encrypted at rest (AES-256)
            </li>
            <li>
              <strong>Access:</strong> Role-based access control (Row Level Security)
            </li>
            <li>
              <strong>Authentication:</strong> JWT tokens with expiration
            </li>
            <li>
              <strong>Backups:</strong> Daily data backups
            </li>
            <li>
              <strong>Monitoring:</strong> 24/7 suspicious activity detection
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">6. Data Retention</h2>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>
              <strong>Active accounts:</strong> While account is active
            </li>
            <li>
              <strong>Closed accounts:</strong> 5 years (legal and tax requirements)
            </li>
            <li>
              <strong>Financial data:</strong> 5 years (legal obligation)
            </li>
            <li>
              <strong>Messages:</strong> 2 years from last activity
            </li>
            <li>
              <strong>Security logs:</strong> 1 year
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-bold text-2xl text-[#211f1a]">7. Contact</h2>
          <div className="rounded-lg border border-[#ebe5d8] bg-white p-4">
            <p className="mb-2 text-[#211f1a]">
              <strong>Email:</strong>{" "}
              <a className="text-[#8B7355] hover:underline" href="mailto:privacy@casaora.com">
                privacy@casaora.com
              </a>
            </p>
            <p className="text-[#211f1a]">
              <strong>Response time:</strong> Maximum 15 business days
            </p>
          </div>
        </section>

        <section className="rounded-lg border-2 border-[#8B7355] bg-[#fff5f2] p-6">
          <h2 className="mb-4 font-bold text-[#211f1a] text-xl">Consent Declaration</h2>
          <p className="text-[#7d7566]">By registering and using Casaora, you declare that:</p>
          <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
            <li>You have read and understood this Privacy Policy</li>
            <li>You authorize the processing of your personal data as established herein</li>
            <li>You know your rights and how to exercise them</li>
          </ul>
          <p className="font-semibold text-[#211f1a]">
            This Privacy Policy complies with Colombian Law 1581 of 2012 and applicable regulations.
          </p>
        </section>
      </div>
    </>
  );
}
