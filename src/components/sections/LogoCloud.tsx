import Image from "next/image";
import { Container } from "@/components/ui/container";

/**
 * LogoCloud Component
 *
 * Displays trusted partner and media logos in a horizontal grid.
 * Shows 6 logos with grayscale effect and hover transitions.
 */
export function LogoCloud() {
  const logos = [
    { name: "El Tiempo", src: "/logos/el-tiempo.svg", alt: "El Tiempo logo" },
    { name: "Semana", src: "/logos/semana.svg", alt: "Semana logo" },
    { name: "La República", src: "/logos/la-republica.svg", alt: "La República logo" },
    { name: "City Hall", src: "/logos/city-hall.svg", alt: "City Hall logo" },
    { name: "Allianz", src: "/logos/allianz.svg", alt: "Allianz logo" },
    { name: "Verified", src: "/logos/verified.svg", alt: "Verified badge" },
  ];

  return (
    <section className="w-full bg-stone-100 py-10">
      <Container className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="font-medium text-sm text-stone-600 uppercase tracking-wider">
            Trusted by Leading Organizations
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 items-center gap-8 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((logo) => (
            <div
              className="flex items-center justify-center grayscale transition-all duration-300 hover:grayscale-0"
              key={logo.name}
            >
              <Image
                alt={logo.alt}
                className="h-12 w-auto object-contain"
                height={48}
                src={logo.src}
                width={120}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
