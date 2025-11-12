# Developer Onboarding Guide

> **Welcome to Casaora! This guide will get you up and running quickly.**

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Automated Setup](#automated-setup)
- [Manual Setup](#manual-setup)
- [Project Structure](#project-structure)
- [Daily Workflows](#daily-workflows)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**TL;DR - 5 Minute Setup:**

```bash
# 1. Clone the repository
git clone <repository-url>
cd maidconnect

# 2. Run automated setup
bash scripts/setup-dev-environment.sh

# 3. Start development
bun dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |
| **Bun** | >= 1.0 | JavaScript runtime & package manager | [bun.sh](https://bun.sh) |
| **Node.js** | >= 18 | Alternative runtime (optional) | [nodejs.org](https://nodejs.org/) |
| **Vercel CLI** | Latest | Deployment & env management | `npm install -g vercel` |
| **Supabase CLI** | Latest | Database management | `brew install supabase/tap/supabase` |
| **Docker** | Latest | For local Supabase | [docker.com](https://www.docker.com/) |

### Recommended Tools

- **VS Code** with extensions:
  - Biome (linting/formatting)
  - Tailwind CSS IntelliSense
  - TypeScript Extension Pack
- **Claude Code** (for AI assistance)
- **Postman** or **Insomnia** (API testing)

### Access Required

- ✅ GitHub repository access
- ✅ Vercel project access (ask team lead)
- ✅ Supabase project access (ask team lead)
- ✅ Slack workspace access

---

## Automated Setup

### Using the Setup Script

The easiest way to get started is using our automated setup script:

```bash
bash scripts/setup-dev-environment.sh
```

**What it does:**
1. ✅ Checks for required tools
2. ✅ Installs missing tools
3. ✅ Installs project dependencies
4. ✅ Links Vercel and Supabase projects
5. ✅ Pulls environment variables
6. ✅ Starts local Supabase
7. ✅ Generates TypeScript types
8. ✅ Runs health checks

**Expected output:**
```
=============================================
  Casaora Developer Environment Setup
=============================================

[1/10] Checking system requirements...
✅ Running on macOS
✅ Git installed: git version 2.39.0

[2/10] Checking Bun installation...
✅ Bun installed: v1.0.0

...

=============================================
  Setup Complete!
=============================================
✅ Your development environment is ready!
```

---

## Manual Setup

If you prefer manual setup or the automated script fails:

### 1. Install Tools

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Vercel CLI
npm install -g vercel

# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Install Supabase CLI (Linux)
# See: https://supabase.com/docs/guides/cli
```

### 2. Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd maidconnect

# Install dependencies
bun install
```

### 3. Configure Vercel

```bash
# Login to Vercel
vercel login

# Link to project
vercel link
# Follow prompts to select the Casaora project

# Pull environment variables
bun run vercel:env:pull
```

### 4. Configure Supabase

```bash
# Login to Supabase
supabase login

# Start local Supabase
supabase start

# This will start:
# - PostgreSQL database
# - Auth server
# - Storage API
# - Realtime server
# - Studio UI (http://localhost:54323)
```

### 5. Generate TypeScript Types

```bash
bun run db:types
```

### 6. Verify Setup

```bash
# Check database health
bun run db:health

# Run build to verify everything works
bun run build
```

### 7. Start Development

```bash
bun dev
```

---

## Project Structure

```
maidconnect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── (auth)/       # Auth routes
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── dashboard/    # User dashboards
│   │   │   └── page.tsx      # Home page
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── [feature]/        # Feature-specific components
│   ├── lib/                   # Business logic & utilities
│   │   ├── integrations/     # External services
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access
│   │   ├── utils/            # Helper functions
│   │   └── shared/           # Cross-cutting concerns
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── i18n/                  # Internationalization
├── supabase/
│   ├── config.toml           # Local Supabase config
│   ├── migrations/           # Database migrations
│   └── functions/            # Edge Functions
├── docs/                      # Documentation
├── scripts/                   # Automation scripts
├── tests/                     # E2E tests
└── public/                    # Static assets
```

**Key Directories:**

- `src/app/` - Next.js routing and pages
- `src/components/` - All React components
- `src/lib/services/` - Business logic layer
- `src/lib/integrations/` - External APIs (Supabase, Stripe, etc.)
- `supabase/migrations/` - Database schema changes

### Naming Rules

- **Components/Classes (.tsx/.jsx)** – PascalCase, 1–2 nouns only (e.g., `UserProfile.tsx`).
- **Support/Util/Hooks (.ts/.js)** – camelCase, 1–2 nouns (e.g., `userService.ts`).
- **Directories** – lowercase only (already enforced by tooling).
- **Brevity** – drop adjectives/verbs, keep ≤2 words, rely on directories for qualifiers.
- **Exemptions** – tool-mandated names stay as-is (`page.tsx`, `layout.tsx`, `route.ts`, `next.config.ts`, Storybook configs, `*.spec.*`, `*.test.*`, timestamped migrations, etc.).

> Use `node scripts/rename-files.mjs` (`--dry-run` / `--apply`) to audit or enforce these rules across the repo.

---

## Daily Workflows

### Starting Your Day

```bash
# 1. Pull latest changes
git pull origin develop

# 2. Install any new dependencies
bun install

# 3. Check for environment variable changes
bun run vercel:env:compare

# 4. Start Supabase if not running
supabase status || supabase start

# 5. Start development server
bun dev
```

### Creating a New Feature

```bash
# 1. Create feature branch from develop
git checkout develop
git pull
git checkout -b feature/your-feature-name

# 2. Make changes
# ... code ...

# 3. Run pre-deployment checks
bash scripts/pre-deploy-checks.sh --quick

# 4. Commit changes
git add .
git commit -m "feat: add your feature"

# 5. Push and create PR
git push origin feature/your-feature-name
# Create PR on GitHub targeting 'develop'
```

### Running Tests & Checks

```bash
# Lint check
bun run check

# Fix lint issues
bun run check:fix

# Type check
bun run build

# Run E2E tests
bun test

# Full pre-deployment check
bash scripts/pre-deploy-checks.sh
```

### Working with Database

```bash
# Check database health
bun run db:health

# Run security checks
bun run db:advisors:security

# Run performance checks
bun run db:advisors:performance

# Generate TypeScript types after schema changes
bun run db:types

# Create new migration
supabase migration new add_new_feature

# Apply migrations
supabase db reset
```

### Debugging

```bash
# View production logs
bun run vercel:logs

# Follow logs in real-time
bun run vercel:logs:follow

# Filter for errors
bun run vercel:logs | grep ERROR

# Check Supabase logs (via Claude Code)
# Ask Claude: "Check Supabase logs for errors"
```

---

## Deployment Process

### Weekly Release (Production)

**Schedule:** Fridays at 4pm

```bash
# 1. Ensure you're on develop branch
git checkout develop
git pull

# 2. Run full pre-deployment checks
bash scripts/pre-deploy-checks.sh

# 3. Create release (merges to main, creates tag, deploys)
bash scripts/create-release.sh

# 4. Monitor deployment
bun run vercel:logs:follow
```

**The release script automatically:**
- Generates changelog from commits
- Merges `develop` → `main`
- Creates Git tag
- Creates GitHub release
- Triggers Vercel production deployment

### Preview Deployment (Testing)

```bash
# Deploy current branch for testing
bun run vercel:deploy

# Deploy and open in browser
bash scripts/vercel-deploy-preview.sh --open
```

### Hotfix (Emergency)

```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-fix

# 2. Make fix
# ... code ...

# 3. Test locally
bun run build
bun test

# 4. Deploy directly to production
bun run vercel:deploy:prod

# 5. Merge back to main AND develop
git checkout main
git merge hotfix/critical-fix
git push

git checkout develop
git merge hotfix/critical-fix
git push
```

### Rollback

If something goes wrong after deployment:

```bash
# Interactive mode - shows recent deployments
bun run vercel:rollback

# Or specify deployment URL directly
bash scripts/vercel-rollback.sh casaora-abc123.vercel.app
```

---

## Troubleshooting

### Common Issues

#### Issue: `bun dev` fails to start

**Solutions:**
1. Check if port 3000 is in use:
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```
2. Clear `.next` directory:
   ```bash
   rm -rf .next
   bun dev
   ```
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules bun.lockb
   bun install
   ```

#### Issue: Supabase won't start

**Solutions:**
1. Check Docker is running:
   ```bash
   docker ps
   ```
2. Stop and restart Supabase:
   ```bash
   supabase stop
   supabase start
   ```
3. Reset Supabase (⚠️ deletes data):
   ```bash
   supabase db reset
   ```

#### Issue: Environment variables not working

**Solutions:**
1. Check `.env.local` exists:
   ```bash
   ls -la .env.local
   ```
2. Pull from Vercel:
   ```bash
   bun run vercel:env:pull
   ```
3. Restart dev server after changes

#### Issue: TypeScript errors after schema change

**Solutions:**
1. Regenerate types:
   ```bash
   bun run db:types
   ```
2. Restart TypeScript server in VS Code:
   - Cmd+Shift+P → "TypeScript: Restart TS Server"

#### Issue: Build fails with "Module not found"

**Solutions:**
1. Check import paths are correct
2. Verify file exists
3. Clear build cache:
   ```bash
   rm -rf .next
   bun run build
   ```

### Getting Help

1. **Check Documentation:**
   - [Vercel CLI Guide](./vercel-cli-guide.md)
   - [Supabase MCP Guide](./supabase-mcp-guide.md)
   - [Release Strategy](./release-strategy.md)
   - [CLAUDE.md](../CLAUDE.md) - Project tech stack & guidelines

2. **Ask Claude Code:**
   - "Why is my build failing?"
   - "Check Supabase logs for errors"
   - "How do I fix this TypeScript error?"

3. **Team Channels:**
   - #engineering - Technical questions
   - #deployments - Deployment issues
   - #general - General questions

---

## Quick Reference

### Most Used Commands

```bash
# Development
bun dev                      # Start dev server
bun run build                # Build for production
bun run check                # Run linter
bun run check:fix            # Fix lint issues

# Database
bun run db:health            # Check database health
bun run db:types             # Generate TypeScript types
bun run db:advisors          # Run security & performance checks
supabase start               # Start local Supabase
supabase stop                # Stop local Supabase

# Vercel
bun run vercel:env:pull      # Pull environment variables
bun run vercel:logs          # View production logs
bun run vercel:deploy        # Deploy preview
bash scripts/create-release.sh  # Create release

# Checks
bash scripts/pre-deploy-checks.sh  # Pre-deployment checks
bash scripts/supabase-health-check.sh  # Database health
```

### Project URLs

- **Production:** https://casaora.com
- **Staging:** https://develop-casaora.vercel.app
- **Local Dev:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323
- **Supabase API:** http://localhost:54321

### Important Files

- `CLAUDE.md` - AI development guidelines & tech stack
- `package.json` - NPM scripts and dependencies
- `supabase/config.toml` - Local Supabase configuration
- `.env.local` - Local environment variables (gitignored)
- `.vercel/project.json` - Vercel project link

---

## Next Steps

Now that you're set up, here's what to do next:

1. **Review Codebase:**
   - Read [CLAUDE.md](../CLAUDE.md) for tech stack overview
   - Explore `src/app/` to understand routing
   - Check `src/lib/` for business logic patterns

2. **Run Health Checks:**
   ```bash
   bash scripts/pre-deploy-checks.sh
   ```

3. **Pick Your First Task:**
   - Check GitHub Issues for "good first issue" label
   - Ask team lead for onboarding tasks
   - Review recent PRs to understand workflows

4. **Join Team Rituals:**
   - Daily standups (10am)
   - Weekly deployments (Fridays 4pm)
   - Sprint planning (Mondays)

---

**Welcome to the team! 🎉**

If you have questions, don't hesitate to ask in Slack or tag the team in your PR.

---

**Last Updated:** 2025-11-11
**Maintained By:** Casaora Development Team
