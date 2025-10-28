import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "./sign-up-form";
import { AUTH_ROUTES } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account | MaidConnect",
};

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#fbfaf9] md:h-screen md:grid-cols-[45%_55%] md:overflow-hidden">
      <div className="flex h-full flex-col border-r border-[#e5dfd4] bg-[#fbfaf9] px-8 py-10 md:h-screen md:overflow-y-auto md:px-16 md:py-16">
        <header className="flex items-center justify-between border-b border-[#ece6da] pb-6 text-sm text-[#211f1a] md:pb-10">
          <Link href="/" className="font-semibold">
            MaidConnect
          </Link>
          <Link href={AUTH_ROUTES.signIn} className="font-semibold">
            Sign in
          </Link>
        </header>
        <main className="flex flex-1 justify-center pb-16 pt-12 md:pt-14">
          <div className="w-full max-w-3xl space-y-14">
            <div className="space-y-6">
              <h1 className="text-[2.35rem] font-semibold leading-tight text-[#211f1a]">Create your MaidConnect account</h1>
              <p className="text-lg leading-relaxed text-[#5d574b]">
                Tell us how you plan to use the platform and we&apos;ll tailor the experience for households or professionals.
              </p>
            </div>
            <div className="rounded-[40px] border border-[#e5dfd4] bg-white p-12 shadow-[0_28px_70px_rgba(18,17,15,0.08)]">
              <SignUpForm />
              <p className="mt-8 text-sm text-[#5d574b]">
                Already have an account?{" "}
                <Link href={AUTH_ROUTES.signIn} className="font-semibold text-[#211f1a] underline-offset-4 hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </main>
        <p className="mt-10 text-xs text-[#7a6d62]">
          We’ll guide you with concierge onboarding after you submit your details.
        </p>
      </div>
      <div className="relative hidden md:block">
        <div className="sticky top-0 h-screen">
          <div className="relative h-full">
            <Image
              src="/signup.png"
              alt="MaidConnect onboarding"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(17,16,14,0.8),rgba(33,31,26,0.4))]" />
            <div className="absolute inset-x-14 bottom-14 max-w-md space-y-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7b59f]">Concierge onboarding</p>
              <h2 className="text-2xl font-semibold leading-snug">We interview, background check, and coach every professional.</h2>
              <p className="text-sm text-[#f3ece1]">
                Build trust from the first visit with structured onboarding, household manuals, and responsive support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
