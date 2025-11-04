# Modal Component Patterns

Quick reference for modal patterns in MaidConnect.

## Components

### BaseModal
Foundation modal with keyboard nav, focus management, and accessibility.

**Props:**
- `isOpen`, `onClose` - Required
- `title`, `description` - Optional header content
- `size` - 'sm' | 'md' | 'lg' | 'xl' | '2xl' (default: 'md')
- `showCloseButton`, `closeOnBackdropClick`, `closeOnEscape` - Behavior controls

**Usage:**
```tsx
import { BaseModal } from "@/components/shared/base-modal";

<BaseModal isOpen={isOpen} onClose={onClose} title="Title" size="lg">
  <div>Content</div>
</BaseModal>
```

### FormModal
Modal with integrated form handling and action buttons.

**Additional Props:**
- `onSubmit` - Form submit handler
- `submitLabel`, `cancelLabel` - Button text
- `isSubmitting` - Loading state
- `customActions` - Replace default buttons

**Usage:**
```tsx
import { FormModal } from "@/components/shared/form-modal";

<FormModal
  isOpen={isOpen}
  onClose={onClose}
  title="Form Title"
  onSubmit={handleSubmit}
  isSubmitting={loading}
>
  <input />
</FormModal>
```

### ConfirmationModal
Simple confirm/cancel dialog with visual variants.

**Props:**
- `isOpen`, `onClose`, `onConfirm` - Required
- `title`, `message` - Required content
- `confirmLabel`, `cancelLabel` - Button text
- `variant` - 'default' | 'danger' | 'success' | 'warning' | 'info'
- `isLoading` - Loading state

**Usage:**
```tsx
import { ConfirmationModal } from "@/components/shared/confirmation-modal";

<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Delete Item?"
  message="This cannot be undone."
  variant="danger"
/>
```

## Hooks

### useModalForm
Manages form state with automatic reset and validation.

```tsx
import { useModalForm } from "@/hooks/use-modal-form";

type FormData = { name: string; email: string };

const form = useModalForm<FormData>({
  initialData: { name: "", email: "" },
  resetOnClose: true,
});

// Usage
form.formData.name
form.updateField("name", "value")
form.setError("error message")
form.handleSubmit(async (data) => { /* submit */ })
```

**Returns:**
- `formData` - Current form data
- `updateField(field, value)` - Update single field
- `isSubmitting` - Is form submitting?
- `error`, `setError` - Error state
- `message`, `setMessage` - Success/error message
- `reset()` - Reset to initial state
- `handleSubmit(fn, options)` - Handle submission with loading/error

### useApiMutation
Handles API calls with automatic loading/error states.

```tsx
import { useApiMutation } from "@/hooks/use-api-mutation";

const mutation = useApiMutation({
  url: "/api/endpoint",
  method: "POST",
  refreshOnSuccess: true,
  onSuccess: (result) => console.log(result),
});

// Usage
await mutation.mutate({ key: "value" })
mutation.isLoading
mutation.error
mutation.data
```

## Patterns

### Pattern 1: Simple Form
```tsx
export function MyFormModal({ isOpen, onClose }) {
  const form = useModalForm({ initialData: { name: "" }, resetOnClose: true });
  const mutation = useApiMutation({ url: "/api/save", method: "POST" });

  const handleSubmit = async () => {
    await mutation.mutate(form.formData);
    form.setMessage("Saved!", "success");
    setTimeout(onClose, 2000);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="My Form"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isLoading}
    >
      <input
        value={form.formData.name}
        onChange={(e) => form.updateField("name", e.target.value)}
      />
      {form.error && <div>{form.error}</div>}
    </FormModal>
  );
}
```

### Pattern 2: Complex Layout
```tsx
export function MyComplexModal({ isOpen, onClose }) {
  const form = useModalForm({ initialData, resetOnClose: true });
  const mutation = useApiMutation({ url: "/api/save" });

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Complex" size="2xl">
      <div className="custom-layout">
        {/* Custom content */}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => mutation.mutate(form.formData)}>
          Save
        </button>
      </div>
    </BaseModal>
  );
}
```

### Pattern 3: Confirmation
```tsx
export function MyConfirmModal({ isOpen, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Are you sure?"
      message="This action cannot be undone."
      variant="danger"
      isLoading={loading}
    />
  );
}
```

## Best Practices

1. **Type your form data:**
   ```tsx
   type FormData = { field: string };
   const form = useModalForm<FormData>({ initialData: { field: "" } });
   ```

2. **Validate before submit:**
   ```tsx
   if (!form.formData.email) {
     form.setError("Email required");
     return;
   }
   ```

3. **Disable during loading:**
   ```tsx
   <button disabled={mutation.isLoading || form.isSubmitting}>
   ```

4. **Use resetOnClose:**
   ```tsx
   const form = useModalForm({ initialData, resetOnClose: true });
   ```

5. **Handle errors gracefully:**
   ```tsx
   try {
     await mutation.mutate(data);
   } catch (error) {
     form.setError(error.message);
   }
   ```

## Examples

See `/src/components/bookings/refactored/` for complete working examples:
- Simple forms: `reschedule-booking-modal.tsx`
- Complex layouts: `professional-review-modal.tsx`
- Confirmations: Various booking action modals

## Migration

For detailed migration from old patterns, see `/docs/08-archives/migration-2025-11/`

## Accessibility

All modals include:
- Keyboard navigation (Escape, Tab, Shift+Tab)
- Focus trap and restore
- ARIA labels and roles
- Screen reader support
