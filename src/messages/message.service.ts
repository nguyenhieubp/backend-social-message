import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './message.entity';
import { ConversationService } from '../conversations/conversation.service';
import { Conversation } from '../conversations/conversation.entity';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private conversationService: ConversationService,
  ) {}

  async createMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    this.logger.log(`Creating message from ${senderId} to ${receiverId}: ${content.substring(0, 20)}...`);
    
    const message = new this.messageModel({
      senderId,
      receiverId,
      content,
    });
    
    // Save the message
    const savedMessage = await message.save();
    this.logger.log(`Message saved with ID: ${savedMessage._id}`);
    
    // Find or create conversation
    const conversations = await this.conversationService.getUserConversations(senderId);
    this.logger.log(`Found ${conversations.length} conversations for sender`);
    
    let conversation = conversations.find(
      conv => 
        (conv.user1Id === senderId && conv.user2Id === receiverId) || 
        (conv.user1Id === receiverId && conv.user2Id === senderId)
    );
    
    if (conversation) {
      this.logger.log(`Updating existing conversation: ${conversation._id}`);
      // Update lastMessageAt with the message's creation time
      await this.conversationService.updateLastMessageAt(
        conversation._id.toString(),
        savedMessage.createdAt
      );
    } else {
      this.logger.log(`Creating new conversation between ${senderId} and ${receiverId}`);
      // Create new conversation if it doesn't exist
      conversation = await this.conversationService.createConversation(senderId, receiverId);
      this.logger.log(`Created new conversation: ${conversation._id}`);
      
      // Update lastMessageAt for the new conversation
      await this.conversationService.updateLastMessageAt(
        conversation._id.toString(),
        savedMessage.createdAt
      );
    }
    
    return savedMessage;
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getConversations(userId: string): Promise<{ userId: string; lastMessage: Message }[]> {
    // Get all messages where user is either sender or receiver
    const messages = await this.messageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ createdAt: -1 })
      .exec();

    // Create a map to store unique conversations with their last message
    const conversationMap = new Map<string, Message>();

    messages.forEach(message => {
      // Determine the other user's ID
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      // Only add to map if we haven't seen this conversation before
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, message);
      }
    });

    // Convert map to array of objects with userId and lastMessage
    return Array.from(conversationMap.entries()).map(([userId, lastMessage]) => ({
      userId,
      lastMessage,
    }));
  }
}
