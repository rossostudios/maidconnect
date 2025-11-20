import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '@/types/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

type Props = AuthStackScreenProps<'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
  }>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
      });

      if (error) {
        Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
      } else {
        Alert.alert(
          'Éxito',
          'Cuenta creada. Por favor verifica tu correo electrónico.',
          [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a Casaora y encuentra profesionales de confianza
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre Completo"
              placeholder="Juan Pérez"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />

            <Input
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              type="email"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              type="password"
            />

            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              type="password"
            />

            <Button
              title="Crear Cuenta"
              onPress={handleSignUp}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitButton}
            />

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signInLink}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  signInLink: {
    fontSize: 14,
    color: Colors.orange[600],
    fontWeight: '600',
  },
});
