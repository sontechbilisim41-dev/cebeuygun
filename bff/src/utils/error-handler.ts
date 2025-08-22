import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from './logger';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode: error.statusCode,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Validation Error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later',
    });
  }

  // JWT errors
  if (error.message.includes('jwt') || error.message.includes('token')) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication Error',
      message: 'Invalid or expired token',
    });
  }

  // Service unavailable errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return reply.status(503).send({
      success: false,
      error: 'Service Unavailable',
      message: 'One or more services are currently unavailable',
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : error.message;

  return reply.status(statusCode).send({
    success: false,
    error: 'Server Error',
    message,
  });
};