import { ClipboardCheck, FileCheck, Globe2, ShieldCheck, Sparkles, Stars } from "lucide-react";

export const stats = [
  {
    label: "Verified professionals",
    value: "450+",
    detail: "Background checked and insured for peace of mind.",
  },
  {
    label: "Cities covered",
    value: "6",
    detail: "Bogotá, Medellín, Cali, Barranquilla, Cartagena & more.",
  },
  {
    label: "Match time",
    value: "48 hrs",
    detail: "Average time to secure your preferred professional.",
  },
];

export const featureHighlights = [
  {
    title: "Thoroughly vetted talent",
    description:
      "Identity verification, background checks, references, and ongoing quality reviews for every professional.",
    icon: ShieldCheck,
    tone: "bg-[#f1e7d4]",
  },
  {
    title: "Concierge-style matching",
    description:
      "Share your preferences and routines. Our bilingual concierges shortlist the right fit and manage introductions.",
    icon: Sparkles,
    tone: "bg-[#e2ecdf]",
  },
  {
    title: "Expats-first support",
    description:
      "We bridge cultural expectations, contracts, and payments so you feel at home from day one.",
    icon: Globe2,
    tone: "bg-[#dde6f3]",
  },
];

export const services = [
  {
    title: "Housekeeping & Deep Cleaning",
    description: "Recurring or one-time solutions tailored to meticulous homes.",
    badge: "Most booked",
    icon: Stars,
    filter: "housekeeping",
  },
  {
    title: "Family & Childcare Support",
    description: "Trusted nannies and caregivers experienced with international households.",
    badge: "Bilingual talent",
    icon: Stars,
    filter: "childcare",
  },
  {
    title: "Move-in & Relocation Prep",
    description: "Arrival day setup, unpacking, and home organization services.",
    badge: "Welcome package",
    icon: Stars,
    filter: "relocation",
  },
  {
    title: "Elder & Wellness Care",
    description: "Companionship, medication reminders, and wellness-focused care.",
    badge: "Compassionate",
    icon: Stars,
    filter: "elder-care",
  },
  {
    title: "Pet & Home Management",
    description: "Reliable sitters, walkers, and property check-ins while you travel.",
    badge: "On-call",
    icon: Stars,
    filter: "pet-care",
  },
  {
    title: "Personal Lifestyle Support",
    description: "Private chefs, errand specialists, and personal assistants on demand.",
    badge: "Premium",
    icon: Stars,
    filter: "lifestyle",
  },
];

export const steps = [
  {
    step: "01",
    title: "Share your household profile",
    description:
      "Complete our guided intake detailing routines, preferences, languages, and required certifications.",
  },
  {
    step: "02",
    title: "Meet curated professionals",
    description:
      "Receive a shortlist with video intros, verified credentials, and transparent pricing to compare with ease.",
  },
  {
    step: "03",
    title: "Book and confirm",
    description:
      "Schedule your service with instant or approved booking. Communicate directly through secure messaging.",
  },
  {
    step: "04",
    title: "Rate and rebook",
    description:
      "Share feedback after each visit. Save your favorites and rebook with one click for ongoing support.",
  },
];

export const testimonials = [
  {
    name: "Sarah Williamson",
    handle: "@sarahinbogota",
    location: "Bogotá · USA expat",
    quote:
      "Found bilingual childcare within 48 hours of landing. Now I have 15+ hours weekly to focus on my business instead of coordinating schedules.",
    outcome: "15+ hours saved weekly",
  },
  {
    name: "Daniel Cho",
    handle: "@danielglobal",
    location: "Medellín · South Korea",
    quote:
      "Our housekeeper costs 40% less than back home, with better quality and zero coordination stress. Background checks gave us complete peace of mind.",
    outcome: "40% cost savings",
  },
  {
    name: "María & Liam",
    handle: "@theandeslife",
    location: "Cartagena · Ireland",
    quote:
      "Matched with a home manager in 3 days who handles everything—cleaning, grocery runs, maintenance calls. We actually enjoy our weekends now.",
    outcome: "Matched in 3 days",
  },
  {
    name: "Anita Patel",
    handle: "@anitaexplores",
    location: "Cali · UK",
    quote:
      "After 2 months with our cleaner, our apartment has never looked better. She remembers our preferences and brings her own eco-friendly supplies.",
    outcome: "2 months strong relationship",
  },
];

export const productPillars = [
  {
    title: "Verified professional profiles",
    description:
      "Every specialist features a vetted biography, certifications, availability, and transparent pricing so households can book with confidence.",
    icon: ShieldCheck,
  },
  {
    title: "Responsive booking workspace",
    description:
      "Smart filters, real-time availability, and concierge coordination streamline scheduling across cities, property types, and service needs.",
    icon: ClipboardCheck,
  },
  {
    title: "Mutual ratings & performance loops",
    description:
      "Structured post-service reviews from both sides drive accountability, highlight top performers, and surface coaching opportunities early.",
    icon: Sparkles,
  },
  {
    title: "Trust & safety layer",
    description:
      "Background checks, secure payments, emergency support, and clear escalation paths keep every booking covered from intake to payout.",
    icon: FileCheck,
  },
];

export const operationsHighlights = [
  {
    title: "Four-stage vetting pipeline",
    description:
      "Document verification, 1:1 interviews, photo sessions, and a probationary period ensure only reliable professionals go live.",
  },
  {
    title: "Structured booking governance",
    description:
      "Escrow payments, check-in/out requirements, and SLA-driven reminders align with our operations manual for consistent delivery.",
  },
  {
    title: "Dispute & safety response",
    description:
      "Time-boxed investigations, insurance coverage, and escalation paths safeguard both properties and professionals.",
  },
  {
    title: "Bilingual concierge support",
    description:
      "WhatsApp, in-app chat, and emergency lines offer 24/7 coverage with cultural sensitivity training baked into every interaction.",
  },
];

export const useCaseFlows = [
  {
    name: "Customer · Search & book",
    persona: "Relocating households and expats",
    summary:
      "Discover bilingual professionals, compare transparent profiles, and confirm visits with concierge oversight.",
    steps: [
      "Search by service, city, and schedule preferences.",
      "Review vetted profiles with ratings, rates, and availability.",
      "Reserve and coordinate through secure messaging and reminders.",
    ],
  },
  {
    name: "Professional · Manage bookings",
    persona: "Trusted home service specialists",
    summary:
      "Review customer verification, accept requests, check in on-site, and finalize earnings automatically.",
    steps: [
      "Receive rich booking briefs with customer ratings and policies.",
      "Clarify scope before accepting and sync to personal calendar.",
      "Check in with GPS verification and log completion for payout.",
    ],
  },
  {
    name: "Professional · Onboarding",
    persona: "Applicants joining the network",
    summary:
      "Submit documents, schedule interviews, capture photography, and launch a conversion-ready profile.",
    steps: [
      "Complete bilingual application with references and documents.",
      "Pass background checks and attend concierge interview.",
      "Collaborate on profile content and go live within 24 hours of shoot.",
    ],
  },
  {
    name: "Customer · Rate & retain",
    persona: "Returning households & property managers",
    summary:
      "Share structured feedback, add tips, and rebook top performers with visibility into mutual ratings.",
    steps: [
      "Receive completion summary and submit ratings within 48 hours.",
      "Add optional tips directly in the app for standout service.",
      "Track preferred professionals and duplicate bookings in seconds.",
    ],
  },
];
