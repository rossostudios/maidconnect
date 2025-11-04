# MaidConnect Mobile Design System

Complete guide to using the MaidConnect design system for consistent, accessible UI development.

## Overview

The MaidConnect design system provides:
- **Design Tokens**: Centralized colors, typography, spacing, and more
- **UI Components**: 7 reusable, accessible components
- **Consistent UX**: Standardized patterns across the app

---

## Design Tokens

Design tokens are defined in [`constants/design-tokens.ts`](../constants/design-tokens.ts).

### Colors

```typescript
import { colors, semanticColors } from '@/constants/design-tokens';

// ✅ Preferred: Use semantic colors
<View style={{ backgroundColor: semanticColors.background.primary }} />
<Text style={{ color: semanticColors.text.primary }} />

// ✅ Also valid: Use color scales
<View style={{ backgroundColor: colors.primary[500] }} />
<View style={{ backgroundColor: colors.neutral[100] }} />

// ❌ Avoid: Hardcoded colors
<View style={{ backgroundColor: '#FFFFFF' }} /> // Don't do this
```

**Semantic Color Categories:**
- `semanticColors.text.*` - Text colors (primary, secondary, tertiary, disabled, inverse)
- `semanticColors.background.*` - Background colors (primary, secondary, tertiary, elevated)
- `semanticColors.border.*` - Border colors (default, light, medium, dark)
- `semanticColors.interactive.*` - Interactive states (default, hover, pressed, disabled)
- `semanticColors.status.*` - Status indicators (success, error, warning, info + light variants)

**Color Scales:**
- `colors.primary[50-900]` - Brand blue
- `colors.neutral[0-900]` - Grays and blacks
- `colors.success[50-700]` - Green
- `colors.error[50-700]` - Red
- `colors.warning[50-700]` - Amber
- `colors.info[50-700]` - Light blue

### Typography

```typescript
import { typography } from '@/constants/design-tokens';

// Font sizes (6 standardized sizes)
typography.fontSize.xs    // 12px
typography.fontSize.sm    // 14px
typography.fontSize.base  // 16px
typography.fontSize.lg    // 20px
typography.fontSize.xl    // 24px
typography.fontSize.xxl   // 32px

// Font weights (use numeric values)
typography.fontWeight.regular   // "400"
typography.fontWeight.semibold  // "600"
typography.fontWeight.bold      // "700"

// Example usage
const styles = StyleSheet.create({
  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
  },
});
```

### Spacing

```typescript
import { spacing } from '@/constants/design-tokens';

// 8px grid system
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 12px
spacing.lg    // 16px
spacing.xl    // 20px
spacing.xxl   // 24px
spacing.xxxl  // 32px
spacing.xxxxl // 40px

// Example usage
const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,        // 16px
    marginBottom: spacing.xxl,  // 24px
  },
});
```

### Border Radius

```typescript
import { borderRadius } from '@/constants/design-tokens';

borderRadius.sm   // 8px
borderRadius.md   // 12px
borderRadius.lg   // 16px
borderRadius.xl   // 24px
borderRadius.full // 999px (for pills/circles)

// Example usage
const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,  // 12px
  },
  button: {
    borderRadius: borderRadius.md,  // 12px
  },
  chip: {
    borderRadius: borderRadius.full, // Fully rounded
  },
});
```

### Shadows

```typescript
import { shadows } from '@/constants/design-tokens';

// Pre-defined shadow elevations
shadows.none  // No shadow
shadows.sm    // Small shadow
shadows.md    // Medium shadow (cards)
shadows.lg    // Large shadow
shadows.xl    // Extra large shadow

// Example usage
const styles = StyleSheet.create({
  card: {
    ...shadows.md,  // Spreads all shadow properties
  },
});
```

---

## UI Components

All UI components are located in [`components/ui/`](../components/ui/) and can be imported as:

```typescript
import { Button, Card, Input, Badge, Chip, EmptyState, Modal } from '@/components/ui';
```

### Button

Reusable button with 5 variants, 3 sizes, loading states, and icons.

```typescript
import { Button } from '@/components/ui';

// Basic usage
<Button onPress={() => console.log('Pressed')}>
  Click Me
</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icons
<Button icon="add-circle-outline" iconPosition="left">
  Add Item
</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "outline" | "ghost" | "danger"
- `size`: "sm" | "md" | "lg"
- `loading`: boolean
- `disabled`: boolean
- `icon`: Ionicons name
- `iconPosition`: "left" | "right"
- `fullWidth`: boolean

### Card

Container component with consistent styling and optional press interaction.

```typescript
import { Card } from '@/components/ui';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Variants
<Card variant="elevated">Elevated (with shadow)</Card>
<Card variant="outlined">Outlined (with border)</Card>
<Card variant="flat">Flat (no shadow/border)</Card>

// Padding
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding (12px)</Card>
<Card padding="md">Medium padding (16px)</Card>
<Card padding="lg">Large padding (20px)</Card>

// Pressable card
<Card onPress={() => console.log('Card pressed')}>
  <Text>Tap me!</Text>
</Card>
```

**Props:**
- `variant`: "elevated" | "outlined" | "flat"
- `padding`: "none" | "sm" | "md" | "lg"
- `onPress`: Optional press handler (makes card pressable)

### Badge

Small label for status indicators, counts, and tags.

```typescript
import { Badge } from '@/components/ui';

// Basic usage
<Badge>New</Badge>

// Variants (semantic colors)
<Badge variant="success">Completed</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Draft</Badge>
<Badge variant="primary">Featured</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

**Props:**
- `variant`: "success" | "error" | "warning" | "info" | "neutral" | "primary"
- `size`: "sm" | "md" | "lg"

### Chip

Interactive chip for filters, tags, and selections.

```typescript
import { Chip } from '@/components/ui';

// Basic filter chip
<Chip
  selected={isSelected}
  onPress={() => setIsSelected(!isSelected)}
>
  Filter Option
</Chip>

// Variants
<Chip variant="outlined">Outlined</Chip>
<Chip variant="filled">Filled</Chip>

// With icon
<Chip icon="funnel-outline" selected={true}>
  Filters
</Chip>

// Dismissible chip
<Chip onRemove={() => console.log('Removed')}>
  Removable
</Chip>

// Disabled
<Chip disabled>Disabled</Chip>
```

**Props:**
- `variant`: "outlined" | "filled"
- `size`: "sm" | "md"
- `selected`: boolean (for filter chips)
- `icon`: Ionicons name
- `onRemove`: Function (shows remove icon)
- `disabled`: boolean

### Input

Text input with labels, validation, icons, and states.

```typescript
import { Input } from '@/components/ui';

// Basic input
<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
/>

// With validation
<Input
  label="Password"
  placeholder="Enter password"
  error={passwordError}
  required
  secureTextEntry
/>

// With icons
<Input
  label="Search"
  placeholder="Search..."
  leftIcon="search-outline"
/>

<Input
  label="Password"
  rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
  onRightIconPress={() => setShowPassword(!showPassword)}
  secureTextEntry={!showPassword}
/>

// With hint
<Input
  label="Username"
  hint="Choose a unique username"
/>

// Sizes
<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium" />
<Input size="lg" placeholder="Large" />

// Disabled
<Input label="Disabled" value="Cannot edit" editable={false} />
```

**Props:**
- `label`: string
- `error`: string (shows error message)
- `hint`: string (helper text)
- `size`: "sm" | "md" | "lg"
- `leftIcon`: Ionicons name
- `rightIcon`: Ionicons name
- `onRightIconPress`: Function
- `required`: boolean (shows * indicator)
- All TextInput props (placeholder, value, onChangeText, etc.)

### EmptyState

Standardized empty state with icon, title, description, and optional action.

```typescript
import { EmptyState } from '@/components/ui';

// Basic empty state
<EmptyState
  icon="document-text-outline"
  title="No Bookings Yet"
  description="Your bookings will appear here once you make one."
/>

// With action button
<EmptyState
  icon="calendar-outline"
  title="No Upcoming Appointments"
  description="Schedule your first cleaning service today."
  action={{
    label: "Browse Professionals",
    onPress: () => router.push('/professionals'),
    variant: "primary",
    icon: "add-outline",
  }}
/>

// Custom icon color
<EmptyState
  icon="heart-outline"
  iconColor={colors.error[500]}
  title="No Favorites"
  description="Add professionals to your favorites for quick access."
/>
```

**Props:**
- `icon`: Ionicons name (required)
- `iconColor`: string (default: semanticColors.text.tertiary)
- `title`: string (required)
- `description`: string
- `action`: Object with { label, onPress, variant?, icon? }
- `children`: ReactNode (custom content below description)

### Modal

Bottom sheet modal with consistent styling and scrolling support.

```typescript
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';

function MyComponent() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onPress={() => setVisible(true)}>Open Modal</Button>

      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title="Modal Title"
      >
        <Text>Modal content goes here</Text>
      </Modal>
    </>
  );
}

// Non-scrollable modal
<Modal
  visible={visible}
  onClose={onClose}
  title="Confirm Action"
  scrollable={false}
>
  <Text>Are you sure?</Text>
</Modal>

// With footer actions
<Modal
  visible={visible}
  onClose={onClose}
  title="Settings"
  footer={
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Button variant="secondary" onPress={onClose} style={{ flex: 1 }}>
        Cancel
      </Button>
      <Button variant="primary" onPress={handleSave} style={{ flex: 1 }}>
        Save
      </Button>
    </View>
  }
>
  <Text>Settings content</Text>
</Modal>
```

**Props:**
- `visible`: boolean (required)
- `onClose`: Function (required)
- `title`: string (required)
- `scrollable`: boolean (default: true)
- `footer`: ReactNode (optional footer content)
- All React Native Modal props

---

## Migration Guide

### Before: Hardcoded Values

```typescript
const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

// Usage
<Pressable style={styles.button} onPress={handlePress}>
  <Text style={styles.buttonText}>Submit</Text>
</Pressable>
```

### After: Design System

```typescript
import { Button } from '@/components/ui';

// Usage
<Button variant="primary" size="md" onPress={handlePress}>
  Submit
</Button>
```

**Benefits:**
- ✅ 90% less code
- ✅ Consistent styling automatically
- ✅ Built-in loading and disabled states
- ✅ Accessible by default
- ✅ TypeScript type safety

### Migrating Custom Components

**Step 1:** Replace hardcoded colors

```typescript
// Before
backgroundColor: "#FFFFFF"
color: "#0F172A"

// After
import { semanticColors } from '@/constants/design-tokens';
backgroundColor: semanticColors.background.primary
color: semanticColors.text.primary
```

**Step 2:** Replace hardcoded spacing

```typescript
// Before
padding: 16
marginBottom: 24

// After
import { spacing } from '@/constants/design-tokens';
padding: spacing.lg
marginBottom: spacing.xxl
```

**Step 3:** Replace hardcoded typography

```typescript
// Before
fontSize: 16
fontWeight: "600"

// After
import { typography } from '@/constants/design-tokens';
fontSize: typography.fontSize.base
fontWeight: typography.fontWeight.semibold
```

**Step 4:** Use UI components where possible

```typescript
// Before: Custom button
<Pressable style={styles.button}>
  {loading ? <ActivityIndicator /> : <Text style={styles.text}>Save</Text>}
</Pressable>

// After: Button component
<Button loading={loading} onPress={handleSave}>Save</Button>
```

---

## Best Practices

### 1. Always Use Design Tokens

```typescript
// ❌ Bad
<View style={{ padding: 16, backgroundColor: '#F8FAFC' }} />

// ✅ Good
import { spacing, semanticColors } from '@/constants/design-tokens';
<View style={{ padding: spacing.lg, backgroundColor: semanticColors.background.secondary }} />
```

### 2. Prefer UI Components Over Custom Implementations

```typescript
// ❌ Bad - Reinventing the wheel
<Pressable style={customButtonStyles}>
  <Text>Click Me</Text>
</Pressable>

// ✅ Good - Using design system
import { Button } from '@/components/ui';
<Button>Click Me</Button>
```

### 3. Use Semantic Colors for Meaning

```typescript
// ❌ Bad - Using color scales without context
<Text style={{ color: colors.primary[500] }}>Success!</Text>

// ✅ Good - Using semantic colors
<Text style={{ color: semanticColors.status.success }}>Success!</Text>
```

### 4. Keep Consistent Spacing

```typescript
// ❌ Bad - Random spacing values
<View style={{ padding: 17, marginBottom: 23 }} />

// ✅ Good - 8px grid system
<View style={{ padding: spacing.lg, marginBottom: spacing.xxl }} />
```

### 5. Maintain Accessible Contrast

The design system's semantic colors are already optimized for WCAG AA contrast ratios. Always use them for text and backgrounds.

```typescript
// ✅ Good - Guaranteed contrast
<Text style={{ color: semanticColors.text.primary }}>
  Readable text
</Text>

// ⚠️ Check contrast if using custom combinations
<Text style={{ color: colors.primary[300] }}>
  May not be readable on light backgrounds
</Text>
```

---

## Quick Reference

### Import Cheat Sheet

```typescript
// Design tokens
import {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows
} from '@/constants/design-tokens';

// UI components
import {
  Button,
  Card,
  Input,
  Badge,
  Chip,
  EmptyState,
  Modal
} from '@/components/ui';

// Or import individually
import { Button } from '@/components/ui/button';
```

### Common Patterns

#### Filter Chips Row
```typescript
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
    {filters.map((filter) => (
      <Chip
        key={filter.id}
        selected={selectedFilter === filter.id}
        onPress={() => setSelectedFilter(filter.id)}
      >
        {filter.label}
      </Chip>
    ))}
  </View>
</ScrollView>
```

#### Form with Validation
```typescript
<View style={{ gap: spacing.lg }}>
  <Input
    label="Email"
    placeholder="you@example.com"
    value={email}
    onChangeText={setEmail}
    error={emailError}
    required
    leftIcon="mail-outline"
  />

  <Input
    label="Password"
    placeholder="Enter password"
    value={password}
    onChangeText={setPassword}
    error={passwordError}
    required
    secureTextEntry={!showPassword}
    rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
    onRightIconPress={() => setShowPassword(!showPassword)}
  />

  <Button loading={isSubmitting} fullWidth onPress={handleSubmit}>
    Submit
  </Button>
</View>
```

#### Status Badges
```typescript
const statusVariant = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  draft: 'neutral',
} as const;

<Badge variant={statusVariant[booking.status]}>
  {booking.status}
</Badge>
```

---

## Need Help?

- **Documentation**: This file
- **Component Props**: See TypeScript definitions in [`components/ui/`](../components/ui/)
- **Design Tokens**: See [`constants/design-tokens.ts`](../constants/design-tokens.ts)
- **Examples**: See refactored [`components/bookings/reschedule-modal.tsx`](../components/bookings/reschedule-modal.tsx)

---

*Last updated: November 2025*
