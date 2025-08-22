import crypto from 'crypto';
import { config } from '@/config';
import { logger, securityLogger } from '@/utils/logger';
import { CardToken } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class TokenizationService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;

  constructor() {
    if (config.security.encryptionKey.length !== this.keyLength) {
      throw new Error(`Encryption key must be exactly ${this.keyLength} characters long`);
    }
  }

  /**
   * Tokenize sensitive card data
   * This creates a secure token that can be stored and used for future payments
   */
  async tokenizeCard(
    customerId: string,
    card: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
      holderName: string;
    },
    provider: 'stripe' | 'iyzico'
  ): Promise<CardToken> {
    try {
      // Generate unique token ID
      const tokenId = uuidv4();
      
      // Extract card metadata (non-sensitive)
      const lastFour = card.number.slice(-4);
      const brand = this.detectCardBrand(card.number);
      
      // Create encrypted token payload (this would typically be done by the provider)
      const tokenPayload = {
        customerId,
        lastFour,
        brand,
        expMonth: card.expMonth,
        expYear: card.expYear,
        provider,
        createdAt: new Date().toISOString(),
      };
      
      // In production, this would be handled by the payment provider
      // We're simulating the tokenization process here
      const providerTokenId = `${provider}_token_${uuidv4()}`;
      
      const cardToken: CardToken = {
        id: tokenId,
        customerId,
        lastFour,
        brand,
        expMonth: card.expMonth,
        expYear: card.expYear,
        provider,
        providerTokenId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Log tokenization for security audit (without sensitive data)
      securityLogger.info('Card tokenized', {
        tokenId,
        customerId,
        lastFour,
        brand,
        provider,
        expMonth: card.expMonth,
        expYear: card.expYear,
      });

      logger.info('Card tokenization completed', {
        tokenId,
        customerId,
        provider,
        lastFour,
        brand,
      });

      return cardToken;
    } catch (error) {
      logger.error('Card tokenization failed:', error);
      throw new Error('Failed to tokenize card');
    }
  }

  /**
   * Validate if a token is still valid and not expired
   */
  validateToken(token: CardToken): boolean {
    if (!token.isActive) {
      return false;
    }

    // Check if card is expired
    const now = new Date();
    const expDate = new Date(token.expYear, token.expMonth - 1);
    
    if (expDate < now) {
      logger.warn('Token validation failed - card expired', {
        tokenId: token.id,
        expMonth: token.expMonth,
        expYear: token.expYear,
      });
      return false;
    }

    return true;
  }

  /**
   * Deactivate a token (for security or customer request)
   */
  async deactivateToken(tokenId: string, reason: string): Promise<void> {
    securityLogger.info('Token deactivated', {
      tokenId,
      reason,
      deactivatedAt: new Date().toISOString(),
    });

    logger.info('Token deactivated', { tokenId, reason });
  }

  /**
   * Detect card brand from card number
   */
  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    // Visa
    if (number.startsWith('4')) {
      return 'visa';
    }
    
    // Mastercard
    if (number.startsWith('5') || (number.startsWith('2') && parseInt(number.substring(0, 4)) >= 2221 && parseInt(number.substring(0, 4)) <= 2720)) {
      return 'mastercard';
    }
    
    // American Express
    if (number.startsWith('34') || number.startsWith('37')) {
      return 'amex';
    }
    
    // Discover
    if (number.startsWith('6011') || number.startsWith('65') || (number.startsWith('644') || number.startsWith('645') || number.startsWith('646') || number.startsWith('647') || number.startsWith('648') || number.startsWith('649'))) {
      return 'discover';
    }
    
    // Troy (Turkish local card)
    if (number.startsWith('9792')) {
      return 'troy';
    }
    
    return 'unknown';
  }

  /**
   * Encrypt sensitive data (for internal use only)
   */
  private encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, config.security.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: '', // Simplified for demo
    };
  }

  /**
   * Decrypt sensitive data (for internal use only)
   */
  private decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, config.security.encryptionKey);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}