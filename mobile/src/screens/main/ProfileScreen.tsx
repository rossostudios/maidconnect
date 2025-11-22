import { Ionicons } from "@expo/vector-icons";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import type { MainTabScreenProps } from "@/types/navigation";

type Props = MainTabScreenProps<"Profile">;

export function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      title: "Información Personal",
      onPress: () => {},
    },
    {
      icon: "card-outline" as const,
      title: "Métodos de Pago",
      onPress: () => {},
    },
    {
      icon: "location-outline" as const,
      title: "Direcciones",
      onPress: () => {},
    },
    {
      icon: "notifications-outline" as const,
      title: "Notificaciones",
      onPress: () => {},
    },
    {
      icon: "help-circle-outline" as const,
      title: "Ayuda y Soporte",
      onPress: () => {},
    },
    {
      icon: "settings-outline" as const,
      title: "Configuración",
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar} />
          <Text style={styles.name}>{user?.user_metadata?.full_name || "Usuario"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.7}
              key={index}
              onPress={item.onPress}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons color={Colors.text.primary} name={item.icon} size={24} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons color={Colors.neutral[400]} name="chevron-forward" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <Button
          onPress={handleSignOut}
          style={styles.signOutButton}
          title="Cerrar Sesión"
          variant="outline"
        />

        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50, // rounded-full
    backgroundColor: Colors.neutral[200],
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  signOutButton: {
    marginTop: 8,
  },
  version: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginTop: 24,
  },
});
