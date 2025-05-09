import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from './conversation.entity';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('create')
  async createConversation(
    @Body('user1Id') user1Id: string,
    @Body('user2Id') user2Id: string,
  ): Promise<Conversation> {
    return this.conversationService.createConversation(user1Id, user2Id);
  }

  @Get('user/:userId')
  async getUserConversations(
    @Param('userId') userId: string,
  ): Promise<Conversation[]> {
    return this.conversationService.getUserConversations(userId);
  }
}
