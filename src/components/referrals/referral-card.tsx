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
    <div className="rounded-lg border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <HugeiconsIcon className="h-6 w-6 text-rausch-500" icon={GiftIcon} />
            <h2 className="font-bold text-2xl text-neutral-900 leading-none">Your Referral Code</h2>
          </div>
          <p className="text-neutral-500 text-sm leading-none">
            Share with friends and you both earn rewards
          </p>
        </div>
        <HugeiconsIcon className="h-8 w-8 text-rausch-500" icon={MagicWand01Icon} />
      </div>

      {/* Referral Code Display */}
      <div className="mb-6 rounded-lg border-2 border-rausch-500 border-dashed bg-rausch-50/50 p-6">
        <div className="mb-2 text-center text-neutral-500 text-xs uppercase tracking-wider">
          Your Code
        </div>
        <div className="mb-4 text-center font-bold text-4xl text-neutral-900 tracking-wider">
          {code}
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rausch-500 px-4 py-3 font-semibold text-sm text-white transition hover:bg-rausch-600 active:scale-[0.98] disabled:opacity-50"
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
      <div className="mb-6 rounded-lg bg-neutral-100 p-5">
        <h3 className="mb-3 font-semibold text-neutral-900 text-sm">How it works:</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-rausch-500 text-white text-xs">
              1
            </div>
            <p className="text-neutral-700 text-sm">
              <span className="font-semibold text-neutral-900">Share your code</span> with friends
              via WhatsApp, social media, or email
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-rausch-500 text-white text-xs">
              2
            </div>
            <p className="text-neutral-700 text-sm">
              <span className="font-semibold text-neutral-900">
                They get {formatCOP(refereeReward / 100)}
              </span>{" "}
              off their first booking
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-rausch-500 text-white text-xs">
              3
            </div>
            <p className="text-neutral-700 text-sm">
              <span className="font-semibold text-neutral-900">
                You earn {formatCOP(referrerReward / 100)}
              </span>{" "}
              in credits when they complete their first booking
            </p>
          </li>
        </ul>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-neutral-500 text-xs leading-none">
            <HugeiconsIcon className="h-4 w-4" icon={UserGroupIcon} />
            People Referred
          </div>
          <div className="mt-1 font-bold text-2xl text-neutral-900 leading-none">{usesCount}</div>
        </div>
        <div className="rounded-lg bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-neutral-500 text-xs leading-none">
            <HugeiconsIcon className="h-4 w-4" icon={GiftIcon} />
            Credits Earned
          </div>
          <div className="mt-1 font-bold text-2xl text-neutral-900 leading-none">
            {formatCOP(totalCreditsEarned / 100)}
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div>
        <div className="mb-3 text-center text-neutral-500 text-xs uppercase tracking-wider">
          Share via
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition hover:border-rausch-500 hover:bg-rausch-50 active:scale-95"
            onClick={() => handleShare("whatsapp")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Share01Icon} />
            </div>
            <span className="font-medium text-neutral-900 text-xs">WhatsApp</span>
          </button>
          <button
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition hover:border-rausch-500 hover:bg-rausch-50 active:scale-95"
            onClick={() => handleShare("twitter")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-babu-500">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Share01Icon} />
            </div>
            <span className="font-medium text-neutral-900 text-xs">Twitter</span>
          </button>
          <button
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition hover:border-rausch-500 hover:bg-rausch-50 active:scale-95"
            onClick={() => handleShare("facebook")}
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-babu-600">
              <HugeiconsIcon className="h-5 w-5 text-white" icon={Share01Icon} />
            </div>
            <span className="font-medium text-neutral-900 text-xs">Facebook</span>
          </button>
        </div>
      </div>

      {/* Fine Print */}
      <div className="mt-6 rounded-lg bg-neutral-50 p-4">
        <p className="text-center text-neutral-500 text-xs leading-relaxed">
          Credits expire after 1 year. Your friend must complete their first booking for you to earn
          rewards. Unlimited referrals allowed.
        </p>
      </div>
    </div>
  );
}
