import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Store
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, selectIsLoading, selectError, clearError } from '@/store/slices/authSlice';

// Types
import { RootStackParamList, LoginForm } from '@/types';

type LoginNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  
  const [formData, setFormData] = useState<LoginForm>({
    email: 'courier@example.com', // Pre-filled for demo
    password: 'password123', // Pre-filled for demo
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      dispatch(clearError());
      await dispatch(loginUser(formData)).unwrap();
      // Navigation will be handled automatically by the navigator
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error || 'Giriş yapılırken bir hata oluştu');
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="bicycle" size={48} color="#fff" />
              </View>
              <Text style={styles.title}>Kurye Uygulaması</Text>
              <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Adresi</Text>
                  <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                    <Ionicons name="mail-outline" size={20} color="#6c757d" />
                    <TextInput
                      style={styles.input}
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      placeholder="ornek@email.com"
                      placeholderTextColor="#a4b0be"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Şifre</Text>
                  <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6c757d" />
                    <TextInput
                      style={styles.input}
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      placeholder="Şifrenizi girin"
                      placeholderTextColor="#a4b0be"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#6c757d"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {/* Demo Credentials Info */}
                <View style={styles.demoInfo}>
                  <Ionicons name="information-circle-outline" size={16} color="#667eea" />
                  <Text style={styles.demoText}>
                    Demo: courier@example.com / password123
                  </Text>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#a4b0be', '#a4b0be'] : ['#667eea', '#764ba2']}
                    style={styles.loginButtonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Ionicons name="hourglass-outline" size={20} color="#fff" />
                        <Text style={styles.loginButtonText}>Giriş yapılıyor...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={16} color="#ff4757" />
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                )}

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Hesabınız yok mu? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>Kayıt Olun</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2f3542',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  inputError: {
    borderColor: '#ff4757',
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2f3542',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4757',
    marginLeft: 4,
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  demoText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#ff4757',
    flex: 1,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#6c757d',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
});