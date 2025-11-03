import { Gift, TrendingUp, Users } from "lucide-react";
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
          <h1 className="font-semibold text-3xl text-[#211f1a]">{t("title")}</h1>
          <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
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
        <h1 className="font-semibold text-3xl text-[#211f1a]">Refer & Earn</h1>
        <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
          Share Casaora with friends and earn rewards when they book their first service
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#ebe5d8] bg-gradient-to-br from-[#8B7355]/10 to-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8B7355]">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div className="mb-1 text-[#5d574b] text-sm">Total Earnings</div>
          <div className="font-bold text-3xl text-[#211f1a]">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(totalCredits / 100)}
          </div>
        </div>

        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ebe5d8]">
            <Users className="h-6 w-6 text-[#211f1a]" />
          </div>
          <div className="mb-1 text-[#5d574b] text-sm">Successful Referrals</div>
          <div className="font-bold text-3xl text-[#211f1a]">{rewardedReferrals}</div>
        </div>

        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ebe5d8]">
            <TrendingUp className="h-6 w-6 text-[#211f1a]" />
          </div>
          <div className="mb-1 text-[#5d574b] text-sm">Pending</div>
          <div className="font-bold text-3xl text-[#211f1a]">{pendingReferrals}</div>
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
          <div className="rounded-2xl border border-[#ebe5d8] bg-white p-8 text-center shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
            <Gift className="mx-auto mb-4 h-12 w-12 text-[#8B7355]" />
            <h3 className="mb-2 font-semibold text-[#211f1a] text-xl">Get Your Referral Code</h3>
            <p className="mb-6 text-[#5d574b]">
              Generate your unique referral code to start earning rewards
            </p>
            <form action="/api/referrals/generate-code" method="POST">
              <button
                className="rounded-lg bg-[#8B7355] px-6 py-3 font-semibold text-white transition hover:bg-[#e54d3a] active:scale-95"
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
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
          <h2 className="mb-6 font-semibold text-[#211f1a] text-xl">Recent Referrals</h2>
          <div className="space-y-4">
            {referralsList.slice(0, 5).map((referral) => (
              <div
                className="flex items-center justify-between rounded-lg border border-[#ebe5d8] p-4"
                key={referral.id}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebe5d8]">
                    <Users className="h-5 w-5 text-[#211f1a]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#211f1a] text-sm">New Referral</div>
                    <div className="text-[#5d574b] text-xs">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div>
                  {referral.status === "rewarded" && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-green-700 text-xs">
                      Rewarded
                    </span>
                  )}
                  {referral.status === "qualified" && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 text-xs">
                      Qualified
                    </span>
                  )}
                  {referral.status === "pending" && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                      Pending
                    </span>
                  )}
                  {referral.status === "expired" && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 text-xs">
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
