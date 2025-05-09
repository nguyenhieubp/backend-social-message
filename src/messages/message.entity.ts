import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  senderId: string;

  @Prop({ type: Types.ObjectId, required: true })
  receiverId: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
