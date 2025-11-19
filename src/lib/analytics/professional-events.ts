/**
 * Professional Analytics Event Tracking
 *
 * Type-safe PostHog event tracking for professional features:
 * - Digital CV / Profile Sharing
 * - Earnings Badge System
 * - Instant Payout System
 */

// ========================================
// Event Types
// ========================================

/**
 * Social sharing platforms
 */
export type SharePlatform = "whatsapp" | "facebook" | "twitter" | "linkedin" | "copy_link" | "native";

/**
 * Payout status types
 */
export type PayoutStatus = "requested" | "processing" | "completed" | "failed";

/**
 * Payout types
 */
export type PayoutType = "instant" | "batch";

// ========================================
// Profile Sharing Events
// ========================================

/**
 * Track when a professional makes their profile public
 */
export function trackProfileMadePublic(props: {
	professionalId: string;
	slug: string;
	hasEarningsBadge: boolean;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("profile_made_public", {
		professional_id: props.professionalId,
		slug: props.slug,
		has_earnings_badge: props.hasEarningsBadge,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when a professional updates their vanity URL slug
 */
export function trackSlugUpdated(props: {
	professionalId: string;
	oldSlug: string | null;
	newSlug: string;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("slug_updated", {
		professional_id: props.professionalId,
		old_slug: props.oldSlug,
		new_slug: props.newSlug,
		is_first_slug: !props.oldSlug,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when a social share button is clicked
 */
export function trackSocialShareClicked(props: {
	professionalId: string;
	platform: SharePlatform;
	profileUrl: string;
	hasEarningsBadge: boolean;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("social_share_clicked", {
		professional_id: props.professionalId,
		platform: props.platform,
		profile_url: props.profileUrl,
		has_earnings_badge: props.hasEarningsBadge,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when a vanity URL is accessed (viewed)
 */
export function trackVanityUrlViewed(props: {
	professionalId: string;
	slug: string;
	referrer?: string;
	userAgent?: string;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("vanity_url_viewed", {
		professional_id: props.professionalId,
		slug: props.slug,
		referrer: props.referrer,
		user_agent: props.userAgent,
		timestamp: new Date().toISOString(),
	});
}

// ========================================
// Earnings Badge Events
// ========================================

/**
 * Track when earnings badge is enabled
 */
export function trackEarningsBadgeEnabled(props: {
	professionalId: string;
	totalBookings: number;
	totalEarningsCOP: number;
	tier: string;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("earnings_badge_enabled", {
		professional_id: props.professionalId,
		total_bookings: props.totalBookings,
		total_earnings_cop: props.totalEarningsCOP,
		badge_tier: props.tier,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when earnings badge is disabled
 */
export function trackEarningsBadgeDisabled(props: {
	professionalId: string;
	totalBookings: number;
	totalEarningsCOP: number;
	tier: string;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("earnings_badge_disabled", {
		professional_id: props.professionalId,
		total_bookings: props.totalBookings,
		total_earnings_cop: props.totalEarningsCOP,
		badge_tier: props.tier,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when earnings badge is viewed on public profile
 */
export function trackEarningsBadgeViewed(props: {
	professionalId: string;
	tier: string;
	totalBookings: number;
	viewerType: "guest" | "customer" | "professional";
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("earnings_badge_viewed", {
		professional_id: props.professionalId,
		badge_tier: props.tier,
		total_bookings: props.totalBookings,
		viewer_type: props.viewerType,
		timestamp: new Date().toISOString(),
	});
}

// ========================================
// Instant Payout Events
// ========================================

/**
 * Track when instant payout is requested
 */
export function trackInstantPayoutRequested(props: {
	professionalId: string;
	amountCOP: number;
	feeAmountCOP: number;
	feePercentage: number;
	availableBalanceCOP: number;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("instant_payout_requested", {
		professional_id: props.professionalId,
		amount_cop: props.amountCOP,
		fee_amount_cop: props.feeAmountCOP,
		fee_percentage: props.feePercentage,
		available_balance_cop: props.availableBalanceCOP,
		net_amount_cop: props.amountCOP - props.feeAmountCOP,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when instant payout is completed
 */
export function trackInstantPayoutCompleted(props: {
	professionalId: string;
	amountCOP: number;
	feeAmountCOP: number;
	payoutId: string;
	processingTimeMs?: number;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("instant_payout_completed", {
		professional_id: props.professionalId,
		amount_cop: props.amountCOP,
		fee_amount_cop: props.feeAmountCOP,
		payout_id: props.payoutId,
		processing_time_ms: props.processingTimeMs,
		net_amount_cop: props.amountCOP - props.feeAmountCOP,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when instant payout fails
 */
export function trackInstantPayoutFailed(props: {
	professionalId: string;
	amountCOP: number;
	feeAmountCOP: number;
	errorCode?: string;
	errorMessage?: string;
	payoutId?: string;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("instant_payout_failed", {
		professional_id: props.professionalId,
		amount_cop: props.amountCOP,
		fee_amount_cop: props.feeAmountCOP,
		error_code: props.errorCode,
		error_message: props.errorMessage,
		payout_id: props.payoutId,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when instant payout modal is opened
 */
export function trackInstantPayoutModalOpened(props: {
	professionalId: string;
	availableBalanceCOP: number;
	pendingBalanceCOP: number;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("instant_payout_modal_opened", {
		professional_id: props.professionalId,
		available_balance_cop: props.availableBalanceCOP,
		pending_balance_cop: props.pendingBalanceCOP,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Track when bank account is added/updated for payouts
 */
export function trackBankAccountAdded(props: {
	professionalId: string;
	bankName: string;
	accountType: "checking" | "savings";
	isFirstAccount: boolean;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("bank_account_added", {
		professional_id: props.professionalId,
		bank_name: props.bankName,
		account_type: props.accountType,
		is_first_account: props.isFirstAccount,
		timestamp: new Date().toISOString(),
	});
}

// ========================================
// Payout History Events
// ========================================

/**
 * Track when payout history is filtered
 */
export function trackPayoutHistoryFiltered(props: {
	professionalId: string;
	payoutTypeFilter: "all" | "instant" | "batch";
	statusFilter: "all" | "completed" | "pending" | "processing" | "failed";
	resultCount: number;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("payout_history_filtered", {
		professional_id: props.professionalId,
		payout_type_filter: props.payoutTypeFilter,
		status_filter: props.statusFilter,
		result_count: props.resultCount,
		timestamp: new Date().toISOString(),
	});
}

// ========================================
// Finance Dashboard Events
// ========================================

/**
 * Track when finances dashboard is viewed
 */
export function trackFinancesDashboardViewed(props: {
	professionalId: string;
	totalBalanceCOP: number;
	availableBalanceCOP: number;
	pendingBalanceCOP: number;
	hasBankAccount: boolean;
}) {
	if (typeof window === "undefined" || !(window as any).posthog) {
		return;
	}

	(window as any).posthog.capture("finances_dashboard_viewed", {
		professional_id: props.professionalId,
		total_balance_cop: props.totalBalanceCOP,
		available_balance_cop: props.availableBalanceCOP,
		pending_balance_cop: props.pendingBalanceCOP,
		has_bank_account: props.hasBankAccount,
		timestamp: new Date().toISOString(),
	});
}
