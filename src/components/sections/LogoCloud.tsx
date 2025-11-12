import { Container } from "@/components/ui/container";

/**
 * LogoCloud Component - Swiss Design System
 *
 * Minimal text-based trust indicators following Swiss principles:
 * - No images, pure typography
 * - Clean separation with dividers
 * - Uppercase tracking for labels
 * - Neutral color palette
 */
export function LogoCloud() {
  const partners = [
    { name: "El Tiempo", category: "Media" },
    { name: "Semana", category: "Magazine" },
    { name: "La República", category: "Business" },
    { name: "Bogotá City", category: "Government" },
    { name: "Allianz", category: "Insurance" },
    { name: "Certified", category: "Quality" },
  ];

  return (
    <section className="w-full border-neutral-200 border-y bg-white py-12">
      <Container className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <p className="font-mono text-neutral-400 text-xs uppercase tracking-widest">
            As Featured In
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {partners.map((partner) => (
            <div
              className="flex flex-col items-center justify-center text-center"
              key={partner.name}
            >
              <div className="font-semibold text-neutral-900 text-sm tracking-tight">
                {partner.name}
              </div>
              <div className="mt-1 text-neutral-500 text-xs">{partner.category}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
