import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import type { AuthStackScreenProps } from "@/types/navigation";

type Props = AuthStackScreenProps<"ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      setError("El correo electrónico es requerido");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Correo electrónico inválido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        Alert.alert("Error", resetError.message);
      } else {
        Alert.alert(
          "Correo enviado",
          "Revisa tu correo electrónico para restablecer tu contraseña",
          [{ text: "OK", onPress: () => navigation.navigate("SignIn") }]
        );
      }
    } catch (err) {
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={Colors.text.primary} name="arrow-back" size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu
            contraseña
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            autoCapitalize="none"
            error={error}
            label="Correo Electrónico"
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            placeholder="tu@email.com"
            type="email"
            value={email}
          />

          <Button
            loading={loading}
            onPress={handleResetPassword}
            size="lg"
            style={styles.submitButton}
            title="Enviar Instrucciones"
            variant="primary"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn")}
            style={styles.backToSignIn}
          >
            <Text style={styles.backToSignInText}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
  backToSignIn: {
    alignItems: "center",
    marginTop: 24,
  },
  backToSignInText: {
    fontSize: 14,
    color: Colors.orange[600],
    fontWeight: "600",
  },
});
