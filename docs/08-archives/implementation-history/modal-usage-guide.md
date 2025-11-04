# Modal Patterns Guide

Quick reference for using the new modal patterns in Casaora.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Pattern Selection](#pattern-selection)
3. [Common Patterns](#common-patterns)
4. [Hook Reference](#hook-reference)
5. [Examples](#examples)

---

## Quick Start

### 1. Choose Your Pattern

| Use Case | Pattern | Components |
|----------|---------|------------|
| Simple form submission | FormModal + useModalForm + useApiMutation | FormModal |
| Complex layout with custom actions | BaseModal + useModalForm + useApiMutation | BaseModal |
| Simple confirmation dialog | ConfirmationModal | ConfirmationModal |

### 2. Import What You Need

```tsx
// For form-based modals
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use-modal-form";
import { useApiMutation } from "@/hooks/use-api-mutation";

// For content-based modals
import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";

// For confirmation dialogs
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
```

---

## Pattern Selection

### Use FormModal When:
- ✅ You have a form with input fields
- ✅ You need standard Cancel/Submit buttons
- ✅ You want automatic form submission handling
- ✅ Your layout is straightforward

**Examples**: Contact forms, booking forms, review forms

### Use BaseModal When:
- ✅ You need a custom layout
- ✅ You have complex content (tables, lists, images)
- ✅ You need custom action buttons
- ✅ You want maximum flexibility

**Examples**: Detail views, admin panels, multi-step wizards

### Use ConfirmationModal When:
- ✅ You need a simple yes/no confirmation
- ✅ You want to warn users about destructive actions
- ✅ You need consistent confirmation UI

**Examples**: Delete confirmations, logout confirmations, cancel confirmations

---

## Common Patterns

### Pattern 1: Simple Form Modal

```tsx
type FormData = {
  name: string;
  email: string;
};

export function MyFormModal({ isOpen, onClose }: Props) {
  const form = useModalForm<FormData>({
    initialData: { name: "", email: "" },
    resetOnClose: true,
  });

  const mutation = useApiMutation({
    url: "/api/submit",
    method: "POST",
    refreshOnSuccess: true,
  });

  const handleSubmit = async () => {
    try {
      await mutation.mutate(form.formData);
      form.setMessage("Success!", "success");
      setTimeout(onClose, 2000);
    } catch (error) {
      form.setError(error.message);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="My Form"
      onSubmit={handleSubmit}
      submitLabel="Submit"
      isSubmitting={mutation.isLoading}
    >
      <input
        value={form.formData.name}
        onChange={(e) => form.updateField("name", e.target.value)}
        placeholder="Name"
      />
      <input
        value={form.formData.email}
        onChange={(e) => form.updateField("email", e.target.value)}
        placeholder="Email"
      />

      {form.error && <div className="error">{form.error}</div>}
    </FormModal>
  );
}
```

### Pattern 2: Complex Layout Modal

```tsx
export function MyComplexModal({ isOpen, onClose, data }: Props) {
  const form = useModalForm({
    initialData: { action: "approve", notes: "" },
    resetOnClose: true,
  });

  const mutation = useApiMutation({
    url: "/api/review",
    method: "POST",
  });

  const handleSubmit = async () => {
    try {
      await mutation.mutate(form.formData);
      onClose();
    } catch (error) {
      form.setError(error.message);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Details"
      size="2xl"
    >
      {/* Custom layout */}
      <div className="custom-layout">
        {/* Your content */}
      </div>

      {/* Custom actions */}
      <div className="flex gap-3">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading..." : "Submit"}
        </button>
      </div>
    </BaseModal>
  );
}
```

### Pattern 3: Confirmation Dialog

```tsx
export function MyConfirmationModal({ isOpen, onClose, onConfirm }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Are you sure?"
      message="This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
```

---

## Hook Reference

### useModalForm

Manages form state with automatic reset and validation.

```tsx
const form = useModalForm<FormData>({
  initialData: { field1: "", field2: 0 },
  resetOnClose: true, // Auto-reset when modal closes
  onSuccess: (result) => console.log(result),
  onError: (error) => console.error(error),
});

// Access form data
form.formData.field1

// Update single field
form.updateField("field1", "new value")

// Update multiple fields
form.setFormData({ ...form.formData, field1: "value" })

// Set error message
form.setError("Something went wrong")

// Set success message
form.setMessage("Success!", "success")

// Reset form
form.reset()

// Handle submission with automatic loading/error states
await form.handleSubmit(async (data) => {
  await fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}, { successMessage: "Saved!" });
```

### useApiMutation

Handles API calls with automatic loading/error states.

```tsx
const mutation = useApiMutation({
  url: "/api/endpoint",
  method: "POST", // or PUT, PATCH, DELETE
  refreshOnSuccess: true, // Call router.refresh() on success
  onSuccess: (result) => console.log(result),
  onError: (error) => console.error(error),
});

// Make the API call
await mutation.mutate({ key: "value" })

// Check states
mutation.isLoading  // boolean
mutation.error      // string | null
mutation.data       // result | null

// Reset mutation state
mutation.reset()
```

---

## Examples from Codebase

### Example 1: Reschedule Booking Modal (FormModal)
**File**: `/src/components/bookings/refactored/reschedule-booking-modal.tsx`

**Features**:
- Date/time input fields
- Form validation
- API mutation with success message
- Auto-close after success

### Example 2: Professional Review Modal (BaseModal)
**File**: `/src/components/admin/refactored/professional-review-modal.tsx`

**Features**:
- Complex multi-field form
- Conditional fields based on action
- Multiple checkboxes
- Custom layout with sections
- Custom action buttons

### Example 3: Feedback Modal (BaseModal + Custom Success State)
**File**: `/src/components/feedback/refactored/feedback-modal.tsx`

**Features**:
- Type selection with icons
- Character counter
- Conditional success state
- Context gathering (URL, viewport)

### Example 4: Changelog Modal (BaseModal + Read-only Content)
**File**: `/src/components/changelog/refactored/changelog-modal.tsx`

**Features**:
- Rich HTML content
- Category badges
- Featured image
- Simple mark-as-read action

### Example 5: Rating Prompt Modal (FormModal + Custom Component)
**File**: `/src/components/reviews/refactored/rating-prompt-modal.tsx`

**Features**:
- Custom star rating component
- Multiple rating fields
- Optional text fields
- Server action integration

---

## Best Practices

### 1. Type Safety
Always define your form data type:
```tsx
type FormData = {
  field1: string;
  field2: number;
};

const form = useModalForm<FormData>({ ... });
```

### 2. Validation
Validate before submission:
```tsx
const handleSubmit = async () => {
  if (!form.formData.email) {
    form.setError("Email is required");
    return;
  }
  // ... continue with submission
};
```

### 3. Loading States
Always disable actions during loading:
```tsx
<button disabled={mutation.isLoading || form.isSubmitting}>
  Submit
</button>
```

### 4. Error Handling
Always catch and display errors:
```tsx
try {
  await mutation.mutate(data);
} catch (error) {
  form.setError(error instanceof Error ? error.message : "Unknown error");
}
```

### 5. Success Feedback
Provide feedback and close gracefully:
```tsx
form.setMessage("Success!", "success");
setTimeout(() => onClose(), 2000);
```

### 6. Reset on Close
Use `resetOnClose: true` to clean up state:
```tsx
const form = useModalForm({
  initialData,
  resetOnClose: true, // ✅ Recommended
});
```

### 7. Accessibility
The base modals handle accessibility, but ensure:
- Labels for all inputs
- Error messages are announced
- Submit button is properly labeled

---

## Common Pitfalls

### ❌ Don't: Manual State Management
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
// ... manual fetch logic
```

### ✅ Do: Use Hooks
```tsx
const mutation = useApiMutation({ url: "/api/endpoint" });
```

### ❌ Don't: Manual Reset Logic
```tsx
useEffect(() => {
  if (!isOpen) {
    setData(initialData);
  }
}, [isOpen]);
```

### ✅ Do: Use resetOnClose
```tsx
const form = useModalForm({
  initialData,
  resetOnClose: true,
});
```

### ❌ Don't: Custom Backdrop/Escape Handling
```tsx
useEffect(() => {
  const handleEscape = (e) => { ... };
  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, []);
```

### ✅ Do: Let BaseModal Handle It
```tsx
<BaseModal
  closeOnEscape={true}
  closeOnBackdropClick={true}
  // ... other props
/>
```

---

## Troubleshooting

### Modal Not Closing
- Check that `isOpen` prop is properly controlled
- Verify `onClose` callback is being called
- Ensure no errors are preventing state updates

### Form Not Resetting
- Set `resetOnClose: true` in useModalForm options
- Call `form.reset()` manually if needed

### API Call Not Working
- Check network tab for errors
- Verify URL is correct
- Check that data is properly serialized
- Look for error messages in `mutation.error`

### Keyboard Navigation Issues
- Ensure modal is using BaseModal or FormModal
- Check that focusable elements are not disabled
- Verify tab order is logical

---

## Migration Checklist

When migrating an old modal:

- [ ] Identify pattern (FormModal vs BaseModal)
- [ ] Extract form data type
- [ ] Replace useState hooks with useModalForm
- [ ] Replace fetch calls with useApiMutation
- [ ] Remove manual useEffect for reset/cleanup
- [ ] Remove manual keyboard handlers
- [ ] Remove manual body scroll prevention
- [ ] Update JSX to use new modal component
- [ ] Test all functionality
- [ ] Test keyboard navigation
- [ ] Test error states
- [ ] Test loading states
- [ ] Test success states

---

## Support

For questions or issues:
1. Check existing examples in `/src/components/*/refactored/`
2. Review the base modal implementations in `/src/components/shared/`
3. Consult the hook implementations in `/src/hooks/`
4. Refer to the migration summary: `MODAL_MIGRATION_SUMMARY.md`

---

Last updated: 2025-11-03
