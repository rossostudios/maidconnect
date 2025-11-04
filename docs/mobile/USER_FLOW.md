# Mobile App User Flow - Profile & Account Features

## Profile Editing Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ACCOUNT SCREEN                              │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Signed in as                                                  │ │
│  │ • Email: user@example.com                                     │ │
│  │ • Role: Customer                                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Profile                                                        │ │
│  │  [👤] Edit Profile                                      →     │ │◄─┐
│  └───────────────────────────────────────────────────────────────┘ │  │
│                                                                     │  │
│  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │ Quick Links                                                    │ │  │
│  │  [💳] Payment Methods                                   →     │ │  │
│  │  ────────────────────────────────────────────                 │ │  │
│  │  [📍] Saved Addresses                                   →     │ │  │
│  │  ────────────────────────────────────────────                 │ │  │
│  │  [❤️] My Favorites                                      →     │ │  │
│  └───────────────────────────────────────────────────────────────┘ │  │
│                                                                     │  │
│  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │ Support                                                        │ │  │
│  │  [?] Help & Support                                     →     │ │  │
│  │  ────────────────────────────────────────────                 │ │  │
│  │  [🛡️] Privacy Policy                                    →     │ │  │
│  │  ────────────────────────────────────────────                 │ │  │
│  │  [📄] Terms of Service                                  →     │ │  │
│  └───────────────────────────────────────────────────────────────┘ │  │
│                                                                     │  │
│  [Sign out]                                                        │  │
│  Version 1.0.0                                                     │  │
└─────────────────────────────────────────────────────────────────────┘  │
                                                                         │
                                                                         │
                                                                         │
                    User taps "Edit Profile"                            │
                              │                                          │
                              ▼                                          │
┌─────────────────────────────────────────────────────────────────────┐  │
│                      EDIT PROFILE SCREEN                            │  │
│  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │ Cancel          Edit Profile                Save              │   │  │
│  └──────────────────────────────────────────────────────────────┘   │  │
│                                                                     │  │
│                        ┌─────────────┐                              │  │
│                        │    Photo    │ ◄─── Tap to change           │  │
│                        │   [📷]      │                              │  │
│                        └─────────────┘                              │  │
│                     Tap to change photo                             │  │
│                                                                     │  │
│  Email                                                              │  │
│  [user@example.com                    ] (read-only)                │  │
│  Email cannot be changed                                            │  │
│                                                                     │  │
│  Full Name *                                                        │  │
│  [John Doe                            ]                            │  │
│                                                                     │  │
│  Phone Number                                                       │  │
│  [+57 300 123 4567                    ]                            │  │
│                                                                     │  │
│  City                                                               │  │
│  [Medellín                            ]                            │  │
│                                                                     │  │
│  Country                                                            │  │
│  [Colombia                            ]                            │  │
│                                                                     │  │
└─────────────────────────────────────────────────────────────────────┘  │
                              │                                          │
                    User taps "Save"                                     │
                              │                                          │
                              ▼                                          │
                    Validate & Update                                    │
                              │                                          │
                              ▼                                          │
                    Success Alert                                        │
                              │                                          │
                              ▼                                          │
                    Navigate back ───────────────────────────────────────┘


## Photo Upload Flow

┌─────────────────────────────────────────────────────────────────────┐
│                        PHOTO OPTIONS                                │
│                                                                     │
│  User taps profile photo                                            │
│         │                                                            │
│         ▼                                                            │
│  Action Sheet appears:                                              │
│  ┌───────────────────────┐                                          │
│  │  Take Photo           │ ──► Request camera permission            │
│  │  Choose from Library  │ ──► Request library permission           │
│  │  Remove Photo         │ ──► Confirm deletion                     │
│  │  Cancel               │                                          │
│  └───────────────────────┘                                          │
│         │                                                            │
│         ▼                                                            │
│  Permission granted?                                                │
│         │                                                            │
│    Yes  │  No                                                        │
│         │  └──► Show error message                                  │
│         ▼                                                            │
│  Open picker/camera                                                 │
│         │                                                            │
│         ▼                                                            │
│  User selects image                                                 │
│         │                                                            │
│         ▼                                                            │
│  Crop to 1:1 aspect ratio                                           │
│         │                                                            │
│         ▼                                                            │
│  Set quality to 0.8                                                 │
│         │                                                            │
│         ▼                                                            │
│  Display preview                                                    │
│         │                                                            │
│         ▼                                                            │
│  User taps "Save"                                                   │
│         │                                                            │
│         ▼                                                            │
│  Convert URI to blob                                                │
│         │                                                            │
│         ▼                                                            │
│  Upload to Supabase Storage                                         │
│  (profile-photos/avatars/{userId}-{timestamp}.{ext})                │
│         │                                                            │
│         ▼                                                            │
│  Get public URL                                                     │
│         │                                                            │
│         ▼                                                            │
│  Update profiles.avatar_url                                         │
│         │                                                            │
│         ▼                                                            │
│  Success!                                                           │
└─────────────────────────────────────────────────────────────────────┘


## Quick Links Navigation

┌─────────────────────────────────────────────────────────────────────┐
│                        QUICK LINKS                                  │
│                                                                     │
│  Payment Methods ──────► /payment-methods screen                    │
│         │                 • View saved cards                        │
│         │                 • Add new card                            │
│         │                 • Set default                             │
│         │                 • Delete cards                            │
│                                                                     │
│  Saved Addresses ──────► /addresses screen                          │
│         │                 • View addresses                          │
│         │                 • Add new address                         │
│         │                 • Edit address                            │
│         │                 • Delete address                          │
│         │                 • Set default                             │
│                                                                     │
│  My Favorites ──────────► /favorites screen                         │
│         │                 • View favorite professionals             │
│         │                 • Remove favorites                        │
│         │                 • Book with favorites                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


## Data Flow

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │ Actions
       ▼
┌──────────────────┐
│   React Query    │ ◄───── Cache Layer
└──────┬───────────┘
       │ API Calls
       ▼
┌──────────────────┐
│  Profile API     │
│  • fetchProfile  │
│  • updateProfile │
│  • uploadPhoto   │
└──────┬───────────┘
       │ Supabase Calls
       ▼
┌──────────────────────────────────────┐
│           Supabase                   │
│  ┌────────────┐  ┌────────────────┐ │
│  │ PostgreSQL │  │    Storage     │ │
│  │ (profiles) │  │ (profile-pics) │ │
│  └────────────┘  └────────────────┘ │
└──────────────────────────────────────┘
```

## State Management

```
Initial Load:
1. useQuery fetches profile data
2. Data cached by React Query
3. UI displays current values

User Edit:
1. User modifies form
2. Local state updates immediately
3. User taps Save

Save Process:
1. useMutation called with new data
2. Optimistic update (optional)
3. API call to update backend
4. On success: invalidate cache
5. React Query refetches
6. UI updates with fresh data
7. Navigate back

Error Handling:
1. API error occurs
2. Show user-friendly alert
3. Rollback optimistic update
4. Keep user on edit screen
5. Allow retry
```

## Permissions Flow

```
Camera Access:
1. User taps "Take Photo"
2. Check permission status
3. If not granted → Request permission
4. If denied → Show settings alert
5. If granted → Open camera

Photo Library:
1. User taps "Choose from Library"
2. Check permission status
3. If not granted → Request permission
4. If denied → Show settings alert
5. If granted → Open picker

Platform Differences:
• iOS: Uses NSCameraUsageDescription & NSPhotoLibraryUsageDescription
• Android: Uses CAMERA & READ_EXTERNAL_STORAGE permissions
```

## Error Scenarios

```
Network Error:
• Display: "Unable to connect. Check your internet connection."
• Action: Retry button

Authentication Error:
• Display: "Session expired. Please sign in again."
• Action: Redirect to sign in

Validation Error:
• Display: "Please fill in required fields"
• Action: Highlight missing fields

Upload Error:
• Display: "Failed to upload photo. Please try again."
• Action: Keep photo preview, allow retry

Permission Denied:
• Display: "Camera access required. Enable in Settings."
• Action: Link to device settings
```

## Success States

```
Profile Updated:
• Alert: "Profile updated successfully"
• Action: Auto-navigate back
• Cache: Invalidated and refreshed

Photo Uploaded:
• Visual: New photo displayed
• Backend: URL saved to database
• Storage: File uploaded to bucket

Navigation:
• Smooth transition
• No data loss
• Preserved scroll position
```

## Performance Optimizations

1. **Image Optimization**
   - Aspect ratio: 1:1 (square)
   - Quality: 0.8 (80%)
   - Format: Auto-detected
   - Max size: Handled by quality setting

2. **Caching Strategy**
   - Profile data: Cached for session
   - Invalidate on update only
   - Stale-while-revalidate pattern

3. **Loading States**
   - Skeleton screens (could add)
   - Spinner for mutations
   - Disabled states during saves

4. **Network Efficiency**
   - Only upload changed data
   - Batch updates where possible
   - Retry logic for failures
