import Link from "next/link";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#ebe5d8] bg-[#fbfaf9] py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-[#7d7566] sm:flex-row">
          <p>© {currentYear} MaidConnect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/support/account-suspended"
              className="transition hover:text-[#ff5d46]"
            >
              Support
            </Link>
            <Link
              href="/privacy"
              className="transition hover:text-[#ff5d46]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition hover:text-[#ff5d46]"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
