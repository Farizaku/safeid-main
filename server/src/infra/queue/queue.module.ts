import { Module, Global } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'HIBP_QUEUE',
      useFactory: () => {
        const connection = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        });

        // Queue producer
        const queue = new Queue('hibp-check', { connection });

        // Basic in-process worker to avoid job timeouts during development.
        // Replace the processor with real HIBP lookup logic (and API key) later.
        new Worker(
          'hibp-check',
          async (job) => {
            // Placeholder processor: performs lookup and stores result on job.data.result
            // Implement real HIBP integration here.
            const breaches: any[] = [];

            await job.update({ ...job.data, result: breaches });

            return breaches;
          },
          { connection }
        );

        return queue;
      },
    },
  ],
  exports: ['HIBP_QUEUE'],
})
export class QueueModule {}
