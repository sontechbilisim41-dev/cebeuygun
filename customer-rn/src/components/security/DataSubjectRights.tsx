import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gdprService } from '@/services/gdprService';
import { securityService } from '@/services/securityService';

interface DataSubjectRightsProps {
  userId: string;
}

interface RequestOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export const DataSubjectRights: React.FC<DataSubjectRightsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [showReasonInput, setShowReasonInput] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, [userId]);

  const loadRequests = async () => {
    try {
      const userRequests = await gdprService.getDataSubjectRequests(userId);
      setRequests(userRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleDataAccess = async () => {
    Alert.alert(
      'Veri Erişim Talebi',
      'Kişisel verilerinizin bir kopyasını talep etmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Talep Et',
          onPress: async () => {
            setIsLoading(true);
            try {
              const requestId = await gdprService.requestDataAccess(userId);
              Alert.alert(
                'Talep Alındı',
                `Veri erişim talebiniz alınmıştır. Talep ID: ${requestId.slice(-8)}. 30 gün içinde e-posta adresinize gönderilecektir.`,
                [{ text: 'Tamam' }]
              );
              await loadRequests();
            } catch (error) {
              Alert.alert('Hata', 'Talep gönderilirken bir hata oluştu.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDataPortability = async () => {
    Alert.alert(
      'Veri Taşınabilirliği',
      'Verilerinizi başka bir hizmete taşımak için JSON formatında indirmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Talep Et',
          onPress: async () => {
            setIsLoading(true);
            try {
              const requestId = await gdprService.requestDataPortability(userId, 'json');
              Alert.alert(
                'Talep Alındı',
                `Veri taşınabilirliği talebiniz alınmıştır. Talep ID: ${requestId.slice(-8)}. İndirme bağlantısı e-posta adresinize gönderilecektir.`,
                [{ text: 'Tamam' }]
              );
              await loadRequests();
            } catch (error) {
              Alert.alert('Hata', 'Talep gönderilirken bir hata oluştu.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDataErasure = () => {
    setShowReasonInput('erasure');
    setReason('');
  };

  const handleProcessingRestriction = () => {
    setShowReasonInput('restriction');
    setReason('');
  };

  const handleProcessingObjection = () => {
    setShowReasonInput('objection');
    setReason('');
  };

  const submitReasonBasedRequest = async (requestType: string) => {
    if (!reason.trim()) {
      Alert.alert('Hata', 'Lütfen talep sebebinizi belirtin.');
      return;
    }

    setIsLoading(true);
    try {
      let requestId: string;
      let successMessage: string;

      switch (requestType) {
        case 'erasure':
          requestId = await gdprService.requestDataErasure(userId, reason);
          successMessage = 'Veri silme talebiniz alınmıştır. Hesabınız ve tüm verileriniz 30 gün içinde silinecektir.';
          break;
        case 'restriction':
          requestId = await gdprService.requestProcessingRestriction(userId, reason);
          successMessage = 'Veri işleme kısıtlama talebiniz alınmıştır. İşleme faaliyetleri gözden geçirilecektir.';
          break;
        case 'objection':
          requestId = await gdprService.objectToProcessing(userId, 'marketing', reason);
          successMessage = 'Veri işleme itirazınız alınmıştır. İlgili işleme faaliyetleri durdurulacaktır.';
          break;
        default:
          throw new Error('Geçersiz talep türü');
      }

      Alert.alert(
        'Talep Alındı',
        `${successMessage} Talep ID: ${requestId.slice(-8)}`,
        [{ text: 'Tamam' }]
      );

      setShowReasonInput(null);
      setReason('');
      await loadRequests();
    } catch (error) {
      Alert.alert('Hata', 'Talep gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestOptions: RequestOption[] = [
    {
      id: 'access',
      title: 'Veri Erişim Hakkı',
      description: 'Kişisel verilerinizin bir kopyasını talep edin',
      icon: 'document-text-outline',
      action: handleDataAccess,
    },
    {
      id: 'portability',
      title: 'Veri Taşınabilirliği',
      description: 'Verilerinizi başka bir hizmete taşımak için indirin',
      icon: 'download-outline',
      action: handleDataPortability,
    },
    {
      id: 'erasure',
      title: 'Veri Silme Hakkı',
      description: 'Hesabınızı ve tüm verilerinizi kalıcı olarak silin',
      icon: 'trash-outline',
      action: handleDataErasure,
    },
    {
      id: 'restriction',
      title: 'İşleme Kısıtlama',
      description: 'Belirli veri işleme faaliyetlerinin durdurulmasını talep edin',
      icon: 'pause-outline',
      action: handleProcessingRestriction,
    },
    {
      id: 'objection',
      title: 'İşleme İtiraz',
      description: 'Belirli veri işleme faaliyetlerine itiraz edin',
      icon: 'hand-left-outline',
      action: handleProcessingObjection,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'processing': return '#667eea';
      case 'completed': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'processing': return 'İşleniyor';
      case 'completed': return 'Tamamlandı';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const renderReasonInput = () => {
    if (!showReasonInput) return null;

    const titles = {
      erasure: 'Veri Silme Sebebi',
      restriction: 'Kısıtlama Sebebi',
      objection: 'İtiraz Sebebi',
    };

    return (
      <View style={styles.reasonInputContainer}>
        <Text style={styles.reasonInputTitle}>
          {titles[showReasonInput as keyof typeof titles]}
        </Text>
        <TextInput
          style={styles.reasonInput}
          value={reason}
          onChangeText={setReason}
          placeholder="Lütfen talep sebebinizi detaylı olarak açıklayın..."
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.characterCount}>{reason.length}/500</Text>
        
        <View style={styles.reasonInputActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowReasonInput(null);
              setReason('');
            }}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => submitReasonBasedRequest(showReasonInput)}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Veri Sahibi Hakları</Text>
        <Text style={styles.subtitle}>
          KVKK kapsamında sahip olduğunuz hakları kullanın
        </Text>
      </View>

      <View style={styles.content}>
        {requestOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={option.action}
            disabled={isLoading}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon as any} size={24} color="#667eea" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a4b0be" />
          </TouchableOpacity>
        ))}

        {renderReasonInput()}

        {requests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={styles.sectionTitle}>Geçmiş Talepler</Text>
            {requests.map((request, index) => (
              <View key={index} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestType}>
                    {requestOptions.find(o => o.id === request.requestType)?.title || request.requestType}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                  </View>
                </View>
                <Text style={styles.requestDate}>
                  Talep Tarihi: {new Date(request.requestDate).toLocaleDateString('tr-TR')}
                </Text>
                {request.completionDate && (
                  <Text style={styles.requestDate}>
                    Tamamlanma Tarihi: {new Date(request.completionDate).toLocaleDateString('tr-TR')}
                  </Text>
                )}
                {request.reason && (
                  <Text style={styles.requestReason}>Sebep: {request.reason}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
            <Text style={styles.infoTitle}>Önemli Bilgiler</Text>
          </View>
          <Text style={styles.infoText}>
            • Talepleriniz 30 gün içinde değerlendirilir{'\n'}
            • Veri silme talebi geri alınamaz{'\n'}
            • Bazı veriler yasal yükümlülükler nedeniyle saklanabilir{'\n'}
            • Talep durumunuz e-posta ile bildirilir
          </Text>
        </View>
      </View>
    </ScrollView>
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
    padding: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  reasonInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reasonInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2f3542',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  reasonInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#667eea',
    minWidth: 80,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  requestsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  requestDate: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  requestReason: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
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
    marginBottom: 12,
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
});