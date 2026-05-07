import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Module imports
import { HealthModule } from './modules/health/health.module';
import { ScanModule } from './modules/scan/scan.module';

// Infra modules
import { DatabaseModule } from './infra/database/database.module';
import { CacheModule } from './infra/cache/cache.module';
import { QueueModule } from './infra/queue/queue.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),

    // Infrastructure
    DatabaseModule,
    CacheModule,
    QueueModule,

    // Domain Modules
    ScanModule,
    HealthModule,
  ],
})
export class AppModule {}
