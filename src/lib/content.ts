import {
  ClipboardIcon,
  FileValidationIcon,
  Globe02Icon,
  MagicWand01Icon,
  SecurityCheckIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";

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
    icon: SecurityCheckIcon,
    tone: "bg-[#FFEEFF8E8]",
  },
  {
    title: "Concierge-style matching",
    description:
      "Share your preferences and routines. Our bilingual concierges shortlist the right fit and manage introductions.",
    icon: MagicWand01Icon,
    tone: "bg-[#EE44EE2E3]",
  },
  {
    title: "Expats-first support",
    description:
      "We bridge cultural expectations, contracts, and payments so you feel at home from day one.",
    icon: Globe02Icon,
    tone: "bg-[#FFEEFF8E8]",
  },
];

export const services = [
  {
    title: "Housekeeping & Deep Cleaning",
    description: "Recurring or one-time solutions tailored to meticulous homes.",
    badge: "Most booked",
    icon: StarIcon,
    filter: "housekeeping",
  },
  {
    title: "Family & Childcare Support",
    description: "Trusted nannies and caregivers experienced with international households.",
    badge: "Bilingual talent",
    icon: StarIcon,
    filter: "childcare",
  },
  {
    title: "Move-in & Relocation Prep",
    description: "Arrival day setup, unpacking, and home organization services.",
    badge: "Welcome package",
    icon: StarIcon,
    filter: "relocation",
  },
  {
    title: "Elder & Wellness Care",
    description: "Companionship, medication reminders, and wellness-focused care.",
    badge: "Compassionate",
    icon: StarIcon,
    filter: "elder-care",
  },
  {
    title: "Pet & Home Management",
    description: "Reliable sitters, walkers, and property check-ins while you travel.",
    badge: "On-call",
    icon: StarIcon,
    filter: "pet-care",
  },
  {
    title: "Personal Lifestyle Support",
    description: "Private chefs, errand specialists, and personal assistants on demand.",
    badge: "Premium",
    icon: StarIcon,
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
    name: "Private Client",
    handle: "@casaoraclient",
    location: "Rosales, Bogotá",
    quote:
      "The quality difference is extraordinary. Instead of sorting through dozens of profiles, I browsed only exceptional candidates—and found our perfect housekeeper within days.",
    outcome: "Curated excellence",
    role: "Entrepreneur & parent",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&h=160&q=80",
    metrics: [
      { label: "Favorite professionals", value: "4" },
      { label: "Time to hire", value: "72h" },
    ],
  },
  {
    name: "International Family",
    handle: "@casaorafamily",
    location: "El Poblado, Medellín",
    quote:
      "I appreciated being able to filter by English fluency and childcare certifications. Every profile I viewed was impressive—it made choosing actually enjoyable.",
    outcome: "Verified quality",
    role: "Relocated from NYC",
    avatar:
      "https://images.unsplash.com/photo-1544723795-432537846b81?auto=format&fit=crop&w=160&h=160&q=80",
    metrics: [
      { label: "Matches reviewed", value: "6" },
      { label: "Languages covered", value: "3" },
    ],
  },
  {
    name: "Estate Owner",
    handle: "@casaoravilla",
    location: "Cartagena",
    quote:
      "Casaora's vetting gave me confidence to browse independently. I could focus on personality fit and schedule, knowing the skills were already verified.",
    outcome: "Peace of mind",
    role: "Luxury villa host",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80",
    metrics: [
      { label: "Portfolio visits", value: "24" },
      { label: "Incidents avoided", value: "0" },
    ],
  },
];

export const productPillars = [
  {
    title: "Verified professional profiles",
    description:
      "Every specialist features a vetted biography, certifications, availability, and transparent pricing so households can book with confidence.",
    icon: SecurityCheckIcon,
  },
  {
    title: "Responsive booking workspace",
    description:
      "Smart filters, real-time availability, and concierge coordination streamline scheduling across cities, property types, and service needs.",
    icon: ClipboardIcon,
  },
  {
    title: "Mutual ratings & performance loops",
    description:
      "Structured post-service reviews from both sides drive accountability, highlight top performers, and surface coaching opportunities early.",
    icon: MagicWand01Icon,
  },
  {
    title: "Trust & safety layer",
    description:
      "Background checks, secure payments, emergency support, and clear escalation paths keep every booking covered from intake to payout.",
    icon: FileValidationIcon,
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
