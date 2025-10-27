import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { ProfessionalsDirectory } from "@/components/professionals/professionals-directory";

export default function ProfessionalsPage() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        <ProfessionalsDirectory />
      </main>
      <SiteFooter />
    </div>
  );
}
