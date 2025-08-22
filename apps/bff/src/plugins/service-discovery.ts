import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { request } from 'undici';
import { config } from '@/config/index';
import { logger } from '@/utils/logger';

interface ServiceClient {
  get: (path: string, options?: any) => Promise<any>;
  post: (path: string, body?: any, options?: any) => Promise<any>;
  put: (path: string, body?: any, options?: any) => Promise<any>;
  delete: (path: string, options?: any) => Promise<any>;
}

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      auth: ServiceClient;
      catalog: ServiceClient;
      pricing: ServiceClient;
      promotion: ServiceClient;
      order: ServiceClient;
      inventory: ServiceClient;
    };
  }
}

const createServiceClient = (baseUrl: string): ServiceClient => {
  const makeRequest = async (method: string, path: string, body?: any, options: any = {}) => {
    const url = `${baseUrl}${path}`;
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await request(url, requestOptions);
      const data = await response.body.json();
      
      if (response.statusCode >= 400) {
        throw new Error(`Service request failed: ${response.statusCode} - ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      logger.error(`Service request failed for ${url}:`, error);
      throw error;
    }
  };

  return {
    get: (path: string, options?: any) => makeRequest('GET', path, undefined, options),
    post: (path: string, body?: any, options?: any) => makeRequest('POST', path, body, options),
    put: (path: string, body?: any, options?: any) => makeRequest('PUT', path, body, options),
    delete: (path: string, options?: any) => makeRequest('DELETE', path, undefined, options),
  };
};

const serviceDiscoveryPlugin: FastifyPluginAsync = async (fastify) => {
  const services = {
    auth: createServiceClient(config.services.auth.url),
    catalog: createServiceClient(config.services.catalog.url),
    pricing: createServiceClient(config.services.pricing.url),
    promotion: createServiceClient(config.services.promotion.url),
    order: createServiceClient(config.services.order.url),
    inventory: createServiceClient(config.services.inventory.url),
  };

  fastify.decorate('services', services);

  // Health check for all services
  fastify.decorate('checkServicesHealth', async () => {
    const healthChecks = await Promise.allSettled(
      Object.entries(services).map(async ([name, client]) => {
        try {
          await client.get('/health');
          return { service: name, status: 'healthy' };
        } catch (error) {
          return { service: name, status: 'unhealthy', error: error.message };
        }
      })
    );

    return healthChecks.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    );
  });
};

export { serviceDiscoveryPlugin };
export default fp(serviceDiscoveryPlugin);