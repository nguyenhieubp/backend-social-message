import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from '../databases/schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<any> {
    try {
      return await this.notificationsService.create(createNotificationDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('get-all')
  async findAll(@Body('userId') userId: string): Promise<any> {
    try {
      return await this.notificationsService.findAll(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('unread')
  async findUnread(@Body('userId') userId: string): Promise<any> {
    try {
      return await this.notificationsService.findUnread(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<any> {
    try {
      return await this.notificationsService.markAsRead(id, userId);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('read-all')
  async markAllAsRead(@Body('userId') userId: string): Promise<void> {
    try {
      await this.notificationsService.markAllAsRead(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<any> {
    try {
      return await this.notificationsService.delete(id, userId);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
