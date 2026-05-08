import { Worker } from 'bullmq';
import Redis from 'ioredis';

// Minimal HIBP client shape used by the worker (allows using mock or real client)
type HibpClientLike = {
  checkAccount(email: string): Promise<any[]>;
};

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function createHibpWorker(connection: Redis, hibpClient: HibpClientLike) {
  // simple per-process rate limiter (min interval between requests)
  let lastRequestTs = 0;
  const minInterval = parseInt(process.env.HIBP_MIN_INTERVAL_MS || '1500');

  const worker = new Worker(
    'hibp-check',
    async (job) => {
      const { email } = job.data || {};

      if (!email) {
        throw new Error('Job missing email');
      }

      const now = Date.now();
      const since = now - lastRequestTs;
      if (since < minInterval) {
        await sleep(minInterval - since);
      }

      try {
        const breaches = await hibpClient.checkAccount(email);

        lastRequestTs = Date.now();

        // store result in job data for the producer to read
        await (job as any).update({ ...job.data, result: breaches });

        return breaches;
      } catch (err) {
        // Let BullMQ handle retries by throwing
        throw err;
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job?: any, err?: any) => {
    console.error(`[HIBP Worker] job ${job?.id} failed:`, err?.message || err);
  });

  worker.on('completed', (job?: any) => {
    console.info(`[HIBP Worker] job ${job?.id} completed`);
  });

  return worker;
}
