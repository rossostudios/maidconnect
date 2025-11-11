# Component & Storybook Template Guide

## 🎯 CRITICAL RULES

1. **NEVER change component names** - Keep existing exports exactly the same
2. **Use ONLY Shadcn UI components** from `@/components/ui`
3. **Neutral colors ONLY** - slate/gray/neutral from Tailwind (no brand colors)
4. **Every component MUST have a Storybook story**
5. **Use Tailwind CSS 4.1 syntax**
6. **Follow Shadcn patterns**: cva for variants, cn() utility

## 📦 Component Template

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Define variants using cva
const componentVariants = cva(
  "base-classes", // base classes
  {
    variants: {
      variant: {
        default: "neutral classes",
        secondary: "more neutral classes",
      },
      size: {
        default: "h-10",
        sm: "h-8",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Props interface
interface YourComponentProps extends VariantProps<typeof componentVariants> {
  className?: string;
  children?: React.ReactNode;
  // ... other props
}

// Component (KEEP ORIGINAL NAME)
export function YourComponent({
  variant,
  size,
  className,
  children,
  ...props
}: YourComponentProps) {
  return (
    <div className={cn(componentVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}
```

## 📖 Storybook Story Template

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { YourComponent } from "./your-component";

const meta = {
  title: "ComponentCategory/YourComponent",
  component: YourComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: "Component content",
  },
};

// Variant stories
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary variant",
  },
};

// Size stories
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small size",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large size",
  },
};
```

## 🎨 Color Guidelines

### ✅ USE (Neutral colors)
- `bg-slate-50` through `bg-slate-950`
- `text-slate-600`, `text-slate-700`, `text-slate-900`
- `border-slate-200`, `border-slate-300`
- `bg-gray-*`, `bg-neutral-*`
- `ring-slate-200`

### ❌ AVOID (Brand colors)
- No `bg-primary`, `bg-blue-*`, `bg-purple-*`
- No `text-primary`, `text-blue-*`
- No hardcoded brand colors
- No custom color classes

## 📦 Shadcn Components Available

Use these from `@/components/ui`:
- accordion, alert-dialog, aspect-ratio, avatar
- badge, breadcrumb, button, calendar, card, checkbox
- collapsible, command, context-menu, data-table, dialog
- dropdown-menu, form, hover-card, input, label
- menubar, navigation-menu, pagination, popover, progress
- radio-group, resizable, scroll-area, select, separator
- sheet, skeleton, slider, sonner, switch
- table, tabs, textarea, tooltip

## 🎯 Story Categories

Organize by feature area:
- `Admin/*` - Admin dashboard components
- `Bookings/*` - Booking-related components
- `Professionals/*` - Professional profile components
- `Navigation/*` - Navigation & layout components
- `Dashboard/*` - Dashboard components
- `Sections/*` - Marketing sections
- `UI/*` - Base UI components
- etc.

## ✅ Checklist

For each component:
- [ ] Uses only Shadcn UI components
- [ ] Neutral colors only (slate/gray/neutral)
- [ ] Component name unchanged
- [ ] All props and exports maintained
- [ ] Uses cva for variants
- [ ] Uses cn() utility for className merging
- [ ] Has complete Storybook story
- [ ] Story demonstrates all variants
- [ ] Story has interactive controls
- [ ] TypeScript types are correct
