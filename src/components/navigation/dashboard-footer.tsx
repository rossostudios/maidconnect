import { Link } from "@/i18n/routing";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-[#ebe5d8] border-t bg-[#fbfaf9] py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-[#7d7566] text-sm sm:flex-row">
          <p>© {currentYear} MaidConnect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link className="transition hover:text-[#ff5d46]" href="/support/account-suspended">
              Support
            </Link>
            <Link className="transition hover:text-[#ff5d46]" href="/privacy">
              Privacy
            </Link>
            <Link className="transition hover:text-[#ff5d46]" href="/terms">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
