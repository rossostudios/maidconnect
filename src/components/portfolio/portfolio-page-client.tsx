"use client";

/**
 * PortfolioPageClient - Three-Tab Portfolio Management
 *
 * Airbnb host dashboard-style portfolio page with tabbed navigation.
 * Professionals can manage their work samples, credentials, and trust profile.
 *
 * Tabs:
 * - Work Samples: Photo gallery of completed work
 * - Credentials: Certifications, licenses, training
 * - Trust Profile: Background checks, reviews, verification badges
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import { Camera02Icon, Certificate01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { PortfolioImage } from "@/app/api/professional/portfolio/route";
import { geistSans } from "@/app/fonts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/core";
import { type Credential, CredentialsManager } from "./credentials-manager";
import { PortfolioManager } from "./portfolio-manager";
import { type TrustProfileData, TrustProfileSection } from "./trust-profile-section";

// ============================================================================
// Types
// ============================================================================

export type PortfolioPageClientProps = {
  /** Portfolio images */
  images: PortfolioImage[];
  /** Featured work description */
  featuredWork?: string;
  /** Professional's credentials */
  credentials?: Credential[];
  /** Trust profile data */
  trustProfile?: TrustProfileData;
  /** Professional ID */
  professionalId: string;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Tab Configuration
// ============================================================================

const TABS = [
  {
    id: "work-samples",
    labelKey: "tabs.workSamples",
    icon: Camera02Icon,
  },
  {
    id: "credentials",
    labelKey: "tabs.credentials",
    icon: Certificate01Icon,
  },
  {
    id: "trust-profile",
    labelKey: "tabs.trustProfile",
    icon: SecurityCheckIcon,
  },
] as const;

// ============================================================================
// Main Component
// ============================================================================

export function PortfolioPageClient({
  images,
  featuredWork = "",
  credentials = [],
  trustProfile,
  professionalId,
  className,
}: PortfolioPageClientProps) {
  const t = useTranslations("dashboard.pro.portfolio");
  const [activeTab, setActiveTab] = useState<string>("work-samples");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <Tabs defaultValue="work-samples" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3 gap-1 bg-neutral-100 p-1 dark:bg-neutral-800">
          {TABS.map((tab) => (
            <TabsTrigger
              className={cn(
                "flex items-center justify-center gap-2 py-3",
                "data-[selected]:bg-white data-[selected]:shadow-sm dark:data-[selected]:bg-neutral-900",
                geistSans.className
              )}
              key={tab.id}
              value={tab.id}
            >
              <HugeiconsIcon
                className={cn(
                  "h-4 w-4",
                  activeTab === tab.id
                    ? "text-rausch-500"
                    : "text-neutral-500 dark:text-neutral-400"
                )}
                icon={tab.icon}
              />
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Work Samples Tab */}
        <TabsContent value="work-samples">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <PortfolioManager featuredWork={featuredWork} images={images} />
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <CredentialsManager credentials={credentials} professionalId={professionalId} />
          </div>
        </TabsContent>

        {/* Trust Profile Tab */}
        <TabsContent value="trust-profile">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <TrustProfileSection professionalId={professionalId} trustProfile={trustProfile} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Portfolio Stats Summary (for dashboard overview)
// ============================================================================

export type PortfolioStatsSummaryProps = {
  imageCount: number;
  credentialCount: number;
  verifiedCredentials: number;
  trustScore?: number;
  hasBackgroundCheck: boolean;
  onClick?: () => void;
  className?: string;
};

export function PortfolioStatsSummary({
  imageCount,
  credentialCount,
  verifiedCredentials,
  trustScore,
  hasBackgroundCheck,
  onClick,
  className,
}: PortfolioStatsSummaryProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-left transition-all",
        "hover:border-rausch-200 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        "dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-rausch-400",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rausch-50 dark:bg-rausch-500/10">
          <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={Camera02Icon} />
        </div>
        <div>
          <p className={cn("font-semibold text-foreground", geistSans.className)}>Portfolio</p>
          <p className="text-muted-foreground text-sm">
            {imageCount} photos • {verifiedCredentials}/{credentialCount} credentials verified
          </p>
        </div>
      </div>
      <div className="text-right">
        {hasBackgroundCheck ? (
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon className="h-4 w-4 text-green-500" icon={SecurityCheckIcon} />
            <span
              className={cn(
                "font-medium text-green-600 text-sm dark:text-green-400",
                geistSans.className
              )}
            >
              Verified
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Not verified</span>
        )}
        {trustScore !== undefined && (
          <p className="mt-0.5 text-muted-foreground text-xs">Trust Score: {trustScore}%</p>
        )}
      </div>
    </button>
  );
}
