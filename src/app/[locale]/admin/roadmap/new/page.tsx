/**
 * Create New Roadmap Item Page (Admin)
 */

import { RoadmapEditor } from "@/components/roadmap/roadmap-editor";

export default function NewRoadmapPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-neutral-900">Create Roadmap Item</h1>
        <p className="text-neutral-700">Add a new item to your product roadmap</p>
      </div>

      <RoadmapEditor mode="create" />
    </>
  );
}
