import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MessageModule } from '../messages/message.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MessageModule, NotificationsModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {} 