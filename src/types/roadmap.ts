/**
 * Roadmap System Types
 *
 * Type definitions for the product roadmap with voting and comments
 */

// =============================================
// Roadmap Item Types
// =============================================

export type RoadmapStatus = "under_consideration" | "planned" | "in_progress" | "shipped";

export type RoadmapCategory = "features" | "infrastructure" | "ui_ux" | "security" | "integrations";

export type RoadmapPriority = "low" | "medium" | "high";

export type RoadmapVisibility = "draft" | "published" | "archived";

export type RoadmapAudience = "all" | "customer" | "professional";

export interface RoadmapItem {
  id: string;
  title: string;
  slug: string;
  description: string; // Rich HTML content
  status: RoadmapStatus;
  category: RoadmapCategory;
  priority: RoadmapPriority;
  target_quarter: string | null; // e.g., 'Q1 2025'
  visibility: RoadmapVisibility;
  target_audience: RoadmapAudience[];
  vote_count: number;
  comment_count: number;
  tags: string[];
  featured_image_url: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  changelog_id: string | null;
  published_at: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
}

// For create/update operations
export interface RoadmapItemInput {
  title: string;
  slug?: string; // Auto-generated from title if not provided
  description: string;
  status: RoadmapStatus;
  category: RoadmapCategory;
  priority?: RoadmapPriority;
  target_quarter?: string | null;
  visibility?: RoadmapVisibility;
  target_audience?: RoadmapAudience[];
  tags?: string[];
  featured_image_url?: string | null;
  metadata?: Record<string, unknown>;
}

// For API responses with user interaction data
export interface RoadmapItemWithVoteStatus extends RoadmapItem {
  hasVoted?: boolean; // Whether current user has voted
  canVote?: boolean; // Whether user can vote (authenticated)
}

// =============================================
// Roadmap Vote Types
// =============================================

export interface RoadmapVote {
  id: string;
  user_id: string;
  roadmap_item_id: string;
  created_at: string;
}

export interface VoteToggleRequest {
  roadmap_item_id: string;
}

export interface VoteToggleResponse {
  success: boolean;
  action: "added" | "removed";
  vote_count: number;
  has_voted: boolean;
}

// =============================================
// Roadmap Comment Types
// =============================================

export interface RoadmapComment {
  id: string;
  roadmap_item_id: string;
  user_id: string;
  comment: string;
  is_approved: boolean;
  is_from_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Comment with user profile data
export interface RoadmapCommentWithUser extends RoadmapComment {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface RoadmapCommentInput {
  roadmap_item_id: string;
  comment: string;
}

// =============================================
// Filter and Query Types
// =============================================

export interface RoadmapFilters {
  status?: RoadmapStatus | RoadmapStatus[];
  category?: RoadmapCategory | RoadmapCategory[];
  target_audience?: RoadmapAudience;
  search?: string;
  tags?: string[];
}

export interface RoadmapListParams extends RoadmapFilters {
  page?: number;
  limit?: number;
  sort_by?: "vote_count" | "created_at" | "updated_at" | "title";
  sort_order?: "asc" | "desc";
}

// =============================================
// API Response Types
// =============================================

export interface RoadmapListResponse {
  success: boolean;
  data: RoadmapItemWithVoteStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface RoadmapDetailResponse {
  success: boolean;
  data: RoadmapItemWithVoteStatus;
  comments?: RoadmapCommentWithUser[];
}

export interface RoadmapStatsResponse {
  success: boolean;
  stats: {
    total_items: number;
    by_status: Record<RoadmapStatus, number>;
    by_category: Record<RoadmapCategory, number>;
    total_votes: number;
    total_comments: number;
  };
}

// =============================================
// Admin Types
// =============================================

export interface RoadmapAdminListParams {
  page?: number;
  limit?: number;
  visibility?: RoadmapVisibility;
  status?: RoadmapStatus;
  category?: RoadmapCategory;
  search?: string;
}

export interface RoadmapAdminStats {
  draft_count: number;
  published_count: number;
  archived_count: number;
  total_votes: number;
  total_comments: number;
  pending_comments: number; // Not approved
}

// =============================================
// UI Component Types
// =============================================

export interface RoadmapStatusConfig {
  status: RoadmapStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string; // Icon component name or emoji
  description: string;
}

export interface RoadmapCategoryConfig {
  category: RoadmapCategory;
  label: string;
  icon: string; // Icon component name or emoji
  color: string;
  description: string;
}

export const ROADMAP_STATUS_CONFIG: Record<RoadmapStatus, RoadmapStatusConfig> = {
  under_consideration: {
    status: "under_consideration",
    label: "Under Consideration",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    icon: "💡",
    description: "We're evaluating this idea",
  },
  planned: {
    status: "planned",
    label: "Planned",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    icon: "📅",
    description: "Scheduled for development",
  },
  in_progress: {
    status: "in_progress",
    label: "In Progress",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    icon: "🚀",
    description: "Currently being built",
  },
  shipped: {
    status: "shipped",
    label: "Shipped",
    color: "#10B981",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    icon: "✅",
    description: "Live and available",
  },
};

export const ROADMAP_CATEGORY_CONFIG: Record<RoadmapCategory, RoadmapCategoryConfig> = {
  features: {
    category: "features",
    label: "Features",
    icon: "✨",
    color: "#8B5CF6",
    description: "New capabilities and functionality",
  },
  infrastructure: {
    category: "infrastructure",
    label: "Infrastructure",
    icon: "🏗️",
    color: "#64748B",
    description: "Backend improvements and scalability",
  },
  ui_ux: {
    category: "ui_ux",
    label: "UI/UX",
    icon: "🎨",
    color: "#EC4899",
    description: "User interface and experience enhancements",
  },
  security: {
    category: "security",
    label: "Security",
    icon: "🔒",
    color: "#EF4444",
    description: "Security and privacy improvements",
  },
  integrations: {
    category: "integrations",
    label: "Integrations",
    icon: "🔌",
    color: "#06B6D4",
    description: "Third-party integrations and APIs",
  },
};

// =============================================
// Validation Schemas (Zod-compatible shapes)
// =============================================

export interface RoadmapItemValidation {
  title: { min: number; max: number };
  slug: { min: number; max: number; pattern: RegExp };
  description: { min: number; max: number };
  target_quarter: { pattern: RegExp }; // e.g., Q1 2025, Q2 2025
  tags: { max_items: number; max_length: number };
}

export const ROADMAP_VALIDATION: RoadmapItemValidation = {
  title: { min: 3, max: 200 },
  slug: { min: 3, max: 200, pattern: /^[a-z0-9-]+$/ },
  description: { min: 10, max: 10000 },
  target_quarter: { pattern: /^Q[1-4] \d{4}$/ },
  tags: { max_items: 10, max_length: 50 },
};

// =============================================
// Helper Functions
// =============================================

/**
 * Generate slug from title
 */
export function generateRoadmapSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Get status config by status value
 */
export function getStatusConfig(status: RoadmapStatus): RoadmapStatusConfig {
  return ROADMAP_STATUS_CONFIG[status];
}

/**
 * Get category config by category value
 */
export function getCategoryConfig(category: RoadmapCategory): RoadmapCategoryConfig {
  return ROADMAP_CATEGORY_CONFIG[category];
}

/**
 * Check if user can edit roadmap item (admin only)
 */
export function canEditRoadmapItem(userRole?: string): boolean {
  return userRole === "admin";
}

/**
 * Check if roadmap item can be voted on
 */
export function canVoteOnItem(item: RoadmapItem): boolean {
  return item.visibility === "published" && item.status !== "shipped";
}

/**
 * Format target quarter for display
 */
export function formatTargetQuarter(quarter: string | null): string {
  if (!quarter) return "TBD";
  return quarter;
}

/**
 * Get status order for sorting
 */
export function getStatusOrder(status: RoadmapStatus): number {
  const order: Record<RoadmapStatus, number> = {
    in_progress: 1,
    planned: 2,
    under_consideration: 3,
    shipped: 4,
  };
  return order[status] || 99;
}

/**
 * Get priority order for sorting
 */
export function getPriorityOrder(priority: RoadmapPriority): number {
  const order: Record<RoadmapPriority, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };
  return order[priority] || 99;
}
