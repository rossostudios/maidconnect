import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Colors } from "@/constants/colors";
import type { AuthStackScreenProps } from "@/types/navigation";

type Props = AuthStackScreenProps<"Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Casaora</Text>
          <Text style={styles.tagline}>Encuentra profesionales de confianza para tu hogar</Text>
        </View>

        <View style={styles.illustrationContainer}>
          {/* Placeholder for illustration */}
          <View style={styles.illustrationPlaceholder} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => navigation.navigate("SignIn")}
            size="lg"
            style={styles.button}
            title="Iniciar Sesión"
            variant="primary"
          />
          <Button
            onPress={() => navigation.navigate("SignUp")}
            size="lg"
            style={styles.button}
            title="Crear Cuenta"
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.orange[500],
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    maxWidth: 280,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationPlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 12, // Anthropic rounded-lg
    backgroundColor: Colors.orange[50],
    borderWidth: 2,
    borderColor: Colors.orange[200],
    borderStyle: "dashed",
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    width: "100%",
  },
});
