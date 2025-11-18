// Anthropic Brand UI Components for Next.js
// Color System: Dark #141413, Light #faf9f5, Mid Gray #b0aea5, Light Gray #e8e6dc
// Accents: Orange #d97757, Blue #6a9bcc, Green #788c5d
// Typography: Poppins (headings), Lora (body)

import React from 'react';

// ============================================
// BUTTON COMPONENTS
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-heading font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#d97757] text-[#faf9f5] hover:bg-[#c56847] focus:ring-[#d97757]',
    secondary: 'bg-[#6a9bcc] text-[#faf9f5] hover:bg-[#5a8bbc] focus:ring-[#6a9bcc]',
    outline: 'border-2 border-[#d97757] text-[#d97757] hover:bg-[#d97757] hover:text-[#faf9f5] focus:ring-[#d97757]',
    ghost: 'text-[#141413] hover:bg-[#e8e6dc] focus:ring-[#b0aea5]'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
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
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-heading text-sm font-medium text-[#141413] mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 font-body text-[#141413] bg-[#faf9f5] 
          border-2 border-[#e8e6dc] rounded-lg
          focus:outline-none focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20
          disabled:bg-[#e8e6dc] disabled:cursor-not-allowed
          placeholder:text-[#b0aea5]
          transition-colors duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm font-body text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm font-body text-[#b0aea5]">{helperText}</p>
      )}
    </div>
  );
};

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
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-heading text-sm font-medium text-[#141413] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2 font-body text-[#141413] bg-[#faf9f5] 
          border-2 border-[#e8e6dc] rounded-lg
          focus:outline-none focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20
          disabled:bg-[#e8e6dc] disabled:cursor-not-allowed
          placeholder:text-[#b0aea5]
          transition-colors duration-200
          resize-vertical
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm font-body text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm font-body text-[#b0aea5]">{helperText}</p>
      )}
    </div>
  );
};

// ============================================
// CARD COMPONENT
// ============================================

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variants = {
    default: 'bg-[#faf9f5] border border-[#e8e6dc]',
    elevated: 'bg-[#faf9f5] shadow-lg',
    bordered: 'bg-[#faf9f5] border-2 border-[#d97757]'
  };
  
  return (
    <div className={`rounded-lg p-6 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'blue' | 'green' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'orange', 
  className = '' 
}) => {
  const variants = {
    orange: 'bg-[#d97757] text-[#faf9f5]',
    blue: 'bg-[#6a9bcc] text-[#faf9f5]',
    green: 'bg-[#788c5d] text-[#faf9f5]',
    gray: 'bg-[#b0aea5] text-[#faf9f5]'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-heading font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ============================================
// ALERT COMPONENT
// ============================================

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info', 
  className = '' 
}) => {
  const variants = {
    info: 'bg-[#6a9bcc] bg-opacity-10 border-[#6a9bcc] text-[#141413]',
    success: 'bg-[#788c5d] bg-opacity-10 border-[#788c5d] text-[#141413]',
    warning: 'bg-[#d97757] bg-opacity-10 border-[#d97757] text-[#141413]',
    error: 'bg-red-50 border-red-500 text-red-900'
  };
  
  return (
    <div className={`p-4 rounded-lg border-l-4 font-body ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// TOGGLE/SWITCH COMPONENT
// ============================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  label,
  disabled = false 
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`
          block w-14 h-8 rounded-full transition-colors duration-200
          ${checked ? 'bg-[#d97757]' : 'bg-[#e8e6dc]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}></div>
        <div className={`
          absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200
          ${checked ? 'transform translate-x-6' : ''}
        `}></div>
      </div>
      {label && (
        <span className="ml-3 font-body text-[#141413]">{label}</span>
      )}
    </label>
  );
};

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
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-heading text-sm font-medium text-[#141413] mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2 font-body text-[#141413] bg-[#faf9f5] 
          border-2 border-[#e8e6dc] rounded-lg
          focus:outline-none focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20
          disabled:bg-[#e8e6dc] disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
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
      {error && (
        <p className="mt-1.5 text-sm font-body text-red-600">{error}</p>
      )}
    </div>
  );
};

// ============================================
// CHECKBOX COMPONENT
// ============================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  className = '',
  ...props 
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        className={`
          w-5 h-5 rounded border-2 border-[#e8e6dc]
          text-[#d97757] 
          focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20
          transition-colors duration-200
          ${className}
        `}
        {...props}
      />
      {label && (
        <span className="ml-2 font-body text-[#141413]">{label}</span>
      )}
    </label>
  );
};

// ============================================
// RADIO COMPONENT
// ============================================

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio: React.FC<RadioProps> = ({ 
  label, 
  className = '',
  ...props 
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="radio"
        className={`
          w-5 h-5 border-2 border-[#e8e6dc]
          text-[#d97757]
          focus:ring-2 focus:ring-[#d97757] focus:ring-opacity-20
          transition-colors duration-200
          ${className}
        `}
        {...props}
      />
      {label && (
        <span className="ml-2 font-body text-[#141413]">{label}</span>
      )}
    </label>
  );
};

// ============================================
// DIVIDER COMPONENT
// ============================================

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({ 
  className = '',
  orientation = 'horizontal' 
}) => {
  return (
    <div 
      className={`
        bg-[#e8e6dc]
        ${orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'}
        ${className}
      `}
    />
  );
};

// ============================================
// LINK COMPONENT
// ============================================

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'subtle';
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'text-[#d97757] hover:text-[#c56847] underline',
    secondary: 'text-[#6a9bcc] hover:text-[#5a8bbc] underline',
    subtle: 'text-[#141413] hover:text-[#b0aea5] no-underline hover:underline'
  };
  
  return (
    <a 
      className={`font-body transition-colors duration-200 ${variants[variant]} ${className}`}
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
    <div className="p-8 bg-[#faf9f5] space-y-8">
      {/* Buttons */}
      <section>
        <h2 className="font-heading text-2xl text-[#141413] mb-4">Buttons</h2>
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
        <h2 className="font-heading text-2xl text-[#141413] mb-4">Form Inputs</h2>
        <div className="space-y-4 max-w-md">
          <Input 
            label="Email" 
            placeholder="Enter your email"
            helperText="We'll never share your email"
          />
          <Input 
            label="Password" 
            type="password"
            error="Password is required"
          />
          <Textarea 
            label="Message" 
            placeholder="Enter your message"
            rows={4}
          />
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="font-heading text-2xl text-[#141413] mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default">
            <h3 className="font-heading text-lg mb-2">Default Card</h3>
            <p className="font-body text-[#b0aea5]">With subtle border</p>
          </Card>
          <Card variant="elevated">
            <h3 className="font-heading text-lg mb-2">Elevated Card</h3>
            <p className="font-body text-[#b0aea5]">With shadow</p>
          </Card>
          <Card variant="bordered">
            <h3 className="font-heading text-lg mb-2">Bordered Card</h3>
            <p className="font-body text-[#b0aea5]">With accent border</p>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-heading text-2xl text-[#141413] mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="orange">Orange</Badge>
          <Badge variant="blue">Blue</Badge>
          <Badge variant="green">Green</Badge>
          <Badge variant="gray">Gray</Badge>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="font-heading text-2xl text-[#141413] mb-4">Alerts</h2>
        <div className="space-y-3">
          <Alert variant="info">This is an informational message</Alert>
          <Alert variant="success">Operation completed successfully</Alert>
          <Alert variant="warning">Please review this warning</Alert>
          <Alert variant="error">An error has occurred</Alert>
        </div>
      </section>

      {/* Toggle */}
      <section>
        <h2 className="font-heading text-2xl text-[#141413] mb-4">Toggle</h2>
        <Toggle 
          checked={toggleState} 
          onChange={setToggleState}
          label="Enable notifications"
        />
      </section>
    </div>
  );
};
