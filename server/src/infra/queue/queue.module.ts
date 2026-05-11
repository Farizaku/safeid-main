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
        const apiKey = (process.env.HIBP_API_KEY || '').trim();
        const useMock = process.env.HIBP_USE_MOCK === 'true';

        // Queue producer
        const queue = new Queue('hibp-check', { connection: queueConnection });

        if (!useMock && !apiKey) {
          throw new Error(
            '[QueueModule] HIBP_API_KEY is required. Use the zeroed test key for the HIBP integration tests or set HIBP_USE_MOCK=true explicitly.'
          );
        }

        const hibpClient = useMock
          ? new MockHibpClient()
          : new HibpClient({
              apiKey,
              baseUrl: process.env.HIBP_BASE_URL,
              userAgent: 'safeid-backend',
            });

        if (useMock) {
          console.log(
            '[QueueModule] ⚠️  Using MOCK HIBP client because HIBP_USE_MOCK=true.'
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
