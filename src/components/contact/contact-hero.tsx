import { Container } from "@/components/ui/container";

export function ContactHero() {
  return (
    <section className="bg-[#fbfaf9] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7d7566]">
          CONTACT
        </p>
        <h1 className="mt-6 text-5xl font-semibold leading-tight text-[#211f1a] sm:text-6xl lg:text-7xl">
          How can we help?
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-[#5d574b] sm:text-2xl">
          Whether you're looking to hire trusted professionals, interested in joining our network,
          or just have a question, our team is here to help.
        </p>
      </Container>
    </section>
  );
}
