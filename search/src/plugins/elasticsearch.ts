import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ElasticsearchService } from '@/services/elasticsearch';

declare module 'fastify' {
  interface FastifyInstance {
    elasticsearch: ElasticsearchService;
  }
}

const elasticsearchPlugin: FastifyPluginAsync = async (fastify) => {
  const elasticsearchService = new ElasticsearchService();
  
  await elasticsearchService.initialize();
  
  fastify.decorate('elasticsearch', elasticsearchService);
  
  fastify.addHook('onClose', async () => {
    // Elasticsearch client cleanup is handled automatically
  });
};

export default fp(elasticsearchPlugin);