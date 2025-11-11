# Release & Deployment Strategy

**Last Updated:** 2025-11-11
**Status:** Active
**Owner:** rossostudios

---

## 📋 Table of Contents

- [Overview](#overview)
- [Release Schedule](#release-schedule)
- [Branch Strategy](#branch-strategy)
- [Semantic Versioning](#semantic-versioning)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)
- [FAQ](#faq)

---

## Overview

Casaora follows a **weekly release schedule** to balance frequent updates with deployment stability. This strategy reduces deployment noise while maintaining rapid iteration.

### Goals

1. **Predictability:** Regular, scheduled releases
2. **Quality:** Time for testing and review
3. **Communication:** Clear changelog and release notes
4. **Efficiency:** Reduce excessive deployments (from 174 → 10)

### Key Metrics

- **Before optimization:** ~77 deployments/week
- **After optimization:** ~7-10 deployments/week
- **Reduction:** 85%+ fewer deployments

---

## Release Schedule

### Weekly Release Cycle

| Day | Activity |
|-----|----------|
| **Monday-Thursday** | Development on `develop` branch |
| **Friday 3pm** | Code freeze for release |
| **Friday 4pm** | Create release, merge to `main` |
| **Friday 5pm** | Monitor production deployment |
| **Weekend** | Hotfixes only (if critical) |

### Exception: Hotfixes

Critical bug fixes can be deployed outside the schedule:
- Security vulnerabilities
- Production-breaking bugs
- Data integrity issues
- Payment processing failures

---

## Branch Strategy

```
main (production)
 ├─ v1.0.0 (tag)
 ├─ v1.1.0 (tag)
 └─ v1.2.0 (tag)
     ↑
develop (staging)
 ├─ feature/booking-improvements
 ├─ feature/admin-analytics
 └─ fix/payment-error
```

### Branches

1. **`main`** (protected)
   - Always matches production
   - Only accepts PRs from `develop`
   - Tagged with version numbers
   - Auto-deploys to Vercel production

2. **`develop`** (integration)
   - Integration branch for features
   - Accepts PRs from feature branches
   - Preview deployments on Vercel
   - Weekly merge to `main`

3. **`feature/*`** (short-lived)
   - One feature per branch
   - Merge to `develop` when ready
   - Delete after merge

4. **`hotfix/*`** (emergency)
   - Branch from `main` for critical fixes
   - Merge back to both `main` and `develop`
   - Delete after merge

---

## Semantic Versioning

Casaora uses [Semantic Versioning 2.0.0](https://semver.org/):

```
v MAJOR . MINOR . PATCH
  └──┬───┘  └─┬──┘  └─┬──┘
     │       │       └─ Bug fixes, patches
     │       └───────── New features (backward compatible)
     └───────────────── Breaking changes
```

### Examples

- `v1.0.0` → `v1.0.1` : Patch (bug fix)
- `v1.0.1` → `v1.1.0` : Minor (new feature)
- `v1.1.0` → `v2.0.0` : Major (breaking change)

### Version Bumping Rules

**Patch (v1.0.X):**
- Bug fixes only
- Security patches
- Performance improvements
- No new features

**Minor (v1.X.0):**
- New features (backward compatible)
- Deprecation warnings
- Significant improvements
- Database migrations (backward compatible)

**Major (vX.0.0):**
- Breaking API changes
- Database schema breaking changes
- Removed features
- Major refactors

---

## Release Process

### Automated (Recommended)

Use the release script:

```bash
# From develop branch
git checkout develop
git pull origin develop

# Create release (auto-generates changelog)
bash scripts/create-release.sh

# Or specify version
bash scripts/create-release.sh v1.2.0
```

The script will:
1. ✅ Generate changelog from commits
2. ✅ Merge `develop` → `main`
3. ✅ Create Git tag
4. ✅ Create GitHub release
5. ✅ Trigger production deployment

### Manual Process

If you prefer manual control:

#### 1. Prepare Release

```bash
# Update develop
git checkout develop
git pull origin develop

# Update main
git checkout main
git pull origin main
```

#### 2. Generate Changelog

```bash
# Get commits since last release
git log v1.0.0..HEAD --oneline --no-merges > changelog.txt

# Categorize and format
# - Features (feat:)
# - Bug fixes (fix:)
# - Chores (chore:, docs:, refactor:)
```

#### 3. Merge and Tag

```bash
# Merge develop → main
git checkout main
git merge develop --no-ff -m "chore: release v1.1.0"

# Create tag
git tag -a v1.1.0 -m "Release v1.1.0"

# Push
git push origin main
git push origin v1.1.0
```

#### 4. Create GitHub Release

```bash
gh release create v1.1.0 \
  --title "Casaora v1.1.0" \
  --notes-file CHANGELOG.md \
  --latest
```

#### 5. Monitor Deployment

- Check Vercel dashboard: https://vercel.com/rossostudios/casaora
- Watch GitHub deployments: https://github.com/rossostudios/casaora/deployments
- Test critical flows on production

---

## Hotfix Process

For critical issues that can't wait for the weekly release:

### 1. Create Hotfix Branch

```bash
# Branch from main (production)
git checkout main
git pull origin main
git checkout -b hotfix/payment-error
```

### 2. Fix and Test

```bash
# Make your fix
# Test locally
# Run tests: bun test
```

### 3. Deploy Hotfix

```bash
# Commit
git add .
git commit -m "fix: resolve payment processing error [hotfix]"

# Push hotfix branch
git push -u origin hotfix/payment-error

# Create PR to main
gh pr create --base main --title "Hotfix: Payment processing error"

# After approval, merge
gh pr merge --squash

# Tag hotfix
git checkout main
git pull
git tag -a v1.1.1 -m "Hotfix v1.1.1: Payment processing"
git push origin v1.1.1
```

### 4. Backport to Develop

```bash
# Merge hotfix back to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

---

## Deployment Configuration

### Vercel Settings

**Current Configuration:**

- **Production Branch:** `main`
- **Preview Branches:** `develop` only
- **Ignored Build Step:** `bash scripts/should-deploy.sh`

**What Gets Deployed:**

| Scenario | Production | Preview |
|----------|------------|---------|
| Push to `main` | ✅ Yes | - |
| Push to `develop` | - | ✅ Yes |
| Push to `feature/*` | - | ❌ No |
| Dependabot PR | - | ❌ No (skipped) |
| `chore:` commit | ❌ No (skipped) | ❌ No (skipped) |
| `docs:` commit | ❌ No (skipped) | ❌ No (skipped) |
| `[skip deploy]` flag | ❌ No (skipped) | ❌ No (skipped) |

### GitHub Actions

**Deployment Guard Workflow:**
- Blocks Dependabot preview deployments
- Adds labels to PRs
- Posts explanatory comments

---

## FAQ

### When should I create a release vs. just pushing to develop?

**Push to develop:**
- Daily feature work
- Bug fixes in progress
- Experimental changes
- Work in progress

**Create a release (Friday):**
- Features ready for production
- Bug fixes tested and approved
- End of weekly sprint
- Hotfixes (exception to Friday rule)

### How do I skip a deployment?

Add `[skip deploy]` to your commit message:

```bash
git commit -m "docs: update README [skip deploy]"
```

Or use `chore:` or `docs:` prefix (auto-skipped):

```bash
git commit -m "chore: update dependencies"
git commit -m "docs: add API documentation"
```

### What if I need to deploy on a different day?

Run the release script any day:

```bash
bash scripts/create-release.sh
```

The weekly schedule is a guideline, not a strict rule.

### How do I roll back a bad release?

#### Option 1: Revert via Git

```bash
# Revert the merge commit
git checkout main
git revert -m 1 HEAD
git push origin main

# Vercel will auto-deploy the rollback
```

#### Option 2: Redeploy Previous Version (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Find the last good deployment
3. Click "..." → "Promote to Production"

#### Option 3: Create Hotfix

If the issue requires code changes:
1. Create hotfix branch from previous tag
2. Apply fix
3. Deploy as hotfix (see Hotfix Process above)

### How do I communicate releases to users?

1. **GitHub Release Notes:** Automatic via script
2. **Changelog:** Update CHANGELOG.md
3. **In-App Banner:** Use changelog modal component
4. **Email:** For major releases (v2.0.0, etc.)
5. **Social Media:** For significant features

### Can I create a release without merging to main?

No. Releases should only be created from `main` to ensure:
- Release tags match production code
- Clear audit trail
- Consistent versioning

For pre-releases or beta versions, use:

```bash
git tag -a v1.2.0-beta.1 -m "Beta release"
gh release create v1.2.0-beta.1 --prerelease
```

---

## Related Documentation

- [Deployment Optimization](../scripts/README.md)
- [Git Workflow](./git-workflow.md) (to be created)
- [Contributing Guidelines](../CONTRIBUTING.md) (to be created)

---

## Changelog

**2025-11-11:**
- Initial release strategy document
- Added weekly release schedule
- Documented branch strategy
- Created release automation script

---

**Questions or suggestions?** Open an issue or PR!

🚀 **Casaora** | Built by [rossostudios](https://github.com/rossostudios)
