import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { KafkaService } from '@/services/kafka';
import { ElasticsearchService } from '@/services/elasticsearch';

declare module 'fastify' {
  interface FastifyInstance {
    kafka: KafkaService;
  }
}

const kafkaPlugin: FastifyPluginAsync = async (fastify) => {
  const elasticsearchService = fastify.elasticsearch as ElasticsearchService;
  const kafkaService = new KafkaService(elasticsearchService);
  
  await kafkaService.initialize();
  
  fastify.decorate('kafka', kafkaService);
  
  fastify.addHook('onClose', async () => {
    await kafkaService.disconnect();
  });
};

export default fp(kafkaPlugin);