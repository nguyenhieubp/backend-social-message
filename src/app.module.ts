import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './messages/message.module';
import { DatabaseModule } from './databases/database.module';
import { ConversationModule } from './conversations/conversation.module';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      }
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
