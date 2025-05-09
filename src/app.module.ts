import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './messages/message.module';
import { DatabaseModule } from './databases/database.module';
import { ConversationModule } from './conversations/conversation.module';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      // 'mongodb://admin:123456789@mongodb:27017/chat-db?authSource=admin',
      'mongodb://admin:123456789@localhost:27017/chat-db?authSource=admin',
    ),
    MessageModule,
    ConversationModule,
    SocketModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
