import { Module, Global } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { HibpClient } from '../http/hibp.client';
import { MockHibpClient } from '../http/hibp.mock';
import { createHibpWorker } from './hibp.worker';

@Global()
@Module({
  providers: [
    {
      provide: 'HIBP_QUEUE',
      useFactory: () => {
        const redisConfig = {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          maxRetriesPerRequest: null as null,
        };

        const queueConnection = new Redis(redisConfig);
        const workerConnection = new Redis(redisConfig);

        // Queue producer
        const queue = new Queue('hibp-check', { connection: queueConnection });

        // Create HIBP client: use mock in dev if API key not configured
        const apiKey = process.env.HIBP_API_KEY || '';
        const useMock = !apiKey && process.env.NODE_ENV !== 'production';
        
        const hibpClient = useMock
          ? new MockHibpClient()
          : new HibpClient({
              apiKey: apiKey,
              baseUrl: process.env.HIBP_BASE_URL,
              userAgent: 'safeid-backend',
            });

        if (useMock) {
          console.log(
            '[QueueModule] ⚠️  Using MOCK HIBP client. Set HIBP_API_KEY to use real API.'
          );
        }

        createHibpWorker(workerConnection, hibpClient);

        return queue;
      },
    },
  ],
  exports: ['HIBP_QUEUE'],
})
export class QueueModule {}
