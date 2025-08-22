import { securityService } from '@/services/securityService';

// Input validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+90|0)?[5][0-9]{9}$/,
  name: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]{2,50}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  address: /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s.,/-]{5,200}$/,
  creditCard: /^[0-9]{13,19}$/,
  cvv: /^[0-9]{3,4}$/,
  postalCode: /^[0-9]{5}$/,
} as const;

// Security validation utilities
export class SecurityValidator {
  // Input validation
  static validateInput(input: string, type: keyof typeof ValidationPatterns): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const pattern = ValidationPatterns[type];
    return pattern.test(input.trim());
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>]/g, (match) => {
        return match === '<' ? '&lt;' : '&gt;';
      });
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (!password) {
      return { isValid: false, score: 0, feedback: ['Şifre gerekli'] };
    }

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('En az 8 karakter olmalı');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir küçük harf içermeli');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir büyük harf içermeli');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir rakam içermeli');
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir özel karakter içermeli (@$!%*?&)');
    }

    // Common password check
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', '12345678', '111111', '1234567890'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push('Yaygın kullanılan şifreler güvenli değil');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  // Validate credit card number using Luhn algorithm
  static validateCreditCard(cardNumber: string): {
    isValid: boolean;
    cardType: string;
  } {
    const sanitized = cardNumber.replace(/\s/g, '');
    
    if (!ValidationPatterns.creditCard.test(sanitized)) {
      return { isValid: false, cardType: 'unknown' };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const isValid = sum % 10 === 0;

    // Determine card type
    let cardType = 'unknown';
    if (/^4/.test(sanitized)) {
      cardType = 'visa';
    } else if (/^5[1-5]/.test(sanitized)) {
      cardType = 'mastercard';
    } else if (/^3[47]/.test(sanitized)) {
      cardType = 'amex';
    }

    return { isValid, cardType };
  }

  // Validate Turkish phone number
  static validateTurkishPhone(phone: string): boolean {
    const cleaned = phone.replace(/\s/g, '');
    return ValidationPatterns.phone.test(cleaned);
  }

  // Format Turkish phone number
  static formatTurkishPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('90')) {
      const number = cleaned.substring(2);
      return `+90 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1);
      return `+90 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    } else if (cleaned.length === 10) {
      return `+90 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
    
    return phone;
  }

  // Validate Turkish ID number
  static validateTurkishId(id: string): boolean {
    if (!/^\d{11}$/.test(id)) {
      return false;
    }

    const digits = id.split('').map(Number);
    
    // First digit cannot be 0
    if (digits[0] === 0) {
      return false;
    }

    // Calculate checksum
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    const checksum1 = (oddSum * 7 - evenSum) % 10;
    const checksum2 = (oddSum + evenSum + digits[9]) % 10;
    
    return checksum1 === digits[9] && checksum2 === digits[10];
  }

  // Check for suspicious patterns
  static detectSuspiciousInput(input: string): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let isSuspicious = false;

    // SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\bOR\b.*=.*\bOR\b)/i,
      /(\bAND\b.*=.*\bAND\b)/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        isSuspicious = true;
        reasons.push('Potential SQL injection attempt');
        break;
      }
    }

    // XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        isSuspicious = true;
        reasons.push('Potential XSS attempt');
        break;
      }
    }

    // Path traversal patterns
    const pathTraversalPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
    ];

    for (const pattern of pathTraversalPatterns) {
      if (pattern.test(input)) {
        isSuspicious = true;
        reasons.push('Potential path traversal attempt');
        break;
      }
    }

    // Command injection patterns
    const commandPatterns = [
      /[;&|`$()]/,
      /\b(cat|ls|pwd|whoami|id|uname)\b/i,
    ];

    for (const pattern of commandPatterns) {
      if (pattern.test(input)) {
        isSuspicious = true;
        reasons.push('Potential command injection attempt');
        break;
      }
    }

    return { isSuspicious, reasons };
  }

  // Rate limiting check
  static async checkRateLimit(
    identifier: string,
    action: string,
    maxRequests: number = 10,
    windowMs: number = 60000
  ): Promise<boolean> {
    const key = `${identifier}-${action}`;
    return securityService.checkRateLimit(key, maxRequests, windowMs);
  }

  // Generate secure random string
  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Validate file upload
  static validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    // Size check
    if (file.size > maxSize) {
      errors.push('Dosya boyutu 5MB\'dan büyük olamaz');
    }

    // Type check
    if (!allowedTypes.includes(file.type)) {
      errors.push('Desteklenmeyen dosya türü');
    }

    // Name check
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('Dosya adı geçersiz karakterler içeriyor');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Form validation helpers
export const FormValidators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Bu alan gerekli';
    }
    return null;
  },

  email: (value: string) => {
    if (!value) return null;
    if (!SecurityValidator.validateInput(value, 'email')) {
      return 'Geçerli bir e-posta adresi girin';
    }
    return null;
  },

  phone: (value: string) => {
    if (!value) return null;
    if (!SecurityValidator.validateTurkishPhone(value)) {
      return 'Geçerli bir telefon numarası girin';
    }
    return null;
  },

  password: (value: string) => {
    if (!value) return null;
    const validation = SecurityValidator.validatePasswordStrength(value);
    if (!validation.isValid) {
      return validation.feedback[0];
    }
    return null;
  },

  confirmPassword: (value: string, originalPassword: string) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Şifreler eşleşmiyor';
    }
    return null;
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    if (value.length < min) {
      return `En az ${min} karakter olmalı`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    if (value.length > max) {
      return `En fazla ${max} karakter olabilir`;
    }
    return null;
  },

  creditCard: (value: string) => {
    if (!value) return null;
    const validation = SecurityValidator.validateCreditCard(value);
    if (!validation.isValid) {
      return 'Geçerli bir kart numarası girin';
    }
    return null;
  },

  cvv: (value: string) => {
    if (!value) return null;
    if (!ValidationPatterns.cvv.test(value)) {
      return 'Geçerli bir CVV girin';
    }
    return null;
  },
};

// Security event logger
export const SecurityLogger = {
  logValidationFailure: async (field: string, value: string, error: string) => {
    await securityService.logAuditEvent({
      action: 'VALIDATION_FAILURE',
      resource: 'form_input',
      severity: 'low',
      metadata: { field, error, valueLength: value.length },
    });
  },

  logSuspiciousInput: async (field: string, reasons: string[]) => {
    await securityService.logAuditEvent({
      action: 'SUSPICIOUS_INPUT_DETECTED',
      resource: 'form_input',
      severity: 'high',
      metadata: { field, reasons },
    });
  },

  logRateLimitExceeded: async (identifier: string, action: string) => {
    await securityService.logAuditEvent({
      action: 'RATE_LIMIT_EXCEEDED',
      resource: 'api_access',
      severity: 'medium',
      metadata: { identifier, action },
    });
  },
};