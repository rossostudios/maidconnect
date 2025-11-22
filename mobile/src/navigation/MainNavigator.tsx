import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Colors } from "@/constants/colors";
import { BookingAddressScreen } from "@/screens/booking/BookingAddressScreen";
import { BookingConfirmScreen } from "@/screens/booking/BookingConfirmScreen";
import { BookingDateTimeScreen } from "@/screens/booking/BookingDateTimeScreen";
import { BookingDetailScreen } from "@/screens/booking/BookingDetailScreen";
import { BookingServiceScreen } from "@/screens/booking/BookingServiceScreen";
import { BookingsScreen } from "@/screens/main/BookingsScreen";
import { HomeScreen } from "@/screens/main/HomeScreen";
import { ProfileScreen } from "@/screens/main/ProfileScreen";
import { SearchScreen } from "@/screens/main/SearchScreen";
import { PaymentMethodScreen } from "@/screens/payment/PaymentMethodScreen";
import { ProfessionalDetailScreen } from "@/screens/professionals/ProfessionalDetailScreen";
import type { MainTabParamList } from "@/types/navigation";

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
          fontWeight: "600",
          fontSize: 18,
          color: Colors.text.primary,
        },
      }}
    >
      <Tab.Screen
        component={HomeScreen}
        name="Home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={SearchScreen}
        name="Search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="search-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={BookingsScreen}
        name="Bookings"
        options={{
          title: "Reservas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="calendar-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        component={ProfessionalDetailScreen}
        name="ProfessionalDetail"
        options={{
          tabBarButton: () => null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tab.Screen
        component={BookingServiceScreen}
        name="BookingService"
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        component={BookingDateTimeScreen}
        name="BookingDateTime"
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        component={BookingAddressScreen}
        name="BookingAddress"
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        component={BookingConfirmScreen}
        name="BookingConfirm"
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        component={BookingDetailScreen}
        name="BookingDetail"
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        component={PaymentMethodScreen}
        name="PaymentMethod"
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
