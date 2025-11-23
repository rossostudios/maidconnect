// Lia Design System - Anthropic-Inspired UI Components
// Color System: Dark #141413, Light #faf9f5, Mid Gray #b0aea5, Light Gray #e8e6dc
// Accents: Orange #d97757, Blue #6a9bcc, Green #788c5d
// Typography: Geist Sans (all text), Geist Mono (data/code)

import React from "react";

// ============================================
// BUTTON COMPONENTS
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-sans font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#d97757] text-[#faf9f5] hover:bg-[#c56847] focus:ring-[#d97757]",
    secondary: "bg-[#6a9bcc] text-[#faf9f5] hover:bg-[#5a8bbc] focus:ring-[#6a9bcc]",
    outline:
      "border-2 border-[#d97757] text-[#d97757] hover:bg-[#d97757] hover:text-[#faf9f5] focus:ring-[#d97757]",
    ghost: "text-[#141413] hover:bg-[#e8e6dc] focus:ring-[#b0aea5]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// ============================================
// INPUT COMPONENTS
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="mb-1.5 block font-medium font-sans text-[#141413] text-sm">{label}</label>
    )}
    <input
      className={`w-full rounded-lg border-2 border-[#e8e6dc] bg-[#faf9f5] px-4 py-2 font-sans text-[#141413] transition-colors duration-200 placeholder:text-[#b0aea5] focus:border-[#d97757] focus:outline-none focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-[#e8e6dc] ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
      {...props}
    />
    {error && <p className="mt-1.5 font-sans text-red-600 text-sm">{error}</p>}
    {helperText && !error && (
      <p className="mt-1.5 font-sans text-[#b0aea5] text-sm">{helperText}</p>
    )}
  </div>
);

// ============================================
// TEXTAREA COMPONENT
// ============================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="mb-1.5 block font-medium font-sans text-[#141413] text-sm">{label}</label>
    )}
    <textarea
      className={`resize-vertical w-full rounded-lg border-2 border-[#e8e6dc] bg-[#faf9f5] px-4 py-2 font-sans text-[#141413] transition-colors duration-200 placeholder:text-[#b0aea5] focus:border-[#d97757] focus:outline-none focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-[#e8e6dc] ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
      {...props}
    />
    {error && <p className="mt-1.5 font-sans text-red-600 text-sm">{error}</p>}
    {helperText && !error && (
      <p className="mt-1.5 font-sans text-[#b0aea5] text-sm">{helperText}</p>
    )}
  </div>
);

// ============================================
// CARD COMPONENT
// ============================================

type CardProps = {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "bordered";
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-[#faf9f5] border border-[#e8e6dc]",
    elevated: "bg-[#faf9f5] shadow-lg",
    bordered: "bg-[#faf9f5] border-2 border-[#d97757]",
  };

  return <div className={`rounded-lg p-6 ${variants[variant]} ${className}`}>{children}</div>;
};

// ============================================
// BADGE COMPONENT
// ============================================

type BadgeProps = {
  children: React.ReactNode;
  variant?: "orange" | "blue" | "green" | "gray";
  className?: string;
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "orange", className = "" }) => {
  const variants = {
    orange: "bg-[#d97757] text-[#faf9f5]",
    blue: "bg-[#6a9bcc] text-[#faf9f5]",
    green: "bg-[#788c5d] text-[#faf9f5]",
    gray: "bg-[#b0aea5] text-[#faf9f5]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-medium font-sans text-xs ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// ============================================
// ALERT COMPONENT
// ============================================

type AlertProps = {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
};

export const Alert: React.FC<AlertProps> = ({ children, variant = "info", className = "" }) => {
  const variants = {
    info: "bg-[#6a9bcc] bg-opacity-10 border-[#6a9bcc] text-[#141413]",
    success: "bg-[#788c5d] bg-opacity-10 border-[#788c5d] text-[#141413]",
    warning: "bg-[#d97757] bg-opacity-10 border-[#d97757] text-[#141413]",
    error: "bg-red-50 border-red-500 text-red-900",
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 font-sans ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// TOGGLE/SWITCH COMPONENT
// ============================================

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled = false }) => (
  <label className="flex cursor-pointer items-center">
    <div className="relative">
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        type="checkbox"
      />
      <div
        className={`block h-8 w-14 rounded-full transition-colors duration-200 ${checked ? "bg-[#d97757]" : "bg-[#e8e6dc]"}
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
        `}
      />
      <div
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-6 transform" : ""}
        `}
      />
    </div>
    {label && <span className="ml-3 font-sans text-[#141413]">{label}</span>}
  </label>
);

// ============================================
// SELECT/DROPDOWN COMPONENT
// ============================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = "",
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="mb-1.5 block font-medium font-sans text-[#141413] text-sm">{label}</label>
    )}
    <select
      className={`w-full rounded-lg border-2 border-[#e8e6dc] bg-[#faf9f5] px-4 py-2 font-sans text-[#141413] transition-colors duration-200 focus:border-[#d97757] focus:outline-none focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-[#e8e6dc] ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1.5 font-sans text-red-600 text-sm">{error}</p>}
  </div>
);

// ============================================
// CHECKBOX COMPONENT
// ============================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = "", ...props }) => (
  <label className="flex cursor-pointer items-center">
    <input
      className={`h-5 w-5 rounded border-2 border-[#e8e6dc] text-[#d97757] transition-colors duration-200 focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20 ${className}
        `}
      type="checkbox"
      {...props}
    />
    {label && <span className="ml-2 font-sans text-[#141413]">{label}</span>}
  </label>
);

// ============================================
// RADIO COMPONENT
// ============================================

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Radio: React.FC<RadioProps> = ({ label, className = "", ...props }) => (
  <label className="flex cursor-pointer items-center">
    <input
      className={`h-5 w-5 border-2 border-[#e8e6dc] text-[#d97757] transition-colors duration-200 focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20 ${className}
        `}
      type="radio"
      {...props}
    />
    {label && <span className="ml-2 font-sans text-[#141413]">{label}</span>}
  </label>
);

// ============================================
// DIVIDER COMPONENT
// ============================================

type DividerProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export const Divider: React.FC<DividerProps> = ({ className = "", orientation = "horizontal" }) => (
  <div
    className={`bg-[#e8e6dc] ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"}
        ${className}
      `}
  />
);

// ============================================
// LINK COMPONENT
// ============================================

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary" | "subtle";
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "text-[#d97757] hover:text-[#c56847] underline",
    secondary: "text-[#6a9bcc] hover:text-[#5a8bbc] underline",
    subtle: "text-[#141413] hover:text-[#b0aea5] no-underline hover:underline",
  };

  return (
    <a
      className={`font-sans transition-colors duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

// ============================================
// USAGE EXAMPLES
// ============================================

export const ComponentShowcase = () => {
  const [toggleState, setToggleState] = React.useState(false);

  return (
    <div className="space-y-8 bg-[#faf9f5] p-8 font-sans">
      {/* Buttons */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#141413]">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#141413]">Form Inputs</h2>
        <div className="max-w-md space-y-4">
          <Input
            helperText="We'll never share your email"
            label="Email"
            placeholder="Enter your email"
          />
          <Input error="Password is required" label="Password" type="password" />
          <Textarea label="Message" placeholder="Enter your message" rows={4} />
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#141413]">Cards</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card variant="default">
            <h3 className="mb-2 font-sans text-lg">Default Card</h3>
            <p className="font-sans text-[#b0aea5]">With subtle border</p>
          </Card>
          <Card variant="elevated">
            <h3 className="mb-2 font-sans text-lg">Elevated Card</h3>
            <p className="font-sans text-[#b0aea5]">With shadow</p>
          </Card>
          <Card variant="bordered">
            <h3 className="mb-2 font-sans text-lg">Bordered Card</h3>
            <p className="font-sans text-[#b0aea5]">With accent border</p>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#141413]">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="orange">Orange</Badge>
          <Badge variant="blue">Blue</Badge>
          <Badge variant="green">Green</Badge>
          <Badge variant="gray">Gray</Badge>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#141413]">Alerts</h2>
        <div className="space-y-3">
          <Alert variant="info">This is an informational message</Alert>
          <Alert variant="success">Operation completed successfully</Alert>
          <Alert variant="warning">Please review this warning</Alert>
          <Alert variant="error">An error has occurred</Alert>
        </div>
      </section>

      {/* Toggle */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#141413]">Toggle</h2>
        <Toggle checked={toggleState} label="Enable notifications" onChange={setToggleState} />
      </section>
    </div>
  );
};
