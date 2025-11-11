/**
 * Sanity Studio Route
 * Renders the Sanity Studio interface at /studio
 *
 * This route uses the [[...tool]] catch-all pattern to handle all Studio routes.
 * The Studio is only accessible to admins (we'll add auth check later).
 */

"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity/sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
