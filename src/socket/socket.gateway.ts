import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../messages/message.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userSockets: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private readonly messageService: MessageService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    message: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      // Save message to database
      const savedMessage = await this.messageService.createMessage(
        message.senderId,
        message.receiverId,
        message.content,
      );

      // Get receiver's socket ID
      const receiverSocketId = this.connectedUsers.get(message.receiverId);
      
      if (receiverSocketId) {
        // Emit to specific user's room
        this.server.to(receiverSocketId).emit('receiveMessage', savedMessage);
      }

      // Emit back to sender for confirmation
      client.emit('messageSent', savedMessage);
    } catch (error) {
      console.error('Error handling message:', error);
      client.emit('messageError', { error: 'Failed to send message' });
    }
  }

  @SubscribeMessage('sendNotification')
  async handleNotification(
    @MessageBody()
    notificationData: {
      actor: string;
      userId: string;
      title: string;
      content: string;
      data: any;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      console.log('Received notification request:', notificationData);
      console.log('Connected users:', Array.from(this.connectedUsers.entries()));
      
      // Save notification to database
      const savedNotification = await this.notificationsService.create({
        actor: notificationData.actor,
        userId: notificationData.userId,
        title: notificationData.title,
        content: notificationData.content,
        data: notificationData.data,
      });
      console.log('Notification saved to database:', savedNotification);

      // Get receiver's socket ID
      const receiverSocketId = this.connectedUsers.get(notificationData.userId);
      console.log(`Receiver socket ID for user ${notificationData.userId}:`, receiverSocketId);

      if (receiverSocketId) {
        // Emit to specific user's room
        this.server.to(receiverSocketId).emit('receiveNotification', savedNotification);
        console.log(`Notification sent to user ${notificationData.userId} via socket ID ${receiverSocketId}`);
      } else {
        console.log(`User ${notificationData.userId} is not connected, notification stored in database only`);
      }

      // Emit back to sender for confirmation
      client.emit('notificationSent', { success: true });
    } catch (error) {
      console.error('Error handling notification:', error);
      client.emit('notificationError', { error: 'Failed to send notification' });
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`User ${userId} joining with socket ID ${client.id}`);
    
    // Store user's socket ID
    this.connectedUsers.set(userId, client.id);
    this.userSockets.set(client.id, userId);

    // Join user's personal room
    client.join(userId);
    console.log(`User ${userId} joined room, current connected users:`, Array.from(this.connectedUsers.keys()));

    // Broadcast online status to all connected clients
    this.broadcastOnlineUsers();
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users
    const userId = this.userSockets.get(client.id);
    if (userId) {
      console.log(`User ${userId} disconnected`);
      this.connectedUsers.delete(userId);
      this.userSockets.delete(client.id);
      this.broadcastOnlineUsers();
    }
  }

  private broadcastOnlineUsers(): void {
    const onlineUserIds = Array.from(this.connectedUsers.keys());
    this.server.emit('onlineUsers', onlineUserIds);
  }
}
