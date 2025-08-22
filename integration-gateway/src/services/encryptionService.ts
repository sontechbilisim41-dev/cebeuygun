import crypto from 'crypto';
import { config } from '@/config';
import { EncryptedCredentials } from '@/types';
import { logger } from '@/utils/logger';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private tagLength = 16;

  async encryptCredentials(credentials: EncryptedCredentials): Promise<EncryptedCredentials> {
    try {
      const encrypted: EncryptedCredentials = {};
      
      for (const [key, value] of Object.entries(credentials)) {
        if (typeof value === 'string' && value.length > 0) {
          encrypted[key as keyof EncryptedCredentials] = await this.encrypt(value);
        } else {
          encrypted[key as keyof EncryptedCredentials] = value;
        }
      }

      return encrypted;
    } catch (error) {
      logger.error('Failed to encrypt credentials:', error);
      throw error;
    }
  }

  async decryptCredentials(encryptedCredentials: EncryptedCredentials): Promise<EncryptedCredentials> {
    try {
      const decrypted: EncryptedCredentials = {};
      
      for (const [key, value] of Object.entries(encryptedCredentials)) {
        if (typeof value === 'string' && this.isEncrypted(value)) {
          decrypted[key as keyof EncryptedCredentials] = await this.decrypt(value);
        } else {
          decrypted[key as keyof EncryptedCredentials] = value;
        }
      }

      return decrypted;
    } catch (error) {
      logger.error('Failed to decrypt credentials:', error);
      throw error;
    }
  }

  private async encrypt(text: string): Promise<string> {
    try {
      const key = Buffer.from(config.security.encryptionKey, 'utf8');
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('integration-gateway', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine iv + tag + encrypted data
      const combined = iv.toString('hex') + tag.toString('hex') + encrypted;
      
      return `enc:${combined}`;
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw error;
    }
  }

  private async decrypt(encryptedText: string): Promise<string> {
    try {
      if (!encryptedText.startsWith('enc:')) {
        return encryptedText; // Not encrypted
      }

      const combined = encryptedText.substring(4); // Remove 'enc:' prefix
      const key = Buffer.from(config.security.encryptionKey, 'utf8');
      
      // Extract components
      const iv = Buffer.from(combined.substring(0, this.ivLength * 2), 'hex');
      const tag = Buffer.from(combined.substring(this.ivLength * 2, (this.ivLength + this.tagLength) * 2), 'hex');
      const encrypted = combined.substring((this.ivLength + this.tagLength) * 2);
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('integration-gateway', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw error;
    }
  }

  private isEncrypted(text: string): boolean {
    return text.startsWith('enc:');
  }

  generateApiKey(): string {
    const randomBytes = crypto.randomBytes(32);
    const timestamp = Date.now().toString(36);
    const hash = crypto.createHash('sha256').update(randomBytes).digest('hex');
    
    return `${config.security.apiKeyPrefix}${timestamp}_${hash.substring(0, 32)}`;
  }

  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateIdempotencyKey(data: any): string {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
}

export const encryptionService = new EncryptionService();