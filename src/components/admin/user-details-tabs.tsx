/**
 * Admin User Details Tabs - Lia Design System
 *
 * Comprehensive tab-based UI for viewing professional and customer profiles
 * Features:
 * - Lazy loading per tab (data fetched only when tab is clicked)
 * - Role-aware content (Professional vs Customer views)
 * - Lia Design System compliant (Airbnb rounded corners, refined typography)
 * - Loading states with skeletons
 */

"use client";

import { Calendar03Icon, CreditCardIcon, Home09Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import from extracted modules
import type { BaseUser, TabData, TabId } from "./users/tabs";
import { ActivityTab, FinancesTab, OverviewTab, ReviewsTab } from "./users/tabs";

type Props = {
  user: BaseUser;
  defaultTab?: TabId;
};

/**
 * Main Tabs Component
 *
 * Features:
 * - Lazy loads data per tab (only fetches when tab is clicked)
 * - Caches fetched data to avoid redundant API calls
 * - Shows loading skeletons while data is being fetched
 * - Adapts content based on user role (professional vs customer)
 */
export function UserDetailsTabs({ user, defaultTab = "overview" }: Props) {
  const [_activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [tabData, setTabData] = useState<TabData>({});
  const [loadingTabs, setLoadingTabs] = useState<Set<TabId>>(new Set());

  // Lazy load tab data when tab is clicked
  const loadTabData = useCallback(
    async (tabId: TabId) => {
      // Skip if already loaded
      if (tabData[tabId]) {
        return;
      }

      // Skip if already loading
      if (loadingTabs.has(tabId)) {
        return;
      }

      // Mark as loading
      setLoadingTabs((prev) => new Set(prev).add(tabId));

      try {
        // Fetch data for this tab
        const response = await fetch(`/api/admin/users/${user.id}/${tabId}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${tabId} data`);
        }

        const data = await response.json();

        // Cache the data
        setTabData((prev) => ({
          ...prev,
          [tabId]: data,
        }));
      } catch (error) {
        console.error(`Error loading ${tabId} tab:`, error);
      } finally {
        // Remove from loading state
        setLoadingTabs((prev) => {
          const next = new Set(prev);
          next.delete(tabId);
          return next;
        });
      }
    },
    [user.id, tabData, loadingTabs]
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (value: string) => {
      const tabId = value as TabId;
      setActiveTab(tabId);
      loadTabData(tabId);
    },
    [loadTabData]
  );

  // Load default tab data on mount
  useState(() => {
    loadTabData(defaultTab);
  });

  return (
    <Tabs className="w-full" defaultValue={defaultTab} onValueChange={handleTabChange}>
      {/* Tab Navigation - Lia Design System */}
      <TabsList className="w-full justify-start border-neutral-200 border-b bg-white">
        <TabsTrigger className="gap-2" value="overview">
          <HugeiconsIcon className="h-4 w-4" icon={Home09Icon} />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger className="gap-2" value="activity">
          <HugeiconsIcon className="h-4 w-4" icon={Calendar03Icon} />
          <span>Activity</span>
        </TabsTrigger>
        <TabsTrigger className="gap-2" value="finances">
          <HugeiconsIcon className="h-4 w-4" icon={CreditCardIcon} />
          <span>Finances</span>
        </TabsTrigger>
        <TabsTrigger className="gap-2" value="reviews">
          <HugeiconsIcon className="h-4 w-4" icon={StarIcon} />
          <span>Reviews</span>
        </TabsTrigger>
      </TabsList>

      {/* Tab Content - Each tab loads its own data */}
      <TabsContent value="overview">
        <OverviewTab data={tabData.overview} user={user} />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityTab data={tabData.activity} user={user} />
      </TabsContent>

      <TabsContent value="finances">
        <FinancesTab data={tabData.finances} user={user} />
      </TabsContent>

      <TabsContent value="reviews">
        <ReviewsTab data={tabData.reviews} user={user} />
      </TabsContent>
    </Tabs>
  );
}
