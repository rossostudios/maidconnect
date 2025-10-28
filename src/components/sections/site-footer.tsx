import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Container } from "@/components/ui/container";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { href: "#services", label: "Household services" },
      { href: "#capabilities", label: "Product pillars" },
      { href: "#testimonials", label: "Client stories" },
      { href: "#use-cases", label: "Use cases" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/professionals", label: "Professionals" },
      { href: "#concierge", label: "Concierge support" },
      { href: "/auth/sign-in", label: "Login / Signup" },
      { href: "/support/account-suspended", label: "Account status" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/maidconnect", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/maidconnect", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/maidconnect", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com/company/maidconnect", icon: Linkedin },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="get-started" className="bg-[#11100e] text-[#f3ece1]">
      <Container className="space-y-12 py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)]">
          <div className="rounded-[32px] border border-[#26231f] bg-[#181612] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-2xl font-semibold text-white">MaidConnect</p>
            <p className="mt-4 text-sm text-[#cfc8be]">
              Modern domestic staffing for expats in Colombia—vetted professionals, concierge onboarding, and ongoing
              household support.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-3 text-[#d7b59f]">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span className="text-[#f3ece1]">+57 300 123 4567</span>
              </p>
              <p className="flex items-center gap-3 text-[#d7b59f]">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span className="text-[#f3ece1]">concierge@maidconnect.com</span>
              </p>
            </div>
          </div>

          <div className="grid gap-8 rounded-[32px] border border-[#26231f] bg-[#181612] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:grid-cols-2">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b1aca5]">
                  {column.title}
                </p>
                <ul className="space-y-3 text-sm text-[#f3ece1]">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition hover:text-[#fd857f]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#26231f] bg-[#181612] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="text-[#f3ece1] transition hover:text-[#fd857f]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-[#cfc8be]">
              <MapPin className="h-4 w-4 text-[#d7b59f]" aria-hidden="true" />
              <span>Medellín & Bogotá, Colombia</span>
            </div>
          </div>
          <div className="mt-6 border-t border-[#26231f] pt-4 text-sm text-[#a8a095]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>© {year} MaidConnect. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/support/account-suspended" className="transition hover:text-[#fd857f]">
                  Terms
                </Link>
                <Link href="/support/account-suspended" className="transition hover:text-[#fd857f]">
                  Privacy
                </Link>
                <Link href="/support/account-suspended" className="transition hover:text-[#fd857f]">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
