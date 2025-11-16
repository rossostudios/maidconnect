"use client";

import {
  Bug01Icon,
  FlashIcon,
  FloppyDiskIcon,
  Loading01Icon,
  MagicWand01Icon,
  PaintBoardIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// Code split BlockEditor (1499 LOC) - lazy load on demand
const BlockEditor = dynamic(
  () =>
    import("@/components/admin/help/block-editor").then((mod) => ({ default: mod.BlockEditor })),
  {
    loading: () => (
      <div className="min-h-96 animate-pulse border border-neutral-200 bg-neutral-50 p-8">
        <div className="mb-4 h-10 w-48 bg-neutral-200" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-neutral-200" />
          <div className="h-4 w-5/6 bg-neutral-200" />
          <div className="h-4 w-4/6 bg-neutral-200" />
        </div>
      </div>
    ),
    ssr: false, // BlockEditor is client-only
  }
);

type ChangelogFormData = {
  sprint_number: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published_at: string;
  categories: string[];
  tags: string;
  target_audience: string[];
  featured_image_url: string;
  visibility: "draft" | "published" | "archived";
};

type ChangelogEditorProps = {
  initialData?: Partial<ChangelogFormData>;
  changelogId?: string;
  mode: "create" | "edit";
};

const categoryOptions = [
  {
    value: "features",
    label: "Features",
    icon: MagicWand01Icon,
    color: "text-neutral-900 dark:text-neutral-100",
  },
  {
    value: "improvements",
    label: "Improvements",
    icon: FlashIcon,
    color: "text-neutral-900 dark:text-neutral-100",
  },
  {
    value: "fixes",
    label: "Fixes",
    icon: Bug01Icon,
    color: "text-neutral-900 dark:text-neutral-100",
  },
  {
    value: "security",
    label: "Security",
    icon: Shield01Icon,
    color: "text-neutral-900 dark:text-neutral-100",
  },
  {
    value: "design",
    label: "Design",
    icon: PaintBoardIcon,
    color: "text-neutral-900 dark:text-neutral-100",
  },
];

const audienceOptions = [
  { value: "all", label: "All Users" },
  { value: "customer", label: "Customers" },
  { value: "professional", label: "Professionals" },
  { value: "admin", label: "Admins" },
];

type SaveChangelogArgs = {
  formData: ChangelogFormData;
  visibility: "draft" | "published";
  mode: "create" | "edit";
  changelogId?: string;
};

async function saveChangelog({ formData, visibility, mode, changelogId }: SaveChangelogArgs) {
  const tagsArray = formData.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const payload = {
    ...formData,
    tags: tagsArray,
    visibility,
    published_at: new Date(formData.published_at).toISOString(),
  };

  const url = mode === "create" ? "/api/admin/changelog" : `/api/admin/changelog/${changelogId}`;
  const method = mode === "create" ? "POST" : "PATCH";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to save changelog");
  }
}

const buildInitialFormData = (initialData?: Partial<ChangelogFormData>): ChangelogFormData => ({
  sprint_number: initialData?.sprint_number || 1,
  title: initialData?.title || "",
  slug: initialData?.slug || "",
  summary: initialData?.summary || "",
  content: initialData?.content || "",
  published_at: initialData?.published_at
    ? new Date(initialData.published_at).toISOString().split("T")[0] || ""
    : new Date().toISOString().split("T")[0] || "",
  categories: initialData?.categories || [],
  tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : initialData?.tags || "",
  target_audience: initialData?.target_audience || ["all"],
  featured_image_url: initialData?.featured_image_url || "",
  visibility: initialData?.visibility || "draft",
});

export function ChangelogEditor({ initialData, changelogId, mode }: ChangelogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChangelogFormData>(() =>
    buildInitialFormData(initialData)
  );

  const updateFormData = useCallback((updates: Partial<ChangelogFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const generateSlug = useCallback(
    (title: string) =>
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    []
  );

  const handleTitleChange = (title: string) => {
    updateFormData({
      title,
      slug: generateSlug(title),
    });
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAudienceToggle = (audience: string) => {
    setFormData((prev) => ({
      ...prev,
      target_audience: prev.target_audience.includes(audience)
        ? prev.target_audience.filter((a) => a !== audience)
        : [...prev.target_audience, audience],
    }));
  };

  const handleSubmit = async (e: React.FormEvent, visibility: "draft" | "published") => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await saveChangelog({ formData, visibility, mode, changelogId });
      router.push("/admin/changelog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {error && (
        <div className="-2xl mb-6 border border-red-200 bg-red-50 p-4 text-red-700 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <form className="space-y-6">
        <BasicInfoSection
          formData={formData}
          onChange={updateFormData}
          onTitleChange={handleTitleChange}
        />

        <ContentSection formData={formData} onChange={updateFormData} />

        <CategoriesSection categories={formData.categories} onToggle={handleCategoryToggle} />

        <MetadataSection
          formData={formData}
          onAudienceToggle={handleAudienceToggle}
          onChange={updateFormData}
        />

        <ActionsSection onCancel={() => router.back()} onSubmit={handleSubmit} saving={saving} />
      </form>
    </div>
  );
}

type BasicInfoSectionProps = {
  formData: ChangelogFormData;
  onChange: (updates: Partial<ChangelogFormData>) => void;
  onTitleChange: (title: string) => void;
};

function BasicInfoSection({ formData, onChange, onTitleChange }: BasicInfoSectionProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h3 className="mb-4 font-bold text-lg text-neutral-900 dark:text-neutral-100">
        Basic Information
      </h3>

      <div className="space-y-4">
        <LabeledInput
          id="sprint_number"
          label="Sprint Number *"
          onChange={(value) =>
            onChange({
              sprint_number: Number.parseInt(value, 10) || 1,
            })
          }
          type="number"
          value={formData.sprint_number}
        />

        <LabeledInput
          id="title"
          label="Title *"
          onChange={onTitleChange}
          placeholder="e.g., Enhanced Search and New Dashboard Features"
          value={formData.title}
        />

        <LabeledInput
          helperText="URL-friendly version of the title (auto-generated)"
          id="slug"
          inputClassName="bg-white font-mono text-neutral-600 text-sm dark:bg-neutral-950 dark:text-neutral-400"
          label="Slug *"
          onChange={(value) => onChange({ slug: value })}
          placeholder="auto-generated-from-title"
          value={formData.slug}
        />

        <LabeledTextarea
          id="summary"
          label="Summary"
          onChange={(value) => onChange({ summary: value })}
          placeholder="Brief overview of this update (shown in list view)"
          value={formData.summary}
        />

        <LabeledInput
          id="published_at"
          label="Published Date *"
          onChange={(value) => onChange({ published_at: value })}
          type="date"
          value={formData.published_at}
        />
      </div>
    </div>
  );
}

type ContentSectionProps = {
  formData: ChangelogFormData;
  onChange: (updates: Partial<ChangelogFormData>) => void;
};

function ContentSection({ formData, onChange }: ContentSectionProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h3 className="mb-4 font-bold text-lg text-neutral-900 dark:text-neutral-100">Content *</h3>

      <BlockEditor
        initialContent={formData.content}
        locale="en"
        onChange={(markdown) => onChange({ content: markdown })}
        placeholder="Start writing your changelog content..."
      />

      <p className="mt-2 text-neutral-600 text-xs dark:text-neutral-400">
        Use the editor shortcuts: / for block menu, Enter for new block
      </p>
    </div>
  );
}

type CategoriesSectionProps = {
  categories: string[];
  onToggle: (category: string) => void;
};

function CategoriesSection({ categories, onToggle }: CategoriesSectionProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h3 className="mb-4 font-bold text-lg text-neutral-900 dark:text-neutral-100">Categories</h3>

      <div className="flex flex-wrap gap-3">
        {categoryOptions.map((option) => {
          const isSelected = categories.includes(option.value);

          return (
            <button
              className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 font-medium text-sm transition ${
                isSelected
                  ? "border-orange-500 bg-orange-500 text-white dark:border-orange-600 dark:bg-orange-600"
                  : "border-neutral-200 text-neutral-600 hover:border-orange-500 hover:text-orange-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-orange-400 dark:hover:text-orange-400"
              }`}
              key={option.value}
              onClick={() => onToggle(option.value)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={option.icon} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type MetadataSectionProps = {
  formData: ChangelogFormData;
  onChange: (updates: Partial<ChangelogFormData>) => void;
  onAudienceToggle: (audience: string) => void;
};

function MetadataSection({ formData, onChange, onAudienceToggle }: MetadataSectionProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h3 className="mb-4 font-bold text-lg text-neutral-900 dark:text-neutral-100">Metadata</h3>

      <div className="space-y-4">
        <LabeledInput
          id="tags"
          label="Tags"
          onChange={(value) => onChange({ tags: value })}
          placeholder="performance, ui, mobile (comma-separated)"
          value={formData.tags}
        />

        <div>
          <div className="mb-2 block font-medium text-orange-600 text-sm dark:text-orange-400">
            Target Audience
          </div>
          <div className="flex flex-wrap gap-2">
            {audienceOptions.map((option) => {
              const isSelected = formData.target_audience.includes(option.value);

              return (
                <button
                  className={`border-2 px-3 py-1.5 font-medium text-sm transition ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-100 text-neutral-900 dark:border-neutral-100 dark:bg-neutral-800 dark:text-neutral-100"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-400"
                  }`}
                  key={option.value}
                  onClick={() => onAudienceToggle(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <LabeledInput
          id="featured_image_url"
          label="Featured Image URL"
          onChange={(value) => onChange({ featured_image_url: value })}
          placeholder="https://example.com/image.jpg"
          type="url"
          value={formData.featured_image_url}
        />
      </div>
    </div>
  );
}

type ActionsSectionProps = {
  saving: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent, visibility: "draft" | "published") => Promise<void>;
};

function ActionsSection({ saving, onCancel, onSubmit }: ActionsSectionProps) {
  return (
    <div className="-2xl flex items-center justify-between gap-4 border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <button
        className="border border-neutral-200 px-6 py-2.5 font-semibold text-neutral-600 transition hover:border-neutral-900 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-400"
        disabled={saving}
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>

      <div className="flex gap-3">
        <button
          className="flex items-center gap-2 rounded-full border-2 border-neutral-200 bg-white px-6 py-2.5 font-semibold text-neutral-900 transition hover:border-neutral-900 disabled:opacity-50 dark:border-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
          disabled={saving}
          onClick={(e) => onSubmit(e, "draft")}
          type="button"
        >
          {saving ? (
            <>
              <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading01Icon} />
              Saving...
            </>
          ) : (
            <>
              <HugeiconsIcon className="h-4 w-4" icon={FloppyDiskIcon} />
              Save Draft
            </>
          )}
        </button>

        <button
          className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
          disabled={saving}
          onClick={(e) => onSubmit(e, "published")}
          type="button"
        >
          {saving ? (
            <>
              <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading01Icon} />
              Publishing...
            </>
          ) : (
            <>
              <HugeiconsIcon className="h-4 w-4" icon={MagicWand01Icon} />
              Publish
            </>
          )}
        </button>
      </div>
    </div>
  );
}

type LabeledInputProps = {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helperText?: string;
  inputClassName?: string;
};

function LabeledInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  helperText,
  inputClassName = "",
}: LabeledInputProps) {
  return (
    <div>
      <label
        className="mb-2 block font-medium text-orange-600 text-sm dark:text-orange-400"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className={`w-full border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-400/20 ${inputClassName}`}
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {helperText && (
        <p className="mt-1 text-neutral-600 text-xs dark:text-neutral-400">{helperText}</p>
      )}
    </div>
  );
}

type LabeledTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function LabeledTextarea({ id, label, value, onChange, placeholder }: LabeledTextareaProps) {
  return (
    <div>
      <label
        className="mb-2 block font-medium text-orange-600 text-sm dark:text-orange-400"
        htmlFor={id}
      >
        {label}
      </label>
      <textarea
        className="w-full border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-400/20"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        value={value}
      />
    </div>
  );
}
