import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { config } from '@/config/index';
import { JWTPayload } from '@/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', null);

  fastify.addHook('preHandler', async (request, reply) => {
    // Skip auth for health check and public endpoints
    if (request.url === '/health' || request.url.startsWith('/public')) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication Required',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      request.user = decoded;
    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication Failed',
        message: 'Invalid or expired token',
      });
    }
  });

  // Role-based access control decorator
  fastify.decorate('requireRole', (roles: string[]) => {
    return async (request: any, reply: any) => {
      if (!request.user) {
        return reply.status(401).send({
          success: false,
          error: 'Authentication Required',
          message: 'User not authenticated',
        });
      }

      if (!roles.includes(request.user.role)) {
        return reply.status(403).send({
          success: false,
          error: 'Access Denied',
          message: 'Insufficient permissions',
        });
      }
    };
  });
};

export { authPlugin };
export default fp(authPlugin);