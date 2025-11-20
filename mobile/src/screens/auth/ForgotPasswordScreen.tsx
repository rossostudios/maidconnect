import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '@/types/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

type Props = AuthStackScreenProps<'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      setError('El correo electrónico es requerido');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Correo electrónico inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        Alert.alert('Error', resetError.message);
      } else {
        Alert.alert(
          'Correo enviado',
          'Revisa tu correo electrónico para restablecer tu contraseña',
          [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Correo Electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            error={error}
            type="email"
            autoCapitalize="none"
          />

          <Button
            title="Enviar Instrucciones"
            onPress={handleResetPassword}
            loading={loading}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          />

          <TouchableOpacity
            style={styles.backToSignIn}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.backToSignInText}>
              Volver a iniciar sesión
            </Text>
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
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
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
    alignItems: 'center',
    marginTop: 24,
  },
  backToSignInText: {
    fontSize: 14,
    color: Colors.orange[600],
    fontWeight: '600',
  },
});
