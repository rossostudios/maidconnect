# GitHub Branch Protection Setup

**Epic F-3.5: Add Required Status Checks to GitHub Branch Protection**

This guide configures branch protection rules to enforce PR checks before merging to `develop`.

## Required Status Checks

The following checks **must pass** before a PR can be merged:

1. ✅ **Build Verification** - `build`
2. ✅ **Code Quality Check** - `lint`
3. ✅ **Smoke Tests (E2E)** - `smoke-tests`

---

## Setup Instructions

### Step 1: Access Branch Protection Settings

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Under "Branch protection rules", click **"Add rule"**

### Step 2: Configure `develop` Branch Protection

**Branch name pattern:** `develop`

#### Required Settings

**☑️ Require a pull request before merging**
- Require approvals: `1` (at least 1 code review)
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners (if CODEOWNERS file exists)

**☑️ Require status checks to pass before merging**
- Require branches to be up to date before merging

Select required status checks:
- `Build Verification` (from `.github/workflows/pr-checks.yml`)
- `Code Quality Check` (from `.github/workflows/pr-checks.yml`)
- `Smoke Tests (E2E)` (from `.github/workflows/pr-checks.yml`)

**☑️ Require conversation resolution before merging**
- All review comments must be resolved

**☑️ Require linear history** (optional but recommended)
- Prevents merge commits, enforces rebase or squash

**☑️ Include administrators**
- Enforce rules for admins too (best practice)

#### Additional Recommended Settings

**☑️ Allow force pushes** → **Specify who can force push** → `Nobody`
- Prevents accidental history rewriting

**☑️ Allow deletions** → ❌ (disabled)
- Prevents accidental branch deletion

### Step 3: Configure `main` Branch Protection

**Branch name pattern:** `main`

Use the same settings as `develop`, plus:

**☑️ Require deployments to succeed before merging**
- Add `production` environment requirement (if configured)

**☑️ Require merge queue** (optional for high-traffic repos)
- Enables automatic merge queue management

---

## Verification

### Test Branch Protection

1. Create a test PR to `develop`:
   ```bash
   git checkout -b test/branch-protection
   echo "# Test" > test-file.md
   git add test-file.md
   git commit -m "test: verify branch protection"
   git push origin test/branch-protection
   ```

2. Open PR on GitHub

3. Verify:
   - ❌ "Merge" button is disabled (checks pending)
   - ⏳ PR checks are running (Build, Lint, Smoke Tests)
   - ⏳ Review is required

4. Wait for checks to complete:
   - ✅ All checks pass → "Merge" button enabled
   - ❌ Any check fails → "Merge" button disabled

5. Request review from teammate

6. After approval + passing checks → Can merge

### Expected Behavior

**Scenario 1: All checks pass + approved**
```
✅ Build Verification
✅ Code Quality Check
✅ Smoke Tests (E2E)
✅ Approved by @teammate

→ "Merge pull request" button is GREEN
```

**Scenario 2: Build fails**
```
❌ Build Verification (failed)
✅ Code Quality Check
⏭️ Smoke Tests (E2E) (skipped - depends on build)
✅ Approved by @teammate

→ "Merge pull request" button is DISABLED
→ PR shows "Some checks were not successful"
```

**Scenario 3: Lint fails**
```
✅ Build Verification
❌ Code Quality Check (failed - Biome errors)
✅ Smoke Tests (E2E)
✅ Approved by @teammate

→ "Merge pull request" button is DISABLED
→ Run `bun run check:fix` locally to resolve
```

**Scenario 4: Missing approval**
```
✅ Build Verification
✅ Code Quality Check
✅ Smoke Tests (E2E)
⏳ Review required

→ "Merge pull request" button is DISABLED
→ Request review from teammate
```

---

## Troubleshooting

### Issue: Status checks not appearing

**Solution:**
1. Ensure GitHub Actions workflow has run at least once
2. Check workflow file paths match: `.github/workflows/pr-checks.yml`
3. Verify branch name in workflow trigger matches PR target: `develop`

### Issue: Can't add specific status check

**Solution:**
1. Status checks only appear after they've run once
2. Create a test PR to trigger workflows
3. Return to branch protection settings to select checks

### Issue: Admins can bypass checks

**Solution:**
1. Ensure "Include administrators" is checked
2. No one should bypass checks (even admins)

### Issue: Checks stuck in "Expected" state

**Solution:**
1. Check GitHub Actions → Workflow runs for errors
2. Verify all required jobs are defined in workflow
3. Check job dependencies (e.g., `needs: [build, lint]`)

---

## Maintenance

### Adding New Required Checks

When adding a new required check to the workflow:

1. Add job to `.github/workflows/pr-checks.yml`
2. Trigger workflow by creating test PR
3. After first successful run, add to branch protection:
   - Settings → Branches → Edit rule for `develop`
   - Search for new check name
   - Select checkbox

### Removing Required Checks

1. Settings → Branches → Edit rule for `develop`
2. Uncheck status check
3. Save changes
4. (Optional) Remove job from workflow file

### Updating Check Names

If you rename a job in the workflow:

1. Update branch protection to remove old check name
2. Create test PR to trigger new check name
3. Add new check name to branch protection

---

## Security Considerations

**🔒 Why Require Status Checks?**

| Risk | Mitigation |
|------|------------|
| Broken build deployed | Build job catches compile errors |
| Code quality issues | Biome catches lint/format violations |
| Regressions in core flows | Smoke tests catch critical bugs |
| Unreviewed code merged | Require 1+ approval |
| Force pushes breaking history | Disable force pushes |

**✅ Best Practices:**

- ✅ Require all checks to pass (no exceptions)
- ✅ Include administrators in rules
- ✅ Require conversation resolution
- ✅ Use linear history (rebase/squash only)
- ✅ Disable force pushes and branch deletion

---

## Related Documentation

- [PR Checks Workflow](../../.github/workflows/pr-checks.yml)
- [Staging Smoke Tests Workflow](../../.github/workflows/staging-smoke-tests.yml)
- [Staging Environment Setup](./staging-environment-setup.md)

---

**Last Updated:** 2025-01-14
**Owner:** DevOps Team
**Status:** Ready for implementation
