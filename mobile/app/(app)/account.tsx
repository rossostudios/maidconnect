import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationsProvider';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
  type UserRole,
} from '@/features/notifications/preferences';

type Profile = {
  id: string;
  role: string;
  onboarding_status: string;
  locale: string;
  phone: string | null;
  city: string | null;
  country: string | null;
};

type PreferenceField = {
  key: string;
  label: string;
  description: string;
};

const CUSTOMER_FIELDS: PreferenceField[] = [
  {
    key: 'bookingConfirmed',
    label: 'Booking confirmed',
    description: 'Receive a push alert when the MaidConnect team confirms your request.',
  },
  {
    key: 'bookingAccepted',
    label: 'Booking accepted',
    description: 'Get notified the moment a professional accepts your booking.',
  },
  {
    key: 'bookingDeclined',
    label: 'Booking declined',
    description: 'Stay informed if a request is declined so you can reassign quickly.',
  },
  {
    key: 'serviceStarted',
    label: 'Service started',
    description: 'Know when a professional checks in and begins the job.',
  },
  {
    key: 'serviceCompleted',
    label: 'Service completed',
    description: 'Confirm when on-site work wraps so you can follow up with the client.',
  },
  {
    key: 'newMessage',
    label: 'New message',
    description: 'Ping your phone when customers or professionals send new messages.',
  },
  {
    key: 'reviewReminder',
    label: 'Review reminder',
    description: 'Get nudged to request reviews after services finish.',
  },
];

const PROFESSIONAL_FIELDS: PreferenceField[] = [
  {
    key: 'newBookingRequest',
    label: 'New booking request',
    description: 'Alerts when dispatch assigns a new customer to you.',
  },
  {
    key: 'bookingCanceled',
    label: 'Booking canceled',
    description: 'Know immediately if a scheduled job gets canceled.',
  },
  {
    key: 'paymentReceived',
    label: 'Payment received',
    description: 'Track when payouts are processed and ready.',
  },
  {
    key: 'newMessage',
    label: 'New message',
    description: 'Notifications for customer or support messages that need attention.',
  },
  {
    key: 'reviewReceived',
    label: 'Review received',
    description: 'Celebrate new reviews as soon as they land.',
  },
];

export default function AccountScreen() {
  const { session, signOut } = useAuth();
  const {
    expoPushToken,
    permissionsStatus,
    isDeviceSupported,
    isRegistering: isRegisteringForPush,
    requestPermissions,
  } = useNotifications();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, onboarding_status, locale, phone, city, country')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('[mobile] Failed to load profile', error);
      setError('Unable to load your profile details right now.');
      return;
    }

    setProfile(data);
    setError(null);
  }, [session?.user.id]);

  useEffect(() => {
    loadProfile().catch(() => {
      // handled in loadProfile
    });
  }, [loadProfile]);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('[mobile] Unable to sign out', error);
      Alert.alert('Sign out failed', 'Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEnablePush = async () => {
    const status = await requestPermissions();
    if (status !== 'granted') {
      Alert.alert('Notifications disabled', 'Allow push notifications from settings to stay updated.');
    }
  };

  const userRole = useMemo<UserRole | undefined>(() => {
    if (profile?.role === 'customer' || profile?.role === 'professional' || profile?.role === 'admin') {
      return profile.role;
    }
    return undefined;
  }, [profile?.role]);

  const roleForPreferences = userRole === 'customer' || userRole === 'professional' ? userRole : null;

  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences', roleForPreferences],
    enabled: Boolean(roleForPreferences),
    queryFn: () => fetchNotificationPreferences((roleForPreferences ?? 'customer') as UserRole),
  });

  const preferencesMutation = useMutation({
    mutationFn: (updated: NotificationPreferences) => {
      if (!roleForPreferences) {
        return Promise.resolve();
      }
      return updateNotificationPreferences(roleForPreferences, updated);
    },
    onMutate: async (nextPreferences) => {
      const queryKey = ['notification-preferences', roleForPreferences];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(queryKey);
      queryClient.setQueryData(queryKey, nextPreferences);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notification-preferences', roleForPreferences], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', roleForPreferences] }).catch(
        (invalidateError) => {
          console.warn('[notifications] Failed to refresh preferences', invalidateError);
        },
      );
    },
  });

  const preferenceFields = useMemo(() => {
    if (roleForPreferences === 'professional') {
      return PROFESSIONAL_FIELDS;
    }
    if (roleForPreferences === 'customer') {
      return CUSTOMER_FIELDS;
    }
    return [];
  }, [roleForPreferences]);

  const currentPreferences = preferencesQuery.data;
  const isSavingPreferences = preferencesMutation.isPending;

  const handlePreferenceToggle = (key: string, value: boolean) => {
    if (!currentPreferences || !roleForPreferences) {
      return;
    }
    const updated: NotificationPreferences = {
      ...currentPreferences,
      [key]: value,
    };
    preferencesMutation.mutate(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.subtitle}>
            Manage your MaidConnect account and quickly review your onboarding status.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signed in as</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{session?.user.email}</Text>

            <Text style={styles.label}>User ID</Text>
            <Text style={styles.valueMuted}>{session?.user.id}</Text>

            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{profile?.role ?? '—'}</Text>

            <Text style={styles.label}>Locale</Text>
            <Text style={styles.value}>{profile?.locale ?? session?.user?.user_metadata?.locale ?? 'en-US'}</Text>

            <Text style={styles.label}>Onboarding status</Text>
            <StatusTag value={profile?.onboarding_status ?? 'unknown'} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{profile?.phone ?? 'Add from dashboard'}</Text>

            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>
              {[profile?.city, profile?.country].filter(Boolean).join(', ') || 'Not set'}
            </Text>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Device support</Text>
            <Text style={styles.value}>{isDeviceSupported ? 'Ready' : 'Use a physical device'}</Text>

            <Text style={styles.label}>Permission</Text>
            <StatusTag value={permissionsStatus ?? 'unknown'} />

            <Text style={styles.label}>Expo push token</Text>
            <Text style={styles.valueMuted}>
              {expoPushToken ? expoPushToken : 'Not registered yet'}
            </Text>

            <Pressable
              style={[
                styles.secondaryButton,
                (isRegisteringForPush || permissionsStatus === 'granted') && styles.secondaryButtonDisabled,
              ]}
              onPress={handleEnablePush}
              disabled={isRegisteringForPush || permissionsStatus === 'granted'}>
              <Text style={styles.secondaryButtonLabel}>
                {isRegisteringForPush ? 'Checking…' : permissionsStatus === 'granted' ? 'Active' : 'Enable push alerts'}
              </Text>
            </Pressable>

            {roleForPreferences ? (
              <View style={styles.preferencesSection}>
                <Text style={styles.preferenceHeader}>Notification preferences</Text>
                {preferencesQuery.isLoading ? (
                  <View style={styles.preferenceLoading}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.preferenceLoadingLabel}>Loading preferences…</Text>
                  </View>
                ) : null}
                {preferencesQuery.isError ? (
                  <Text style={styles.error}>
                    Unable to load notification preferences right now. Pull to refresh later.
                  </Text>
                ) : null}

                {currentPreferences
                  ? preferenceFields.map((field) => (
                      <View key={field.key} style={styles.preferenceRow}>
                        <View style={styles.preferenceTextContainer}>
                          <Text style={styles.preferenceLabel}>{field.label}</Text>
                          <Text style={styles.preferenceDescription}>{field.description}</Text>
                        </View>
                        <Switch
                          value={Boolean(currentPreferences[field.key])}
                          onValueChange={(value) => handlePreferenceToggle(field.key, value)}
                          disabled={isSavingPreferences}
                          trackColor={{ false: '#CBD5F5', true: '#2563EB' }}
                          thumbColor={currentPreferences[field.key] ? '#1E40AF' : '#FFFFFF'}
                        />
                      </View>
                    ))
                  : null}
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
          disabled={isSigningOut}>
          <Text style={styles.signOutLabel}>{isSigningOut ? 'Signing out…' : 'Sign out'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusTag({ value }: { value: string }) {
  const normalized = value.replace(/_/g, ' ');
  return (
    <View style={styles.statusTag}>
      <Text style={styles.statusTagLabel}>{normalized}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 28,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  valueMuted: {
    fontSize: 14,
    color: '#64748B',
  },
  statusTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusTagLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  signOutButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#EBF2FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonLabel: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '600',
  },
  preferencesSection: {
    marginTop: 20,
    gap: 16,
  },
  preferenceHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  preferenceTextContainer: {
    flex: 1,
    gap: 4,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  preferenceLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceLoadingLabel: {
    fontSize: 13,
    color: '#475569',
  },
});
