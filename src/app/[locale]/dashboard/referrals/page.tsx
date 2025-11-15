import { AnalyticsUpIcon, GiftIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { ReferralCard } from "@/components/referrals/referral-card";
import { requireUser } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Referral = {
  id: string;
  referee_id: string;
  status: string;
  created_at: string;
  rewarded_at: string | null;
};

export default async function ReferralsPage({ params }: { params: Promise<{ locale: string }> }) {
  const user = await requireUser();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.referrals" });

  // Check if feature is enabled
  if (!isFeatureEnabled("referral_program")) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="font-semibold text-3xl text-neutral-900">{t("title")}</h1>
          <p className="mt-2 text-base text-neutral-500 leading-relaxed">
            This feature is coming soon!
          </p>
        </div>
      </section>
    );
  }

  const supabase = await createSupabaseServerClient();

  // Fetch user's referral code (or create if doesn't exist)
  let referralCode: string | null = null;
  let usesCount = 0;

  const { data: existingCode } = await supabase
    .from("referral_codes")
    .select("code, uses_count")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (existingCode) {
    referralCode = existingCode.code;
    usesCount = existingCode.uses_count;
  } else {
    // Generate new code via API (we'll let the component handle this on client side)
    // For now, show a message to generate code
    referralCode = null;
  }

  // Fetch user's total credits
  const { data: creditsData } = await supabase.rpc("get_user_referral_credits", {
    p_user_id: user.id,
  });
  const totalCredits = (creditsData as number) || 0;

  // Fetch referral stats
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referee_id, status, created_at, rewarded_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const referralsList = (referrals as Referral[]) || [];
  const pendingReferrals = referralsList.filter((r) => r.status === "pending").length;
  const rewardedReferrals = referralsList.filter((r) => r.status === "rewarded").length;

  // Default reward amounts (should match migration)
  const referrerReward = 1500; // $15 in cents
  const refereeReward = 1000; // $10 in cents

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-semibold text-3xl text-neutral-900">Refer & Earn</h1>
        <p className="mt-2 text-base text-neutral-500 leading-relaxed">
          Share Casaora with friends and earn rewards when they book their first service
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-orange-500/10 to-white p-6 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <HugeiconsIcon className="h-6 w-6 text-white" icon={GiftIcon} />
          </div>
          <div className="mb-1 text-neutral-500 text-sm">Total Earnings</div>
          <div className="font-bold text-3xl text-neutral-900">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(totalCredits / 100)}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
            <HugeiconsIcon className="h-6 w-6 text-neutral-900" icon={UserGroupIcon} />
          </div>
          <div className="mb-1 text-neutral-500 text-sm">Successful Referrals</div>
          <div className="font-bold text-3xl text-neutral-900">{rewardedReferrals}</div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
            <HugeiconsIcon className="h-6 w-6 text-neutral-900" icon={AnalyticsUpIcon} />
          </div>
          <div className="mb-1 text-neutral-500 text-sm">Pending</div>
          <div className="font-bold text-3xl text-neutral-900">{pendingReferrals}</div>
        </div>
      </div>

      {/* Referral Card */}
      <div>
        {referralCode ? (
          <ReferralCard
            code={referralCode}
            refereeReward={refereeReward}
            referrerReward={referrerReward}
            totalCreditsEarned={totalCredits}
            usesCount={usesCount}
          />
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
            <HugeiconsIcon className="mx-auto mb-4 h-12 w-12 text-orange-500" icon={GiftIcon} />
            <h3 className="mb-2 font-semibold text-neutral-900 text-xl">Get Your Referral Code</h3>
            <p className="mb-6 text-neutral-500">
              Generate your unique referral code to start earning rewards
            </p>
            <form action="/api/referrals/generate-code" method="POST">
              <button
                className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 active:scale-95"
                type="submit"
              >
                Generate My Code
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Recent Referrals */}
      {referralsList.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
          <h2 className="mb-6 font-semibold text-neutral-900 text-xl">Recent Referrals</h2>
          <div className="space-y-4">
            {referralsList.slice(0, 5).map((referral) => (
              <div
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
                key={referral.id}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
                    <HugeiconsIcon className="h-5 w-5 text-neutral-900" icon={UserGroupIcon} />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900 text-sm">New Referral</div>
                    <div className="text-neutral-500 text-xs">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div>
                  {referral.status === "rewarded" && (
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-orange-500 text-xs">
                      Rewarded
                    </span>
                  )}
                  {referral.status === "qualified" && (
                    <span className="rounded-full bg-neutral-50 px-3 py-1 text-orange-500 text-xs">
                      Qualified
                    </span>
                  )}
                  {referral.status === "pending" && (
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-orange-500 text-xs">
                      Pending
                    </span>
                  )}
                  {referral.status === "expired" && (
                    <span className="rounded-full bg-neutral-200/30 px-3 py-1 text-neutral-500 text-xs">
                      Expired
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
