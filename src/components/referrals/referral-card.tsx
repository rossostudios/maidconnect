"use client";

import {
  Copy01Icon,
  GiftIcon,
  MagicWand01Icon,
  Share01Icon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { formatCOP } from "@/lib/format";

type ReferralCardProps = {
  code: string;
  usesCount: number;
  totalCreditsEarned: number;
  referrerReward: number; // Amount referrer gets (in cents)
  refereeReward: number; // Amount referee gets (in cents)
};

/**
 * ReferralCard - Share code, earn rewards
 *
 * Research insights applied:
 * - 90%+ of successful programs use double-sided incentives
 * - Clear value proposition increases sharing by 397%
 * - Easy copy/share reduces friction
 * - Visual rewards display motivates sharing
 */
export function ReferralCard({
  code,
  usesCount,
  totalCreditsEarned,
  referrerReward,
  refereeReward,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const shareUrl = `${window.location.origin}/auth/sign-up?ref=${code}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = (platform: "whatsapp" | "twitter" | "facebook") => {
    const shareUrl = `${window.location.origin}/auth/sign-up?ref=${code}`;
    const message = `Join Casaora and get ${formatCOP(refereeReward / 100)} off your first booking! Use my code: ${code}`;

    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className="rounded-2xl border border-[#ebe5d8] bg-gradient-to-br from-white to-[#fbf9f7] p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-6 w-6 text-[#E85D48]" icon={GiftIcon} />
            <h2 className="font-bold text-2xl text-gray-900">Your Referral Code</h2>
          </div>
          <p className="text-gray-600 text-sm">Share with friends and you both earn rewards</p>
        </div>
        <HugeiconsIcon className="h-8 w-8 text-[#E85D48]" icon={MagicWand01Icon} />
      </div>

      {/* Referral Code Display */}
      <div className="mb-6 rounded-xl border-2 border-[#E85D48] border-dashed bg-white p-6">
        <div className="mb-2 text-center text-gray-600 text-xs uppercase tracking-wider">
          Your Code
        </div>
        <div className="mb-4 text-center font-bold text-4xl text-gray-900 tracking-wider">
          {code}
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E85D48] px-4 py-3 font-semibold text-sm text-white transition hover:bg-[#e54d3a] active:scale-95 disabled:opacity-50"
          onClick={handleCopy}
          type="button"
        >
          {copied ? (
            <>
              <HugeiconsIcon className="h-4 w-4" icon={Tick02Icon} />
              Copied!
            </>
          ) : (
            <>
              <HugeiconsIcon className="h-4 w-4" icon={Copy01Icon} />
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Rewards Explanation */}
      <div className="mb-6 rounded-xl bg-[#E85D48]/5 p-5">
        <h3 className="mb-3 font-semibold text-gray-900 text-sm">How it works:</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E85D48] text-white text-xs">
              1
            </div>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Share your code</span> with friends via WhatsApp,
              social media, or email
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E85D48] text-white text-xs">
              2
            </div>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">They get {formatCOP(refereeReward / 100)}</span> off
              their first booking
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E85D48] text-white text-xs">
              3
            </div>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">You earn {formatCOP(referrerReward / 100)}</span> in
              credits when they complete their first booking
            </p>
          </li>
        </ul>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4">
          <div className="mb-1 flex items-center gap-2 text-gray-600 text-xs">
            <HugeiconsIcon className="h-4 w-4" icon={UserGroupIcon} />
            People Referred
          </div>
          <div className="font-bold text-2xl text-gray-900">{usesCount}</div>
        </div>
        <div className="rounded-xl bg-white p-4">
          <div className="mb-1 flex items-center gap-2 text-gray-600 text-xs">
            <HugeiconsIcon className="h-4 w-4" icon={GiftIcon} />
            Credits Earned
          </div>
          <div className="font-bold text-2xl text-gray-900">
            {formatCOP(totalCreditsEarned / 100)}
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div>
        <div className="mb-3 text-center text-gray-600 text-xs uppercase tracking-wider">
          Share via
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#ebe5d8] bg-white p-4 transition hover:border-[#25D366] hover:bg-[#25D366]/5 active:scale-95"
            onClick={() => handleShare("whatsapp")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Share01Icon} />
            </div>
            <span className="font-medium text-gray-900 text-xs">WhatsApp</span>
          </button>
          <button
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#ebe5d8] bg-white p-4 transition hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/5 active:scale-95"
            onClick={() => handleShare("twitter")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DA1F2]">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Share01Icon} />
            </div>
            <span className="font-medium text-gray-900 text-xs">Twitter</span>
          </button>
          <button
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#ebe5d8] bg-white p-4 transition hover:border-[#4267B2] hover:bg-[#4267B2]/5 active:scale-95"
            onClick={() => handleShare("facebook")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4267B2]">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Share01Icon} />
            </div>
            <span className="font-medium text-gray-900 text-xs">Facebook</span>
          </button>
        </div>
      </div>

      {/* Fine Print */}
      <div className="mt-6 rounded-lg bg-[#fbf9f7] p-4">
        <p className="text-center text-gray-600 text-xs leading-relaxed">
          Credits expire after 1 year. Your friend must complete their first booking for you to earn
          rewards. Unlimited referrals allowed.
        </p>
      </div>
    </div>
  );
}
