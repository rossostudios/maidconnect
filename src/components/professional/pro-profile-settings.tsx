"use client";

import { useState } from "react";
import { toast } from "sonner";
import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  initialSlug?: string | null;
  vanityBaseUrl: string;
  profileVisibility?: string | null;
};

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProProfileSettings({ initialSlug, vanityBaseUrl, profileVisibility }: Props) {
  const [slug, setSlug] = useState(initialSlug ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = vanityBaseUrl?.replace(/\/$/, "") || "https://casaora.com";
  const currentUrl = slug ? `${baseUrl}/pro/${slug}` : `${baseUrl}/pro/your-name`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const normalized = normalizeSlug(slug);

    if (!normalized || normalized.length < 3) {
      setSaving(false);
      setError("Slug must be at least 3 characters and use letters, numbers, or hyphens.");
      return;
    }

    try {
      const response = await fetch("/api/pro/slug", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: normalized }),
      });

      const data = (await response.json().catch(() => ({}))) as { slug?: string; error?: string };

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update vanity URL");
      }

      setSlug(data.slug || normalized);
      toast.success("Vanity URL updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update vanity URL";
      setError(message);
      toast.error("Could not update vanity URL", { description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={cn(
              "font-semibold text-neutral-600 text-xs uppercase tracking-[0.18em] dark:text-neutral-400",
              geistSans.className
            )}
          >
            Public profile
          </p>
          <h2 className={cn("mt-1 font-semibold text-neutral-900 text-xl dark:text-neutral-100", geistSans.className)}>
            Vanity URL & visibility
          </h2>
        </div>

        {profileVisibility && (
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {profileVisibility === "public" ? "Visible" : "Hidden"}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className={cn("font-medium text-neutral-900 text-sm dark:text-neutral-100", geistSans.className)}>
            Current link
          </p>
          <p
            className={cn("break-all text-neutral-600 text-sm dark:text-neutral-400", geistSans.className)}
            data-testid="current-slug"
          >
            {currentUrl}
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label
            className={cn("font-medium text-neutral-900 text-sm dark:text-neutral-100", geistSans.className)}
            htmlFor="slug"
          >
            Vanity URL
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-neutral-700 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              <span className="whitespace-nowrap text-neutral-500 dark:text-neutral-500">{baseUrl}/pro/</span>
              <input
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-neutral-900 outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
                id="slug"
                name="slug"
                onChange={(event) => setSlug(event.target.value)}
                placeholder="your-name"
                value={slug}
              />
            </div>
            <Button className="sm:w-auto" disabled={saving} type="submit">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
          {error ? <p className="text-rausch-600 text-sm dark:text-rausch-400">{error}</p> : null}
          <p className="text-neutral-500 text-xs dark:text-neutral-400">
            Use lowercase letters, numbers, and hyphens only. Your link will be public once profile
            visibility is set to public.
          </p>
        </form>
      </div>
    </div>
  );
}
