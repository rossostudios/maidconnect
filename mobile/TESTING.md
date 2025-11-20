# Mobile App Testing Guide

## Prerequisites

### 1. Install Development Tools

```bash
# Install Node.js and Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install Expo CLI globally
npm install -g expo-cli

# Or use npx (no global install needed)
npx expo --version
```

### 2. Install Expo Go on Your Device

**iOS:**
- Download "Expo Go" from the App Store
- Sign in or create an Expo account

**Android:**
- Download "Expo Go" from the Google Play Store
- Sign in or create an Expo account

### 3. Environment Setup

Create `.env` file in `/mobile` directory:

```bash
cd /home/user/casaora/mobile
cp .env.example .env  # If .env.example exists

# Or create .env manually with:
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

Get Supabase credentials from:
- Production: https://supabase.com/dashboard/project/your-project-id/settings/api
- Local: After running `supabase start` in main project directory

---

## Running the Mobile App

### Method 1: Expo Go (Recommended for Quick Testing)

```bash
# Navigate to mobile directory
cd /home/user/casaora/mobile

# Install dependencies
bun install

# Start development server
bun start

# Or use:
npx expo start
```

This will:
1. Start the Metro bundler
2. Show a QR code in your terminal
3. Display options to open on iOS, Android, or web

**Scan QR Code:**
- **iOS:** Open Camera app → Point at QR code → Tap notification
- **Android:** Open Expo Go app → Tap "Scan QR Code" → Point at QR code

### Method 2: iOS Simulator (Mac Only)

```bash
cd /home/user/casaora/mobile
bun start

# Press 'i' to open iOS Simulator
# Or:
npx expo start --ios
```

Requirements:
- Xcode installed from Mac App Store
- iOS Simulator configured

### Method 3: Android Emulator

```bash
cd /home/user/casaora/mobile
bun start

# Press 'a' to open Android Emulator
# Or:
npx expo start --android
```

Requirements:
- Android Studio installed
- Android Virtual Device (AVD) configured
- Emulator running

### Method 4: Web Browser (Limited Features)

```bash
cd /home/user/casaora/mobile
bun start

# Press 'w' to open in web browser
# Or:
npx expo start --web
```

**Note:** Some native features won't work in web (camera, native date picker, etc.)

---

## Testing Checklist

### 1. Authentication Flow

**Sign Up:**
- [ ] Open app → See Welcome screen
- [ ] Tap "Crear Cuenta"
- [ ] Enter full name, email, password
- [ ] Tap "Registrarse"
- [ ] Verify navigation to Main app (Home screen)

**Sign In:**
- [ ] Sign out if signed in
- [ ] Tap "Iniciar Sesión"
- [ ] Enter email, password
- [ ] Tap "Iniciar Sesión"
- [ ] Verify navigation to Main app

**Forgot Password:**
- [ ] From Sign In screen, tap "¿Olvidaste tu contraseña?"
- [ ] Enter email
- [ ] Tap "Enviar Instrucciones"
- [ ] Check email for reset link (Supabase will send email)

**Session Persistence:**
- [ ] Sign in successfully
- [ ] Close app completely (swipe up/kill process)
- [ ] Reopen app
- [ ] Verify auto-login to Main app (no auth screen shown)

---

### 2. Professional Search & Discovery

**Home Screen:**
- [ ] View featured professionals
- [ ] Check professional cards show:
  - [ ] Profile picture
  - [ ] Name
  - [ ] Rating (if available)
  - [ ] Services list
  - [ ] Hourly rate in local currency
  - [ ] Verified badge (if applicable)
- [ ] Tap on professional card → Navigate to detail

**Search Screen:**
- [ ] Navigate to "Buscar" tab (bottom navigation)
- [ ] View search filters:
  - [ ] Service type buttons (Limpieza, Plomería, etc.)
  - [ ] Minimum rating selector
  - [ ] Verified only toggle
- [ ] Apply filters:
  - [ ] Tap "Limpieza" → See only cleaning professionals
  - [ ] Set minimum rating to 4.0 → See high-rated pros
  - [ ] Toggle "Verificados" → See only verified pros
- [ ] Clear filters → See all professionals
- [ ] Pull down to refresh → See loading indicator

**Professional Detail:**
- [ ] Tap any professional → See detail screen
- [ ] Verify displayed information:
  - [ ] Large profile picture
  - [ ] Full name
  - [ ] Rating and review count
  - [ ] Hourly rate
  - [ ] Services badges
  - [ ] Bio/description
  - [ ] Background check status
  - [ ] City/country
- [ ] Tap "Reservar" button → Navigate to booking flow

---

### 3. Booking Flow (Critical Path)

**Step 1: Service Selection**
- [ ] From professional detail, tap "Reservar"
- [ ] See service selection grid (6 services)
- [ ] Tap "Limpieza General" → Highlight in orange
- [ ] Adjust duration:
  - [ ] Tap "-" button → Decrease hours
  - [ ] Tap "+" button → Increase hours
  - [ ] Verify minimum 1 hour, maximum 8 hours
- [ ] Read info card about duration estimation
- [ ] Tap "Continuar" → Navigate to date/time

**Step 2: Date & Time Selection**
- [ ] **iOS:** See inline calendar picker
- [ ] **Android:** See horizontal date scroll
- [ ] Select date (within next 30 days)
- [ ] View time slots grid (8 AM - 8 PM)
- [ ] Tap available time slot → Highlight in orange
- [ ] Verify unavailable slots are grayed out
- [ ] Check selected date/time summary at top
- [ ] Tap "Continuar" → Navigate to address

**Step 3: Address Input**
- [ ] Enter street address (e.g., "Calle 123 #45-67")
- [ ] Select city from dropdown
- [ ] Select neighborhood (optional)
- [ ] Add delivery notes (optional, e.g., "Apartamento 302")
- [ ] Verify form validation:
  - [ ] Empty street → Show error
  - [ ] Empty city → Disable continue button
- [ ] Fill all required fields
- [ ] Tap "Continuar" → Navigate to confirmation

**Step 4: Booking Confirmation**
- [ ] Review professional summary:
  - [ ] Picture, name, rating
- [ ] Review service details:
  - [ ] Service type
  - [ ] Date and time (Spanish format)
  - [ ] Duration
  - [ ] Address (full formatted)
- [ ] Review price breakdown:
  - [ ] Hourly rate
  - [ ] Duration calculation (e.g., "3.0 × $50,000")
  - [ ] Total amount in local currency
- [ ] Tap "Confirmar Reserva" → Navigate to payment

**Step 5: Payment (Stripe)**
- [ ] See total amount in large display
- [ ] Wait for payment initialization (loading indicator)
- [ ] See Stripe CardField appear
- [ ] Enter test card details:
  - [ ] Card number: `4242 4242 4242 4242`
  - [ ] Expiry: Any future date (e.g., `12/25`)
  - [ ] CVC: Any 3 digits (e.g., `123`)
- [ ] Verify "Pagar Ahora" button enables when card is complete
- [ ] Tap "Pagar Ahora"
- [ ] See payment processing (loading state)
- [ ] Verify success alert: "¡Pago Exitoso!"
- [ ] Tap "Ver Reserva" → Navigate to booking detail

---

### 4. Booking Management

**Bookings Screen:**
- [ ] Navigate to "Reservas" tab (bottom navigation)
- [ ] See Active/Past tabs
- [ ] **Active Tab:**
  - [ ] View pending bookings (orange badge)
  - [ ] View confirmed bookings (blue badge)
  - [ ] View in-progress bookings (green badge)
- [ ] **Past Tab:**
  - [ ] View completed bookings (gray badge)
  - [ ] View cancelled bookings (red badge)
- [ ] Check booking cards show:
  - [ ] Service type
  - [ ] Date and time
  - [ ] Professional name and picture
  - [ ] Address
  - [ ] Total amount
  - [ ] Status badge
- [ ] Pull down to refresh → See loading indicator
- [ ] Tap booking card → Navigate to detail

**Booking Detail:**
- [ ] See large status card with icon and color
- [ ] View professional information:
  - [ ] Picture, name, rating
- [ ] View service details:
  - [ ] Service type
  - [ ] Date and time
  - [ ] Duration
- [ ] View address:
  - [ ] Full address with neighborhood
  - [ ] Delivery notes (if provided)
- [ ] View total amount
- [ ] **For pending/confirmed bookings:**
  - [ ] See "Cancelar Reserva" button
  - [ ] Tap cancel button → See confirmation alert
  - [ ] Confirm cancellation → See success alert
  - [ ] Navigate back → See status changed to "Cancelada"
- [ ] **For completed/cancelled bookings:**
  - [ ] No cancel button shown

---

### 5. Multi-Currency Testing

**Colombia (COP):**
- [ ] Search for professionals in Colombia cities
- [ ] Verify prices show "COP $50,000" format
- [ ] Complete booking → Verify currency in payment

**Paraguay (PYG):**
- [ ] Search for professionals in Asunción
- [ ] Verify prices show "₲ 300,000" format
- [ ] Complete booking → Verify currency

**Uruguay (UYU):**
- [ ] Search for professionals in Montevideo
- [ ] Verify prices show "$U 2,000" format
- [ ] Complete booking → Verify currency

**Argentina (ARS):**
- [ ] Search for professionals in Buenos Aires
- [ ] Verify prices show "$ 25,000" format
- [ ] Complete booking → Verify currency

---

### 6. Navigation & UI Testing

**Bottom Tab Navigation:**
- [ ] Tap "Inicio" → Navigate to Home
- [ ] Tap "Buscar" → Navigate to Search
- [ ] Tap "Reservas" → Navigate to Bookings
- [ ] Tap "Perfil" → Navigate to Profile
- [ ] Verify active tab is highlighted in orange

**Back Navigation:**
- [ ] From any screen, tap back button (top-left)
- [ ] Verify navigation to previous screen
- [ ] From professional detail, tap back → Return to search/home

**Design System (Lia):**
- [ ] Check all buttons have 12px rounded corners
- [ ] Check all cards have 12px rounded corners
- [ ] Check all inputs have 12px rounded corners
- [ ] Check badges have fully rounded corners (pills)
- [ ] Verify orange (primary), blue (info), green (success) colors
- [ ] Verify Geist font throughout

---

### 7. Error Handling & Edge Cases

**Network Errors:**
- [ ] Turn off Wi-Fi/data
- [ ] Try to load professionals → See error message
- [ ] Turn on network → Pull to refresh → Data loads

**Invalid Credentials:**
- [ ] Try sign in with wrong password → See error alert
- [ ] Try sign up with existing email → See error alert

**Booking Validation:**
- [ ] Try to continue without selecting service → Button disabled
- [ ] Try to continue without selecting time → Button disabled
- [ ] Try to continue without entering address → Show validation errors

**Payment Errors:**
- [ ] Enter invalid card (e.g., `4000 0000 0000 0002`) → See decline error
- [ ] Enter incomplete card → Button stays disabled
- [ ] Cancel payment → Navigate back to confirmation

---

### 8. Performance Testing

**Load Times:**
- [ ] Home screen loads in < 2 seconds
- [ ] Search results appear in < 1 second
- [ ] Professional detail loads in < 1 second
- [ ] Booking screens transition smoothly

**Scroll Performance:**
- [ ] Scroll professional list → Smooth, no jank
- [ ] Scroll booking list → Smooth performance
- [ ] Date picker scrolls smoothly

**Image Loading:**
- [ ] Professional pictures load progressively
- [ ] No broken image placeholders
- [ ] Images are properly sized (not stretched)

---

## Common Issues & Troubleshooting

### Issue: "Unable to resolve module"
**Solution:**
```bash
cd mobile
rm -rf node_modules
bun install
npx expo start --clear
```

### Issue: "Network request failed" or "Supabase connection error"
**Solution:**
- Check `.env` file has correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase project is running (local or cloud)
- Check network connectivity

### Issue: "Stripe not initialized"
**Solution:**
- Verify `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`
- Use test key from Stripe Dashboard (starts with `pk_test_`)
- Restart Expo server after adding .env variables

### Issue: iOS Simulator won't open
**Solution:**
```bash
# Open Xcode → Preferences → Locations
# Verify Command Line Tools is selected

# Start simulator manually:
open -a Simulator

# Then press 'i' in Expo terminal
```

### Issue: Android Emulator won't connect
**Solution:**
```bash
# Check Android SDK location:
echo $ANDROID_HOME

# Start emulator from Android Studio
# Then press 'a' in Expo terminal
```

### Issue: App stuck on splash screen
**Solution:**
- Check Metro bundler terminal for errors
- Look for Supabase connection issues
- Try hard reload: Shake device → Tap "Reload"

---

## Automated Testing (Future)

### Unit Tests
```bash
cd mobile
bun test
```

### E2E Tests (Detox - To Be Implemented)
```bash
cd mobile
bun run e2e:ios
bun run e2e:android
```

---

## Test Accounts

### Customer Account (For Testing)
```
Email: test-customer@casaora.com
Password: TestCustomer123!
```

### Professional Account (For Testing - Future)
```
Email: test-pro@casaora.com
Password: TestPro123!
```

**Note:** Create these test accounts via sign-up flow or Supabase dashboard

---

## Stripe Test Cards

### Successful Payments
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

### Failed Payments (For Error Testing)
```
Declined: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
Expired Card: 4000 0000 0000 0069
```

**Full list:** https://stripe.com/docs/testing#cards

---

## Reporting Bugs

When reporting issues, include:

1. **Device Info:**
   - Device model (e.g., iPhone 14, Samsung Galaxy S23)
   - OS version (e.g., iOS 17.2, Android 13)
   - Expo Go version OR Simulator/Emulator details

2. **Steps to Reproduce:**
   - Numbered list of exact steps
   - Expected behavior
   - Actual behavior

3. **Screenshots/Videos:**
   - Screen recording (iOS: Swipe down → Screen Recording)
   - Screenshots of error messages

4. **Console Logs:**
   - Copy errors from Metro bundler terminal
   - Include timestamp and full error stack

5. **Environment:**
   - Supabase: Local or Production
   - Network: Wi-Fi or Mobile data
   - First install or existing user

---

## Next Steps After Testing

1. **Create test accounts** in Supabase for consistent testing
2. **Populate database** with sample professionals for each country
3. **Test payment flows** with Stripe test mode
4. **Document bugs** in GitHub issues
5. **Plan Phase 1 features** (Messaging, Profile Management, Reviews)

---

## Quick Start Testing Script

```bash
# Complete testing flow (5-10 minutes):

1. Install Expo Go on phone
2. cd /home/user/casaora/mobile
3. bun install
4. bun start
5. Scan QR code with phone
6. Sign up with new account
7. Search for professionals
8. Create a test booking (use Stripe test card)
9. View booking in Bookings tab
10. Cancel the booking
11. Verify cancellation successful

✅ If all steps work, your mobile app is production-ready for customer bookings!
```
