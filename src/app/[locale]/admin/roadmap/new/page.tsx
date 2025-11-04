/**
 * Create New Roadmap Item Page (Admin)
 */

import { RoadmapEditor } from "@/components/roadmap/roadmap-editor";

export default function NewRoadmapPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-[var(--foreground)]">Create Roadmap Item</h1>
        <p className="text-[#6B7280]">Add a new item to your product roadmap</p>
      </div>

      <RoadmapEditor mode="create" />
    </>
  );
}
