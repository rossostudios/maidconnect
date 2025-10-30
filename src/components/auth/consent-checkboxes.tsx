"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ConsentCheckboxesProps = {
  errors?: {
    privacyConsent?: string;
    termsConsent?: string;
    dataProcessingConsent?: string;
  };
  locale?: string;
};

export function ConsentCheckboxes({ errors, locale = "en" }: ConsentCheckboxesProps) {
  const isSpanish = locale === "es";

  return (
    <div className="space-y-4">
      {/* Privacy Policy Consent - REQUIRED */}
      <label
        className={cn(
          "flex items-start gap-3 text-[#211f1a] text-sm",
          errors?.privacyConsent && "text-red-700"
        )}
      >
        <input
          aria-invalid={Boolean(errors?.privacyConsent)}
          aria-required="true"
          className={cn(
            "mt-[2px] h-4 w-4 shrink-0 accent-[#211f1a]",
            errors?.privacyConsent && "accent-red-600"
          )}
          name="privacyConsent"
          required
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              He leído y acepto la{" "}
              <Link
                className="font-semibold text-[#211f1a] underline decoration-[#211f1a]/40 underline-offset-4 hover:decoration-[#ff5d46]"
                href="/privacy"
                target="_blank"
              >
                Política de Privacidad
              </Link>
              . <span className="text-red-600">*</span>
            </>
          ) : (
            <>
              I have read and accept the{" "}
              <Link
                className="font-semibold text-[#211f1a] underline decoration-[#211f1a]/40 underline-offset-4 hover:decoration-[#ff5d46]"
                href="/privacy"
                target="_blank"
              >
                Privacy Policy
              </Link>
              . <span className="text-red-600">*</span>
            </>
          )}
        </span>
      </label>
      {errors?.privacyConsent ? (
        <p className="ml-7 text-red-600 text-xs">{errors.privacyConsent}</p>
      ) : null}

      {/* Terms of Service Consent - REQUIRED */}
      <label
        className={cn(
          "flex items-start gap-3 text-[#211f1a] text-sm",
          errors?.termsConsent && "text-red-700"
        )}
      >
        <input
          aria-invalid={Boolean(errors?.termsConsent)}
          aria-required="true"
          className={cn(
            "mt-[2px] h-4 w-4 shrink-0 accent-[#211f1a]",
            errors?.termsConsent && "accent-red-600"
          )}
          name="termsConsent"
          required
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              He leído y acepto los{" "}
              <Link
                className="font-semibold text-[#211f1a] underline decoration-[#211f1a]/40 underline-offset-4 hover:decoration-[#ff5d46]"
                href="/terms"
                target="_blank"
              >
                Términos y Condiciones
              </Link>
              . <span className="text-red-600">*</span>
            </>
          ) : (
            <>
              I have read and accept the{" "}
              <Link
                className="font-semibold text-[#211f1a] underline decoration-[#211f1a]/40 underline-offset-4 hover:decoration-[#ff5d46]"
                href="/terms"
                target="_blank"
              >
                Terms and Conditions
              </Link>
              . <span className="text-red-600">*</span>
            </>
          )}
        </span>
      </label>
      {errors?.termsConsent ? (
        <p className="ml-7 text-red-600 text-xs">{errors.termsConsent}</p>
      ) : null}

      {/* Data Processing Consent - REQUIRED (Ley 1581 de 2012) */}
      <label
        className={cn(
          "flex items-start gap-3 text-[#211f1a] text-sm",
          errors?.dataProcessingConsent && "text-red-700"
        )}
      >
        <input
          aria-invalid={Boolean(errors?.dataProcessingConsent)}
          aria-required="true"
          className={cn(
            "mt-[2px] h-4 w-4 shrink-0 accent-[#211f1a]",
            errors?.dataProcessingConsent && "accent-red-600"
          )}
          name="dataProcessingConsent"
          required
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              Autorizo expresamente a MaidConnect para el tratamiento de mis datos personales,
              incluyendo su recopilación, almacenamiento, uso, circulación, procesamiento y
              transferencia a terceros (como procesadores de pago, proveedores de servicios en la
              nube, y otros necesarios para la operación de la plataforma), de acuerdo con lo
              establecido en la Ley 1581 de 2012 y la Política de Privacidad.{" "}
              <span className="text-red-600">*</span>
            </>
          ) : (
            <>
              I expressly authorize MaidConnect to process my personal data, including its
              collection, storage, use, circulation, processing, and transfer to third parties (such
              as payment processors, cloud service providers, and others necessary for platform
              operation), in accordance with Law 1581 of 2012 and the Privacy Policy.{" "}
              <span className="text-red-600">*</span>
            </>
          )}
        </span>
      </label>
      {errors?.dataProcessingConsent ? (
        <p className="ml-7 text-red-600 text-xs">{errors.dataProcessingConsent}</p>
      ) : null}

      {/* Marketing Communications - OPTIONAL */}
      <label className="flex items-start gap-3 text-[#211f1a] text-sm">
        <input
          className="mt-[2px] h-4 w-4 shrink-0 accent-[#211f1a]"
          defaultChecked={false}
          name="marketingConsent"
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              Acepto recibir correos electrónicos promocionales, ofertas especiales, y noticias de
              MaidConnect. Puedo retirar mi consentimiento en cualquier momento.{" "}
              <span className="text-[#7a6d62]">(Opcional)</span>
            </>
          ) : (
            <>
              I agree to receive promotional emails, special offers, and news from MaidConnect. I
              can withdraw my consent at any time.{" "}
              <span className="text-[#7a6d62]">(Optional)</span>
            </>
          )}
        </span>
      </label>

      {/* Required fields note */}
      <p className="text-[#7a6d62] text-xs">
        {isSpanish ? (
          <>
            <span className="text-red-600">*</span> Campos requeridos
          </>
        ) : (
          <>
            <span className="text-red-600">*</span> Required fields
          </>
        )}
      </p>
    </div>
  );
}
