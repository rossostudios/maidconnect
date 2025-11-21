import type { Metadata } from "next";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

export const metadata: Metadata = {
  title: "Terms of Service | Casaora",
  description: "Terms and conditions for using Casaora platform",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const isSpanish = locale === "es";
  const lastUpdated = "30 de Enero de 2025";

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)] md:p-12">
            {isSpanish ? (
              <SpanishTerms lastUpdated={lastUpdated} />
            ) : (
              <EnglishTerms lastUpdated={lastUpdated} />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SpanishTerms({ lastUpdated }: { lastUpdated: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 font-bold text-4xl text-neutral-900">Términos y Condiciones de Uso</h1>
        <p className="text-neutral-500 text-sm">Última actualización: {lastUpdated}</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            1. Aceptación de los Términos
          </h2>
          <p className="text-neutral-700">
            Al acceder y utilizar la plataforma Casaora (&quot;la Plataforma&quot;), usted
            (&quot;Usuario&quot;) acepta estar sujeto a estos Términos y Condiciones de Uso
            (&quot;Términos&quot;). Si no está de acuerdo con estos Términos, no debe utilizar la
            Plataforma.
          </p>
          <p className="mt-3 text-neutral-700">
            Casaora es operada por <strong>[NOMBRE DE LA EMPRESA]</strong>, con oficinas registradas
            en <strong>Colombia, Paraguay, Uruguay y Argentina</strong> (&quot;Casaora&quot;,
            &quot;nosotros&quot;, &quot;nuestro&quot;). Cada mercado opera bajo los requisitos
            regulatorios locales correspondientes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            2. Descripción del Servicio
          </h2>
          <p className="text-neutral-700">
            Casaora es una <strong>plataforma de intermediación digital</strong> que conecta a
            clientes que buscan servicios de limpieza doméstica con profesionales independientes que
            ofrecen dichos servicios.
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-neutral-700">
              <strong>Casaora NO es:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1 text-neutral-700">
              <li>Un empleador de los profesionales de limpieza</li>
              <li>Una agencia de empleo temporal</li>
              <li>Un proveedor directo de servicios de limpieza</li>
              <li>
                Responsable de la ejecución, calidad, o consecuencias de los servicios prestados
                entre usuarios y profesionales
              </li>
            </ul>
          </div>
          <p className="mt-3 text-neutral-700">
            <strong>Casaora SÍ es:</strong> Una plataforma tecnológica que facilita la conexión,
            comunicación, reservación, y procesamiento de pagos entre clientes y profesionales
            independientes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            3. Naturaleza de la Relación Contractual
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                3.1 Profesionales Independientes
              </h3>
              <p className="text-neutral-700">
                Los profesionales de limpieza registrados en la Plataforma son{" "}
                <strong>contratistas independientes</strong> que operan su propio negocio. NO existe
                relación laboral, de subordinación, ni de dependencia entre Casaora y los
                profesionales.
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-1 text-neutral-700">
                <li>Los profesionales establecen su propia disponibilidad y tarifas</li>
                <li>Los profesionales deciden qué reservas aceptar o rechazar</li>
                <li>
                  Los profesionales son responsables de sus propios impuestos y obligaciones
                  tributarias
                </li>
                <li>
                  Los profesionales no reciben salario, prestaciones sociales, ni beneficios
                  laborales
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                3.2 Contrato Directo Cliente-Profesional
              </h3>
              <p className="text-neutral-700">
                Cuando un cliente reserva un servicio a través de la Plataforma, se establece un{" "}
                <strong>contrato directo de prestación de servicios</strong> entre el cliente y el
                profesional. Casaora actúa únicamente como intermediario tecnológico.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            4. Registro y Cuenta de Usuario
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                4.1 Requisitos de Registro
              </h3>
              <ul className="ml-6 list-disc space-y-1 text-neutral-700">
                <li>Debe ser mayor de 18 años</li>
                <li>Debe proporcionar información veraz, precisa y completa</li>
                <li>Debe mantener la confidencialidad de sus credenciales de acceso</li>
                <li>Es responsable de todas las actividades realizadas bajo su cuenta</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">4.2 Tipos de Cuenta</h3>
              <p className="text-neutral-700">
                <strong>Cuenta de Cliente:</strong> Permite buscar profesionales, realizar reservas,
                y gestionar servicios.
              </p>
              <p className="mt-2 text-neutral-700">
                <strong>Cuenta de Profesional:</strong> Permite ofrecer servicios, recibir reservas,
                y gestionar pagos. Los profesionales deben completar un proceso de verificación que
                puede incluir:
              </p>
              <ul className="mt-1 ml-6 list-disc space-y-1 text-neutral-700">
                <li>Verificación de identidad (cédula de ciudadanía o documento equivalente)</li>
                <li>Verificación de antecedentes (cuando sea legalmente permitido)</li>
                <li>Información de cuenta bancaria para recibir pagos</li>
                <li>Referencias profesionales (opcional)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            5. Obligaciones de los Clientes
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-neutral-700">
            <li>
              <strong>Información Precisa:</strong> Proporcionar detalles correctos sobre la
              dirección, tipo de servicio, y requisitos especiales
            </li>
            <li>
              <strong>Acceso al Domicilio:</strong> Garantizar el acceso al lugar donde se prestará
              el servicio en la fecha y hora acordadas
            </li>
            <li>
              <strong>Condiciones Seguras:</strong> Asegurar que el ambiente de trabajo sea seguro y
              apropiado
            </li>
            <li>
              <strong>Pago Oportuno:</strong> Realizar el pago completo según lo acordado a través
              de la Plataforma
            </li>
            <li>
              <strong>Trato Respetuoso:</strong> Tratar a los profesionales con respeto y
              profesionalismo
            </li>
            <li>
              <strong>Reportar Problemas:</strong> Notificar cualquier problema o disputa a través
              de los canales oficiales de la Plataforma
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            6. Obligaciones de los Profesionales
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-neutral-700">
            <li>
              <strong>Calidad del Servicio:</strong> Prestar servicios de manera profesional,
              competente y diligente
            </li>
            <li>
              <strong>Puntualidad:</strong> Llegar a tiempo a las citas programadas
            </li>
            <li>
              <strong>Comunicación:</strong> Mantener comunicación clara con los clientes sobre el
              servicio
            </li>
            <li>
              <strong>Equipos y Productos:</strong> Utilizar productos y equipos seguros y
              apropiados (salvo que el cliente proporcione los suyos)
            </li>
            <li>
              <strong>Confidencialidad:</strong> Respetar la privacidad del cliente y no divulgar
              información personal o del domicilio
            </li>
            <li>
              <strong>Cumplimiento Legal:</strong> Cumplir con todas las leyes y regulaciones
              aplicables, incluyendo obligaciones tributarias
            </li>
            <li>
              <strong>Disponibilidad Actualizada:</strong> Mantener su calendario y disponibilidad
              actualizados en la Plataforma
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            7. Reservas y Cancelaciones
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                7.1 Proceso de Reserva
              </h3>
              <ol className="ml-6 list-decimal space-y-1 text-neutral-700">
                <li>El cliente selecciona un profesional, servicio, fecha y hora</li>
                <li>El cliente proporciona detalles del servicio y realiza el pago</li>
                <li>
                  El profesional recibe la solicitud y tiene 24 horas para aceptarla o rechazarla
                </li>
                <li>
                  Si el profesional acepta, la reserva se confirma y el servicio queda programado
                </li>
                <li>
                  Si el profesional rechaza o no responde en 24 horas, el pago se reembolsa
                  automáticamente
                </li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                7.2 Política de Cancelación por el Cliente
              </h3>
              <ul className="ml-6 list-disc space-y-1 text-neutral-700">
                <li>
                  <strong>Más de 24 horas antes:</strong> Reembolso del 100% del monto pagado
                </li>
                <li>
                  <strong>Entre 12-24 horas antes:</strong> Reembolso del 50% del monto pagado
                </li>
                <li>
                  <strong>Menos de 12 horas antes:</strong> Sin reembolso (el profesional recibe el
                  pago completo como compensación)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                7.3 Cancelación por el Profesional (Después de Aceptar)
              </h3>
              <ul className="ml-6 list-disc space-y-1 text-neutral-700">
                <li>El cliente recibe un reembolso del 100%</li>
                <li>
                  El profesional puede recibir una penalización en su calificación o estado de
                  cuenta
                </li>
                <li>
                  Cancelaciones reiteradas pueden resultar en suspensión o terminación de la cuenta
                  profesional
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">8. Pagos y Comisiones</h2>
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                8.1 Procesamiento de Pagos
              </h3>
              <p className="text-neutral-700">
                Todos los pagos se procesan a través de procesadores de pago certificados PCI DSS.
                En <strong>Colombia</strong>, utilizamos <strong>Stripe</strong>. En{" "}
                <strong>Paraguay, Uruguay y Argentina</strong>, utilizamos <strong>PayPal</strong>.
                Casaora no almacena información completa de tarjetas de crédito o débito.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                8.2 Estructura de Precios
              </h3>
              <ul className="ml-6 list-disc space-y-1 text-neutral-700">
                <li>
                  <strong>Cliente:</strong> Paga el precio del servicio establecido por el
                  profesional + tarifas de procesamiento de Stripe (si aplican)
                </li>
                <li>
                  <strong>Profesional:</strong> Recibe el precio del servicio menos:
                  <ul className="mt-1 ml-6 list-disc space-y-1">
                    <li>
                      Comisión de Casaora: <strong>[X]%</strong> del valor del servicio
                    </li>
                    <li>Tarifas de procesamiento de Stripe (~3.2% + COP $700 por transacción)</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                8.3 Pagos a Profesionales
              </h3>
              <ul className="ml-6 list-disc space-y-1 text-neutral-700">
                <li>
                  Los fondos se retienen durante <strong>24 horas después del check-out</strong>{" "}
                  para permitir resolución de disputas
                </li>
                <li>
                  Después de 24 horas, el profesional puede solicitar el pago a su cuenta bancaria
                  registrada
                </li>
                <li>Los pagos se procesan en 2-5 días hábiles según el banco</li>
                <li>
                  El profesional es responsable de declarar estos ingresos ante las autoridades
                  tributarias
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">8.4 Reembolsos</h3>
              <p className="text-neutral-700">
                Los reembolsos se procesan según la política de cancelación y pueden tardar de 5 a
                10 días hábiles en reflejarse en la cuenta del cliente, dependiendo de la
                institución financiera.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            9. Calificaciones y Reseñas
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-neutral-700">
            <li>
              Los clientes pueden calificar y reseñar a los profesionales después de completar un
              servicio
            </li>
            <li>
              Las calificaciones y reseñas deben ser honestas, precisas y basadas en experiencias
              reales
            </li>
            <li>
              Casaora se reserva el derecho de eliminar reseñas que:
              <ul className="mt-1 ml-6 list-disc space-y-1">
                <li>Contengan lenguaje ofensivo, discriminatorio o inapropiado</li>
                <li>Violen la privacidad de terceros</li>
                <li>Sean fraudulentas o no estén relacionadas con el servicio prestado</li>
              </ul>
            </li>
            <li>Los profesionales pueden responder a las reseñas de manera profesional</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            10. Prohibiciones y Conducta Inaceptable
          </h2>
          <p className="mb-2 text-neutral-700">
            Los usuarios NO deben utilizar la Plataforma para:
          </p>
          <ul className="ml-6 list-disc space-y-1 text-neutral-700">
            <li>Eludir el sistema de pagos de la Plataforma (pagos fuera de la Plataforma)</li>
            <li>Acosar, amenazar, discriminar o abusar de otros usuarios</li>
            <li>Publicar contenido falso, engañoso o fraudulento</li>
            <li>Violar derechos de propiedad intelectual de terceros</li>
            <li>Recopilar datos de otros usuarios sin autorización</li>
            <li>Intentar acceder de manera no autorizada a sistemas o cuentas</li>
            <li>Utilizar robots, scripts o herramientas automatizadas sin autorización</li>
            <li>Realizar cualquier actividad ilegal o que viole estos Términos</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            11. Disputas entre Usuarios
          </h2>
          <div className="space-y-3">
            <p className="text-neutral-700">
              Casaora ofrece un sistema de mediación para ayudar a resolver disputas entre clientes
              y profesionales, pero NO es responsable de:
            </p>
            <ul className="ml-6 list-disc space-y-1 text-neutral-700">
              <li>Daños a la propiedad durante la prestación del servicio</li>
              <li>Lesiones o accidentes ocurridos durante el servicio</li>
              <li>Calidad insatisfactoria del servicio prestado</li>
              <li>Incumplimiento de compromisos entre cliente y profesional</li>
            </ul>
            <p className="mt-3 text-neutral-700">En caso de disputa, el usuario debe:</p>
            <ol className="ml-6 list-decimal space-y-1 text-neutral-700">
              <li>Intentar resolver directamente con la otra parte</li>
              <li>
                Si no se resuelve, reportar a Casaora dentro de las 48 horas siguientes al servicio
              </li>
              <li>Proporcionar evidencia relevante (fotos, mensajes, etc.)</li>
              <li>Casaora puede ofrecer mediación pero la decisión final es de las partes</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            12. Limitación de Responsabilidad
          </h2>
          <div className="space-y-3">
            <p className="text-neutral-700">
              <strong>EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-2 text-neutral-700">
              <li>
                Casaora NO es responsable de los servicios prestados por profesionales
                independientes, ni de su calidad, puntualidad, o resultados
              </li>
              <li>
                Casaora NO es responsable de daños, pérdidas, lesiones, o perjuicios resultantes de
                la interacción entre usuarios
              </li>
              <li>
                La Plataforma se proporciona &quot;TAL CUAL&quot; sin garantías de ningún tipo
              </li>
              <li>
                Casaora NO garantiza que la Plataforma estará disponible 24/7 sin interrupciones o
                errores
              </li>
              <li>
                La responsabilidad máxima de Casaora hacia cualquier usuario no excederá el monto de
                las comisiones pagadas por ese usuario en los últimos 6 meses
              </li>
            </ul>
            <p className="mt-3 text-neutral-700">
              Los usuarios reconocen y aceptan que contratan servicios con terceros independientes
              bajo su propio riesgo.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">13. Indemnización</h2>
          <p className="text-neutral-700">
            El Usuario acepta defender, indemnizar y mantener indemne a Casaora, sus directores,
            empleados, contratistas y representantes de cualquier reclamación, demanda, daño,
            responsabilidad, costo o gasto (incluyendo honorarios de abogados razonables) que surjan
            de:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1 text-neutral-700">
            <li>Su uso de la Plataforma</li>
            <li>Su violación de estos Términos</li>
            <li>Su violación de derechos de terceros</li>
            <li>Su conducta en relación con el servicio prestado o recibido</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            14. Suspensión y Terminación
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">14.1 Por Casaora</h3>
              <p className="text-neutral-700">
                Casaora puede suspender o terminar su cuenta inmediatamente si:
              </p>
              <ul className="mt-1 ml-6 list-disc space-y-1 text-neutral-700">
                <li>Viola estos Términos</li>
                <li>Proporciona información falsa o fraudulenta</li>
                <li>Realiza actividades ilegales o prohibidas</li>
                <li>Recibe múltiples quejas o calificaciones negativas</li>
                <li>No completa la verificación requerida (profesionales)</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">14.2 Por el Usuario</h3>
              <p className="text-neutral-700">
                Puede cerrar su cuenta en cualquier momento desde la configuración de su perfil. Los
                servicios programados deben completarse o cancelarse según la política antes de
                cerrar la cuenta.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                14.3 Efecto de la Terminación
              </h3>
              <ul className="ml-6 list-disc space-y-1 text-neutral-700">
                <li>Pierde acceso inmediato a su cuenta</li>
                <li>
                  Los servicios programados deben ser cancelados (según política de cancelación)
                </li>
                <li>Los pagos pendientes se procesarán según lo acordado</li>
                <li>
                  Casaora puede retener cierta información según requisitos legales y de Política de
                  Privacidad
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            15. Propiedad Intelectual
          </h2>
          <p className="text-neutral-700">
            Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo pero no
            limitado a:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1 text-neutral-700">
            <li>Código fuente y software</li>
            <li>Diseño, interfaz de usuario y experiencia</li>
            <li>Logotipos, marcas comerciales y nombres comerciales</li>
            <li>Contenido original creado por Casaora</li>
          </ul>
          <p className="mt-3 text-neutral-700">
            Son propiedad exclusiva de Casaora o sus licenciantes. El Usuario recibe únicamente una
            licencia limitada, no exclusiva, no transferible para usar la Plataforma según estos
            Términos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            16. Modificaciones a los Términos
          </h2>
          <p className="text-neutral-700">
            Casaora se reserva el derecho de modificar estos Términos en cualquier momento. Los
            cambios materiales serán notificados a través de:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1 text-neutral-700">
            <li>Correo electrónico a la dirección registrada</li>
            <li>Notificación en la Plataforma</li>
            <li>Actualización de la fecha de &quot;Última actualización&quot;</li>
          </ul>
          <p className="mt-3 text-neutral-700">
            El uso continuado de la Plataforma después de la notificación constituye aceptación de
            los nuevos Términos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            17. Ley Aplicable y Jurisdicción
          </h2>
          <p className="text-neutral-700">
            Estos Términos se rigen por las leyes del país donde el Usuario reside o donde se
            presta el servicio:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1 text-neutral-700">
            <li>
              <strong>Colombia:</strong> Leyes de la República de Colombia, jurisdicción de Bogotá
            </li>
            <li>
              <strong>Paraguay:</strong> Leyes de la República del Paraguay, jurisdicción de
              Asunción
            </li>
            <li>
              <strong>Uruguay:</strong> Leyes de la República Oriental del Uruguay, jurisdicción de
              Montevideo
            </li>
            <li>
              <strong>Argentina:</strong> Leyes de la República Argentina, jurisdicción de Buenos
              Aires
            </li>
          </ul>
          <p className="mt-3 text-neutral-700">
            Las partes acuerdan intentar resolver cualquier disputa mediante negociación de buena fe
            antes de iniciar procedimientos legales.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            18. Disposiciones Generales
          </h2>
          <ul className="ml-6 list-disc space-y-2 text-neutral-700">
            <li>
              <strong>Divisibilidad:</strong> Si cualquier disposición de estos Términos es
              considerada inválida, las demás disposiciones permanecerán vigentes
            </li>
            <li>
              <strong>Renuncia:</strong> La falta de ejercicio de cualquier derecho no constituye
              renuncia a ese derecho
            </li>
            <li>
              <strong>Cesión:</strong> No puede transferir sus derechos u obligaciones sin
              consentimiento escrito de Casaora
            </li>
            <li>
              <strong>Acuerdo Completo:</strong> Estos Términos constituyen el acuerdo completo
              entre las partes
            </li>
            <li>
              <strong>Idioma:</strong> En caso de conflicto entre versiones de idioma, prevalece la
              versión en español
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            19. Información de Contacto
          </h2>
          <p className="text-neutral-700">
            Para preguntas, comentarios o quejas sobre estos Términos, puede contactarnos:
          </p>
          <ul className="mt-2 ml-6 list-none space-y-1 text-neutral-700">
            <li>
              <strong>Correo electrónico:</strong> legal@casaora.com
            </li>
            <li>
              <strong>Soporte regional:</strong> Disponible en Colombia, Paraguay, Uruguay y
              Argentina
            </li>
          </ul>
          <p className="mt-3 text-neutral-700">
            Nos comprometemos a responder a su consulta dentro de los{" "}
            <strong>15 días hábiles</strong> siguientes a su recepción.
          </p>
        </section>

        <section className="bg-neutral-50 p-6">
          <p className="text-neutral-500 text-sm">
            <strong>Nota Legal:</strong> Al hacer clic en &quot;Acepto los Términos y
            Condiciones&quot; durante el registro, usted confirma que ha leído, comprendido y
            aceptado estos Términos en su totalidad. Si no está de acuerdo, no debe utilizar la
            Plataforma.
          </p>
        </section>
      </div>
    </div>
  );
}

function EnglishTerms({ lastUpdated }: { lastUpdated: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 font-bold text-4xl text-neutral-900">Terms and Conditions of Use</h1>
        <p className="text-neutral-500 text-sm">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">1. Acceptance of Terms</h2>
          <p className="text-neutral-700">
            By accessing and using the Casaora platform (&quot;the Platform&quot;), you
            (&quot;User&quot;) agree to be bound by these Terms and Conditions of Use
            (&quot;Terms&quot;). If you do not agree to these Terms, you must not use the Platform.
          </p>
          <p className="mt-3 text-neutral-700">
            Casaora is operated by <strong>[COMPANY NAME]</strong>, with registered offices in{" "}
            <strong>Colombia, Paraguay, Uruguay, and Argentina</strong>
            (&quot;Casaora&quot;, &quot;we&quot;, &quot;our&quot;). Each market operates under local
            regulatory requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">2. Service Description</h2>
          <p className="text-neutral-700">
            Casaora is a <strong>digital intermediation platform</strong> that connects clients
            seeking domestic cleaning services with independent professionals who offer such
            services.
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-neutral-700">
              <strong>Casaora IS NOT:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1 text-neutral-700">
              <li>An employer of cleaning professionals</li>
              <li>A temporary employment agency</li>
              <li>A direct provider of cleaning services</li>
              <li>
                Responsible for the execution, quality, or consequences of services provided between
                users
              </li>
            </ul>
          </div>
          <p className="mt-3 text-neutral-700">
            <strong>Casaora IS:</strong> A technology platform that facilitates connection,
            communication, booking, and payment processing between clients and independent
            professionals.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            3. Nature of Contractual Relationship
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                3.1 Independent Professionals
              </h3>
              <p className="text-neutral-700">
                Cleaning professionals registered on the Platform are{" "}
                <strong>independent contractors</strong> operating their own business. There is NO
                employment, subordination, or dependency relationship between Casaora and the
                professionals.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                3.2 Direct Client-Professional Contract
              </h3>
              <p className="text-neutral-700">
                When a client books a service through the Platform, a{" "}
                <strong>direct service provision contract</strong> is established between the client
                and the professional. Casaora acts solely as a technology intermediary.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">4. Payment Processing</h2>
          <p className="text-neutral-700">
            All payments are processed through PCI DSS certified payment processors. In{" "}
            <strong>Colombia</strong>, we use <strong>Stripe</strong>. In{" "}
            <strong>Paraguay, Uruguay, and Argentina</strong>, we use <strong>PayPal</strong>.
            Casaora does not store complete credit or debit card information.
          </p>
          <p className="mt-3 text-neutral-700">
            Professionals receive payment 24 hours after check-out, minus Casaora&apos;s commission
            and payment processor fees. Professionals are responsible for declaring this income to
            tax authorities in their respective countries.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">5. Cancellation Policy</h2>
          <ul className="ml-6 list-disc space-y-1 text-neutral-700">
            <li>
              <strong>More than 24 hours before:</strong> 100% refund
            </li>
            <li>
              <strong>12-24 hours before:</strong> 50% refund
            </li>
            <li>
              <strong>Less than 12 hours before:</strong> No refund
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">
            6. Limitation of Liability
          </h2>
          <p className="text-neutral-700">
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong> Casaora is NOT responsible for
            services provided by independent professionals, nor for their quality, timeliness, or
            results. The Platform is provided &quot;AS IS&quot; without warranties of any kind.
          </p>
          <p className="mt-3 text-neutral-700">
            Users acknowledge that they contract services with independent third parties at their
            own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">7. Governing Law</h2>
          <p className="text-neutral-700">
            These Terms are governed by the laws of the country where the User resides or where the
            service is provided:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1 text-neutral-700">
            <li>
              <strong>Colombia:</strong> Laws of the Republic of Colombia, jurisdiction of Bogotá
            </li>
            <li>
              <strong>Paraguay:</strong> Laws of the Republic of Paraguay, jurisdiction of Asunción
            </li>
            <li>
              <strong>Uruguay:</strong> Laws of the Oriental Republic of Uruguay, jurisdiction of
              Montevideo
            </li>
            <li>
              <strong>Argentina:</strong> Laws of the Argentine Republic, jurisdiction of Buenos
              Aires
            </li>
          </ul>
          <p className="mt-3 text-neutral-700">
            The parties agree to attempt to resolve any dispute through good faith negotiation
            before initiating legal proceedings.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-2xl text-neutral-900">8. Contact Information</h2>
          <p className="text-neutral-700">For questions about these Terms, contact us:</p>
          <ul className="mt-2 ml-6 list-none space-y-1 text-neutral-700">
            <li>
              <strong>Email:</strong> legal@casaora.com
            </li>
            <li>
              <strong>Regional Support:</strong> Available in Colombia, Paraguay, Uruguay, and
              Argentina
            </li>
          </ul>
        </section>

        <section className="bg-neutral-50 p-6">
          <p className="text-neutral-500 text-sm">
            <strong>Legal Notice:</strong> By clicking &quot;I Accept the Terms and Conditions&quot;
            during registration, you confirm that you have read, understood, and accepted these
            Terms in their entirety. If you do not agree, you must not use the Platform.
          </p>
        </section>
      </div>
    </div>
  );
}
