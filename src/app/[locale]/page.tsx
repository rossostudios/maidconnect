import { setRequestLocale } from "next-intl/server";
import { WelcomeTour } from "@/components/onboarding";
import { ConciergeSection } from "@/components/sections/concierge-section";
import { HeroSection } from "@/components/sections/hero-section";
import { NewProfessionalsCarousel } from "@/components/sections/new-professionals-carousel";
import { ProcessSection } from "@/components/sections/process-section";
import { ServicesSection } from "@/components/sections/services-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { getLatestProfessionals } from "@/lib/professionals/queries";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Get the locale from params
  const { locale } = await params;

  // Set the locale for this request so server components can access it
  setRequestLocale(locale);
  // Fetch latest professionals for the carousel
  let latestProfessionals = await getLatestProfessionals(7);

  // Fallback to mock data if no professionals found
  if (latestProfessionals.length === 0) {
    latestProfessionals = [
      {
        id: "1",
        name: "Maria Silva",
        city: "Bogotá",
        country: "Colombia",
        profilePicture:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=533&fit=crop&crop=faces,top",
        hourlyRate: 25,
        specialties: ["House Cleaning", "Deep Cleaning"],
      },
      {
        id: "2",
        name: "Carlos Rodriguez",
        city: "Medellín",
        country: "Colombia",
        profilePicture:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop&crop=faces,top",
        hourlyRate: 30,
        specialties: ["Personal Chef", "Meal Prep"],
      },
      {
        id: "3",
        name: "Ana Martinez",
        city: "Cartagena",
        country: "Colombia",
        profilePicture:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=533&fit=crop&crop=faces,top",
        hourlyRate: 28,
        specialties: ["Childcare", "Tutoring"],
      },
      {
        id: "4",
        name: "Juan Pérez",
        city: "Cali",
        country: "Colombia",
        profilePicture:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=533&fit=crop&crop=faces,top",
        hourlyRate: 32,
        specialties: ["Gardening", "Landscaping"],
      },
      {
        id: "5",
        name: "Sofia Ramirez",
        city: "Bogotá",
        country: "Colombia",
        profilePicture:
          "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=533&fit=crop&crop=faces,top",
        hourlyRate: 27,
        specialties: ["Elderly Care", "Companion"],
      },
      {
        id: "6",
        name: "Diego Lopez",
        city: "Medellín",
        country: "Colombia",
        profilePicture:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=533&fit=crop&crop=faces,top",
        hourlyRate: 26,
        specialties: ["Pet Care", "Dog Walking"],
      },
      {
        id: "7",
        name: "Isabella Torres",
        city: "Cartagena",
        country: "Colombia",
        profilePicture:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=533&fit=crop&crop=faces,top",
        hourlyRate: 29,
        specialties: ["House Cleaning", "Laundry"],
      },
    ];
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main data-tour="welcome">
        <HeroSection />
        <NewProfessionalsCarousel professionals={latestProfessionals} />
        <ServicesSection />
        <ProcessSection />
        <TestimonialsSection />
        <ConciergeSection />
      </main>
      <SiteFooter />
      <WelcomeTour autoStart />
    </div>
  );
}
