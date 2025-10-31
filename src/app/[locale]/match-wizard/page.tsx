import { redirect } from "next/navigation";
import { MatchWizard } from "@/components/match-wizard/match-wizard";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const metadata = {
  title: "Find Your Perfect Match",
  description: "Answer a few questions and we'll recommend the best professionals for your needs",
};

export default function MatchWizardPage() {
  // Check if feature flag is enabled
  if (!isFeatureEnabled("show_match_wizard")) {
    redirect("/professionals");
  }

  return <MatchWizard />;
}
