import {
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

interface AuthRequest extends Express.Request {
  user: { userId: string; email: string };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.notificationsService.findUserNotifications(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }
}