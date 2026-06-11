import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getUserNotifications(@Request() req) {
    return this.notificationsService.findUserNotifications(
      req.user.userId,
    );
  }
}