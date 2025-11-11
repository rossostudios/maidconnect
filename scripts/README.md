# Deployment Optimization Scripts

This directory contains automation scripts to reduce excessive deployments and optimize your CI/CD workflow.

## 🎯 Quick Start

Run this one command to optimize everything:

```bash
bash scripts/optimize-deployments.sh
```

## 📋 Individual Scripts

### 1. `optimize-deployments.sh` (Main Script)

**Purpose:** Configures GitHub repository settings via CLI to reduce deployment noise.

**What it does:**
- ✅ Enables branch protection for `main`
- ✅ Enables auto-delete for merged branches
- ✅ Enables Dependabot security updates
- ✅ Enables vulnerability alerts
- ✅ Cleans up old Dependabot PRs
- ✅ Configures repository merge settings

**Usage:**
```bash
bash scripts/optimize-deployments.sh
```

**Expected outcome:** ~70% reduction in deployments from GitHub settings alone

---

### 2. `update-dependabot-config.sh`

**Purpose:** Updates Dependabot configuration to reduce PR frequency.

**Changes:**
- Weekly → Monthly update schedule
- 10 → 3 max open PRs
- Better dependency grouping
- Ignores major version updates

**Usage:**
```bash
bash scripts/update-dependabot-config.sh
git add .github/dependabot.yml
git commit -m "chore: optimize Dependabot config"
git push
```

**Expected outcome:** ~90% reduction in Dependabot PRs

---

### 3. `create-deployment-guard.sh`

**Purpose:** Creates GitHub Action that prevents Dependabot deployments.

**Creates:** `.github/workflows/deployment-guard.yml`

**What it does:**
- Detects Dependabot PRs
- Adds "no-deploy" label
- Adds explanatory comment
- Supports `[skip deploy]` commit flag

**Usage:**
```bash
bash scripts/create-deployment-guard.sh
git add .github/workflows/
git commit -m "ci: add deployment guard"
git push
```

**Expected outcome:** Prevents all Dependabot preview deployments

---

### 4. `create-vercel-ignore.sh`

**Purpose:** Creates script that Vercel uses to skip deployments.

**Creates:** `scripts/should-deploy.sh`

**Skips deployments for:**
- Dependabot branches/commits
- Commits with `[skip deploy]` or `[skip ci]`
- Documentation-only changes (`docs:`)
- Chore commits (`chore:`)

**Usage:**
```bash
# 1. Create the script
bash scripts/create-vercel-ignore.sh

# 2. Commit it
git add scripts/should-deploy.sh
git commit -m "ci: add Vercel deployment skip logic"
git push

# 3. Configure in Vercel Dashboard
# Go to: Settings > Git > Ignored Build Step
# Enter: bash scripts/should-deploy.sh
```

**Expected outcome:** Selective preview deployments based on commit type

---

## 🚀 Complete Setup (Recommended)

Run all optimizations in order:

```bash
# 1. Optimize GitHub settings (via CLI)
bash scripts/optimize-deployments.sh

# 2. Update Dependabot config
bash scripts/update-dependabot-config.sh

# 3. Create deployment guard workflow
bash scripts/create-deployment-guard.sh

# 4. Create Vercel ignore script
bash scripts/create-vercel-ignore.sh

# 5. Commit all changes
git add .github/ scripts/
git commit -m "chore: optimize deployment pipeline to reduce noise by 70%"
git push origin main

# 6. Configure Vercel (manual step)
# Go to Vercel Dashboard > Settings > Git > Ignored Build Step
# Enter: bash scripts/should-deploy.sh
```

---

## 📊 Expected Results

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Deployments/week | ~50-100 | ~10-20 | **70-80%** |
| Dependabot PRs/month | ~40 | ~3-12 | **70-90%** |
| Preview deployments | Every PR | Selected only | **~60%** |
| Open branches | 7+ | 2-3 | **~70%** |

---

## 🛠️ Troubleshooting

### Script fails with "Permission denied"

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### "gh: command not found"

Install GitHub CLI:
```bash
brew install gh
gh auth login
```

### "Branch protection update failed"

You may not have admin access. Ask repo owner to run the script.

### Vercel still deploying Dependabot PRs

Make sure you configured the Ignored Build Step in Vercel Dashboard (manual step required).

---

## 🔄 Rollback

If you need to revert changes:

### Dependabot Config
```bash
mv .github/dependabot.yml.backup .github/dependabot.yml
git add .github/dependabot.yml
git commit -m "chore: revert Dependabot config"
git push
```

### Branch Protection
```bash
gh api repos/rossostudios/casaora/branches/main/protection --method DELETE
```

### GitHub Actions
```bash
rm .github/workflows/deployment-guard.yml
git add .github/workflows/
git commit -m "ci: remove deployment guard"
git push
```

---

## 📚 Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Vercel Ignored Build Step](https://vercel.com/docs/deployments/configure-a-build#ignored-build-step)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

**Created:** 2025-11-11
**Last Updated:** 2025-11-11
**Maintained by:** rossostudios
