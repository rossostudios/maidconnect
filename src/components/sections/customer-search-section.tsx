import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { DirectoryProfessional } from "@/components/professionals/professionals-directory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Kbd } from "@/components/ui/kbd";
import { Link } from "@/i18n/routing";
import { formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";

type CustomerSearchSectionProps = {
  professionals: DirectoryProfessional[];
};

export function CustomerSearchSection({ professionals }: CustomerSearchSectionProps) {
  const featuredProfessionals = professionals.slice(0, 3);

  return (
    <section className="border-stone-200 border-t bg-stone-50 py-20 sm:py-24">
      <Container className="space-y-12">
        <div className="max-w-3xl space-y-5">
          <h2 className="font-semibold text-3xl text-stone-900 tracking-tight">
            Discover pre-vetted professionals ready to book
          </h2>
          <p className="text-base text-stone-600">
            Browse bilingual specialists who have completed Casaora's onboarding and background
            checks. Compare services, languages, and rates before requesting a hold.
          </p>
        </div>

        {featuredProfessionals.length === 0 ? (
          <Card className="rounded-3xl border-stone-200 bg-stone-50">
            <CardContent className="p-10 text-center text-stone-600 text-sm">
              We&apos;ll showcase new professionals here as they complete onboarding. In the
              meantime, explore the full directory to see who&apos;s available.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProfessionals.map((professional) => (
              <Card
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-3xl border-stone-200 bg-white shadow-sm transition-all duration-300",
                  "hover:-translate-y-1 hover:border-stone-400 hover:shadow-lg"
                )}
                key={professional.id}
              >
                <div className="relative h-48 w-full">
                  <Image
                    alt={professional.name}
                    className="object-cover"
                    fill
                    src={professional.photoUrl}
                  />
                </div>
                <CardContent className="flex flex-1 flex-col gap-3 p-6">
                  <div>
                    <h3 className="font-semibold text-lg text-stone-900">{professional.name}</h3>
                    <p className="text-stone-600 text-sm">
                      {professional.service ?? "Flexible household services"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-semibold text-stone-600 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1 text-white">
                      <HugeiconsIcon className="h-3.5 w-3.5 text-white" icon={StarIcon} />
                      New to Casaora
                    </span>
                    {professional.languages.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1">
                        {professional.languages.join(" / ")}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-stone-600 text-sm">{professional.location}</p>
                  <p className="text-stone-600 text-sm">
                    {professional.bio
                      ? professional.bio.length > 120
                        ? `${professional.bio.slice(0, 120)}…`
                        : professional.bio
                      : "This professional is finalizing their public bio. Request a booking to see availability."}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-stone-600 text-sm">
                    <span>{formatCOP(professional.hourlyRateCop) ?? "Rate on request"}</span>
                    <Link
                      className="font-semibold text-stone-900 text-sm underline-offset-4 transition hover:underline"
                      href={`/professionals/${professional.id}`}
                    >
                      View profile
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="rounded-3xl border-stone-200 bg-stone-50/90">
          <CardContent className="flex flex-col gap-4 p-6 text-stone-600 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-stone-900">Ready to explore more?</p>
              <p>
                Head to the full directory to filter by service type, language, and availability.
              </p>
            </div>
            <Button asChild>
              <Link href="/professionals">
                Browse all professionals
                <Kbd className="ml-2" size="lg" variant="outline">
                  B
                </Kbd>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
