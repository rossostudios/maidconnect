import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "./sign-in-form";
import { AUTH_ROUTES } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in | MaidConnect",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === "string" ? params.redirectTo : null;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#fbfaf9] md:h-screen md:grid-cols-[45%_55%] md:overflow-hidden">
      <div className="flex h-full flex-col border-r border-[#e5dfd4] bg-[#fbfaf9] px-8 py-10 md:h-screen md:overflow-y-auto md:px-16 md:py-16">
        <header className="flex items-center justify-between border-b border-[#ece6da] pb-6 text-sm text-[#211f1a] md:pb-10">
          <Link href="/" className="font-semibold">
            MaidConnect
          </Link>
          <Link href={AUTH_ROUTES.signUp} className="font-semibold">
            Create account
          </Link>
        </header>
        <main className="flex flex-1 justify-center pb-16 pt-12 md:pt-14">
          <div className="w-full max-w-3xl space-y-12">
            <div className="space-y-5">
              <h1 className="text-[2.1rem] font-semibold text-[#211f1a]">Welcome back</h1>
              <p className="text-base leading-relaxed text-[#5d574b]">
                Sign in to manage your bookings, documents, and payouts in one workspace.
              </p>
            </div>
            <div className="rounded-[36px] border border-[#e5dfd4] bg-white p-12 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
              <SignInForm redirectTo={redirectTo} />
              <p className="mt-8 text-sm text-[#5d574b]">
                Need an account?{" "}
                <Link href={AUTH_ROUTES.signUp} className="font-semibold text-[#211f1a] underline-offset-4 hover:underline">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </main>
        <p className="mt-10 text-xs text-[#7a6d62]">
          Concierge support is available 7 days a week for onboarding assistance.
        </p>
      </div>
      <div className="relative hidden md:block">
        <div className="sticky top-0 h-screen">
          <div className="relative h-full">
            <Image
              src="/login.png"
              alt="MaidConnect hospitality"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,16,14,0.75),rgba(33,31,26,0.35))]" />
            <div className="absolute inset-x-14 bottom-14 max-w-md space-y-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7b59f]">Trusted domestic talent</p>
              <h2 className="text-2xl font-semibold leading-snug">Meticulous professionals handpicked for expat households.</h2>
              <p className="text-sm text-[#f3ece1]">
                Our bilingual concierge team vets every profile with interviews, trial visits, and ongoing quality checks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
