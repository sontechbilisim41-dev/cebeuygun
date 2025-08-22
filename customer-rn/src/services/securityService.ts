import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { apiClient } from './apiClient';

interface SecurityConfig {
  tokenRotationInterval: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
  biometricEnabled: boolean;
}

interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PIIField {
  field: string;
  value: string;
  encrypted: boolean;
  masked: boolean;
}

class SecurityService {
  private config: SecurityConfig = {
    tokenRotationInterval: 15 * 60 * 1000, // 15 minutes
    maxLoginAttempts: 5,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    biometricEnabled: false,
  };

  private auditQueue: AuditLogEntry[] = [];
  private encryptionKey: string | null = null;

  async initialize(): Promise<void> {
    try {
      // Initialize encryption key
      await this.initializeEncryption();
      
      // Setup token rotation
      this.setupTokenRotation();
      
      // Setup session monitoring
      this.setupSessionMonitoring();
      
      // Initialize audit logging
      this.initializeAuditLogging();
      
      console.log('Security service initialized successfully');
    } catch (error) {
      console.error('Security service initialization failed:', error);
      throw error;
    }
  }

  // Encryption & Data Protection
  private async initializeEncryption(): Promise<void> {
    try {
      let key = await SecureStore.getItemAsync('encryption_key');
      
      if (!key) {
        // Generate new encryption key
        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${Date.now()}-${Math.random()}-${Platform.OS}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
        
        await SecureStore.setItemAsync('encryption_key', key, {
          requireAuthentication: true,
          authenticationPrompt: 'Authenticate to access secure data',
        });
      }
      
      this.encryptionKey = key;
    } catch (error) {
      console.error('Encryption initialization failed:', error);
      throw error;
    }
  }

  async encryptPII(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      // Simple XOR encryption for demo - use proper encryption in production
      const encrypted = Buffer.from(data)
        .map((byte, index) => 
          byte ^ this.encryptionKey!.charCodeAt(index % this.encryptionKey!.length)
        );
      
      return Buffer.from(encrypted).toString('base64');
    } catch (error) {
      console.error('PII encryption failed:', error);
      throw error;
    }
  }

  async decryptPII(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encrypted = Buffer.from(encryptedData, 'base64');
      const decrypted = encrypted
        .map((byte, index) => 
          byte ^ this.encryptionKey!.charCodeAt(index % this.encryptionKey!.length)
        );
      
      return Buffer.from(decrypted).toString();
    } catch (error) {
      console.error('PII decryption failed:', error);
      throw error;
    }
  }

  maskPII(data: string, type: 'email' | 'phone' | 'name' | 'address'): string {
    switch (type) {
      case 'email':
        const [username, domain] = data.split('@');
        return `${username.substring(0, 2)}***@${domain}`;
      
      case 'phone':
        return data.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
      
      case 'name':
        const names = data.split(' ');
        return names.map(name => 
          name.length > 2 ? `${name.substring(0, 2)}***` : name
        ).join(' ');
      
      case 'address':
        return data.substring(0, 10) + '***';
      
      default:
        return '***';
    }
  }

  // Token Management & Authentication
  private setupTokenRotation(): void {
    setInterval(async () => {
      try {
        await this.rotateTokens();
      } catch (error) {
        console.error('Token rotation failed:', error);
        await this.logAuditEvent({
          action: 'TOKEN_ROTATION_FAILED',
          resource: 'authentication',
          severity: 'high',
          metadata: { error: error.message },
        });
      }
    }, this.config.tokenRotationInterval);
  }

  private async rotateTokens(): Promise<void> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      if (!refreshToken) {
        return;
      }

      const response = await apiClient.post('/auth/rotate-token', {
        refreshToken,
      });

      await SecureStore.setItemAsync('access_token', response.data.accessToken);
      await SecureStore.setItemAsync('refresh_token', response.data.refreshToken);

      await this.logAuditEvent({
        action: 'TOKEN_ROTATED',
        resource: 'authentication',
        severity: 'low',
      });
    } catch (error) {
      console.error('Token rotation error:', error);
      throw error;
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const lastActivity = await SecureStore.getItemAsync('last_activity');
      
      if (!lastActivity) {
        return false;
      }

      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      
      if (timeSinceActivity > this.config.sessionTimeout) {
        await this.invalidateSession();
        return false;
      }

      await this.updateLastActivity();
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  private async updateLastActivity(): Promise<void> {
    await SecureStore.setItemAsync('last_activity', Date.now().toString());
  }

  private async invalidateSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('last_activity');

      await this.logAuditEvent({
        action: 'SESSION_INVALIDATED',
        resource: 'authentication',
        severity: 'medium',
        metadata: { reason: 'timeout' },
      });
    } catch (error) {
      console.error('Session invalidation failed:', error);
    }
  }

  private setupSessionMonitoring(): void {
    setInterval(async () => {
      const isValid = await this.validateSession();
      if (!isValid) {
        // Trigger logout or session refresh
        console.log('Session expired, triggering logout');
      }
    }, 60000); // Check every minute
  }

  // Audit Logging
  private initializeAuditLogging(): void {
    // Setup periodic audit log sync
    setInterval(() => {
      this.syncAuditLogs();
    }, 30000); // Sync every 30 seconds
  }

  async logAuditEvent(event: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        id: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${Date.now()}-${Math.random()}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        ),
        timestamp: new Date().toISOString(),
        ...event,
      };

      this.auditQueue.push(auditEntry);

      // Store locally for offline capability
      const existingLogs = await SecureStore.getItemAsync('audit_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(auditEntry);

      // Keep only last 1000 entries locally
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      await SecureStore.setItemAsync('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  private async syncAuditLogs(): Promise<void> {
    if (this.auditQueue.length === 0) {
      return;
    }

    try {
      const logsToSync = [...this.auditQueue];
      this.auditQueue = [];

      await apiClient.post('/audit/logs', {
        logs: logsToSync,
      });

      console.log(`Synced ${logsToSync.length} audit logs`);
    } catch (error) {
      console.error('Audit log sync failed:', error);
      // Re-add logs to queue for retry
      this.auditQueue.unshift(...this.auditQueue);
    }
  }

  // GDPR/KVKK Compliance
  async requestDataExport(userId: string): Promise<string> {
    try {
      await this.logAuditEvent({
        userId,
        action: 'DATA_EXPORT_REQUESTED',
        resource: 'user_data',
        severity: 'medium',
      });

      const response = await apiClient.post('/gdpr/export-data', {
        userId,
      });

      await this.logAuditEvent({
        userId,
        action: 'DATA_EXPORT_COMPLETED',
        resource: 'user_data',
        severity: 'medium',
        metadata: { exportId: response.data.exportId },
      });

      return response.data.downloadUrl;
    } catch (error) {
      await this.logAuditEvent({
        userId,
        action: 'DATA_EXPORT_FAILED',
        resource: 'user_data',
        severity: 'high',
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  async requestDataDeletion(userId: string, reason?: string): Promise<void> {
    try {
      await this.logAuditEvent({
        userId,
        action: 'DATA_DELETION_REQUESTED',
        resource: 'user_data',
        severity: 'high',
        metadata: { reason },
      });

      await apiClient.post('/gdpr/delete-data', {
        userId,
        reason,
      });

      // Clear local data
      await this.clearUserData(userId);

      await this.logAuditEvent({
        userId,
        action: 'DATA_DELETION_COMPLETED',
        resource: 'user_data',
        severity: 'high',
      });
    } catch (error) {
      await this.logAuditEvent({
        userId,
        action: 'DATA_DELETION_FAILED',
        resource: 'user_data',
        severity: 'critical',
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  private async clearUserData(userId: string): Promise<void> {
    try {
      // Clear all user-related data from secure storage
      const keys = [
        'access_token',
        'refresh_token',
        'user_profile',
        'user_preferences',
        'cached_orders',
        'location_history',
        'payment_methods',
      ];

      for (const key of keys) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          console.warn(`Failed to delete ${key}:`, error);
        }
      }

      console.log('User data cleared successfully');
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw error;
    }
  }

  async updateConsentStatus(userId: string, consents: Record<string, boolean>): Promise<void> {
    try {
      await this.logAuditEvent({
        userId,
        action: 'CONSENT_UPDATED',
        resource: 'user_consent',
        severity: 'medium',
        metadata: { consents },
      });

      await apiClient.post('/gdpr/update-consent', {
        userId,
        consents,
      });

      // Store consent locally
      await SecureStore.setItemAsync(
        'user_consents',
        JSON.stringify({
          userId,
          consents,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      await this.logAuditEvent({
        userId,
        action: 'CONSENT_UPDATE_FAILED',
        resource: 'user_consent',
        severity: 'high',
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  // Input Validation & Sanitization
  validateInput(input: string, type: 'email' | 'phone' | 'name' | 'text'): boolean {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^(\+90|0)?[5][0-9]{9}$/,
      name: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]{2,50}$/,
      text: /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s.,!?-]{1,500}$/,
    };

    return patterns[type].test(input.trim());
  }

  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  // Security Headers & Protection
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  }

  // Rate Limiting
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  // Security Monitoring
  async detectSuspiciousActivity(userId: string, activity: string): Promise<boolean> {
    try {
      const suspiciousPatterns = [
        'multiple_failed_logins',
        'unusual_location_access',
        'rapid_api_calls',
        'data_scraping_attempt',
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => 
        activity.toLowerCase().includes(pattern)
      );

      if (isSuspicious) {
        await this.logAuditEvent({
          userId,
          action: 'SUSPICIOUS_ACTIVITY_DETECTED',
          resource: 'security',
          severity: 'critical',
          metadata: { activity },
        });

        // Trigger security response
        await this.triggerSecurityResponse(userId, activity);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Suspicious activity detection failed:', error);
      return false;
    }
  }

  private async triggerSecurityResponse(userId: string, activity: string): Promise<void> {
    try {
      // Implement security response (e.g., temporary account lock, notification)
      await apiClient.post('/security/incident', {
        userId,
        activity,
        timestamp: new Date().toISOString(),
      });

      console.log(`Security response triggered for user ${userId}`);
    } catch (error) {
      console.error('Security response failed:', error);
    }
  }

  // Cleanup & Maintenance
  async performSecurityMaintenance(): Promise<void> {
    try {
      // Clean up old audit logs
      await this.cleanupOldAuditLogs();
      
      // Rotate encryption keys if needed
      await this.checkKeyRotation();
      
      // Clear expired sessions
      await this.clearExpiredSessions();
      
      console.log('Security maintenance completed');
    } catch (error) {
      console.error('Security maintenance failed:', error);
    }
  }

  private async cleanupOldAuditLogs(): Promise<void> {
    try {
      const logs = await SecureStore.getItemAsync('audit_logs');
      if (!logs) return;

      const parsedLogs = JSON.parse(logs);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      const filteredLogs = parsedLogs.filter((log: AuditLogEntry) => 
        new Date(log.timestamp).getTime() > thirtyDaysAgo
      );

      await SecureStore.setItemAsync('audit_logs', JSON.stringify(filteredLogs));
    } catch (error) {
      console.error('Audit log cleanup failed:', error);
    }
  }

  private async checkKeyRotation(): Promise<void> {
    try {
      const keyCreated = await SecureStore.getItemAsync('key_created_at');
      if (!keyCreated) return;

      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      
      if (parseInt(keyCreated) < ninetyDaysAgo) {
        await this.rotateEncryptionKey();
      }
    } catch (error) {
      console.error('Key rotation check failed:', error);
    }
  }

  private async rotateEncryptionKey(): Promise<void> {
    try {
      // Generate new key
      const newKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}-${Math.random()}-rotation`,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      // Store new key
      await SecureStore.setItemAsync('encryption_key', newKey);
      await SecureStore.setItemAsync('key_created_at', Date.now().toString());

      this.encryptionKey = newKey;

      await this.logAuditEvent({
        action: 'ENCRYPTION_KEY_ROTATED',
        resource: 'security',
        severity: 'medium',
      });
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw error;
    }
  }

  private async clearExpiredSessions(): Promise<void> {
    try {
      const isValid = await this.validateSession();
      if (!isValid) {
        await this.invalidateSession();
      }
    } catch (error) {
      console.error('Session cleanup failed:', error);
    }
  }
}

export const securityService = new SecurityService();