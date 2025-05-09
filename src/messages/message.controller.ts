import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body() body: { senderId: string; receiverId: string; content: string },
  ) {
    return this.messageService.createMessage(
      body.senderId,
      body.receiverId,
      body.content,
    );
  }

  @Get('conversation/:senderId/:receiverId')
  async getConversation(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    return this.messageService.getConversation(senderId, receiverId);
  }

  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    const conversations = await this.messageService.getConversations(userId);

    return conversations.map((conv) => ({
      userId: conv.userId,
      lastMessage: {
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
        senderId: conv.lastMessage.senderId,
        receiverId: conv.lastMessage.receiverId,
      },
    }));
  }
}
