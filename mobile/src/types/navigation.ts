import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
  ProfessionalDetail: { professionalId: string };
  BookingService: { professionalId: string };
  BookingDateTime: {
    professionalId: string;
    serviceType: string;
    durationHours: number;
  };
  BookingAddress: {
    professionalId: string;
    serviceType: string;
    durationHours: number;
    startTime: string;
  };
  BookingConfirm: {
    professionalId: string;
    serviceType: string;
    durationHours: number;
    startTime: string;
    address: {
      street: string;
      city: string;
      neighborhood?: string;
      notes?: string;
    };
  };
};

// Home Stack Navigator
export type HomeStackParamList = {
  HomeScreen: undefined;
  BookingDetails: { bookingId: string };
  ProfessionalProfile: { professionalId: string };
};

// Type helpers for screens
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;
