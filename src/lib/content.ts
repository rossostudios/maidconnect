import { ClipboardCheck, FileCheck, Globe2, ShieldCheck, Sparkles, Stars } from "lucide-react";

type LocalizedString = {
  en: string;
  es: string;
};

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
  },
  {
    title: "Family & Childcare Support",
    description:
      "Trusted nannies and caregivers experienced with international households.",
    badge: "Bilingual talent",
    icon: Stars,
  },
  {
    title: "Move-in & Relocation Prep",
    description: "Arrival day setup, unpacking, and home organization services.",
    badge: "Welcome package",
    icon: Stars,
  },
  {
    title: "Elder & Wellness Care",
    description: "Companionship, medication reminders, and wellness-focused care.",
    badge: "Compassionate",
    icon: Stars,
  },
  {
    title: "Pet & Home Management",
    description: "Reliable sitters, walkers, and property check-ins while you travel.",
    badge: "On-call",
    icon: Stars,
  },
  {
    title: "Personal Lifestyle Support",
    description: "Private chefs, errand specialists, and personal assistants on demand.",
    badge: "Premium",
    icon: Stars,
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
    title: "Start with ongoing support",
    description:
      "We coordinate onboarding, agreements, and follow-ups to ensure every visit meets your expectations.",
  },
];

export const testimonials = [
  {
    name: "Sarah Williamson",
    handle: "@sarahinbogota",
    location: "Bogotá · USA expat",
    quote:
      "Maidconnect helped us find bilingual childcare within a week of landing. The onboarding support was beyond anything we expected.",
  },
  {
    name: "Daniel Cho",
    handle: "@danielglobal",
    location: "Medellín · South Korea",
    quote:
      "Transparent pricing, background checks, and ongoing check-ins—finally a service that understands international families.",
  },
  {
    name: "María & Liam",
    handle: "@theandeslife",
    location: "Cartagena · Ireland",
    quote:
      "Our concierge knew the exact questions to ask. We matched with a home manager who keeps everything running seamlessly.",
  },
  {
    name: "Anita Patel",
    handle: "@anitaexplores",
    location: "Cali · UK",
    quote:
      "The quality of candidates is outstanding. You can tell Maidconnect invests in each professional they represent.",
  },
];

export type Professional = {
  id: string;
  name: string;
  name_es: string;
  photo: string;
  service: string;
  service_es: string;
  rating: number;
  reviewCount: number;
  isTopProfessional: boolean;
  isVerified: boolean;
  experienceYears: number;
  hourlyRate: number;
  languages: string[];
  location: string;
  city: "Bogotá" | "Medellín";
  neighborhood: string;
  distanceKm: number;
  availableToday: boolean;
};

export const professionals: Professional[] = [
  {
    id: "ana-silva",
    name: "Ana Silva",
    name_es: "Ana Silva",
    photo:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    service: "Cleaning",
    service_es: "Limpieza",
    rating: 4.9,
    reviewCount: 112,
    isTopProfessional: true,
    isVerified: true,
    experienceYears: 4,
    hourlyRate: 24,
    languages: ["English", "Spanish"],
    location: "Bogotá · Chapinero",
    city: "Bogotá",
    neighborhood: "Chapinero",
    distanceKm: 2.1,
    availableToday: true,
  },
  {
    id: "maria-rodriguez",
    name: "María Rodriguez",
    name_es: "María Rodriguez",
    photo:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=600&q=80",
    service: "Cooking",
    service_es: "Cocina",
    rating: 4.8,
    reviewCount: 89,
    isTopProfessional: true,
    isVerified: true,
    experienceYears: 6,
    hourlyRate: 28,
    languages: ["Spanish", "English"],
    location: "Bogotá · Usaquén",
    city: "Bogotá",
    neighborhood: "Usaquén",
    distanceKm: 3.4,
    availableToday: false,
  },
  {
    id: "catalina-hernandez",
    name: "Catalina Hernández",
    name_es: "Catalina Hernández",
    photo:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
    service: "Laundry & Ironing",
    service_es: "Lavandería y Planchado",
    rating: 4.7,
    reviewCount: 54,
    isTopProfessional: false,
    isVerified: true,
    experienceYears: 3,
    hourlyRate: 20,
    languages: ["Spanish"],
    location: "Medellín · El Poblado",
    city: "Medellín",
    neighborhood: "El Poblado",
    distanceKm: 1.8,
    availableToday: true,
  },
  {
    id: "lucia-gomez",
    name: "Lucía Gómez",
    name_es: "Lucía Gómez",
    photo:
      "https://images.unsplash.com/photo-1573496529574-be85d6a60704?auto=format&fit=crop&w=600&q=80",
    service: "Deep Cleaning",
    service_es: "Limpieza Profunda",
    rating: 4.95,
    reviewCount: 142,
    isTopProfessional: true,
    isVerified: true,
    experienceYears: 8,
    hourlyRate: 32,
    languages: ["English", "Spanish"],
    location: "Medellín · Laureles",
    city: "Medellín",
    neighborhood: "Laureles",
    distanceKm: 4.6,
    availableToday: true,
  },
  {
    id: "diana-morales",
    name: "Diana Morales",
    name_es: "Diana Morales",
    photo:
      "https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=600&q=80",
    service: "Home Organization",
    service_es: "Organización del Hogar",
    rating: 4.6,
    reviewCount: 37,
    isTopProfessional: false,
    isVerified: true,
    experienceYears: 5,
    hourlyRate: 27,
    languages: ["English", "Spanish"],
    location: "Bogotá · Zona T",
    city: "Bogotá",
    neighborhood: "Zona T",
    distanceKm: 5.2,
    availableToday: false,
  },
  {
    id: "sofia-ramirez",
    name: "Sofía Ramírez",
    name_es: "Sofía Ramírez",
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    service: "Childcare Support",
    service_es: "Cuidado Infantil",
    rating: 4.85,
    reviewCount: 73,
    isTopProfessional: true,
    isVerified: true,
    experienceYears: 7,
    hourlyRate: 30,
    languages: ["English", "Spanish", "Portuguese"],
    location: "Medellín · Envigado",
    city: "Medellín",
    neighborhood: "Envigado",
    distanceKm: 3.1,
    availableToday: true,
  },
];

export const professionalsById: Record<string, Professional> = professionals.reduce(
  (acc, professional) => {
    acc[professional.id] = professional;
    return acc;
  },
  {} as Record<string, Professional>,
);

type ProfileService = {
  name: LocalizedString;
  description: LocalizedString;
  duration: string;
  rate: string;
  includes: LocalizedString[];
};

type ProfileReview = {
  name: string;
  date: string;
  rating: number;
  comment: LocalizedString;
};

type ProfileVerification = {
  title: LocalizedString;
  detail: LocalizedString;
};

type ProfileBookingStep = {
  title: LocalizedString;
  detail: LocalizedString;
};

export type ProfessionalProfile = {
  headline: LocalizedString;
  about: LocalizedString;
  highlights: LocalizedString[];
  services: ProfileService[];
  verifications: ProfileVerification[];
  availability: LocalizedString[];
  bookingProcess: ProfileBookingStep[];
  reviews: ProfileReview[];
  conciergeNote: LocalizedString;
};

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

export const professionalProfiles: Record<string, ProfessionalProfile> = {
  "ana-silva": {
    headline: {
      en: "Trusted housekeeping specialist for modern apartments",
      es: "Especialista confiable en limpieza para apartamentos modernos",
    },
    about: {
      en: "Ana has supported relocating families across Chapinero and Rosales for four years. With hospitality training and an eye for detail, she creates tidy, calm homes for busy professionals and traveling couples alike.",
      es: "Ana ha acompañado a familias recién llegadas en Chapinero y Rosales durante cuatro años. Con formación en hotelería y una mirada detallista, transforma hogares en espacios ordenados y tranquilos para profesionales ocupados y parejas viajeras.",
    },
    highlights: [
      {
        en: "Background check cleared October 2025 with annual renewal scheduled",
        es: "Antecedentes certificados en octubre 2025 con renovación anual programada",
      },
      {
        en: "Probationary rating 4.95/5 across first 30 bookings",
        es: "Calificación de prueba de 4.95/5 en las primeras 30 reservas",
      },
      {
        en: "Specializes in eco-friendly products and pet-friendly routines",
        es: "Especializada en productos ecológicos y rutinas aptas para mascotas",
      },
    ],
    services: [
      {
        name: { en: "Weekly apartment reset", es: "Mantenimiento semanal" },
        description: {
          en: "Regular cleaning for 2-3 bedroom apartments including kitchen, bathrooms, and laundry set-up.",
          es: "Limpieza regular para apartamentos de 2-3 habitaciones con cocina, baños y ropa lista.",
        },
        duration: "4 hours",
        rate: "$96 USD",
        includes: [
          {
            en: "Surface sanitation, floor care, linen refresh",
            es: "Desinfección de superficies, pisos y cambio de lencería",
          },
          {
            en: "Laundry wash & fold (up to 2 loads)",
            es: "Lavado y doblado de ropa (hasta 2 cargas)",
          },
        ],
      },
      {
        name: { en: "Move-in deep clean", es: "Limpieza profunda de mudanza" },
        description: {
          en: "Pre-arrival detailing for furnished rentals and serviced apartments.",
          es: "Detalle previo a la llegada para alquileres amoblados y aparta-estudios.",
        },
        duration: "6 hours",
        rate: "$160 USD",
        includes: [
          {
            en: "Interior appliances, balcony/terrace wash, closet reorganization",
            es: "Electrodomésticos, balcones o terrazas y reorganización de clósets",
          },
        ],
      },
    ],
    verifications: [
      {
        title: {
          en: "ID & background cleared",
          es: "Identidad y antecedentes aprobados",
        },
        detail: {
          en: "Cedula validated via Registraduría and criminal record certified",
          es: "Cédula validada por Registraduría y certificado de antecedentes limpio",
        },
      },
      {
        title: {
          en: "In-person concierge interview",
          es: "Entrevista presencial con concierge",
        },
        detail: {
          en: "Assessed for bilingual communication and hospitality standards",
          es: "Evaluación de comunicación bilingüe y estándares de hospitalidad",
        },
      },
      {
        title: {
          en: "Probation completed",
          es: "Período de prueba completado",
        },
        detail: {
          en: "Maintained 4.9+ rating across first 5 concierge-monitored bookings",
          es: "Mantiene calificación 4.9+ en las primeras 5 reservas monitoreadas",
        },
      },
    ],
    availability: [
      {
        en: "Monday – Friday · 8:00 – 16:00 · Chapinero, Rosales, Zona G",
        es: "Lunes a viernes · 8:00 – 16:00 · Chapinero, Rosales, Zona G",
      },
      {
        en: "Saturday (alternate) · 9:00 – 13:00 · North Bogotá",
        es: "Sábados alternos · 9:00 – 13:00 · Norte de Bogotá",
      },
    ],
    bookingProcess: [
      {
        title: { en: "Share priorities", es: "Comparte prioridades" },
        detail: {
          en: "Concierge gathers property layout, supplies, and pet notes before confirming.",
          es: "El concierge recopila detalles del espacio, insumos y mascotas antes de confirmar.",
        },
      },
      {
        title: { en: "Confirm visit", es: "Confirma la visita" },
        detail: {
          en: "Ana reviews instructions and blocks travel buffer in her Maidconnect calendar.",
          es: "Ana revisa las instrucciones y reserva buffer de traslado en su calendario.",
        },
      },
      {
        title: { en: "Arrival check-in", es: "Check-in de llegada" },
        detail: {
          en: "GPS check-in within 15 minutes of arrival and photo confirmation of setup.",
          es: "Check-in GPS dentro de los 15 minutos y foto de la preparación inicial.",
        },
      },
      {
        title: { en: "Post-service review", es: "Revisión posterior" },
        detail: {
          en: "Concierge requests feedback and Ana responds to any follow-up within 2 hours.",
          es: "El concierge solicita feedback y Ana responde a cualquier ajuste en 2 horas.",
        },
      },
    ],
    reviews: [
      {
        name: "Michael & Tara",
        date: "September 2025",
        rating: 5,
        comment: {
          en: "Immaculate work every visit. Ana anticipates our weekly routines and keeps our pantry organized for remote life.",
          es: "Trabajo impecable en cada visita. Ana anticipa nuestra rutina y mantiene la despensa lista para nuestro estilo remoto.",
        },
      },
      {
        name: "Louis B.",
        date: "July 2025",
        rating: 5,
        comment: {
          en: "She handled our move-in deep clean flawlessly—even coordinated paint touch-ups through Maidconnect.",
          es: "Gestionó la limpieza profunda de la mudanza a la perfección y coordinó retoques de pintura con Maidconnect.",
        },
      },
    ],
    conciergeNote: {
      en: "Ana is perfect for households that value structure and discreet support. Request 72-hour notice for deep cleans during high season.",
      es: "Ideal para hogares que valoran estructura y discreción. Solicita 72 horas de aviso para limpiezas profundas en temporada alta.",
    },
  },
  "maria-rodriguez": {
    headline: {
      en: "Chef-prepared meals rooted in Andean flavors",
      es: "Comidas tipo chef con sabores andinos",
    },
    about: {
      en: "María is a Bogotá-based culinary professional with six years of experience designing weekly menus for expat families and corporate retreats.",
      es: "María es una profesional culinaria en Bogotá con seis años diseñando menús semanales para familias expats y retiros corporativos.",
    },
    highlights: [
      {
        en: "Certified food handling and ServSafe equivalent",
        es: "Certificación en manipulación de alimentos y equivalente ServSafe",
      },
      {
        en: "Specializes in gluten-free and plant-forward recipes",
        es: "Especialista en recetas libres de gluten y vegetarianas",
      },
      {
        en: "Conversational English with menu translation support",
        es: "Inglés conversacional con soporte de traducción de menús",
      },
    ],
    services: [
      {
        name: { en: "Weekly meal prep", es: "Preparación semanal" },
        description: {
          en: "Designs menus, shops locally, and prepares 12 plated meals stored with reheating instructions.",
          es: "Diseña menús, compra en mercados locales y deja 12 comidas con instrucciones de recalentado.",
        },
        duration: "5 hours",
        rate: "$180 USD",
        includes: [
          { en: "Menu consultation", es: "Consulta de menú" },
          { en: "Market run (cost of groceries billed separately)", es: "Compra de mercado (insumos se facturan aparte)" },
        ],
      },
      {
        name: { en: "Private dinner for 6", es: "Cena privada para 6" },
        description: {
          en: "Three-course dining experience with table styling support.",
          es: "Cena de tres tiempos con ambientación básica de mesa.",
        },
        duration: "Evening service",
        rate: "$320 USD",
        includes: [
          { en: "Signature Andean fusion menu", es: "Menú fusión andina" },
          { en: "Cleanup and kitchen reset", es: "Limpieza y orden de la cocina" },
        ],
      },
    ],
    verifications: [
      {
        title: { en: "Food safety certified", es: "Certificación sanitaria" },
        detail: {
          en: "Registro Invima up to date and verified by Maidconnect",
          es: "Registro Invima vigente y validado por Maidconnect",
        },
      },
      {
        title: { en: "Concierge tasting completed", es: "Cata con concierge" },
        detail: {
          en: "Sampled by operations team with 4.9 satisfaction score",
          es: "Degustación aprobada por operaciones con puntaje 4.9",
        },
      },
      {
        title: { en: "Premium client references", es: "Referencias premium" },
        detail: {
          en: "References from three North Bogotá households confirmed",
          es: "Referencias de tres hogares del norte de Bogotá verificadas",
        },
      },
    ],
    availability: [
      {
        en: "Menu planning calls every Monday",
        es: "Llamadas de planeación de menú los lunes",
      },
      {
        en: "Cooking days Tuesday – Friday · 10:00 – 18:00",
        es: "Días de cocina martes a viernes · 10:00 – 18:00",
      },
      {
        en: "Private dinners select Saturdays",
        es: "Cenas privadas algunos sábados",
      },
    ],
    bookingProcess: [
      {
        title: { en: "Menu consultation", es: "Consulta de menú" },
        detail: {
          en: "Concierge captures dietary notes and desired cuisines before sharing with María.",
          es: "El concierge recibe restricciones y gustos antes de compartirlos con María.",
        },
      },
      {
        title: { en: "Proposal & market list", es: "Propuesta y lista" },
        detail: {
          en: "Receive a bilingual menu draft with market list for approval.",
          es: "Recibe un menú bilingüe con lista de mercado para aprobación.",
        },
      },
      {
        title: { en: "Day-of prep", es: "Preparación del día" },
        detail: {
          en: "María checks in on arrival, reviews kitchen guidelines, and begins mise en place.",
          es: "María confirma llegada, revisa lineamientos de cocina e inicia mise en place.",
        },
      },
      {
        title: { en: "Post-service wrap", es: "Cierre del servicio" },
        detail: {
          en: "Kitchen reset, feedback collection, and optional follow-up menu adjustments.",
          es: "Orden de la cocina, feedback y ajustes opcionales de menú futuro.",
        },
      },
    ],
    reviews: [
      {
        name: "Iqbal F.",
        date: "August 2025",
        rating: 5,
        comment: {
          en: "Our family of five has never eaten healthier. María leaves labeled meals and even adapts spice levels.",
          es: "Nuestra familia de cinco nunca comió tan balanceado. María deja comidas etiquetadas y adapta los sabores.",
        },
      },
      {
        name: "Samantha P.",
        date: "May 2025",
        rating: 4.8,
        comment: {
          en: "Impressive vegan dinner for investors—she handled the kitchen like a pro and explained dishes in English.",
          es: "Cena vegana impecable para inversionistas; manejó la cocina como profesional y explicó los platos en inglés.",
        },
      },
    ],
    conciergeNote: {
      en: "Recommend booking two weeks in advance for private dinners; weekly clients receive priority scheduling.",
      es: "Para cenas privadas sugerimos reservar con dos semanas; los clientes semanales tienen prioridad.",
    },
  },
  "catalina-hernandez": {
    headline: {
      en: "Laundry care and wardrobe organization for high-touch homes",
      es: "Cuidado de lavandería y organización de vestidores",
    },
    about: {
      en: "Catalina supports digital nomads settling in El Poblado with meticulous laundry cycles and wardrobe upkeep.",
      es: "Catalina acompaña a nómadas digitales en El Poblado con ciclos de lavandería precisos y cuidado de vestidores.",
    },
    highlights: [
      {
        en: "Trained on European and US washer/dryer systems",
        es: "Capacitada en lavadoras y secadoras europeas y americanas",
      },
      {
        en: "Fold and packing systems inspired by KonMari",
        es: "Métodos de doblado y empaque estilo KonMari",
      },
    ],
    services: [
      {
        name: { en: "Laundry concierge", es: "Conserjería de lavandería" },
        description: {
          en: "Wash, dry, steam, and organize weekly garments with stain treatment.",
          es: "Lavado, secado, vaporizado y organización semanal con tratamiento de manchas.",
        },
        duration: "3 hours",
        rate: "$60 USD",
        includes: [
          { en: "Stain assessment", es: "Revisión de manchas" },
          { en: "Seasonal storage rotation", es: "Rotación de guardarropa por temporada" },
        ],
      },
      {
        name: { en: "Carry-on packing", es: "Empaque de mano" },
        description: {
          en: "Curated outfits, packing cubes, and travel laundry plan for frequent flyers.",
          es: "Outfits curados, packing cubes y plan de lavandería para viajeros frecuentes.",
        },
        duration: "2 hours",
        rate: "$45 USD",
        includes: [
          { en: "Lookbook PDF", es: "Lookbook en PDF" },
        ],
      },
    ],
    verifications: [
      {
        title: { en: "Residency & references", es: "Residencia y referencias" },
        detail: {
          en: "Address verified and two expat references contacted",
          es: "Dirección verificada y dos referencias de expats contactadas",
        },
      },
      {
        title: { en: "Concierge shadow shift", es: "Jornada supervisada" },
        detail: {
          en: "Completed on-site quality check with Maidconnect operations lead",
          es: "Turno supervisado por la jefa de operaciones de Maidconnect",
        },
      },
    ],
    availability: [
      {
        en: "Monday – Thursday afternoons",
        es: "Lunes a jueves en la tarde",
      },
      {
        en: "Friday mornings reserved for packing services",
        es: "Viernes en la mañana reservados para empaques",
      },
    ],
    bookingProcess: [
      {
        title: { en: "Laundry intake", es: "Brief de lavandería" },
        detail: {
          en: "Document fabric types, detergents, and preferred folding styles.",
          es: "Documenta telas, detergentes y estilo de doblado preferido.",
        },
      },
      {
        title: { en: "Cycle updates", es: "Actualizaciones" },
        detail: {
          en: "Photo updates via app after each completed load.",
          es: "Fotos en la app después de cada ciclo completado.",
        },
      },
      {
        title: { en: "Wardrobe review", es: "Revisión final" },
        detail: {
          en: "Walk-through to confirm placement and labeling system.",
          es: "Recorrido para confirmar ubicación y etiquetado.",
        },
      },
    ],
    reviews: [
      {
        name: "Naomi R.",
        date: "October 2025",
        rating: 4.9,
        comment: {
          en: "Catalina saved my wardrobe after an unexpected wine spill—she even sourced a local tailor",
          es: "Catalina salvó mi guardarropa tras una mancha de vino y coordinó un sastre local",
        },
      },
      {
        name: "Victor H.",
        date: "June 2025",
        rating: 4.7,
        comment: {
          en: "Reliable, punctual, and my suitcase is now a work of art before every flight.",
          es: "Confiable y puntual; mi maleta es una obra de arte antes de cada vuelo.",
        },
      },
    ],
    conciergeNote: {
      en: "Laundry slots fill fast—consider a recurring Tuesday booking for guaranteed cadence.",
      es: "Los cupos se llenan rápido; programa un martes recurrente para asegurar frecuencia.",
    },
  },
  "lucia-gomez": {
    headline: {
      en: "Deep-cleaning lead for luxury rentals and villas",
      es: "Líder de limpiezas profundas para rentas de lujo y villas",
    },
    about: {
      en: "Lucía manages a trusted team of two assistants to handle large properties and turnover schedules in Laureles and Envigado.",
      es: "Lucía coordina un equipo de dos asistentes para propiedades amplias y cambios de huéspedes en Laureles y Envigado.",
    },
    highlights: [
      {
        en: "Insurance coverage up to $10,000 USD",
        es: "Cobertura de seguro hasta USD $10,000",
      },
      {
        en: "Special equipment for marble and hardwood surfaces",
        es: "Equipo especializado para mármol y maderas",
      },
      {
        en: "Preferred partner for three boutique rental agencies",
        es: "Aliada de tres agencias boutique",
      },
    ],
    services: [
      {
        name: { en: "Turnover deep clean", es: "Limpieza profunda de check-out" },
        description: {
          en: "Full reset between guests including inventory audit and concierge staging.",
          es: "Reseteo completo entre huéspedes con auditoría de inventario y ambientación.",
        },
        duration: "6 hours",
        rate: "$240 USD",
        includes: [
          { en: "Professional equipment", es: "Equipos profesionales" },
          { en: "Minor maintenance report", es: "Reporte de mantenimiento menor" },
        ],
      },
      {
        name: { en: "Seasonal refresh", es: "Renovación estacional" },
        description: {
          en: "Curtains, upholstery, and outdoor areas serviced in one visit.",
          es: "Cortinas, tapicería y exteriores atendidos en una visita.",
        },
        duration: "Full day",
        rate: "$380 USD",
        includes: [
          { en: "Outdoor pressure cleaning", es: "Hidrolavado de exterior" },
        ],
      },
    ],
    verifications: [
      {
        title: { en: "Background revalidated", es: "Antecedentes revalidados" },
        detail: {
          en: "Semi-annual checks due to luxury property access",
          es: "Verificaciones semestrales por acceso a propiedades de lujo",
        },
      },
      {
        title: { en: "Equipment certification", es: "Certificación de equipos" },
        detail: {
          en: "Maintains calibration logs for specialized machines",
          es: "Mantiene bitácoras de calibración de máquinas",
        },
      },
    ],
    availability: [
      {
        en: "Teams operate Monday – Saturday · 8:00 – 18:00",
        es: "Equipos operan lunes a sábado · 8:00 – 18:00",
      },
      {
        en: "Emergency turnovers with 24-hour notice",
        es: "Turnos de emergencia con 24 horas de aviso",
      },
    ],
    bookingProcess: [
      {
        title: { en: "Site walk-through", es: "Recorrido inicial" },
        detail: {
          en: "Concierge joins video or onsite review for first-time properties.",
          es: "Concierge acompaña revisión virtual o presencial para primeras visitas.",
        },
      },
      {
        title: { en: "Scope confirmation", es: "Confirmación de alcance" },
        detail: {
          en: "Checklist agreed through the app with timestamps for teams.",
          es: "Checklist acordado en la app con tiempos definidos para el equipo.",
        },
      },
      {
        title: { en: "Quality review", es: "Revisión de calidad" },
        detail: {
          en: "Photo report uploaded; concierge performs random audits.",
          es: "Reporte fotográfico cargado; concierge realiza auditorías aleatorias.",
        },
      },
    ],
    reviews: [
      {
        name: "Felipe & Jordan",
        date: "August 2025",
        rating: 5,
        comment: {
          en: "Lucía handles our Airbnb turnovers flawlessly—even restocks welcome kits without reminders.",
          es: "Lucía gestiona los turnos de nuestro Airbnb sin fallas y repone los kits de bienvenida sin recordatorios.",
        },
      },
      {
        name: "Sarai M.",
        date: "April 2025",
        rating: 4.9,
        comment: {
          en: "Her team saved our marble floors after a spill. Detailed, respectful, and insured.",
          es: "Su equipo salvó nuestros pisos de mármol tras un derrame. Detallado, respetuoso y asegurado.",
        },
      },
    ],
    conciergeNote: {
      en: "Request larger crews (3+) for villas above 400m²; Lucía can coordinate additional vetted assistants.",
      es: "Solicita equipos ampliados (3+) para villas mayores a 400m²; Lucía coordina asistentes verificados.",
    },
  },
  "diana-morales": {
    headline: {
      en: "Home organization and household management",
      es: "Organización del hogar y gestión doméstica",
    },
    about: {
      en: "Diana blends interior styling with practical household systems, supporting Zona T executives who travel frequently.",
      es: "Diana combina estilismo interior con sistemas prácticos para ejecutivos de la Zona T que viajan con frecuencia.",
    },
    highlights: [
      {
        en: "Certified professional organizer (NAPO affiliate)",
        es: "Organizadora profesional certificada (afiliada NAPO)",
      },
      {
        en: "Smart home integration and staff onboarding",
        es: "Integración de domótica y capacitación de personal",
      },
    ],
    services: [
      {
        name: { en: "Room redesign sprint", es: "Sprint de reorganización" },
        description: {
          en: "Declutter, categorize, and style one priority space with smart storage.",
          es: "Depura, categoriza y estiliza un espacio prioritario con almacenamiento inteligente.",
        },
        duration: "5 hours",
        rate: "$150 USD",
        includes: [
          { en: "Space planning sketch", es: "Plano de planificación" },
        ],
      },
      {
        name: { en: "Household management setup", es: "Sistema de gestión doméstica" },
        description: {
          en: "House manual creation, staff task boards, and maintenance calendar.",
          es: "Manual del hogar, tableros de tareas y calendario de mantenimiento.",
        },
        duration: "Two visits",
        rate: "$260 USD",
        includes: [
          { en: "Digital and printed copies", es: "Copias digitales e impresas" },
        ],
      },
    ],
    verifications: [
      {
        title: { en: "Client portfolio verified", es: "Portafolio verificado" },
        detail: {
          en: "Operations reviewed before/after documentation from 6 projects",
          es: "Operaciones revisó documentos antes/después de 6 proyectos",
        },
      },
      {
        title: { en: "Insurance & confidentiality", es: "Seguro y confidencialidad" },
        detail: {
          en: "Signed NDA and privacy protocol for high-profile clients",
          es: "NDA y protocolo de privacidad firmado para clientes de alto perfil",
        },
      },
    ],
    availability: [
      {
        en: "Project days Tuesday – Thursday",
        es: "Días de proyecto martes a jueves",
      },
      {
        en: "Consultation calls Mondays and Fridays",
        es: "Consultas los lunes y viernes",
      },
    ],
    bookingProcess: [
      {
        title: { en: "Discovery call", es: "Llamada inicial" },
        detail: {
          en: "Concierge and Diana map goals, inventory, and timelines.",
          es: "Concierge y Diana definen metas, inventario y tiempos.",
        },
      },
      {
        title: { en: "Implementation day", es: "Día de implementación" },
        detail: {
          en: "Onsite execution with optional staff coaching.",
          es: "Ejecución en sitio con coaching opcional al personal.",
        },
      },
      {
        title: { en: "Maintenance check-in", es: "Seguimiento" },
        detail: {
          en: "30-day virtual review to adjust systems as needed.",
          es: "Revisión virtual a los 30 días para ajustes.",
        },
      },
    ],
    reviews: [
      {
        name: "Cynthia W.",
        date: "July 2025",
        rating: 4.8,
        comment: {
          en: "Our closets went from chaos to catalogued. Diana even trained our nanny on the system.",
          es: "Nuestros clósets pasaron del caos al catálogo y Diana entrenó a nuestra niñera en el sistema.",
        },
      },
      {
        name: "Andrés & Lee",
        date: "March 2025",
        rating: 4.9,
        comment: {
          en: "The household manual she created keeps our travel schedules smooth—worth every peso.",
          es: "El manual del hogar mantiene nuestros viajes en orden; vale cada peso.",
        },
      },
    ],
    conciergeNote: {
      en: "Ideal for executives balancing multiple residences. Pair with Ana or Catalina for ongoing upkeep.",
      es: "Ideal para ejecutivos con múltiples residencias. Combina con Ana o Catalina para mantenimiento continuo.",
    },
  },
  "sofia-ramirez": {
    headline: {
      en: "Bilingual childcare and family support",
      es: "Apoyo familiar y cuidado infantil bilingüe",
    },
    about: {
      en: "Sofía is a former preschool teacher with pediatric first-aid certification supporting expat families in Envigado and Laureles.",
      es: "Sofía es ex maestra de preescolar con certificación en primeros auxilios pediátricos, acompañando familias expats en Envigado y Laureles.",
    },
    highlights: [
      {
        en: "CPR & pediatric emergency training renewed June 2025",
        es: "Capacitación en RCP y emergencias pediátricas renovada en junio 2025",
      },
      {
        en: "Bilingual storytelling and homework support",
        es: "Cuentacuentos bilingüe y apoyo escolar",
      },
    ],
    services: [
      {
        name: { en: "After-school routine", es: "Rutina después del colegio" },
        description: {
          en: "Pick-up coordination, snack prep, enrichment activities, and bedtime wind-down.",
          es: "Coordinación de recogida, meriendas, actividades y preparación para dormir.",
        },
        duration: "4 hours",
        rate: "$120 USD",
        includes: [
          { en: "Homework support", es: "Apoyo con tareas" },
          { en: "Daily report to parents", es: "Reporte diario a padres" },
        ],
      },
      {
        name: { en: "Weekend explorer", es: "Aventuras de fin de semana" },
        description: {
          en: "Plan and guide bilingual outings around Medellín — museums, nature, and cultural events.",
          es: "Planea salidas bilingües en Medellín: museos, naturaleza y eventos culturales.",
        },
        duration: "5 hours",
        rate: "$150 USD",
        includes: [
          { en: "Curated itinerary", es: "Itinerario curado" },
          { en: "Transportation coordination", es: "Coordinación de transporte" },
        ],
      },
    ],
    verifications: [
      {
        title: { en: "Childcare background check", es: "Antecedentes de cuidado infantil" },
        detail: {
          en: "Enhanced screening with family services database",
          es: "Filtro ampliado con base de datos de bienestar familiar",
        },
      },
      {
        title: { en: "Family references", es: "Referencias familiares" },
        detail: {
          en: "Three long-term families with video testimonials",
          es: "Tres familias a largo plazo con testimonios en video",
        },
      },
      {
        title: { en: "Emergency protocol trained", es: "Entrenamiento en emergencias" },
        detail: {
          en: "Completed Maidconnect safety drills and incident reporting",
          es: "Completó simulacros de seguridad y reportes de incidentes",
        },
      },
    ],
    availability: [
      {
        en: "Weekdays · 13:00 – 20:00",
        es: "Días de semana · 13:00 – 20:00",
      },
      {
        en: "Optional weekend experiences twice per month",
        es: "Experiencias de fin de semana dos veces al mes",
      },
    ],
    bookingProcess: [
      {
        title: { en: "Family intake", es: "Brief familiar" },
        detail: {
          en: "Collect routines, emergency contacts, and learning goals.",
          es: "Recopila rutinas, contactos de emergencia y metas de aprendizaje.",
        },
      },
      {
        title: { en: "First play session", es: "Primera sesión" },
        detail: {
          en: "Concierge joins intro visit to align expectations.",
          es: "El concierge acompaña la visita inicial para alinear expectativas.",
        },
      },
      {
        title: { en: "Ongoing feedback", es: "Feedback continuo" },
        detail: {
          en: "Weekly bilingual progress notes with mood, activities, and meals.",
          es: "Reporte semanal bilingüe con estado de ánimo, actividades y comidas.",
        },
      },
    ],
    reviews: [
      {
        name: "Rachel & Mateo",
        date: "September 2025",
        rating: 5,
        comment: {
          en: "Our twins adore Sofía. She balances fun with structure and keeps us updated in English.",
          es: "Nuestros gemelos adoran a Sofía. Equilibra diversión con estructura y nos mantiene informados en inglés.",
        },
      },
      {
        name: "Omar D.",
        date: "June 2025",
        rating: 4.9,
        comment: {
          en: "Reliable, punctual, and proactive about safety. She even taught our daughter Spanish songs.",
          es: "Confiable, puntual y proactiva en seguridad. Enseñó canciones en español a nuestra hija.",
        },
      },
    ],
    conciergeNote: {
      en: "Background checks take longer for childcare—book intro sessions at least 10 days ahead.",
      es: "Los chequeos para cuidado infantil tardan más; programa sesiones intro con 10 días de anticipación.",
    },
  },
};

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
