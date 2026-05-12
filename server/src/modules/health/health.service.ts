import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  database?: {
    status: 'ok' | 'error';
    message?: string;
  };
  redis?: {
    status: 'ok' | 'error';
    message?: string;
  };
}

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getHealth(): Promise<HealthStatus> {
    const health: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };

    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      health.database = {
        status: 'ok',
      };
    } catch (error) {
      health.status = 'error';
      health.database = {
        status: 'error',
        message: 'Database connection failed',
      };
    }

    return health;
  }
}
