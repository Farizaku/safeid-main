import { Module } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './services/scan.service';
import { DatabaseModule } from '@infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ScanController],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
