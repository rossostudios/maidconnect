import Link from "next/link";
import { Container } from "@/components/ui/container";

const footerLinks = [
  { href: "#services", label: "View services" },
  { href: "#capabilities", label: "Platform features" },
  { href: "#concierge", label: "Contact concierge" },
];

export function SiteFooter() {
  return (
    <footer
      id="get-started"
      className="border-t border-[#ebe6de] bg-white py-8 text-sm text-[#6a6456]"
    >
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Maidconnect. Domestic staffing for foreigners in
          Colombia.
        </p>
        <div className="flex flex-wrap items-center gap-4 font-semibold text-[#3f3a31]">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#fd857f]">
              {link.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
