import {
  Body, Controller, Get, Param, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FamilyService } from './family.service';
import { InviteDto } from './dto/invite.dto';

interface AuthRequest extends Express.Request {
  user: { userId: string; email: string };
}

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  /** POST /family/invite — caregiver invites patient by email */
  @Post('invite')
  invite(@Request() req: AuthRequest, @Body() dto: InviteDto) {
    return this.familyService.invite(req.user.userId, dto);
  }

  /** GET /family/pending — patient sees incoming pending invites */
  @Get('pending')
  pending(@Request() req: AuthRequest) {
    return this.familyService.getPendingForPatient(req.user.userId);
  }

  /** POST /family/:id/accept — patient accepts an invite */
  @Post(':id/accept')
  accept(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.familyService.accept(id, req.user.userId);
  }

  /** POST /family/:id/reject — patient rejects an invite */
  @Post(':id/reject')
  reject(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.familyService.reject(id, req.user.userId);
  }

  /** GET /family/patients — caregiver's accepted patients */
  @Get('patients')
  myPatients(@Request() req: AuthRequest) {
    return this.familyService.getMyPatients(req.user.userId);
  }

  /** GET /family/caregivers — patient's accepted caregivers */
  @Get('caregivers')
  myCaregivers(@Request() req: AuthRequest) {
    return this.familyService.getMyCaregivers(req.user.userId);
  }

  /** GET /family/patients/:patientId/medicines — caregiver views patient's meds */
  @Get('patients/:patientId/medicines')
  patientMedicines(
    @Param('patientId') patientId: string,
    @Request() req: AuthRequest,
  ) {
    return this.familyService.getPatientMedicines(req.user.userId, patientId);
  }
}
