# Local Development Setup

**Complete guide for setting up a full-featured MaidConnect development environment**

This guide provides detailed instructions for setting up your local development environment across different operating systems.

---

## Table of Contents

- [System Requirements](#system-requirements)
- [Platform-Specific Setup](#platform-specific-setup)
  - [macOS Setup](#macos-setup)
  - [Windows Setup](#windows-setup)
  - [Linux Setup](#linux-setup)
- [IDE Configuration](#ide-configuration)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Payment Integration (Stripe)](#payment-integration-stripe)
- [Email Testing](#email-testing)
- [AI Integration (Amara)](#ai-integration-amara)
- [Feature Flags](#feature-flags)
- [Development Workflows](#development-workflows)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

- **CPU:** Dual-core 2.0 GHz
- **RAM:** 8 GB (16 GB recommended)
- **Storage:** 10 GB free space
- **OS:** macOS 11+, Windows 10+, or Linux (Ubuntu 20.04+)
- **Internet:** Stable connection for API calls

### Recommended Specs

- **CPU:** Quad-core 3.0 GHz or better
- **RAM:** 16 GB or more
- **Storage:** SSD with 20 GB+ free space
- **Display:** 1920x1080 or higher resolution
- **GPU:** Integrated graphics sufficient

---

## Platform-Specific Setup

## macOS Setup

### 1. Install Homebrew

```bash
# Install Homebrew package manager
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Verify installation
brew --version
```

### 2. Install Development Tools

```bash
# Install Git
brew install git

# Install Node.js (for fallback compatibility)
brew install node@20

# Install Bun (primary package manager)
brew install oven-sh/bun/bun

# Install PostgreSQL (for Supabase)
brew install postgresql@15

# Install Docker Desktop (for Supabase local)
brew install --cask docker

# Verify installations
git --version
node --version
bun --version
docker --version
```

### 3. Install Supabase CLI

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Verify installation
supabase --version

# Login to Supabase
supabase login
```

### 4. Install Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login
```

### 5. Optional: Install GitHub CLI

```bash
# Install GitHub CLI
brew install gh

# Authenticate with GitHub
gh auth login
```

---

## Windows Setup

### 1. Install Package Manager (Chocolatey or Scoop)

**Option A: Chocolatey (Recommended)**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Verify installation
choco --version
```

**Option B: Scoop**
```powershell
# Run PowerShell (doesn't require admin)
iwr -useb get.scoop.sh | iex

# Verify installation
scoop --version
```

### 2. Install Development Tools

**Using Chocolatey:**
```powershell
# Install Git
choco install git -y

# Install Node.js
choco install nodejs-lts -y

# Install Bun
powershell -c "irm bun.sh/install.ps1|iex"

# Install Docker Desktop
choco install docker-desktop -y

# Refresh environment variables
refreshenv
```

**Using Scoop:**
```powershell
# Add extras bucket
scoop bucket add extras

# Install tools
scoop install git
scoop install nodejs-lts
scoop install docker
powershell -c "irm bun.sh/install.ps1|iex"
```

### 3. Install Supabase CLI

```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download from GitHub releases
# https://github.com/supabase/cli/releases
```

### 4. Install Stripe CLI

```powershell
# Using Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Or download from Stripe
# https://github.com/stripe/stripe-cli/releases/latest
```

### 5. Install WSL2 (Optional but Recommended)

```powershell
# Enable WSL
wsl --install

# Install Ubuntu
wsl --install -d Ubuntu

# Restart computer
```

**Benefits of WSL2:**
- Better performance for Node.js
- Native Unix commands
- Easier Docker integration

---

## Linux Setup

### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y curl wget git build-essential

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install PostgreSQL
sudo apt install -y postgresql-15 postgresql-contrib

# Install Supabase CLI
wget https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz
tar -xzf supabase_linux_amd64.tar.gz
sudo mv supabase /usr/local/bin/
rm supabase_linux_amd64.tar.gz

# Install Stripe CLI
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xzf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
rm stripe_linux_x86_64.tar.gz

# Verify installations
git --version
node --version
bun --version
docker --version
supabase --version
stripe --version
```

### Fedora/RHEL

```bash
# Update system
sudo dnf update -y

# Install prerequisites
sudo dnf install -y curl wget git gcc-c++ make

# Install Node.js
sudo dnf module install -y nodejs:20

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Docker
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker

# Follow Ubuntu instructions for Supabase and Stripe CLI
```

---

## IDE Configuration

### VS Code Setup

#### 1. Install VS Code

**macOS:**
```bash
brew install --cask visual-studio-code
```

**Windows:**
```powershell
choco install vscode -y
```

**Linux:**
```bash
sudo snap install --classic code
```

#### 2. Install Essential Extensions

Create `.vscode/extensions.json` in project root:

```json
{
  "recommendations": [
    // Core Development
    "biomejs.biome",                    // Linting & formatting (REQUIRED)
    "bradlc.vscode-tailwindcss",        // Tailwind autocomplete
    "dbaeumer.vscode-eslint",           // TypeScript hints

    // Database & Backend
    "supabase.supabase",                // Supabase tools
    "ckolkman.vscode-postgres",         // PostgreSQL client

    // Payments
    "stripe.stripe-vscode",             // Stripe integration

    // i18n
    "lokalise.i18n-ally",               // Translation management

    // Git & Collaboration
    "eamodio.gitlens",                  // Git supercharged
    "github.copilot",                   // AI pair programmer (optional)

    // Productivity
    "streetsidesoftware.code-spell-checker", // Spell checker
    "wayou.vscode-todo-highlight",      // TODO highlighting
    "usernamehw.errorlens",             // Inline error messages

    // Testing
    "ms-playwright.playwright",         // Playwright Test Runner

    // Markdown
    "yzhang.markdown-all-in-one"        // Markdown editing
  ]
}
```

Install all recommended extensions:
```bash
# From command palette (Cmd/Ctrl+Shift+P)
Extensions: Show Recommended Extensions
→ Install All
```

#### 3. Configure VS Code Settings

Create `.vscode/settings.json`:

```json
{
  // Editor
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,

  // TypeScript
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.tsdk": "node_modules/typescript/lib",

  // Tailwind CSS
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],

  // Files
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/.git": true
  },
  "files.watcherExclude": {
    "**/.next/**": true,
    "**/node_modules/**": true
  },

  // Search
  "search.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/bun.lockb": true
  },

  // Biome (Linter)
  "biome.lspBin": "node_modules/@biomejs/biome/bin/biome",

  // Git
  "git.enableSmartCommit": true,
  "git.confirmSync": false,

  // i18n Ally
  "i18n-ally.localesPaths": ["src/i18n"],
  "i18n-ally.keystyle": "nested",

  // Spell Checker
  "cSpell.words": [
    "maidconnect",
    "casaora",
    "supabase",
    "nextjs",
    "tailwindcss",
    "biome"
  ]
}
```

#### 4. Keyboard Shortcuts

Create `.vscode/keybindings.json`:

```json
[
  {
    "key": "cmd+shift+f",
    "command": "biome.format",
    "when": "editorTextFocus"
  },
  {
    "key": "cmd+shift+l",
    "command": "biome.lint",
    "when": "editorTextFocus"
  }
]
```

---

## Environment Variables

### Complete `.env.local` Configuration

Copy `.env.example` and fill in the values:

```bash
cp .env.example .env.local
```

#### Required Variables

```bash
# ============================================
# REQUIRED: Supabase
# ============================================
# Get from: https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # NEVER expose to client!

# ============================================
# REQUIRED: Application URLs
# ============================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# ============================================
# REQUIRED: Stripe (Test Mode)
# ============================================
# Get from: https://dashboard.stripe.com/test/apikeys

STRIPE_SECRET_KEY=sk_test_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...  # From Stripe CLI or dashboard

# ============================================
# REQUIRED: Cron Secret
# ============================================
# Generate with: openssl rand -base64 32
CRON_SECRET=your-random-secret
```

#### Optional Variables

```bash
# ============================================
# OPTIONAL: Email Service (Resend)
# ============================================
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_xxx...

# ============================================
# OPTIONAL: Push Notifications (VAPID)
# ============================================
# Generate with: node scripts/generate-vapid-keys.js
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx...
VAPID_PRIVATE_KEY=xxx...
VAPID_SUBJECT=mailto:support@casaora.co

# ============================================
# OPTIONAL: Logging (Better Stack)
# ============================================
# Get from: https://logs.betterstack.com/
LOGTAIL_SOURCE_TOKEN=xxx...
NEXT_PUBLIC_LOGTAIL_TOKEN=xxx...

# ============================================
# OPTIONAL: Rate Limiting (Upstash Redis)
# ============================================
# Get from: https://console.upstash.com/
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx...

# ============================================
# OPTIONAL: AI Assistant (Amara)
# ============================================
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxx...
NEXT_PUBLIC_FEATURE_AMARA_ENABLED=true

# ============================================
# OPTIONAL: Translation (Google Translate)
# ============================================
# Get from: https://console.cloud.google.com/
GOOGLE_TRANSLATE_API_KEY=xxx...

# ============================================
# OPTIONAL: Background Checks
# ============================================
# Checkr: https://dashboard.checkr.com/
CHECKR_API_KEY=xxx...
CHECKR_WEBHOOK_SECRET=xxx...

# Truora: https://dashboard.truora.com/
TRUORA_API_KEY=xxx...
TRUORA_WEBHOOK_SECRET=xxx...
```

### Environment Variable Priority

Next.js loads env files in this order (later files override earlier):

1. `.env` - Committed defaults (DO NOT put secrets here)
2. `.env.local` - Local overrides (gitignored, put secrets here)
3. `.env.development` - Development-specific
4. `.env.production` - Production-specific

**Rule:** Use `.env.local` for all local development secrets.

---

## Database Setup

### Option 1: Local Supabase (Recommended for Development)

#### Start Local Supabase

```bash
# Start all Supabase services
supabase start

# Output shows connection details:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# anon key: eyJxxx...
# service_role key: eyJxxx...
```

#### Update `.env.local` for Local Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase-start>
```

#### Apply Migrations

```bash
# Reset database and run all migrations
supabase db reset

# Or apply migrations manually
supabase db push
```

#### Access Supabase Studio

Open [http://localhost:54323](http://localhost:54323) to:
- Browse tables and data
- Run SQL queries
- View logs
- Test RLS policies
- Manage auth users

### Option 2: Remote Supabase Project

#### Create Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in details:
   - **Name:** maidconnect-dev-yourname
   - **Database Password:** Generate strong password
   - **Region:** South America (São Paulo) - closest to Colombia

#### Link Local CLI to Remote

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push local migrations to remote
supabase db push
```

#### Get API Keys

1. Go to Project Settings > API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Database Management Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Restart Supabase
supabase stop && supabase start

# Reset database (drops all data, re-runs migrations)
supabase db reset

# Create new migration
supabase migration new add_your_feature

# Check for schema differences
supabase db diff

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# View logs
supabase logs

# View status
supabase status
```

---

## Payment Integration (Stripe)

### Setup Stripe Test Environment

#### 1. Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create account (use **Test mode**)

#### 2. Get API Keys

1. Go to [Developers > API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

#### 3. Setup Webhooks (Local Testing)

**Option A: Stripe CLI (Recommended)**

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook signing secret → STRIPE_WEBHOOK_SECRET
```

**Option B: Dashboard Webhook (For Remote Dev)**

1. Go to [Developers > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL:** `https://your-dev-domain.com/api/webhooks/stripe`
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

#### 4. Test Payment Flow

```bash
# Start dev server
bun run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger payment_intent.succeeded
```

### Stripe Test Cards

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**Any future expiry date and any 3-digit CVC works for test cards.**

---

## Email Testing

### Option 1: Resend (Production-like)

```bash
# Sign up: https://resend.com
# Get API key: https://resend.com/api-keys

RESEND_API_KEY=re_xxx...
```

**Test email:**
```bash
curl -X POST 'http://localhost:3000/api/test/email' \
  -H 'Content-Type: application/json' \
  -d '{"to":"you@example.com"}'
```

### Option 2: MailHog (Local SMTP Catcher)

```bash
# Install MailHog
brew install mailhog  # macOS
# or download from: https://github.com/mailhog/MailHog

# Start MailHog
mailhog

# Access web UI: http://localhost:8025
# SMTP server: localhost:1025
```

Configure in `.env.local`:
```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@maidconnect.local
```

---

## AI Integration (Amara)

### Setup Anthropic API

#### 1. Create Account

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Create account and verify email

#### 2. Get API Key

1. Go to [Account > API Keys](https://console.anthropic.com/account/keys)
2. Create new key
3. Copy → `ANTHROPIC_API_KEY`

#### 3. Enable Amara

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-xxx...
NEXT_PUBLIC_FEATURE_AMARA_ENABLED=true
```

#### 4. Test Amara

1. Start dev server: `bun run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Look for floating chat button (bottom-right)
4. Click and ask: "Find me cleaners in Bogotá"

**Note:** Amara requires active professionals in database. Seed data if needed:

```bash
bun run db:seed  # If seed script exists
```

---

## Feature Flags

### Environment-Based Flags

Feature flags are controlled via environment variables:

```bash
# .env.local

# Enable Amara AI Assistant
NEXT_PUBLIC_FEATURE_AMARA_ENABLED=true

# Enable web vitals tracking
NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS=true

# Show match wizard
NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD=true

# Enhanced trust badges
NEXT_PUBLIC_FEATURE_ENHANCED_TRUST_BADGES=true

# Live price breakdown
NEXT_PUBLIC_FEATURE_LIVE_PRICE_BREAKDOWN=true

# Auto-translate chat
NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT=true

# One-tap rebook
NEXT_PUBLIC_FEATURE_ONE_TAP_REBOOK=true

# Recurring plans
NEXT_PUBLIC_FEATURE_RECURRING_PLANS=true
```

### Using Feature Flags in Code

```typescript
// Check if feature is enabled
import { isFeatureEnabled } from '@/lib/feature-flags';

if (isFeatureEnabled('AMARA_ENABLED')) {
  // Show Amara chat button
}
```

---

## Development Workflows

### Daily Development

```bash
# 1. Start services
supabase start                  # Terminal 1
stripe listen --forward-to ...  # Terminal 2 (if testing payments)
bun run dev                     # Terminal 3

# 2. Make changes
code .

# 3. Test changes
# Browser: http://localhost:3000

# 4. Run quality checks
bun run check:fix

# 5. Commit
git add .
git commit -m "feat: description"
```

### Testing Workflow

```bash
# Unit tests (if added)
bun test

# E2E tests (Playwright)
bun test:ui              # Interactive mode
bun test:headed          # See browser
bun test -- bookings     # Run specific test

# Type checking
bun run build            # Will fail on type errors
```

### Database Migration Workflow

```bash
# 1. Make schema changes
code supabase/migrations/20250106_your_feature.sql

# 2. Apply locally
supabase db reset

# 3. Generate types
supabase gen types typescript --local > src/types/supabase.ts

# 4. Test changes
bun run dev

# 5. Commit migration
git add supabase/migrations/
git commit -m "feat(db): add your feature table"
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
bun run dev -- -p 3001
```

### Supabase Won't Start

```bash
# Check Docker is running
docker ps

# If Docker not running:
# macOS: Open Docker Desktop
# Linux: sudo systemctl start docker

# Reset Supabase
supabase stop
supabase start
```

### Database Migration Errors

```bash
# Check current migration status
supabase db diff

# Reset and reapply all migrations
supabase db reset

# If migration file has errors, fix then:
supabase db reset
```

### TypeScript Errors After DB Changes

```bash
# Regenerate types
supabase gen types typescript --local > src/types/supabase.ts

# Restart TypeScript server in VS Code
# Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Stripe Webhook Not Working

```bash
# Check Stripe CLI is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify webhook secret matches
echo $STRIPE_WEBHOOK_SECRET

# Test webhook manually
stripe trigger payment_intent.succeeded
```

### Environment Variables Not Loading

```bash
# Restart dev server after env changes
# Stop server (Ctrl+C)
bun run dev

# Check env is loaded
# In your code:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
bun install
bun run dev
```

### Permission Errors (macOS/Linux)

```bash
# Fix npm/bun permissions
sudo chown -R $(whoami) ~/.bun
sudo chown -R $(whoami) ~/.npm

# For Docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## Next Steps

Now that your environment is set up:

1. **Read [Getting Started Guide](./getting-started.md)** - Make your first contribution
2. **Explore [Development Guide](./development-guide.md)** - Learn common patterns
3. **Review [API Reference](../03-technical/api-reference.md)** - Understand the API
4. **Study [Database Schema](../03-technical/database-schema.md)** - Learn the data model

---

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team
