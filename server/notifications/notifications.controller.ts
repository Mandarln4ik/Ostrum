import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Post('user')
  sendUser(@Body() body: { userId: string, title: string, message: string }) {
    return this.service.sendToUser(body.userId, body.title, body.message);
  }

  @Post('global')
  sendGlobal(@Body() body: { title: string, message: string }) {
    return this.service.sendGlobal(body.title, body.message);
  }

  @Get('user/:id')
  getByUser(@Param('id') id: string) {
    return this.service.findByUser(id);
  }
}