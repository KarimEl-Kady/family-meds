import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DoseLogsService } from './dose-logs.service';

@Controller('dose-logs')
export class DoseLogsController {
  constructor(private readonly doseLogsService: DoseLogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.doseLogsService.findByUser(req.user.userId);
  }
}
