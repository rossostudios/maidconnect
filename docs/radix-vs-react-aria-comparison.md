# Radix UI vs React Aria - Side-by-Side Comparison

Quick visual comparison guide for developers migrating components.

## Dialog / Modal

### Radix UI
```tsx
import * as Dialog from "@radix-ui/react-dialog";

function MyDialog() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button>Open Dialog</button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 ...">
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>Dialog description</Dialog.Description>
          
          <div>Content here</div>
          
          <Dialog.Close asChild>
            <button>Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### React Aria Components
```tsx
import { DialogTrigger, Modal, Dialog, Heading, Button } from 'react-aria-components';

function MyDialog() {
  return (
    <DialogTrigger>
      <Button>Open Dialog</Button>
      
      <Modal className="fixed inset-0 bg-black/50">
        <Dialog className="fixed top-1/2 left-1/2 ...">
          {({ close }) => (
            <>
              <Heading slot="title">Dialog Title</Heading>
              <p slot="description">Dialog description</p>
              
              <div>Content here</div>
              
              <Button onPress={close}>Close</Button>
            </>
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
```

**Key Differences:**
- React Aria uses `DialogTrigger` wrapper vs `Dialog.Trigger`
- Modal overlay is a separate `Modal` component
- Close function passed via render props: `{({ close }) => ...}`
- Uses `slot` prop for semantic sections
- Uses `onPress` instead of `onClick`

---

## Checkbox

### Radix UI
```tsx
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

function MyCheckbox({ checked, onCheckedChange }) {
  return (
    <Checkbox.Root 
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="h-4 w-4 rounded border"
    >
      <Checkbox.Indicator>
        <Check className="h-4 w-4" />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}
```

### React Aria Components
```tsx
import { Checkbox } from 'react-aria-components';
import { Check } from "lucide-react";

function MyCheckbox({ isSelected, onChange }) {
  return (
    <Checkbox 
      isSelected={isSelected}
      onChange={onChange}
      className="group"
    >
      <div className="h-4 w-4 rounded border">
        <Check className="h-4 w-4 hidden group-selected:block" />
      </div>
    </Checkbox>
  );
}
```

**Key Differences:**
- `checked` → `isSelected`
- `onCheckedChange` → `onChange`
- No separate `Indicator` component
- Use `group-selected:` Tailwind modifier for checked state
- Simpler structure, single component

---

## Radio Group

### Radix UI
```tsx
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

function MyRadioGroup({ value, onValueChange }) {
  return (
    <RadioGroup.Root value={value} onValueChange={onValueChange}>
      <div className="flex gap-4">
        <RadioGroup.Item value="option1" className="h-4 w-4">
          <RadioGroup.Indicator>
            <Circle className="h-2 w-2" />
          </RadioGroup.Indicator>
        </RadioGroup.Item>
        <label>Option 1</label>
        
        <RadioGroup.Item value="option2" className="h-4 w-4">
          <RadioGroup.Indicator>
            <Circle className="h-2 w-2" />
          </RadioGroup.Indicator>
        </RadioGroup.Item>
        <label>Option 2</label>
      </div>
    </RadioGroup.Root>
  );
}
```

### React Aria Components
```tsx
import { RadioGroup, Radio } from 'react-aria-components';
import { Circle } from "lucide-react";

function MyRadioGroup({ value, onChange }) {
  return (
    <RadioGroup value={value} onChange={onChange}>
      <div className="flex gap-4">
        <Radio value="option1" className="group">
          <div className="h-4 w-4">
            <Circle className="h-2 w-2 hidden group-selected:block" />
          </div>
          <span>Option 1</span>
        </Radio>
        
        <Radio value="option2" className="group">
          <div className="h-4 w-4">
            <Circle className="h-2 w-2 hidden group-selected:block" />
          </div>
          <span>Option 2</span>
        </Radio>
      </div>
    </RadioGroup>
  );
}
```

**Key Differences:**
- `RadioGroup.Item` → `Radio`
- `onValueChange` → `onChange`
- Label is part of `Radio` component
- No separate `Indicator` component
- Use `group-selected:` for selected state

---

## Select (Already Migrated)

### Radix UI (Old)
```tsx
import * as Select from "@radix-ui/react-select";

function MySelect({ value, onValueChange }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger>
        <Select.Value placeholder="Select..." />
        <Select.Icon />
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content>
          <Select.Viewport>
            <Select.Item value="1">
              <Select.ItemText>Option 1</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value="2">
              <Select.ItemText>Option 2</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
```

### React Aria (Current Implementation)
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

function MySelect({ value, onValueChange }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Option 1</SelectItem>
        <SelectItem value="2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

**Key Differences:**
- Simpler API, fewer nested components
- No `Portal`, `Viewport`, `ItemText`, `ItemIndicator`
- Maintained compound component API for backward compat
- Uses hooks internally (`useSelect`, `useSelectState`)

---

## Tabs (Already Migrated)

### Radix UI (Old)
```tsx
import * as Tabs from "@radix-ui/react-tabs";

function MyTabs({ defaultValue }) {
  return (
    <Tabs.Root defaultValue={defaultValue}>
      <Tabs.List>
        <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
      </Tabs.List>
      
      <Tabs.Content value="tab1">
        Content 1
      </Tabs.Content>
      <Tabs.Content value="tab2">
        Content 2
      </Tabs.Content>
    </Tabs.Root>
  );
}
```

### React Aria (Current Implementation)
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function MyTabs({ defaultValue }) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tab1">
        Content 1
      </TabsContent>
      <TabsContent value="tab2">
        Content 2
      </TabsContent>
    </Tabs>
  );
}
```

**Key Differences:**
- Nearly identical API (maintained for backward compat)
- Better keyboard navigation (Home, End, Arrow keys)
- Smaller bundle size
- Uses hooks internally (`useTab`, `useTabList`, `useTabPanel`)

---

## Label

### Radix UI
```tsx
import * as Label from "@radix-ui/react-label";

function MyFormField() {
  return (
    <>
      <Label.Root htmlFor="email">Email</Label.Root>
      <input id="email" type="email" />
    </>
  );
}
```

### Native HTML (Recommended)
```tsx
function MyFormField() {
  return (
    <>
      <label htmlFor="email" className="font-medium text-sm">
        Email
      </label>
      <input id="email" type="email" />
    </>
  );
}
```

**Key Differences:**
- Use native `<label>` element
- No need for React Aria (accessibility built-in)
- Apply Tailwind classes directly
- Simpler, smaller bundle

---

## Separator

### Radix UI
```tsx
import * as Separator from "@radix-ui/react-separator";

function MySeparator() {
  return (
    <Separator.Root 
      orientation="horizontal" 
      decorative 
      className="h-px bg-slate-200"
    />
  );
}
```

### Native HTML (Recommended)
```tsx
function MySeparator() {
  return (
    <hr 
      aria-orientation="horizontal" 
      role="separator"
      className="h-px bg-slate-200 border-0"
    />
  );
}
```

**Alternative: React Aria Separator**
```tsx
import { Separator } from 'react-aria-components';

function MySeparator() {
  return (
    <Separator 
      orientation="horizontal"
      className="h-px bg-slate-200"
    />
  );
}
```

**Key Differences:**
- Native `<hr>` is simplest
- React Aria Separator for advanced needs
- Both options lighter than Radix

---

## Avatar

### Radix UI
```tsx
import * as Avatar from "@radix-ui/react-avatar";

function MyAvatar({ src, alt, fallback }) {
  return (
    <Avatar.Root className="h-10 w-10 rounded-full">
      <Avatar.Image src={src} alt={alt} />
      <Avatar.Fallback>{fallback}</Avatar.Fallback>
    </Avatar.Root>
  );
}
```

### Custom Implementation (Recommended)
```tsx
import { useState } from 'react';

function MyAvatar({ src, alt, fallback }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative h-10 w-10 rounded-full overflow-hidden">
      {!error && src ? (
        <img 
          src={src} 
          alt={alt}
          className={cn(
            "h-full w-full object-cover",
            !loaded && "opacity-0"
          )}
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-200">
          {fallback}
        </div>
      )}
    </div>
  );
}
```

**Key Differences:**
- Custom implementation with native `<img>`
- Manual error and load handling
- No external dependency
- Lighter bundle

---

## Button with Slot (asChild pattern)

### Radix UI
```tsx
import { Slot } from "@radix-ui/react-slot";

function Button({ asChild, children, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props}>{children}</Comp>;
}

// Usage
<Button asChild>
  <a href="/link">Link as Button</a>
</Button>
```

### Render Props Pattern (Recommended)
```tsx
function Button({ render, children, ...props }) {
  if (render) {
    return render(props);
  }
  return <button {...props}>{children}</button>;
}

// Usage
<Button render={(props) => <a href="/link" {...props}>Link as Button</a>} />

// Or with renderProps pattern from React Aria
<Button>
  {(props) => <a href="/link" {...props}>Link as Button</a>}
</Button>
```

**Key Differences:**
- Render props more explicit
- No magic component merging
- TypeScript types clearer
- More React-idiomatic

---

## Common Prop Name Changes

| Radix UI | React Aria | Notes |
|----------|------------|-------|
| `checked` | `isSelected` | Checkboxes, Radio |
| `disabled` | `isDisabled` | All interactive components |
| `open` | `isOpen` | Dialogs, Popovers |
| `onOpenChange` | `onOpenChange` | Same! |
| `onCheckedChange` | `onChange` | Checkboxes |
| `onValueChange` | `onChange` | Select, RadioGroup |
| `asChild` | Render props | Composition pattern |
| `onClick` | `onPress` | Buttons, interactive elements |

---

## Styling Patterns

### Radix Data Attributes
```tsx
// Radix provides these automatically
<div 
  data-state="open"
  data-disabled
  className="data-[state=open]:animate-in data-[state=closed]:animate-out"
/>
```

### React Aria Group Modifiers
```tsx
// React Aria uses group- modifiers
<div className="group" data-selected={isSelected}>
  <span className="group-selected:text-blue-500">
    Selected content
  </span>
</div>
```

### Manual Data Attributes (if needed)
```tsx
// Add manually for Tailwind compatibility
<div 
  data-state={isOpen ? 'open' : 'closed'}
  className="data-[state=open]:animate-in"
/>
```

---

## Migration Patterns

### Pattern 1: Maintain Compound API
```tsx
// Create wrapper that looks like Radix
const Dialog = Object.assign(
  DialogRoot,
  {
    Trigger: DialogTrigger,
    Content: DialogContent,
    Title: DialogTitle,
  }
);

// Usage stays the same
<Dialog.Trigger>Open</Dialog.Trigger>
```

### Pattern 2: Use React Aria Components Directly
```tsx
// Import from react-aria-components
import { Dialog, DialogTrigger } from 'react-aria-components';

// Use as-is
<DialogTrigger>
  <Button>Open</Button>
  <Modal>
    <Dialog>...</Dialog>
  </Modal>
</DialogTrigger>
```

### Pattern 3: Hybrid Approach (Recommended)
```tsx
// Wrap React Aria with custom API
export function Dialog({ children, ...props }) {
  return (
    <AriaDialog {...props}>
      {children}
    </AriaDialog>
  );
}

// Add compound components for familiarity
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
```

---

## Testing Considerations

### Before Migration
```tsx
// Test Radix behavior
expect(screen.getByRole('dialog')).toBeInTheDocument();
expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
```

### After Migration
```tsx
// Test React Aria behavior (similar)
expect(screen.getByRole('dialog')).toBeInTheDocument();
// May need to add data-state manually
expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
```

---

**Last Updated:** 2025-11-11  
**See Also:** 
- `radix-to-react-aria-migration-plan.md` - Full migration plan
- `radix-to-react-aria-migration-summary.md` - Quick summary
