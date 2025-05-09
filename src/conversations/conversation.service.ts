import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './conversation.entity';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  async createConversation(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation> {
    this.logger.log(`Creating conversation between ${user1Id} and ${user2Id}`);
    const newConversation = new this.conversationModel({ user1Id, user2Id });
    const savedConversation = await newConversation.save();
    this.logger.log(`Created conversation: ${savedConversation._id}`);
    return savedConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    this.logger.log(`Getting conversations for user: ${userId}`);
    // Lấy tất cả cuộc trò chuyện của người dùng
    const conversations = await this.conversationModel
      .find({ $or: [{ user1Id: userId }, { user2Id: userId }] })
      .exec();
    
    this.logger.log(`Found ${conversations.length} conversations for user: ${userId}`);
    
    // Sắp xếp cuộc trò chuyện theo lastMessageAt nếu có, nếu không thì sử dụng createdAt
    return conversations.sort((a, b) => {
      const dateA = a.lastMessageAt || a.createdAt;
      const dateB = b.lastMessageAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  }

  async updateLastMessageAt(conversationId: string, messageTime?: Date): Promise<Conversation> {
    this.logger.log(`Updating lastMessageAt for conversation: ${conversationId}`);
    return this.conversationModel
      .findByIdAndUpdate(
        conversationId,
        { lastMessageAt: messageTime || new Date() },
        { new: true }
      )
      .exec();
  }
}
