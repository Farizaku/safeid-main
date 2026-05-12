import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthStatus } from './health.service';

@ApiTags('Health')
@Controller('api/health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está saudável',
    type: Object,
  })
  async check(): Promise<HealthStatus> {
    return this.healthService.getHealth();
  }
}
