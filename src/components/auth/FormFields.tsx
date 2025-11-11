/**
 * Form Field Components
 * Reusable form field components with built-in error handling
 * Reduces repetitive conditional logic in forms
 */

import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FieldWrapperProps = {
  label: string;
  children: React.ReactNode;
  helper?: string;
  error?: string;
  htmlFor?: string;
};

/**
 * Wrapper component for form fields with label and error display
 */
export function FieldWrapper({ label, children, helper, error, htmlFor }: FieldWrapperProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className="space-y-3">
      <Label htmlFor={htmlFor}>{label}</Label>
      {helper ? <p className="text-stone-600 text-xs">{helper}</p> : null}
      {children}
      {error ? (
        <p className="text-stone-800 text-xs" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = {
  label: string;
  name: string;
  error?: string;
  type?: "text" | "email" | "tel" | "password";
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
};

/**
 * Text input field with built-in error handling
 */
export function TextInput({
  label,
  name,
  error,
  type = "text",
  placeholder,
  autoComplete,
  minLength,
  required,
}: TextInputProps) {
  const hasError = Boolean(error);

  return (
    <FieldWrapper error={error} htmlFor={name} label={label}>
      <Input
        aria-describedby={hasError ? `${name}-error` : undefined}
        aria-invalid={hasError}
        autoComplete={autoComplete}
        className={hasError ? "border-stone-800" : ""}
        id={name}
        minLength={minLength}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </FieldWrapper>
  );
}

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
};

/**
 * Select field with built-in error handling
 */
export function SelectField({
  label,
  name,
  error,
  placeholder,
  options,
  value,
  onValueChange,
}: SelectFieldProps) {
  const hasError = Boolean(error);

  return (
    <FieldWrapper error={error} htmlFor={name} label={label}>
      <Select name={name} onValueChange={onValueChange} value={value}>
        <SelectTrigger
          aria-describedby={hasError ? `${name}-error` : undefined}
          aria-invalid={hasError}
          className={hasError ? "border-stone-800" : ""}
          id={name}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input name={name} type="hidden" value={value} />
    </FieldWrapper>
  );
}
