/**
 * UI Component Library - Barrel Exports
 *
 * Central export point for all Lia Design System primitives.
 * Import components using: `import { Button, Card, Input } from '@/components/ui'`
 *
 * @see docs/lia/primitives.md for component documentation
 */

// ============================================================================
// CORE FORM PRIMITIVES
// ============================================================================

export type { ButtonProps } from "./button";
export { Button, buttonVariants } from "./button";
export { Checkbox } from "./checkbox";
export { Input } from "./input";

export { Label } from "./label";
export { RadioGroup, RadioGroupItem } from "./radio-group";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
export { Textarea } from "./textarea";

// ============================================================================
// LAYOUT & CONTAINERS
// ============================================================================

export type { CardVariant } from "./card";
export { Card, CardContent, CardFooter, CardHeader, CardImage, cardVariants } from "./card";

export { Container } from "./container";
export { GridField } from "./grid-field";
export { LiaGrid, LiaGrid10, LiaGrid12, LiaGrid13, LiaGridResponsive } from "./lia-grid";

export { Separator } from "./separator";

// ============================================================================
// NAVIGATION & INTERACTION
// ============================================================================

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export { SkipLink, SkipLinks } from "./skip-link";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

// ============================================================================
// FEEDBACK & STATUS
// ============================================================================

export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export { Backdrop } from "./backdrop";
export type { BadgeProps } from "./badge";
export { Badge, badgeVariants } from "./badge";
export { LoadingCamper } from "./loading-camper";
export {
  CalendarSkeleton,
  CardSkeleton,
  ChartSkeleton,
  ConversationSkeleton,
  DashboardSectionSkeleton,
  FormSkeleton,
  ListSkeleton,
  ProfileCardSkeleton,
  Skeleton,
  StatCardSkeleton,
  TableSkeleton,
} from "./skeleton";

// ============================================================================
// DATA DISPLAY
// ============================================================================

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
export { DataCard } from "./data-card";
export { DataTableEnhanced } from "./data-table-enhanced";
export { PremiumStatCard } from "./premium-stat-card";
export { StatCard } from "./stat-card";
export { StatusCard } from "./status-card";

// ============================================================================
// DATE & TIME
// ============================================================================

export { DatePicker } from "./date-picker";

export { TimePicker } from "./time-picker";

// ============================================================================
// ANIMATION & EFFECTS
// ============================================================================

export { AnimatedCounter } from "./animated-counter";

export { AnimatedMarquee } from "./animated-marquee";

export { WavyDivider } from "./wavy-divider";

// ============================================================================
// MARKETING & LANDING PAGES
// ============================================================================

export { BenefitCard } from "./benefit-card";
export { CheckmarkList } from "./checkmark-list";
export { ComparisonTable } from "./comparison-table";
export { FeatureSection } from "./feature-section";
export { HeroSearchBar } from "./hero-search-bar";

export { SectionHeader } from "./section-header";
export { TwoColumnFeature } from "./two-column-feature";

// ============================================================================
// UTILITIES
// ============================================================================

export { Kbd } from "./kbd";

// ============================================================================
// MINIMAL VARIANTS (Legacy)
// ============================================================================

export { MinimalButton } from "./minimal-button";

export { MinimalInput } from "./minimal-input";
