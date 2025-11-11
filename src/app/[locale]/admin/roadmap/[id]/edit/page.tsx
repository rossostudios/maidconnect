/**
 * Edit Roadmap Item Page (Admin)
 */

import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { RoadmapEditor } from "@/components/roadmap/roadmap-editor";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { RoadmapItem } from "@/types/roadmap";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getRoadmapItem(id: string): Promise<RoadmapItem | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("roadmap_items").select("*").eq("id", id).single();

  if (error || !data) {
    return null;
  }

  return data as RoadmapItem;
}

export default async function EditRoadmapPage({ params }: PageProps) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const { id } = await params;
  const roadmapItem = await getRoadmapItem(id);

  if (!roadmapItem) {
    notFound();
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-[#116611616]">Edit Roadmap Item</h1>
        <p className="text-[#AA88AAAAC]">Update "{roadmapItem.title}"</p>
      </div>

      <RoadmapEditor initialData={roadmapItem} mode="edit" />
    </>
  );
}
