import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import {
  OPTIONAL_DOCUMENTS,
  REQUIRED_DOCUMENTS,
} from "@/app/[locale]/dashboard/pro/onboarding/state";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Dynamically import TanStack Table component (reduces initial bundle size)
const DocumentsTable = dynamic(
  () =>
    import("@/components/documents/documents-table").then((mod) => ({
      default: mod.DocumentsTable,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full animate-pulse rounded-lg bg-gradient-to-br from-[#ebe5d8]/30 to-[#ebe5d8]/10" />
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

  // Generate signed URLs for downloads
  if (documents.length > 0) {
    const signedUrlResults = await Promise.all(
      documents.map((doc) =>
        supabase.storage.from("professional-documents").createSignedUrl(doc.storage_path, 3600)
      )
    );

    documents = documents.map((doc, index) => {
      const result = signedUrlResults[index];
      if (result.error) {
        console.error("Error generating signed URL:", result.error);
      }
      return {
        ...doc,
        signedUrl: result.data?.signedUrl ?? null,
      };
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-3xl text-[#211f1a]">{t("title")}</h1>
          <p className="mt-2 text-[#5d574b] text-base leading-relaxed">{t("description")}</p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-sm text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
          href="/dashboard/pro/onboarding"
        >
          {t("uploadButton")}
        </Link>
      </div>

      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <DocumentsTable documents={documents} labels={DOCUMENT_LABELS} />
      </div>
    </section>
  );
}
