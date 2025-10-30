"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const productFeatures = [
  {
    name: "Booking Platform",
    href: "/product/booking-platform",
    description: "Schedule services with instant or approved booking"
  },
  {
    name: "Professional Profiles",
    href: "/product/professional-profiles",
    description: "Verified profiles with reviews and portfolios"
  },
  {
    name: "Secure Messaging",
    href: "/product/secure-messaging",
    description: "Direct communication with your professionals"
  },
  {
    name: "Payment Processing",
    href: "/product/payment-processing",
    description: "Safe, transparent payments with receipt tracking"
  },
  {
    name: "Reviews & Ratings",
    href: "/product/reviews-ratings",
    description: "Community-driven trust and quality assurance"
  },
  {
    name: "Admin Dashboard",
    href: "/product/admin-dashboard",
    description: "Complete platform management and moderation"
  },
];

const links = [
  { href: "/professionals", label: "Find a Professional" },
  { href: "/contact", label: "Contact" },
];

export function SiteNavigation() {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsProductOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProductOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="order-3 flex w-full justify-between gap-6 text-sm font-medium text-[#211f1a] sm:order-none sm:w-auto sm:justify-end">
      <div className="flex w-full items-center justify-between gap-6 overflow-x-auto sm:w-auto sm:overflow-visible">
        {/* Product Dropdown */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className="flex items-center gap-1 whitespace-nowrap text-[#211f1a] transition hover:text-[#5d574b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5d46]"
            onClick={() => setIsProductOpen(!isProductOpen)}
          >
            Product
            <ChevronDown className={`h-4 w-4 transition-transform ${isProductOpen ? "rotate-180" : ""}`} />
          </button>

          {isProductOpen && (
            <div className="absolute left-0 top-full z-50 pt-2">
              <div className="w-[640px] rounded-2xl border border-[#e5dfd4] bg-white p-3 shadow-[0_24px_55px_rgba(15,15,15,0.15)]">
                <div className="grid grid-cols-2 gap-2">
                  {productFeatures.map((feature) => (
                    <Link
                      key={feature.name}
                      href={feature.href}
                      className="group flex flex-col gap-1 rounded-xl p-3 transition hover:bg-[#fbfafa]"
                    >
                      <span className="text-sm font-semibold text-[#211f1a] group-hover:text-[#ff5d46]">
                        {feature.name}
                      </span>
                      <span className="text-xs text-[#7a6d62]">
                        {feature.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regular Links */}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap text-[#211f1a] transition hover:text-[#5d574b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5d46]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
