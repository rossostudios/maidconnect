import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  type?: 'text' | 'password' | 'email';
}

export function Input({
  label,
  error,
  containerStyle,
  type = 'text',
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputProps: TextInputProps = {
    ...props,
    secureTextEntry: type === 'password' && !isPasswordVisible,
    keyboardType: type === 'email' ? 'email-address' : 'default',
    autoCapitalize: type === 'email' ? 'none' : props.autoCapitalize,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor={Colors.neutral[500]}
          {...inputProps}
        />
        {type === 'password' && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.neutral[500]}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderRadius: 12, // Anthropic rounded-lg equivalent (12px)
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});
