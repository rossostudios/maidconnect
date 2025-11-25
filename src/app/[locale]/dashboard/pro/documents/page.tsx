import { unstable_noStore } from "next/cache";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { DocumentUploadForm } from "@/app/[locale]/dashboard/pro/onboarding/document-upload-form";
import {
  OPTIONAL_DOCUMENTS,
  REQUIRED_DOCUMENTS,
} from "@/app/[locale]/dashboard/pro/onboarding/state";
import { geistSans } from "@/app/fonts";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

const DocumentsTable = dynamic(
  () =>
    import("@/components/documents/documents-table").then((mod) => ({
      default: mod.DocumentsTable,
    })),
  {
    loading: () => (
      <div className="h-[400px] w-full animate-pulse rounded-lg border border-neutral-200 bg-neutral-50" />
    ),
  }
);

type DocumentRow = {
  id: string;
  document_type: string;
  storage_path: string;
  uploaded_at: string;
  metadata: {
    originalName?: string;
    size?: number;
    mimeType?: string;
    note?: string | null;
  } | null;
  signedUrl?: string | null;
};

const DOCUMENT_LABELS: Record<string, string> = Object.fromEntries(
  [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS].map((doc) => [doc.key, doc.label])
);

export default async function ProDocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  unstable_noStore();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.documents" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const [{ data: documentsData }, { data: professionalProfile }] = await Promise.all([
    supabase
      .from("professional_documents")
      .select("id, document_type, storage_path, uploaded_at, metadata")
      .eq("profile_id", user.id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("professional_profiles")
      .select("country_code")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  let documents = (documentsData as DocumentRow[] | null) ?? [];

  if (documents.length > 0) {
    const signedUrlResults = await Promise.all(
      documents.map((doc) =>
        supabase.storage.from("professional-documents").createSignedUrl(doc.storage_path, 3600)
      )
    );

    documents = documents.map((doc, index) => {
      const result = signedUrlResults[index];
      if (result?.error) {
        console.error("Error generating signed URL:", result.error);
      }
      return {
        ...doc,
        signedUrl: result?.data?.signedUrl ?? null,
      };
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p
          className={cn(
            "font-semibold text-neutral-600 text-xs uppercase tracking-[0.2em]",
            geistSans.className
          )}
        >
          Verification
        </p>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className={cn("text-base text-neutral-700 leading-relaxed", geistSans.className)}>
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className={cn("mb-4 font-semibold text-lg text-neutral-900", geistSans.className)}>
            Upload documents
          </h2>
          <DocumentUploadForm
            countryCode={professionalProfile?.country_code as any}
            inputClass={
              "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            }
          />
          <p className={cn("mt-3 text-neutral-500 text-xs", geistSans.className)}>
            Need help? You can also continue via onboarding.
          </p>
          <Link
            className={cn(
              "mt-3 inline-flex items-center justify-center rounded-md border border-neutral-200 px-3 py-2 font-semibold text-neutral-700 text-xs uppercase tracking-wider transition hover:bg-neutral-50",
              geistSans.className
            )}
            href="/dashboard/pro/onboarding"
          >
            {t("uploadButton")}
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className={cn("mb-4 font-semibold text-lg text-neutral-900", geistSans.className)}>
            Submitted documents
          </h2>
          <DocumentsTable documents={documents} labels={DOCUMENT_LABELS} />
        </div>
      </div>
    </div>
  );
}
