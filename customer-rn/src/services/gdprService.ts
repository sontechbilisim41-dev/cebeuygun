import { apiClient } from './apiClient';
import { securityService } from './securityService';
import { secureStorage } from './secureStorage';

interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DataProcessingPurpose {
  id: string;
  name: string;
  description: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  required: boolean;
  dataTypes: string[];
  retentionPeriod: number; // in days
}

interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: string;
  completionDate?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

interface PIIInventory {
  field: string;
  category: 'basic' | 'sensitive' | 'special';
  purpose: string[];
  legalBasis: string;
  retentionPeriod: number;
  encrypted: boolean;
  location: string[];
}

class GDPRService {
  private consentVersion = '1.0';
  private dataProcessingPurposes: DataProcessingPurpose[] = [
    {
      id: 'service_provision',
      name: 'Hizmet Sunumu',
      description: 'Sipariş işleme ve teslimat hizmetleri',
      legalBasis: 'contract',
      required: true,
      dataTypes: ['name', 'phone', 'address', 'location'],
      retentionPeriod: 2555, // 7 years
    },
    {
      id: 'marketing',
      name: 'Pazarlama İletişimi',
      description: 'Promosyon ve kampanya bildirimleri',
      legalBasis: 'consent',
      required: false,
      dataTypes: ['email', 'phone', 'preferences'],
      retentionPeriod: 1095, // 3 years
    },
    {
      id: 'analytics',
      name: 'Analitik ve İyileştirme',
      description: 'Hizmet kalitesi analizi ve iyileştirme',
      legalBasis: 'legitimate_interests',
      required: false,
      dataTypes: ['usage_data', 'device_info', 'location'],
      retentionPeriod: 730, // 2 years
    },
    {
      id: 'support',
      name: 'Müşteri Desteği',
      description: 'Teknik destek ve müşteri hizmetleri',
      legalBasis: 'contract',
      required: true,
      dataTypes: ['name', 'email', 'phone', 'support_history'],
      retentionPeriod: 1825, // 5 years
    },
  ];

  private piiInventory: PIIInventory[] = [
    {
      field: 'firstName',
      category: 'basic',
      purpose: ['service_provision', 'support'],
      legalBasis: 'contract',
      retentionPeriod: 2555,
      encrypted: true,
      location: ['database', 'logs', 'cache'],
    },
    {
      field: 'lastName',
      category: 'basic',
      purpose: ['service_provision', 'support'],
      legalBasis: 'contract',
      retentionPeriod: 2555,
      encrypted: true,
      location: ['database', 'logs', 'cache'],
    },
    {
      field: 'email',
      category: 'basic',
      purpose: ['service_provision', 'marketing', 'support'],
      legalBasis: 'contract',
      retentionPeriod: 2555,
      encrypted: true,
      location: ['database', 'logs', 'email_service'],
    },
    {
      field: 'phone',
      category: 'basic',
      purpose: ['service_provision', 'marketing', 'support'],
      legalBasis: 'contract',
      retentionPeriod: 2555,
      encrypted: true,
      location: ['database', 'logs', 'sms_service'],
    },
    {
      field: 'address',
      category: 'basic',
      purpose: ['service_provision'],
      legalBasis: 'contract',
      retentionPeriod: 2555,
      encrypted: true,
      location: ['database', 'logs'],
    },
    {
      field: 'location',
      category: 'sensitive',
      purpose: ['service_provision', 'analytics'],
      legalBasis: 'consent',
      retentionPeriod: 365,
      encrypted: true,
      location: ['database', 'logs', 'analytics_service'],
    },
    {
      field: 'paymentInfo',
      category: 'sensitive',
      purpose: ['service_provision'],
      legalBasis: 'contract',
      retentionPeriod: 2555,
      encrypted: true,
      location: ['payment_service'],
    },
  ];

  async initialize(): Promise<void> {
    try {
      await this.loadStoredConsents();
      await this.checkConsentExpiry();
      console.log('GDPR service initialized successfully');
    } catch (error) {
      console.error('GDPR service initialization failed:', error);
      throw error;
    }
  }

  // Consent Management
  async recordConsent(
    userId: string,
    consentType: string,
    granted: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const consentRecord: ConsentRecord = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        consentType,
        granted,
        timestamp: new Date().toISOString(),
        version: this.consentVersion,
        ...metadata,
      };

      // Store locally
      await this.storeConsentLocally(consentRecord);

      // Send to server
      await apiClient.post('/gdpr/consent', consentRecord);

      // Log audit event
      await securityService.logAuditEvent({
        userId,
        action: 'CONSENT_RECORDED',
        resource: 'user_consent',
        severity: 'medium',
        metadata: { consentType, granted, version: this.consentVersion },
      });

      console.log(`Consent recorded: ${consentType} = ${granted}`);
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw error;
    }
  }

  private async storeConsentLocally(consent: ConsentRecord): Promise<void> {
    try {
      const existingConsents = await secureStorage.getObject<ConsentRecord[]>('user_consents') || [];
      
      // Remove old consent for same type
      const filteredConsents = existingConsents.filter(
        c => !(c.userId === consent.userId && c.consentType === consent.consentType)
      );
      
      filteredConsents.push(consent);
      
      await secureStorage.setObject('user_consents', filteredConsents);
    } catch (error) {
      console.error('Failed to store consent locally:', error);
      throw error;
    }
  }

  async getConsent(userId: string, consentType: string): Promise<ConsentRecord | null> {
    try {
      const consents = await secureStorage.getObject<ConsentRecord[]>('user_consents') || [];
      
      return consents.find(
        c => c.userId === userId && c.consentType === consentType
      ) || null;
    } catch (error) {
      console.error('Failed to get consent:', error);
      return null;
    }
  }

  async getAllConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      const consents = await secureStorage.getObject<ConsentRecord[]>('user_consents') || [];
      return consents.filter(c => c.userId === userId);
    } catch (error) {
      console.error('Failed to get all consents:', error);
      return [];
    }
  }

  private async loadStoredConsents(): Promise<void> {
    try {
      const consents = await secureStorage.getObject<ConsentRecord[]>('user_consents');
      if (consents) {
        console.log(`Loaded ${consents.length} stored consents`);
      }
    } catch (error) {
      console.error('Failed to load stored consents:', error);
    }
  }

  private async checkConsentExpiry(): Promise<void> {
    try {
      const consents = await secureStorage.getObject<ConsentRecord[]>('user_consents') || [];
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const expiredConsents = consents.filter(
        c => new Date(c.timestamp) < oneYearAgo
      );

      if (expiredConsents.length > 0) {
        console.log(`Found ${expiredConsents.length} expired consents`);
        // Trigger consent renewal process
        await this.triggerConsentRenewal(expiredConsents);
      }
    } catch (error) {
      console.error('Failed to check consent expiry:', error);
    }
  }

  private async triggerConsentRenewal(expiredConsents: ConsentRecord[]): Promise<void> {
    try {
      for (const consent of expiredConsents) {
        await securityService.logAuditEvent({
          userId: consent.userId,
          action: 'CONSENT_EXPIRED',
          resource: 'user_consent',
          severity: 'medium',
          metadata: { consentType: consent.consentType },
        });
      }

      // Notify user about consent renewal
      // This would trigger a UI flow to renew consents
      console.log('Consent renewal triggered');
    } catch (error) {
      console.error('Failed to trigger consent renewal:', error);
    }
  }

  // Data Subject Rights
  async submitDataSubjectRequest(
    userId: string,
    requestType: DataSubjectRequest['requestType'],
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const request: DataSubjectRequest = {
        id: `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        requestType,
        status: 'pending',
        requestDate: new Date().toISOString(),
        reason,
        metadata,
      };

      // Store locally
      await this.storeRequestLocally(request);

      // Send to server
      const response = await apiClient.post('/gdpr/data-subject-request', request);

      // Log audit event
      await securityService.logAuditEvent({
        userId,
        action: 'DATA_SUBJECT_REQUEST_SUBMITTED',
        resource: 'user_data',
        severity: 'high',
        metadata: { requestType, requestId: request.id },
      });

      return response.data.requestId;
    } catch (error) {
      console.error('Failed to submit data subject request:', error);
      throw error;
    }
  }

  private async storeRequestLocally(request: DataSubjectRequest): Promise<void> {
    try {
      const existingRequests = await secureStorage.getObject<DataSubjectRequest[]>('data_subject_requests') || [];
      existingRequests.push(request);
      
      await secureStorage.setObject('data_subject_requests', existingRequests);
    } catch (error) {
      console.error('Failed to store request locally:', error);
      throw error;
    }
  }

  async getDataSubjectRequests(userId: string): Promise<DataSubjectRequest[]> {
    try {
      const requests = await secureStorage.getObject<DataSubjectRequest[]>('data_subject_requests') || [];
      return requests.filter(r => r.userId === userId);
    } catch (error) {
      console.error('Failed to get data subject requests:', error);
      return [];
    }
  }

  // Right to Access (Article 15)
  async requestDataAccess(userId: string): Promise<string> {
    return this.submitDataSubjectRequest(userId, 'access', 'User requested data access');
  }

  // Right to Rectification (Article 16)
  async requestDataRectification(
    userId: string,
    incorrectData: Record<string, any>,
    correctData: Record<string, any>
  ): Promise<string> {
    return this.submitDataSubjectRequest(
      userId,
      'rectification',
      'User requested data rectification',
      { incorrectData, correctData }
    );
  }

  // Right to Erasure (Article 17)
  async requestDataErasure(userId: string, reason: string): Promise<string> {
    try {
      const requestId = await this.submitDataSubjectRequest(
        userId,
        'erasure',
        reason
      );

      // Start immediate local data cleanup
      await this.initiateLocalDataErasure(userId);

      return requestId;
    } catch (error) {
      console.error('Failed to request data erasure:', error);
      throw error;
    }
  }

  private async initiateLocalDataErasure(userId: string): Promise<void> {
    try {
      // Clear all user-related data from local storage
      const keysToDelete = [
        'user_profile',
        'user_preferences',
        'cached_orders',
        'location_history',
        'payment_methods',
        'search_history',
        'favorites',
      ];

      for (const key of keysToDelete) {
        try {
          await secureStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to delete ${key}:`, error);
        }
      }

      // Log erasure
      await securityService.logAuditEvent({
        userId,
        action: 'LOCAL_DATA_ERASED',
        resource: 'user_data',
        severity: 'high',
      });

      console.log('Local data erasure initiated');
    } catch (error) {
      console.error('Failed to initiate local data erasure:', error);
      throw error;
    }
  }

  // Right to Data Portability (Article 20)
  async requestDataPortability(userId: string, format: 'json' | 'csv' | 'xml' = 'json'): Promise<string> {
    return this.submitDataSubjectRequest(
      userId,
      'portability',
      'User requested data portability',
      { format }
    );
  }

  // Right to Restriction (Article 18)
  async requestProcessingRestriction(userId: string, reason: string): Promise<string> {
    return this.submitDataSubjectRequest(userId, 'restriction', reason);
  }

  // Right to Object (Article 21)
  async objectToProcessing(userId: string, processingPurpose: string, reason: string): Promise<string> {
    return this.submitDataSubjectRequest(
      userId,
      'objection',
      reason,
      { processingPurpose }
    );
  }

  // Data Processing Information
  getDataProcessingPurposes(): DataProcessingPurpose[] {
    return this.dataProcessingPurposes;
  }

  getPIIInventory(): PIIInventory[] {
    return this.piiInventory;
  }

  getDataRetentionPolicy(dataType: string): number {
    const piiItem = this.piiInventory.find(item => item.field === dataType);
    return piiItem?.retentionPeriod || 365; // Default 1 year
  }

  // Privacy Notice Generation
  generatePrivacyNotice(language: 'tr' | 'en' = 'tr'): string {
    const notices = {
      tr: `
KVKK AYDINLATMA METNİ

1. VERİ SORUMLUSU
[Şirket Adı], KVKK kapsamında veri sorumlusu sıfatıyla hareket etmektedir.

2. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI
Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
${this.dataProcessingPurposes.map(purpose => `- ${purpose.name}: ${purpose.description}`).join('\n')}

3. KİŞİSEL VERİLERİN SAKLANMA SÜRESİ
Verileriniz, işlenme amacının gerektirdiği süre boyunca saklanacaktır.

4. HAKLARINIZ
KVKK kapsamında sahip olduğunuz haklar:
- Bilgi talep etme hakkı
- Düzeltme hakkı
- Silme hakkı
- İşlemeye itiraz hakkı
- Veri taşınabilirliği hakkı

5. İLETİŞİM
Haklarınızı kullanmak için: privacy@company.com
      `,
      en: `
GDPR PRIVACY NOTICE

1. DATA CONTROLLER
[Company Name] acts as data controller under GDPR.

2. PURPOSES OF PROCESSING
Your personal data is processed for the following purposes:
${this.dataProcessingPurposes.map(purpose => `- ${purpose.name}: ${purpose.description}`).join('\n')}

3. RETENTION PERIOD
Your data will be retained for the period necessary for the processing purposes.

4. YOUR RIGHTS
Your rights under GDPR:
- Right to information
- Right to rectification
- Right to erasure
- Right to object
- Right to data portability

5. CONTACT
To exercise your rights: privacy@company.com
      `,
    };

    return notices[language];
  }

  // Compliance Monitoring
  async performComplianceCheck(): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check consent records
      const consents = await secureStorage.getObject<ConsentRecord[]>('user_consents') || [];
      
      if (consents.length === 0) {
        issues.push('No consent records found');
        recommendations.push('Implement consent collection mechanism');
      }

      // Check data retention
      const oldData = consents.filter(c => {
        const age = Date.now() - new Date(c.timestamp).getTime();
        const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
        return age > maxAge;
      });

      if (oldData.length > 0) {
        issues.push(`${oldData.length} consent records exceed retention period`);
        recommendations.push('Implement automated data cleanup');
      }

      // Check encryption
      const encryptionKey = await secureStorage.getItem('encryption_key');
      if (!encryptionKey) {
        issues.push('No encryption key found');
        recommendations.push('Initialize encryption system');
      }

      return {
        compliant: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Compliance check failed:', error);
      return {
        compliant: false,
        issues: ['Compliance check failed'],
        recommendations: ['Fix compliance monitoring system'],
      };
    }
  }

  // Data Breach Response
  async reportDataBreach(
    description: string,
    affectedUsers: string[],
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    try {
      const breachReport = {
        id: `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description,
        affectedUsers: affectedUsers.length,
        severity,
        reportedAt: new Date().toISOString(),
        reportedBy: 'mobile_app',
      };

      // Send to server
      await apiClient.post('/gdpr/data-breach', breachReport);

      // Log audit event
      await securityService.logAuditEvent({
        action: 'DATA_BREACH_REPORTED',
        resource: 'security',
        severity: 'critical',
        metadata: breachReport,
      });

      console.log('Data breach reported successfully');
    } catch (error) {
      console.error('Failed to report data breach:', error);
      throw error;
    }
  }
}

export const gdprService = new GDPRService();