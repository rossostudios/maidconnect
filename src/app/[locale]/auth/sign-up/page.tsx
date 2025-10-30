import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SignUpForm } from "./sign-up-form";
import { AUTH_ROUTES } from "@/lib/auth";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "pages.signUp.meta" });

  return {
    title: t("title"),
  };
}

export default async function SignUpPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "pages.signUp" });

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#fbfaf9] md:h-screen md:grid-cols-[45%_55%] md:overflow-hidden">
      <div className="flex h-full flex-col border-r border-[#e5dfd4] bg-[#fbfaf9] px-8 py-10 md:h-screen md:overflow-y-auto md:px-16 md:py-16">
        <header className="flex items-center justify-between border-b border-[#ece6da] pb-6 text-sm text-[#211f1a] md:pb-10">
          <Link href="/" className="font-semibold">
            MaidConnect
          </Link>
          <Link href={AUTH_ROUTES.signIn} className="font-semibold">
            {t("header.signIn")}
          </Link>
        </header>
        <main className="flex flex-1 justify-center pb-16 pt-12 md:pt-14">
          <div className="w-full max-w-3xl space-y-14">
            <div className="space-y-6">
              <h1 className="text-[2.35rem] font-semibold leading-tight text-[#211f1a]">{t("hero.title")}</h1>
              <p className="text-lg leading-relaxed text-[#5d574b]">
                {t("hero.description")}
              </p>
            </div>
            <div className="rounded-[40px] border border-[#e5dfd4] bg-white p-12 shadow-[0_28px_70px_rgba(18,17,15,0.08)]">
              <SignUpForm />
              <p className="mt-8 text-sm text-[#5d574b]">
                {t("form.haveAccount")}{" "}
                <Link href={AUTH_ROUTES.signIn} className="font-semibold text-[#211f1a] underline-offset-4 hover:underline">
                  {t("form.signInInstead")}
                </Link>
              </p>
            </div>
          </div>
        </main>
        <p className="mt-10 text-xs text-[#7a6d62]">
          {t("footer.support")}
        </p>
      </div>
      <div className="relative hidden md:block">
        <div className="sticky top-0 h-screen">
          <div className="relative h-full">
            <Image
              src="/signup.png"
              alt={t("sidebar.imageAlt")}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(17,16,14,0.8),rgba(33,31,26,0.4))]" />
            <div className="absolute inset-x-14 bottom-14 max-w-md space-y-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7b59f]">{t("sidebar.badge")}</p>
              <h2 className="text-2xl font-semibold leading-snug">{t("sidebar.title")}</h2>
              <p className="text-sm text-[#f3ece1]">
                {t("sidebar.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
