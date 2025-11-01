/**
 * Create New Roadmap Item Page (Admin)
 */

import { RoadmapEditor } from "@/components/roadmap/roadmap-editor";

export default function NewRoadmapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#211f1a] mb-2">Create Roadmap Item</h1>
        <p className="text-[#6B7280]">Add a new item to your product roadmap</p>
      </div>

      <RoadmapEditor mode="create" />
    </div>
  );
}
