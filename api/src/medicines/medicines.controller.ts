import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Express.Request {
  user: { userId: string; email: string };
}

@Controller('medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateMedicineDto) {
    return this.medicinesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.medicinesService.findAllByUser(req.user.userId);
  }

  @Get('low-stock')
  getLowStock(@Request() req: AuthRequest) {
    return this.medicinesService.getLowStockMedicines(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.medicinesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateMedicineDto,
  ) {
    return this.medicinesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.medicinesService.remove(id, req.user.userId);
  }

  @Post(':id/take')
  takeMedicine(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.medicinesService.takeMedicine(id, req.user.userId);
  }

  @Get(':id/history')
  getHistory(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.medicinesService.getDoseHistory(req.user.userId, id);
  }
}
