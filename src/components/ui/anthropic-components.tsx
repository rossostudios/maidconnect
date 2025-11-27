// Lia Design System - Airbnb-Inspired UI Components
// Color System: Dark #222222, Light #F7F7F7, Mid Gray #767676, Light Gray #DDDDDD
// Accents: Rausch #7A3B4A (burgundy), Babu #00A699 (teal), Green #788c5d
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
    primary: "bg-[#7A3B4A] text-white hover:bg-[#6B3340] focus:ring-[#7A3B4A]",
    secondary: "bg-[#00A699] text-white hover:bg-[#008F84] focus:ring-[#00A699]",
    outline:
      "border-2 border-[#7A3B4A] text-[#7A3B4A] hover:bg-[#7A3B4A] hover:text-white focus:ring-[#7A3B4A]",
    ghost: "text-[#222222] hover:bg-[#DDDDDD] focus:ring-[#767676]",
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
      <label className="mb-1.5 block font-medium font-sans text-[#222222] text-sm">{label}</label>
    )}
    <input
      className={`w-full rounded-lg border-2 border-[#DDDDDD] bg-[#F7F7F7] px-4 py-2 font-sans text-[#222222] transition-colors duration-200 placeholder:text-[#767676] focus:border-[#7A3B4A] focus:outline-none focus:ring-2 focus:ring-[#7A3B4A] focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-[#DDDDDD] ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
      {...props}
    />
    {error && <p className="mt-1.5 font-sans text-red-600 text-sm">{error}</p>}
    {helperText && !error && (
      <p className="mt-1.5 font-sans text-[#767676] text-sm">{helperText}</p>
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
      <label className="mb-1.5 block font-medium font-sans text-[#222222] text-sm">{label}</label>
    )}
    <textarea
      className={`resize-vertical w-full rounded-lg border-2 border-[#DDDDDD] bg-[#F7F7F7] px-4 py-2 font-sans text-[#222222] transition-colors duration-200 placeholder:text-[#767676] focus:border-[#7A3B4A] focus:outline-none focus:ring-2 focus:ring-[#7A3B4A] focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-[#DDDDDD] ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
      {...props}
    />
    {error && <p className="mt-1.5 font-sans text-red-600 text-sm">{error}</p>}
    {helperText && !error && (
      <p className="mt-1.5 font-sans text-[#767676] text-sm">{helperText}</p>
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
    default: "bg-[#F7F7F7] border border-[#DDDDDD]",
    elevated: "bg-[#F7F7F7] shadow-lg",
    bordered: "bg-[#F7F7F7] border-2 border-[#7A3B4A]",
  };

  return <div className={`rounded-lg p-6 ${variants[variant]} ${className}`}>{children}</div>;
};

// ============================================
// BADGE COMPONENT
// ============================================

type BadgeProps = {
  children: React.ReactNode;
  variant?: "rausch" | "babu" | "green" | "gray";
  className?: string;
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "rausch", className = "" }) => {
  const variants = {
    rausch: "bg-[#7A3B4A] text-white",
    babu: "bg-[#00A699] text-white",
    green: "bg-[#788c5d] text-white",
    gray: "bg-[#767676] text-white",
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
    info: "bg-[#00A699] bg-opacity-10 border-[#00A699] text-[#222222]",
    success: "bg-[#788c5d] bg-opacity-10 border-[#788c5d] text-[#222222]",
    warning: "bg-[#7A3B4A] bg-opacity-10 border-[#7A3B4A] text-[#222222]",
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
        className={`block h-8 w-14 rounded-full transition-colors duration-200 ${checked ? "bg-[#7A3B4A]" : "bg-[#DDDDDD]"}
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
        `}
      />
      <div
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-6 transform" : ""}
        `}
      />
    </div>
    {label && <span className="ml-3 font-sans text-[#222222]">{label}</span>}
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

const Select: React.FC<SelectProps> = ({ label, error, options, className = "", ...props }) => (
  <div className="w-full">
    {label && (
      <label className="mb-1.5 block font-medium font-sans text-[#222222] text-sm">{label}</label>
    )}
    <select
      className={`w-full rounded-lg border-2 border-[#DDDDDD] bg-[#F7F7F7] px-4 py-2 font-sans text-[#222222] transition-colors duration-200 focus:border-[#7A3B4A] focus:outline-none focus:ring-2 focus:ring-[#7A3B4A] focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-[#DDDDDD] ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
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

const Checkbox: React.FC<CheckboxProps> = ({ label, className = "", ...props }) => (
  <label className="flex cursor-pointer items-center">
    <input
      className={`h-5 w-5 rounded border-2 border-[#DDDDDD] text-[#7A3B4A] transition-colors duration-200 focus:ring-2 focus:ring-[#7A3B4A] focus:ring-opacity-20 ${className}
        `}
      type="checkbox"
      {...props}
    />
    {label && <span className="ml-2 font-sans text-[#222222]">{label}</span>}
  </label>
);

// ============================================
// RADIO COMPONENT
// ============================================

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Radio: React.FC<RadioProps> = ({ label, className = "", ...props }) => (
  <label className="flex cursor-pointer items-center">
    <input
      className={`h-5 w-5 border-2 border-[#DDDDDD] text-[#7A3B4A] transition-colors duration-200 focus:ring-2 focus:ring-[#7A3B4A] focus:ring-opacity-20 ${className}
        `}
      type="radio"
      {...props}
    />
    {label && <span className="ml-2 font-sans text-[#222222]">{label}</span>}
  </label>
);

// ============================================
// DIVIDER COMPONENT
// ============================================

type DividerProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

const Divider: React.FC<DividerProps> = ({ className = "", orientation = "horizontal" }) => (
  <div
    className={`bg-[#DDDDDD] ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"}
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

const Link: React.FC<LinkProps> = ({ variant = "primary", children, className = "", ...props }) => {
  const variants = {
    primary: "text-[#6B3340] hover:text-[#5D2B35] underline",
    secondary: "text-[#00A699] hover:text-[#008F84] underline",
    subtle: "text-[#222222] hover:text-[#767676] no-underline hover:underline",
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

const ComponentShowcase = () => {
  const [toggleState, setToggleState] = React.useState(false);

  return (
    <div className="space-y-8 bg-[#F7F7F7] p-8 font-sans">
      {/* Buttons */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#222222]">Buttons</h2>
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
        <h2 className="mb-4 font-sans text-2xl text-[#222222]">Form Inputs</h2>
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
        <h2 className="mb-4 font-sans text-2xl text-[#222222]">Cards</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card variant="default">
            <h3 className="mb-2 font-sans text-lg">Default Card</h3>
            <p className="font-sans text-[#767676]">With subtle border</p>
          </Card>
          <Card variant="elevated">
            <h3 className="mb-2 font-sans text-lg">Elevated Card</h3>
            <p className="font-sans text-[#767676]">With shadow</p>
          </Card>
          <Card variant="bordered">
            <h3 className="mb-2 font-sans text-lg">Bordered Card</h3>
            <p className="font-sans text-[#767676]">With accent border</p>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#222222]">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="rausch">Rausch</Badge>
          <Badge variant="babu">Babu</Badge>
          <Badge variant="green">Green</Badge>
          <Badge variant="gray">Gray</Badge>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#222222]">Alerts</h2>
        <div className="space-y-3">
          <Alert variant="info">This is an informational message</Alert>
          <Alert variant="success">Operation completed successfully</Alert>
          <Alert variant="warning">Please review this warning</Alert>
          <Alert variant="error">An error has occurred</Alert>
        </div>
      </section>

      {/* Toggle */}
      <section>
        <h2 className="mb-4 font-sans text-2xl text-[#222222]">Toggle</h2>
        <Toggle checked={toggleState} label="Enable notifications" onChange={setToggleState} />
      </section>
    </div>
  );
};
