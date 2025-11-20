# Casaora Mobile App

React Native mobile application for Casaora - Professional home services marketplace.

## Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform and build tools
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **Supabase** - Backend (auth, database, storage)
- **React Native AsyncStorage** - Local data persistence

## Design System

The mobile app follows the **Lia Design System** with Anthropic-inspired design principles:

- **Anthropic Rounded Corners** - `borderRadius: 12` for buttons/cards/inputs, full rounded for avatars/badges
- **Geist-inspired Typography** - Clean, modern font hierarchy
- **4px Grid System** - All spacing in multiples of 4
- **Three-Accent Palette** - Orange (primary), Blue (secondary), Green (success)
- **Warm Neutral Grays** - Anthropic-inspired color palette

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components (Button, Input, Card)
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   └── main/         # Main app screens
│   ├── navigation/       # React Navigation setup
│   ├── hooks/            # Custom React hooks (useAuth)
│   ├── lib/              # Utilities and integrations
│   │   ├── supabase.ts   # Supabase client configuration
│   │   └── format.ts     # Formatting utilities
│   ├── types/            # TypeScript type definitions
│   └── constants/        # App constants (colors, etc.)
├── App.tsx               # Root component
├── app.json              # Expo configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Expo CLI** (installed globally or via npx)
- **iOS Simulator** (macOS only) or **Android Studio** (for Android development)
- **Supabase Project** (for backend services)

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Installation

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run on iOS Simulator (macOS only)
bun run ios

# Run on Android Emulator
bun run android

# Run in web browser (for testing)
bun run web
```

## Development Workflow

### Testing Authentication

1. Start the development server: `bun start`
2. Open the app in Expo Go (mobile) or simulator
3. Test the authentication flow:
   - Sign up with a new account
   - Verify email (check Supabase inbox)
   - Sign in with credentials
   - Test forgot password flow

### Adding New Features

1. **Create screen component** in `src/screens/`
2. **Add navigation route** in `src/navigation/`
3. **Update types** in `src/types/navigation.ts`
4. **Use design system components** from `src/components/`
5. **Follow Lia Design System** principles (rounded corners, spacing, colors)

### Design System Guidelines

**Always use:**
- `borderRadius: 12` for buttons, cards, and inputs (Anthropic rounded-lg)
- Full rounded (`borderRadius: 9999`) for avatars and badges
- Colors from `src/constants/colors.ts`
- Spacing in multiples of 4px (8, 12, 16, 20, 24, 32, etc.)

**Never use:**
- Sharp corners (missing borderRadius) - violates Lia Design System
- Glass morphism (backdrop blur effects)
- Random color values - always use the color palette

## Key Features

### Implemented

✅ Authentication flow (sign in, sign up, forgot password)
✅ React Navigation setup with auth and main stacks
✅ Supabase client with AsyncStorage persistence
✅ Lia Design System components (Button, Input, Card)
✅ Main app screens (Home, Search, Bookings, Profile)
✅ TypeScript type safety throughout

### To Be Implemented

🔲 Professional search and filtering
🔲 Booking creation and management
🔲 Payment integration (Stripe/PayPal)
🔲 Professional profile details
🔲 Real-time booking updates
🔲 Push notifications
🔲 In-app messaging
🔲 Reviews and ratings
🔲 Multi-country support (CO, PY, UY, AR)

## Supabase Integration

The mobile app uses Supabase for:

- **Authentication** - Email/password, OAuth providers
- **Database** - PostgreSQL with Row-Level Security
- **Storage** - File uploads (profile images, documents)
- **Realtime** - Live booking updates

The Supabase client is configured in `src/lib/supabase.ts` with AsyncStorage for session persistence.

## Navigation Structure

```
RootNavigator (based on auth state)
├── AuthNavigator (unauthenticated)
│   ├── Welcome
│   ├── SignIn
│   ├── SignUp
│   └── ForgotPassword
└── MainNavigator (authenticated)
    ├── Home (tab)
    ├── Search (tab)
    ├── Bookings (tab)
    └── Profile (tab)
```

## Shared Code with Web App

The mobile app shares these from the web app:

- **Territory configuration** - Countries, cities, currencies (`src/types/territories.ts`)
- **Database types** - Supabase type definitions (to be synced)
- **Business logic** - Formatting utilities, validation rules

## Building for Production

### iOS

```bash
# Build for App Store
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Play Store
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

**Note:** Requires Expo Application Services (EAS) account and configuration.

## Testing

### Manual Testing

1. Test authentication flow on both iOS and Android
2. Verify navigation between screens
3. Test form validation and error handling
4. Verify API integration with Supabase

### Automated Testing (Future)

- Jest for unit tests
- Detox for E2E tests

## Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
# Clear cache and restart
bun start --clear
```

**TypeScript errors:**
```bash
# Rebuild TypeScript definitions
rm -rf node_modules && bun install
```

**Supabase connection issues:**
- Verify `.env` file has correct credentials
- Check Supabase dashboard for API status
- Ensure you're using the correct Supabase URL (not pooler URL)

**Navigation types not working:**
- Ensure you've added the route to the correct navigator type in `src/types/navigation.ts`

## Contributing

When contributing to the mobile app:

1. Follow the Lia Design System guidelines
2. Use TypeScript for all new code
3. Add proper navigation types
4. Test on both iOS and Android
5. Follow the existing code structure

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Supabase Docs](https://supabase.com/docs)
- [Lia Design System](../docs/lia/) - Web app design system reference

## Support

For questions or issues:

1. Check the troubleshooting section above
2. Review the web app's CLAUDE.md for backend context
3. Consult the main project documentation

---

**Version:** 1.0.0 (MVP)
**Last Updated:** 2025-11-20
