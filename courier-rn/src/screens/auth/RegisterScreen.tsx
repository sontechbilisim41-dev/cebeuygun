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
import { Picker } from '@react-native-picker/picker';

// Store
import { useAppDispatch, useAppSelector } from '@/store';
import { registerUser, selectIsLoading, selectError, clearError } from '@/store/slices/authSlice';

// Types
import { RootStackParamList, RegisterForm } from '@/types';

type RegisterNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'MOTORBIKE',
    vehiclePlate: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gerekli';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gerekli';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gerekli';
    } else if (!/^(\+90|0)?[5][0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası girin';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Şifre tekrarı gerekli';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (formData.vehicleType !== 'WALKING' && !formData.vehiclePlate?.trim()) {
      newErrors.vehiclePlate = 'Araç plakası gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      dispatch(clearError());
      await dispatch(registerUser(formData)).unwrap();
      Alert.alert(
        'Kayıt Başarılı',
        'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
        [{ text: 'Tamam' }]
      );
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error || 'Kayıt olurken bir hata oluştu');
    }
  };

  const handleInputChange = (field: keyof RegisterForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case 'BICYCLE': return 'Bisiklet';
      case 'MOTORBIKE': return 'Motosiklet';
      case 'CAR': return 'Araba';
      case 'WALKING': return 'Yürüyerek';
      default: return type;
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
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Ionicons name="person-add" size={48} color="#fff" />
              </View>
              <Text style={styles.title}>Kurye Ol</Text>
              <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                {/* Name Inputs */}
                <View style={styles.nameRow}>
                  <View style={[styles.inputContainer, styles.nameInput]}>
                    <Text style={styles.inputLabel}>Ad</Text>
                    <View style={[styles.inputWrapper, errors.firstName && styles.inputError]}>
                      <TextInput
                        style={styles.input}
                        value={formData.firstName}
                        onChangeText={(value) => handleInputChange('firstName', value)}
                        placeholder="Adınız"
                        placeholderTextColor="#a4b0be"
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>

                  <View style={[styles.inputContainer, styles.nameInput]}>
                    <Text style={styles.inputLabel}>Soyad</Text>
                    <View style={[styles.inputWrapper, errors.lastName && styles.inputError]}>
                      <TextInput
                        style={styles.input}
                        value={formData.lastName}
                        onChangeText={(value) => handleInputChange('lastName', value)}
                        placeholder="Soyadınız"
                        placeholderTextColor="#a4b0be"
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>
                </View>

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

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Telefon Numarası</Text>
                  <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                    <Ionicons name="call-outline" size={20} color="#6c757d" />
                    <TextInput
                      style={styles.input}
                      value={formData.phone}
                      onChangeText={(value) => handleInputChange('phone', value)}
                      placeholder="+90 555 123 4567"
                      placeholderTextColor="#a4b0be"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  </View>
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>

                {/* Vehicle Type */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Araç Tipi</Text>
                  <View style={styles.pickerWrapper}>
                    <Ionicons name="car-outline" size={20} color="#6c757d" />
                    <Picker
                      selectedValue={formData.vehicleType}
                      onValueChange={(value) => handleInputChange('vehicleType', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Bisiklet" value="BICYCLE" />
                      <Picker.Item label="Motosiklet" value="MOTORBIKE" />
                      <Picker.Item label="Araba" value="CAR" />
                      <Picker.Item label="Yürüyerek" value="WALKING" />
                    </Picker>
                  </View>
                </View>

                {/* Vehicle Plate (if not walking) */}
                {formData.vehicleType !== 'WALKING' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Araç Plakası</Text>
                    <View style={[styles.inputWrapper, errors.vehiclePlate && styles.inputError]}>
                      <Ionicons name="card-outline" size={20} color="#6c757d" />
                      <TextInput
                        style={styles.input}
                        value={formData.vehiclePlate}
                        onChangeText={(value) => handleInputChange('vehiclePlate', value)}
                        placeholder="34 ABC 123"
                        placeholderTextColor="#a4b0be"
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.vehiclePlate && (
                      <Text style={styles.errorText}>{errors.vehiclePlate}</Text>
                    )}
                  </View>
                )}

                {/* Password Inputs */}
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

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Şifre Tekrarı</Text>
                  <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6c757d" />
                    <TextInput
                      style={styles.input}
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      placeholder="Şifrenizi tekrar girin"
                      placeholderTextColor="#a4b0be"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#6c757d"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>

                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#a4b0be', '#a4b0be'] : ['#667eea', '#764ba2']}
                    style={styles.registerButtonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Ionicons name="hourglass-outline" size={20} color="#fff" />
                        <Text style={styles.registerButtonText}>Kayıt oluşturuluyor...</Text>
                      </View>
                    ) : (
                      <Text style={styles.registerButtonText}>Kayıt Ol</Text>
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

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Giriş Yapın</Text>
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
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
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
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
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
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  picker: {
    flex: 1,
    height: 48,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4757',
    marginLeft: 4,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#6c757d',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
});