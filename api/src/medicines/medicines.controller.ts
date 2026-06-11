import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  UseGuards,
  Param,
  Req,
} from '@nestjs/common';

import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateMedicineDto) {
    return this.medicinesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.medicinesService.findAllByUser(req.user.userId);
  }

  @Post(':id/take')
  @UseGuards(JwtAuthGuard)
  takeMedicine(@Param('id') id: string, @Req() req) {
    return this.medicinesService.takeMedicine(id, req.user.userId);
  }

  @Get(':id/history')
  getHistory(@Request() req, @Param('id') id: string) {
    return this.medicinesService.getDoseHistory(req.user.userId, id);
  }
}
