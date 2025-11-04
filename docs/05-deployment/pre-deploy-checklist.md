# Pre-Deployment Checklist

Before deploying to Vercel, complete these steps:

## 🔐 Gather API Keys & Credentials

- [ ] **Supabase**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` from Supabase → Settings → API
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Settings → API
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` from Supabase → Settings → API

- [ ] **Stripe**
  - [ ] `STRIPE_SECRET_KEY` from Stripe → Developers → API Keys
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from Stripe → Developers → API Keys
  - [ ] `STRIPE_WEBHOOK_SECRET` - Will create after first deployment

- [ ] **Resend**
  - [ ] Sign up at [resend.com](https://resend.com)
  - [ ] `RESEND_API_KEY` from Resend → API Keys

- [ ] **App Config**
  - [ ] Generate `CRON_SECRET`: Run `openssl rand -base64 32` in terminal
  - [ ] `NEXT_PUBLIC_BASE_URL` - Will be your Vercel URL (e.g., `https://casaora.vercel.app`)

## 📝 Code & Database

- [ ] All migrations applied to Supabase production database
  ```bash
  supabase db push
  ```

- [ ] Test build locally
  ```bash
  npm run build
  ```

- [ ] No TypeScript errors
  ```bash
  npx tsc --noEmit
  ```

- [ ] Commit and push all changes to Git
  ```bash
  git add .
  git commit -m "feat: add booking lifecycle and email notifications"
  git push
  ```

## 🚀 Deploy to Vercel

1. [ ] Go to [vercel.com/new](https://vercel.com/new)
2. [ ] Import your repository
3. [ ] Add ALL environment variables from the list above
4. [ ] Deploy!

## 🔗 Post-Deployment

- [ ] Copy your Vercel deployment URL (e.g., `https://casaora.vercel.app`)
- [ ] Update `NEXT_PUBLIC_BASE_URL` in Vercel → Settings → Environment Variables
- [ ] Set up Stripe webhook (see DEPLOYMENT.md Step 3)
- [ ] Redeploy to apply new env vars

## ✅ Test Everything

- [ ] Sign up as customer works
- [ ] Sign up as professional works
- [ ] Can browse professionals directory
- [ ] Professional can complete onboarding
- [ ] Customer can create booking
- [ ] Professional receives email notification (check spam!)
- [ ] Professional can accept/decline booking
- [ ] Customer receives confirmation/decline email
- [ ] Cron job visible in Vercel → Settings → Cron Jobs

---

## Quick Reference: Generate CRON_SECRET

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Online:**
https://generate-secret.vercel.app/32

---

## Troubleshooting

**Build fails on Vercel?**
→ Run `npm run build` locally first to catch errors

**Environment variables not working?**
→ Redeploy after adding them (Vercel → Deployments → Redeploy)

**Emails not sending?**
→ Check Resend dashboard logs and verify API key

**Database connection fails?**
→ Verify Supabase keys are correct and project isn't paused

---

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
