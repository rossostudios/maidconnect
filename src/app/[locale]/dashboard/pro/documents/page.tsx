import { unstable_noStore } from "next/cache";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
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
      <div className="h-[400px] w-full animate-pulse border border-neutral-200 bg-neutral-50" />
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

  const { data: documentsData } = await supabase
    .from("professional_documents")
    .select("id, document_type, storage_path, uploaded_at, metadata")
    .eq("profile_id", user.id)
    .order("uploaded_at", { ascending: false });

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className={cn(
              "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            {t("title")}
          </h1>
          <p
            className={cn(
              "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
              geistSans.className
            )}
          >
            {t("description")}
          </p>
        </div>
        <Link
          className={cn(
            "inline-flex items-center justify-center border border-neutral-200 bg-[#FF5200] px-4 py-2 font-semibold text-white text-xs uppercase tracking-wider transition-all hover:bg-orange-600 hover:shadow-sm",
            geistSans.className
          )}
          href="/dashboard/pro/onboarding"
        >
          {t("uploadButton")}
        </Link>
      </div>

      <div className="border border-neutral-200 bg-white p-6">
        <DocumentsTable documents={documents} labels={DOCUMENT_LABELS} />
      </div>
    </div>
  );
}
