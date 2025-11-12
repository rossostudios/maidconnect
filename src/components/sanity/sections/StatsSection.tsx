/**
 * Stats Section Component
 *
 * Renders stats section from Sanity CMS
 */

import { Container } from "@/components/ui/container";

type Stat = {
  value: string;
  label: string;
  icon?: string;
};

type StatsSectionProps = {
  data: {
    title?: string;
    stats?: Stat[];
  };
};

export function StatsSection({ data }: StatsSectionProps) {
  const { title, stats } = data;

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f8fafc] py-16 sm:py-20 lg:py-24">
      <Container>
        {title && <h2 className="serif-headline-lg mb-12 text-center text-[#0f172a]">{title}</h2>}

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div className="text-center" key={index}>
              <div className="serif-display-lg text-[#64748b]">{stat.value}</div>
              <div className="mt-2 font-medium text-[#0f172a]/70 text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
