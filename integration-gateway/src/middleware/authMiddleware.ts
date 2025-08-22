import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger } from '@/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authorization token required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.security.jwtSecret) as any;
      
      req.user = {
        id: decoded.sub,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };

      // Check if user has integration management permission
      if (!req.user.permissions.includes('integration:manage')) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token:', {
        error: jwtError.message,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      timestamp: new Date().toISOString(),
    });
  }
};

export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Validate API key format
    if (!apiKey.startsWith(config.security.apiKeyPrefix)) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key format',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // In production, this would validate against database
    // For now, accept any properly formatted key
    next();
  } catch (error) {
    logger.error('API key middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      timestamp: new Date().toISOString(),
    });
  }
};