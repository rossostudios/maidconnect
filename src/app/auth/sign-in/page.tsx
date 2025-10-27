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
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/" className="text-base font-semibold text-neutral-900">
            MaidConnect
          </Link>
          <Link href={AUTH_ROUTES.signUp} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Create account
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold text-neutral-900">Sign in</h1>
          <p className="mb-8 text-sm text-neutral-600">
            Access your dashboard to manage bookings, profiles, and payments.
          </p>
          <SignInForm redirectTo={redirectTo} />
          <p className="mt-6 text-sm text-neutral-600">
            Need an account?{" "}
            <Link href={AUTH_ROUTES.signUp} className="font-medium text-blue-600 hover:text-blue-700">
              Sign up here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
