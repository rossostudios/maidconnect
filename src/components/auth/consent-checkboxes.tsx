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
          "flex cursor-pointer items-start gap-3 text-slate-900 text-sm",
          errors?.privacyConsent && "text-red-700"
        )}
      >
        <input
          aria-describedby={errors?.privacyConsent ? "privacyConsent-error" : undefined}
          aria-invalid={Boolean(errors?.privacyConsent)}
          aria-required="true"
          className={cn(
            "mt-[2px] h-4 w-4 shrink-0 rounded border-slate-300 accent-slate-900",
            errors?.privacyConsent && "border-red-500 accent-red-600"
          )}
          id="privacyConsent"
          name="privacyConsent"
          required
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              He leído y acepto la{" "}
              <Link
                className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 transition-colors hover:decoration-orange"
                href="/privacy"
                target="_blank"
              >
                Política de Privacidad
              </Link>
              .{" "}
              <span aria-hidden="true" className="font-bold text-red-600">
                *
              </span>
              <span className="sr-only">(required)</span>
            </>
          ) : (
            <>
              I have read and accept the{" "}
              <Link
                className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 transition-colors hover:decoration-orange"
                href="/privacy"
                target="_blank"
              >
                Privacy Policy
              </Link>
              .{" "}
              <span aria-hidden="true" className="font-bold text-red-600">
                *
              </span>
              <span className="sr-only">(required)</span>
            </>
          )}
        </span>
      </label>
      {errors?.privacyConsent ? (
        <p className="ml-7 text-red-700 text-xs" id="privacyConsent-error" role="alert">
          {errors.privacyConsent}
        </p>
      ) : null}

      {/* Terms of Service Consent - REQUIRED */}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 text-slate-900 text-sm",
          errors?.termsConsent && "text-red-700"
        )}
      >
        <input
          aria-describedby={errors?.termsConsent ? "termsConsent-error" : undefined}
          aria-invalid={Boolean(errors?.termsConsent)}
          aria-required="true"
          className={cn(
            "mt-[2px] h-4 w-4 shrink-0 rounded border-slate-300 accent-slate-900",
            errors?.termsConsent && "border-red-500 accent-red-600"
          )}
          id="termsConsent"
          name="termsConsent"
          required
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              He leído y acepto los{" "}
              <Link
                className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 transition-colors hover:decoration-orange"
                href="/terms"
                target="_blank"
              >
                Términos y Condiciones
              </Link>
              .{" "}
              <span aria-hidden="true" className="font-bold text-red-600">
                *
              </span>
              <span className="sr-only">(required)</span>
            </>
          ) : (
            <>
              I have read and accept the{" "}
              <Link
                className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 transition-colors hover:decoration-orange"
                href="/terms"
                target="_blank"
              >
                Terms and Conditions
              </Link>
              .{" "}
              <span aria-hidden="true" className="font-bold text-red-600">
                *
              </span>
              <span className="sr-only">(required)</span>
            </>
          )}
        </span>
      </label>
      {errors?.termsConsent ? (
        <p className="ml-7 text-red-700 text-xs" id="termsConsent-error" role="alert">
          {errors.termsConsent}
        </p>
      ) : null}

      {/* Data Processing Consent - REQUIRED (Ley 1581 de 2012) */}
      <label
        className={cn(
          "flex items-start gap-3 text-stone-900 text-sm",
          errors?.dataProcessingConsent && "text-stone-500"
        )}
      >
        <input
          aria-invalid={Boolean(errors?.dataProcessingConsent)}
          aria-required="true"
          className={cn(
            "mt-[2px] h-4 w-4 shrink-0 accent-stone-900",
            errors?.dataProcessingConsent && "accent-stone-500"
          )}
          name="dataProcessingConsent"
          required
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              Autorizo expresamente a Casaora para el tratamiento de mis datos personales,
              incluyendo su recopilación, almacenamiento, uso, circulación, procesamiento y
              transferencia a terceros (como procesadores de pago, proveedores de servicios en la
              nube, y otros necesarios para la operación de la plataforma), de acuerdo con lo
              establecido en la Ley 1581 de 2012 y la Política de Privacidad.{" "}
              <span className="text-stone-500">*</span>
            </>
          ) : (
            <>
              I expressly authorize Casaora to process my personal data, including its collection,
              storage, use, circulation, processing, and transfer to third parties (such as payment
              processors, cloud service providers, and others necessary for platform operation), in
              accordance with Law 1581 of 2012 and the Privacy Policy.{" "}
              <span className="text-stone-500">*</span>
            </>
          )}
        </span>
      </label>
      {errors?.dataProcessingConsent ? (
        <p className="ml-7 text-stone-500 text-xs">{errors.dataProcessingConsent}</p>
      ) : null}

      {/* Marketing Communications - OPTIONAL */}
      <label className="flex items-start gap-3 text-stone-900 text-sm">
        <input
          className="mt-[2px] h-4 w-4 shrink-0 accent-stone-900"
          defaultChecked={false}
          name="marketingConsent"
          type="checkbox"
        />
        <span>
          {isSpanish ? (
            <>
              Acepto recibir correos electrónicos promocionales, ofertas especiales, y noticias de
              Casaora. Puedo retirar mi consentimiento en cualquier momento.{" "}
              <span className="text-stone-400">(Opcional)</span>
            </>
          ) : (
            <>
              I agree to receive promotional emails, special offers, and news from Casaora. I can
              withdraw my consent at any time. <span className="text-stone-400">(Optional)</span>
            </>
          )}
        </span>
      </label>

      {/* Required fields note */}
      <p className="text-stone-400 text-xs">
        {isSpanish ? (
          <>
            <span className="text-stone-500">*</span> Campos requeridos
          </>
        ) : (
          <>
            <span className="text-stone-500">*</span> Required fields
          </>
        )}
      </p>
    </div>
  );
}
