import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScanService } from './services/scan.service';
import { CreateScanDto, ScanResultDto, ScanHistoryDto } from './dto/scan.dto';
import { CurrentUser } from '../../api/decorators/current-user.decorator';

@ApiTags('scan')
@ApiBearerAuth()
@Controller('api/v1/scan')
export class ScanController {
  constructor(private scanService: ScanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit email for breach analysis' })
  @ApiResponse({
    status: 201,
    description: 'Scan submitted successfully',
    type: ScanResultDto,
  })
  async submitScan(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateScanDto,
  ): Promise<ScanResultDto> {
    return this.scanService.submitScan(userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user scan history' })
  @ApiResponse({
    status: 200,
    description: 'List of user scans',
    type: [ScanHistoryDto],
  })
  async getHistory(@CurrentUser('id') userId: number): Promise<ScanHistoryDto[]> {
    return this.scanService.getUserHistory(userId);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get scan result by job ID' })
  @ApiResponse({
    status: 200,
    description: 'Scan result details',
  })
  async getScanDetail(
    @CurrentUser('id') userId: number,
    @Param('jobId') jobId: string,
  ): Promise<any> {
    return this.scanService.getScanDetail(userId, jobId);
  }
}
