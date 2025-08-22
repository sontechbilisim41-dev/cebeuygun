import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { gdprService } from '@/services/gdprService';
import { securityService } from '@/services/securityService';

interface ConsentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  granted: boolean;
  legalBasis: string;
  purposes: string[];
}

interface ConsentManagerProps {
  userId: string;
  onConsentUpdate?: (consents: Record<string, boolean>) => void;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({
  userId,
  onConsentUpdate,
}) => {
  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      id: 'service_provision',
      title: 'Hizmet Sunumu',
      description: 'Sipariş işleme, teslimat ve müşteri desteği için gerekli temel veriler',
      required: true,
      granted: true,
      legalBasis: 'Sözleşme',
      purposes: ['Sipariş işleme', 'Teslimat', 'Müşteri desteği'],
    },
    {
      id: 'marketing',
      title: 'Pazarlama İletişimi',
      description: 'Promosyon, kampanya ve ürün önerileri için pazarlama iletişimi',
      required: false,
      granted: false,
      legalBasis: 'Rıza',
      purposes: ['E-posta pazarlama', 'SMS kampanyaları', 'Kişiselleştirilmiş öneriler'],
    },
    {
      id: 'analytics',
      title: 'Analitik ve İyileştirme',
      description: 'Hizmet kalitesi analizi ve uygulama iyileştirme çalışmaları',
      required: false,
      granted: false,
      legalBasis: 'Meşru Menfaat',
      purposes: ['Kullanım analizi', 'Performans ölçümü', 'Hizmet iyileştirme'],
    },
    {
      id: 'location',
      title: 'Konum Verileri',
      description: 'Teslimat hizmetleri ve konum bazlı özellikler için konum bilgileri',
      required: false,
      granted: false,
      legalBasis: 'Rıza',
      purposes: ['Teslimat takibi', 'Yakın restoranlar', 'Teslimat süresi tahmini'],
    },
    {
      id: 'personalization',
      title: 'Kişiselleştirme',
      description: 'Kişiselleştirilmiş deneyim ve öneriler için tercih verileri',
      required: false,
      granted: false,
      legalBasis: 'Rıza',
      purposes: ['Kişisel öneriler', 'Favori restoranlar', 'Özel teklifler'],
    },
  ]);

  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStoredConsents();
  }, [userId]);

  const loadStoredConsents = async () => {
    try {
      const storedConsents = await gdprService.getAllConsents(userId);
      
      setConsents(prevConsents =>
        prevConsents.map(consent => {
          const stored = storedConsents.find(s => s.consentType === consent.id);
          return stored ? { ...consent, granted: stored.granted } : consent;
        })
      );
    } catch (error) {
      console.error('Failed to load stored consents:', error);
    }
  };

  const handleConsentChange = async (consentId: string, granted: boolean) => {
    if (isLoading) return;

    const consent = consents.find(c => c.id === consentId);
    if (!consent) return;

    if (consent.required && !granted) {
      Alert.alert(
        'Gerekli İzin',
        'Bu izin hizmet sunumu için gereklidir ve devre dışı bırakılamaz.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Record consent
      await gdprService.recordConsent(userId, consentId, granted);

      // Update local state
      setConsents(prevConsents =>
        prevConsents.map(c =>
          c.id === consentId ? { ...c, granted } : c
        )
      );

      // Log security event
      await securityService.logAuditEvent({
        userId,
        action: 'CONSENT_CHANGED',
        resource: 'user_consent',
        severity: 'medium',
        metadata: { consentType: consentId, granted },
      });

      // Notify parent component
      if (onConsentUpdate) {
        const updatedConsents = consents.reduce((acc, c) => {
          acc[c.id] = c.id === consentId ? granted : c.granted;
          return acc;
        }, {} as Record<string, boolean>);
        onConsentUpdate(updatedConsents);
      }

      // Show confirmation
      Alert.alert(
        'İzin Güncellendi',
        `${consent.title} izni ${granted ? 'verildi' : 'geri çekildi'}.`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Failed to update consent:', error);
      Alert.alert(
        'Hata',
        'İzin güncellenirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showConsentDetails = (consentId: string) => {
    setShowDetails(consentId);
  };

  const hideConsentDetails = () => {
    setShowDetails(null);
  };

  const renderConsentItem = (consent: ConsentItem) => (
    <View key={consent.id} style={styles.consentItem}>
      <View style={styles.consentHeader}>
        <View style={styles.consentInfo}>
          <Text style={styles.consentTitle}>{consent.title}</Text>
          <Text style={styles.consentDescription}>{consent.description}</Text>
          
          <View style={styles.legalBasisContainer}>
            <Text style={styles.legalBasisLabel}>Hukuki Dayanak:</Text>
            <Text style={styles.legalBasisText}>{consent.legalBasis}</Text>
            {consent.required && (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Gerekli</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.consentControls}>
          <Switch
            value={consent.granted}
            onValueChange={(value) => handleConsentChange(consent.id, value)}
            disabled={consent.required || isLoading}
            trackColor={{ false: '#e9ecef', true: '#667eea' }}
            thumbColor={consent.granted ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => showConsentDetails(consent.id)}
      >
        <Ionicons name="information-circle-outline" size={16} color="#667eea" />
        <Text style={styles.detailsButtonText}>Detayları Görüntüle</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConsentDetails = () => {
    const consent = consents.find(c => c.id === showDetails);
    if (!consent) return null;

    return (
      <Modal
        visible={!!showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={hideConsentDetails}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{consent.title}</Text>
            <TouchableOpacity onPress={hideConsentDetails}>
              <Ionicons name="close" size={24} color="#2f3542" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Açıklama</Text>
              <Text style={styles.detailText}>{consent.description}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Hukuki Dayanak</Text>
              <Text style={styles.detailText}>{consent.legalBasis}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>İşleme Amaçları</Text>
              {consent.purposes.map((purpose, index) => (
                <View key={index} style={styles.purposeItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                  <Text style={styles.purposeText}>{purpose}</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Veri Saklama Süresi</Text>
              <Text style={styles.detailText}>
                {consent.id === 'service_provision' && '7 yıl (Yasal yükümlülük)'}
                {consent.id === 'marketing' && '3 yıl (Pazarlama faaliyetleri için)'}
                {consent.id === 'analytics' && '2 yıl (Analiz ve iyileştirme için)'}
                {consent.id === 'location' && '1 yıl (Konum bazlı hizmetler için)'}
                {consent.id === 'personalization' && '2 yıl (Kişiselleştirme için)'}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Haklarınız</Text>
              <Text style={styles.detailText}>
                KVKK kapsamında sahip olduğunuz haklar:
                {'\n'}• Bilgi talep etme hakkı
                {'\n'}• Düzeltme hakkı
                {'\n'}• Silme hakkı
                {'\n'}• İşlemeye itiraz hakkı
                {'\n'}• Veri taşınabilirliği hakkı
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hideConsentDetails}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gizlilik Tercihleri</Text>
        <Text style={styles.subtitle}>
          Kişisel verilerinizin işlenmesi için izinlerinizi yönetin
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {consents.map(renderConsentItem)}

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#667eea" />
            <Text style={styles.infoTitle}>Veri Güvenliği</Text>
          </View>
          <Text style={styles.infoText}>
            Tüm kişisel verileriniz AES-256 şifreleme ile korunmaktadır. 
            Verileriniz sadece belirtilen amaçlar doğrultusunda işlenir ve 
            üçüncü taraflarla paylaşılmaz.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text" size={24} color="#667eea" />
            <Text style={styles.infoTitle}>KVKK Uyumluluğu</Text>
          </View>
          <Text style={styles.infoText}>
            Uygulamamız Kişisel Verilerin Korunması Kanunu (KVKK) ve 
            Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) gerekliliklerine 
            tam uyum sağlamaktadır.
          </Text>
        </View>
      </ScrollView>

      {renderConsentDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2f3542',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  consentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  consentInfo: {
    flex: 1,
    marginRight: 16,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  legalBasisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legalBasisLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginRight: 4,
  },
  legalBasisText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#667eea',
    marginRight: 8,
  },
  requiredBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  consentControls: {
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f3542',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  purposeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  purposeText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  closeButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});