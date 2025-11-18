# Anthropic Brand UI Components - Setup Guide

## 📦 Installation

### 1. Install Required Dependencies

```bash
npm install next react react-dom
npm install -D tailwindcss postcss autoprefixer typescript @types/react @types/node
npx tailwindcss init -p
```

### 2. Configure Tailwind CSS

Update your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        anthropic: {
          dark: '#141413',
          light: '#faf9f5',
          'mid-gray': '#b0aea5',
          'light-gray': '#e8e6dc',
          orange: '#d97757',
          'orange-hover': '#c56847',
          blue: '#6a9bcc',
          'blue-hover': '#5a8bbc',
          green: '#788c5d',
          'green-hover': '#687c4d',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'Arial', 'sans-serif'],
        body: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'anthropic-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'anthropic-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'anthropic-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
```

### 3. Import Fonts

Add to your `app/layout.tsx` or `pages/_app.tsx`:

```tsx
import { Poppins, Lora } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

const lora = Lora({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-lora',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${lora.variable}`}>
      <body className="font-body bg-anthropic-light text-anthropic-dark">
        {children}
      </body>
    </html>
  )
}
```

### 4. Update Global Styles

In your `app/globals.css` or `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
  
  body {
    @apply font-body;
  }
}
```

---

## 🎨 Component Usage Guide

### Buttons

```tsx
import { Button } from '@/components/ui/anthropic-components'

export default function Page() {
  return (
    <div className="space-x-3">
      <Button variant="primary" size="md">
        Primary Button
      </Button>
      
      <Button variant="secondary" size="md">
        Secondary Button
      </Button>
      
      <Button variant="outline" size="lg">
        Outline Button
      </Button>
      
      <Button variant="ghost" size="sm">
        Ghost Button
      </Button>
      
      <Button disabled>
        Disabled Button
      </Button>
    </div>
  )
}
```

### Form Inputs

```tsx
import { Input, Textarea, Select } from '@/components/ui/anthropic-components'

export default function ContactForm() {
  return (
    <form className="max-w-md space-y-4">
      <Input
        label="Full Name"
        placeholder="John Doe"
        helperText="Enter your full name"
      />
      
      <Input
        label="Email"
        type="email"
        placeholder="john@example.com"
        error="Email is required"
      />
      
      <Select
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
        ]}
      />
      
      <Textarea
        label="Message"
        placeholder="Tell us more..."
        rows={5}
      />
      
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </form>
  )
}
```

### Cards

```tsx
import { Card, Badge } from '@/components/ui/anthropic-components'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card variant="default">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-heading text-xl">Feature Card</h3>
          <Badge variant="orange">New</Badge>
        </div>
        <p className="font-body text-anthropic-mid-gray">
          This is a default card with subtle styling
        </p>
      </Card>
      
      <Card variant="elevated">
        <h3 className="font-heading text-xl mb-2">Elevated Card</h3>
        <p className="font-body text-anthropic-mid-gray">
          This card has a shadow for emphasis
        </p>
      </Card>
      
      <Card variant="bordered">
        <h3 className="font-heading text-xl mb-2">Bordered Card</h3>
        <Badge variant="blue">Featured</Badge>
      </Card>
    </div>
  )
}
```

### Alerts

```tsx
import { Alert } from '@/components/ui/anthropic-components'

export default function Notifications() {
  return (
    <div className="space-y-4 max-w-2xl">
      <Alert variant="info">
        <strong>Info:</strong> Your profile has been updated
      </Alert>
      
      <Alert variant="success">
        <strong>Success:</strong> Payment processed successfully
      </Alert>
      
      <Alert variant="warning">
        <strong>Warning:</strong> Your trial expires in 3 days
      </Alert>
      
      <Alert variant="error">
        <strong>Error:</strong> Unable to process your request
      </Alert>
    </div>
  )
}
```

### Toggle Switch

```tsx
'use client'

import { Toggle } from '@/components/ui/anthropic-components'
import { useState } from 'react'

export default function Settings() {
  const [notifications, setNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  
  return (
    <div className="space-y-4">
      <Toggle
        checked={notifications}
        onChange={setNotifications}
        label="Enable email notifications"
      />
      
      <Toggle
        checked={darkMode}
        onChange={setDarkMode}
        label="Dark mode"
      />
    </div>
  )
}
```

### Checkboxes and Radio Buttons

```tsx
import { Checkbox, Radio } from '@/components/ui/anthropic-components'

export default function PreferencesForm() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg mb-3">Interests</h3>
        <div className="space-y-2">
          <Checkbox label="AI & Machine Learning" />
          <Checkbox label="Web Development" />
          <Checkbox label="Data Science" />
        </div>
      </div>
      
      <div>
        <h3 className="font-heading text-lg mb-3">Subscription Plan</h3>
        <div className="space-y-2">
          <Radio name="plan" label="Free" />
          <Radio name="plan" label="Pro" />
          <Radio name="plan" label="Enterprise" />
        </div>
      </div>
    </div>
  )
}
```

---

## 🎯 Design System Principles

### Color Usage Guidelines

1. **Primary Actions**: Use `orange` (#d97757) for primary CTAs and important actions
2. **Secondary Actions**: Use `blue` (#6a9bcc) for secondary actions
3. **Success States**: Use `green` (#788c5d) for success messages and confirmations
4. **Backgrounds**: Use `light` (#faf9f5) as the main background color
5. **Text**: Use `dark` (#141413) for primary text, `mid-gray` (#b0aea5) for secondary text

### Typography Scale

- **Hero/Display**: 2.25rem (36px) - h1
- **Page Title**: 1.875rem (30px) - h2
- **Section Header**: 1.5rem (24px) - h3
- **Subsection**: 1.25rem (20px) - h4
- **Body Large**: 1.125rem (18px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

### Spacing System

Use consistent spacing based on 4px increments:
- `spacing-1`: 4px
- `spacing-2`: 8px
- `spacing-3`: 12px
- `spacing-4`: 16px (base unit)
- `spacing-6`: 24px
- `spacing-8`: 32px
- `spacing-12`: 48px

### Border Radius

- **Small**: 4px - For small elements like badges
- **Medium**: 8px - For inputs and buttons
- **Large**: 12px - For cards and containers
- **Full**: 9999px - For pills and circular elements

---

## 📱 Responsive Design

All components are mobile-first and responsive by default:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Mobile: 1 column</Card>
  <Card>Tablet: 2 columns</Card>
  <Card>Desktop: 3 columns</Card>
</div>
```

---

## ♿ Accessibility

All components follow accessibility best practices:

- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ ARIA labels where needed
- ✅ Color contrast compliance (WCAG AA)
- ✅ Screen reader friendly

### Testing Accessibility

```bash
npm install -D @axe-core/react
```

```tsx
// In development only
import React from 'react'
import ReactDOM from 'react-dom'

if (process.env.NODE_ENV !== 'production') {
  const axe = require('@axe-core/react')
  axe(React, ReactDOM, 1000)
}
```

---

## 🎨 Customization

### Extending Components

```tsx
import { Button } from '@/components/ui/anthropic-components'

export function IconButton({ icon, ...props }: any) {
  return (
    <Button className="flex items-center gap-2" {...props}>
      {icon}
      {props.children}
    </Button>
  )
}
```

### Creating Custom Variants

```tsx
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  const customVariants = {
    ...variants,
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-anthropic-green text-anthropic-light hover:bg-anthropic-green-hover'
  }
  
  // ... rest of component
}
```

---

## 🔧 Component File Structure

Recommended project structure:

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── anthropic-components.tsx  # Main components
│   │   ├── Button.tsx                # Individual exports
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── features/
│       └── your-feature-components/
└── styles/
    └── anthropic-theme.css           # Additional custom styles
```

---

## 💡 Pro Tips

1. **Consistent Spacing**: Always use the defined spacing tokens for margins and padding
2. **Color Harmony**: Stick to the three accent colors for a cohesive look
3. **Typography Hierarchy**: Use heading fonts for titles, body fonts for content
4. **Component Composition**: Build complex UIs by combining simple components
5. **Performance**: Import only the components you need

---

## 🐛 Troubleshooting

### Fonts Not Loading

Ensure Google Fonts are properly imported in your layout:

```tsx
import { Poppins, Lora } from 'next/font/google'
```

### Tailwind Classes Not Working

Make sure your `tailwind.config.js` includes all your component paths in the `content` array.

### Colors Not Matching

Double-check that you're using the exact hex values from the brand guidelines.

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Anthropic Brand Guidelines](https://www.anthropic.com/brand)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## 🤝 Contributing

When creating new components:
1. Follow the existing component patterns
2. Maintain consistent prop interfaces
3. Include TypeScript types
4. Support all standard HTML attributes via spread props
5. Add accessibility features
6. Document usage examples

---

## 📄 License

See LICENSE.txt for complete licensing information.
