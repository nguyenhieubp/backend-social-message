import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Conversation extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  user1Id: string;

  @Prop({ type: Types.ObjectId, required: true })
  user2Id: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
