import { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "./sign-up-form";
import { AUTH_ROUTES } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account | MaidConnect",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="text-base font-semibold text-neutral-900">
            MaidConnect
          </Link>
          <Link href={AUTH_ROUTES.signIn} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-8 max-w-xl">
            <h1 className="text-3xl font-semibold text-neutral-900">Create your MaidConnect account</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Choose the experience that fits you—book trusted home services or manage your professional business.
            </p>
          </div>
          <SignUpForm />
          <p className="mt-6 text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href={AUTH_ROUTES.signIn} className="font-medium text-blue-600 hover:text-blue-700">
              Sign in here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
