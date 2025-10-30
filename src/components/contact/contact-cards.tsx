import { Container } from "@/components/ui/container";
import Link from "next/link";

const contactOptions = [
  {
    title: "Support",
    description: "Fill out our form or email us at support@maidconnect.co with your question.",
    buttonText: "Submit an inquiry",
    buttonHref: "mailto:support@maidconnect.co",
  },
  {
    title: "For customers",
    description: "Browse our verified professionals and book trusted help for your home.",
    buttonText: "Find a professional",
    buttonHref: "/professionals",
  },
  {
    title: "For professionals",
    description: "Join our network and connect with families looking for reliable help.",
    buttonText: "Apply to join",
    buttonHref: "/auth/sign-up?role=professional",
  },
];

export function ContactCards() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <Container className="max-w-[1400px]">
        <div className="grid gap-8 md:grid-cols-3">
          {contactOptions.map((option) => (
            <div
              key={option.title}
              className="flex flex-col justify-between rounded-[32px] border border-[#ebe5d8] bg-gradient-to-br from-[#fbfafa] to-white p-10 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_20px_60px_rgba(18,17,15,0.08)]"
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-[#211f1a]">
                  {option.title}
                </h2>
                <p className="text-base leading-relaxed text-[#5d574b]">
                  {option.description}
                </p>
              </div>
              <Link
                href={option.buttonHref}
                className="mt-12 inline-flex w-fit items-center justify-center rounded-full bg-[#211f1a] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#2d2822]"
              >
                {option.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
