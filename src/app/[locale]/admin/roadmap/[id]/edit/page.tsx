/**
 * Edit Roadmap Item Page (Admin)
 */

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { RoadmapEditor } from "@/components/roadmap/roadmap-editor";
import type { RoadmapItem } from "@/types/roadmap";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getRoadmapItem(id: string): Promise<RoadmapItem | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("roadmap_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as RoadmapItem;
}

export default async function EditRoadmapPage({ params }: PageProps) {
  const { id } = await params;
  const roadmapItem = await getRoadmapItem(id);

  if (!roadmapItem) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#211f1a] mb-2">Edit Roadmap Item</h1>
        <p className="text-[#6B7280]">Update "{roadmapItem.title}"</p>
      </div>

      <RoadmapEditor mode="edit" initialData={roadmapItem} />
    </div>
  );
}
