import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (request, reply) => {
    const servicesHealth = await (fastify as any).checkServicesHealth();
    
    const allHealthy = servicesHealth.every((service: any) => service.status === 'healthy');
    
    return reply.status(allHealthy ? 200 : 503).send({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: servicesHealth,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });
};

export { healthRoutes };