import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { EmailVerificationGuard } from '../../auth/guards/email-verification.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'File report against post, comment, or user (Enforces exactly 1 target; Deduplicates active reports)' })
  @ApiResponse({ status: 201, description: 'Report filed successfully' })
  @ApiResponse({ status: 200, description: 'Active report already exists for target (Idempotent deduplication)' })
  @ApiResponse({ status: 400, description: 'Invalid report target (Must specify exactly 1 target)' })
  @ApiResponse({ status: 403, description: 'Email verification required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)
  async fileReport(
    @CurrentUser() user: any,
    @Body() dto: CreateReportDto,
    @Res() res: Response,
  ) {
    const result = await this.reportsService.fileReport(user.sub, dto);
    const statusCode = result.isDuplicate ? HttpStatus.OK : HttpStatus.CREATED;
    return res.status(statusCode).json(result.report);
  }
}
