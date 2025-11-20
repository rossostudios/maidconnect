import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '@/types/navigation';
import { HomeScreen } from '@/screens/main/HomeScreen';
import { SearchScreen } from '@/screens/main/SearchScreen';
import { BookingsScreen } from '@/screens/main/BookingsScreen';
import { ProfileScreen } from '@/screens/main/ProfileScreen';
import { ProfessionalDetailScreen } from '@/screens/professionals/ProfessionalDetailScreen';
import { BookingServiceScreen } from '@/screens/booking/BookingServiceScreen';
import { BookingDateTimeScreen } from '@/screens/booking/BookingDateTimeScreen';
import { BookingAddressScreen } from '@/screens/booking/BookingAddressScreen';
import { BookingConfirmScreen } from '@/screens/booking/BookingConfirmScreen';
import { BookingDetailScreen } from '@/screens/booking/BookingDetailScreen';
import { PaymentMethodScreen } from '@/screens/payment/PaymentMethodScreen';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.orange[500],
        tabBarInactiveTintColor: Colors.neutral[500],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: Colors.text.primary,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfessionalDetail"
        component={ProfessionalDetailScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BookingService"
        component={BookingServiceScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BookingDateTime"
        component={BookingDateTimeScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BookingAddress"
        component={BookingAddressScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
