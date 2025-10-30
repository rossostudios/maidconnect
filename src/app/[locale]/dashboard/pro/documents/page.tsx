import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { DocumentsTable } from "@/components/documents/documents-table";
import { REQUIRED_DOCUMENTS, OPTIONAL_DOCUMENTS } from "@/app/[locale]/dashboard/pro/onboarding/state";

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
  [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS].map((doc) => [doc.key, doc.label]),
);

export default async function ProDocumentsPage() {
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
      ),
    );

    documents = documents.map((doc, index) => {
      const result = signedUrlResults[index];
      if (result.error) {
        console.error("Failed to generate signed URL", result.error);
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
          <h1 className="text-3xl font-semibold text-[#211f1a]">Document Center</h1>
          <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
            Keep your verification paperwork current. Upload new files if your information changes.
          </p>
        </div>
        <Link
          href="/dashboard/pro/onboarding"
          className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
        >
          Upload Documents
        </Link>
      </div>

      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <DocumentsTable documents={documents} labels={DOCUMENT_LABELS} />
      </div>
    </section>
  );
}
