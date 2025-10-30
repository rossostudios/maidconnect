import { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.signIn.meta" });

  return {
    title: t("title"),
  };
}

export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.signIn" });
  const searchParamsResolved = await searchParams;
  const redirectTo =
    typeof searchParamsResolved.redirectTo === "string" ? searchParamsResolved.redirectTo : null;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#fbfaf9] md:h-screen md:grid-cols-[45%_55%] md:overflow-hidden">
      <div className="flex h-full flex-col border-[#e5dfd4] border-r bg-[#fbfaf9] px-8 py-10 md:h-screen md:overflow-y-auto md:px-16 md:py-16">
        <header className="flex items-center justify-between border-[#ece6da] border-b pb-6 text-[#211f1a] text-sm md:pb-10">
          <Link className="font-semibold" href="/">
            MaidConnect
          </Link>
          <Link className="font-semibold" href={AUTH_ROUTES.signUp}>
            {t("header.createAccount")}
          </Link>
        </header>
        <main className="flex flex-1 justify-center pt-12 pb-16 md:pt-14">
          <div className="w-full max-w-3xl space-y-12">
            <div className="space-y-5">
              <h1 className="font-semibold text-[#211f1a] text-[2.1rem]">{t("hero.title")}</h1>
              <p className="text-[#5d574b] text-base leading-relaxed">{t("hero.description")}</p>
            </div>
            <div className="rounded-[36px] border border-[#e5dfd4] bg-white p-12 shadow-[0_24px_60px_rgba(18,17,15,0.06)]">
              <SignInForm redirectTo={redirectTo} />
              <p className="mt-8 text-[#5d574b] text-sm">
                {t("form.needAccount")}{" "}
                <Link
                  className="font-semibold text-[#211f1a] underline-offset-4 hover:underline"
                  href={AUTH_ROUTES.signUp}
                >
                  {t("form.createOneNow")}
                </Link>
              </p>
            </div>
          </div>
        </main>
        <p className="mt-10 text-[#7a6d62] text-xs">{t("footer.support")}</p>
      </div>
      <div className="relative hidden md:block">
        <div className="sticky top-0 h-screen">
          <div className="relative h-full">
            <Image
              alt={t("sidebar.imageAlt")}
              className="object-cover"
              fill
              priority
              src="/login.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,16,14,0.75),rgba(33,31,26,0.35))]" />
            <div className="absolute inset-x-14 bottom-14 max-w-md space-y-3 text-white">
              <p className="font-semibold text-[#d7b59f] text-xs uppercase tracking-[0.3em]">
                {t("sidebar.badge")}
              </p>
              <h2 className="font-semibold text-2xl leading-snug">{t("sidebar.title")}</h2>
              <p className="text-[#f3ece1] text-sm">{t("sidebar.description")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
