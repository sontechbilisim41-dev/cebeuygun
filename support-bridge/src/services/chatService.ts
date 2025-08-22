import { Server as SocketIOServer } from 'socket.io';
import { ChatSession, ChatMessage, CustomerInfo, Agent } from '@/types';
import { logger } from '@/utils/logger';
import { ticketService } from './ticketService';
import { cacheService } from './cacheService';
import { notificationService } from './notificationService';

class ChatService {
  private io: SocketIOServer | null = null;
  private activeSessions: Map<string, ChatSession> = new Map();
  private agentSessions: Map<string, Set<string>> = new Map(); // agentId -> sessionIds

  initialize(io: SocketIOServer): void {
    this.io = io;
    this.setupSocketHandlers();
    this.startSessionCleanup();
  }

  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info('Socket connected', { socketId: socket.id });

      // Customer joins chat
      socket.on('join_chat', async (data) => {
        try {
          const { customerId, orderId, customerInfo } = data;
          const session = await this.createChatSession(customerId, orderId, customerInfo);
          
          socket.join(session.id);
          socket.data.sessionId = session.id;
          socket.data.customerId = customerId;
          socket.data.userType = 'customer';

          // Find available agent
          const agent = await this.findAvailableAgent();
          if (agent) {
            await this.assignAgentToSession(session.id, agent.id);
            socket.to(session.id).emit('agent_joined', { agent });
          } else {
            // Add to queue
            await this.addToQueue(session.id);
            socket.emit('queued', { position: await this.getQueuePosition(session.id) });
          }

          socket.emit('session_created', { session });
        } catch (error) {
          logger.error('Join chat error:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // Agent joins
      socket.on('agent_join', async (data) => {
        try {
          const { agentId, agentInfo } = data;
          
          socket.data.agentId = agentId;
          socket.data.userType = 'agent';
          
          // Update agent status
          await this.updateAgentStatus(agentId, 'online');
          
          // Get assigned sessions
          const sessions = await this.getAgentSessions(agentId);
          for (const sessionId of sessions) {
            socket.join(sessionId);
          }

          socket.emit('agent_ready', { sessions });
        } catch (error) {
          logger.error('Agent join error:', error);
          socket.emit('error', { message: 'Failed to join as agent' });
        }
      });

      // Send message
      socket.on('send_message', async (data) => {
        try {
          const { sessionId, content, messageType = 'text', attachments } = data;
          const session = this.activeSessions.get(sessionId);
          
          if (!session) {
            socket.emit('error', { message: 'Session not found' });
            return;
          }

          const message = await this.createMessage({
            sessionId,
            senderId: socket.data.customerId || socket.data.agentId,
            senderType: socket.data.userType,
            content,
            messageType,
            attachments,
          });

          // Broadcast to session participants
          this.io!.to(sessionId).emit('new_message', message);

          // Update ticket if linked
          if (session.ticketId) {
            await ticketService.addMessageToTicket(session.ticketId, message);
          }

          // Send notification to offline participants
          await this.notifyOfflineParticipants(sessionId, message);
        } catch (error) {
          logger.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Typing indicator
      socket.on('typing', (data) => {
        const { sessionId, isTyping } = data;
        socket.to(sessionId).emit('user_typing', {
          userId: socket.data.customerId || socket.data.agentId,
          userType: socket.data.userType,
          isTyping,
        });
      });

      // End session
      socket.on('end_session', async (data) => {
        try {
          const { sessionId, reason } = data;
          await this.endChatSession(sessionId, reason);
          
          this.io!.to(sessionId).emit('session_ended', { reason });
          
          // Remove from room
          socket.leave(sessionId);
        } catch (error) {
          logger.error('End session error:', error);
        }
      });

      // Escalate to call
      socket.on('escalate_call', async (data) => {
        try {
          const { sessionId, reason } = data;
          await this.escalateToCall(sessionId, reason);
          
          this.io!.to(sessionId).emit('call_escalated', { reason });
        } catch (error) {
          logger.error('Escalate call error:', error);
        }
      });

      // Disconnect
      socket.on('disconnect', async () => {
        try {
          if (socket.data.userType === 'agent' && socket.data.agentId) {
            await this.handleAgentDisconnect(socket.data.agentId);
          } else if (socket.data.sessionId) {
            await this.handleCustomerDisconnect(socket.data.sessionId);
          }
        } catch (error) {
          logger.error('Disconnect error:', error);
        }
      });
    });
  }

  async createChatSession(
    customerId: string,
    orderId?: string,
    customerInfo?: CustomerInfo
  ): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      orderId,
      status: 'active',
      startedAt: new Date().toISOString(),
      metadata: {
        platform: 'web',
        source: orderId ? 'order_screen' : 'help_center',
        customerInfo: customerInfo || await this.getCustomerInfo(customerId),
      },
    };

    this.activeSessions.set(session.id, session);
    
    // Cache session
    await cacheService.set(`session:${session.id}`, session, 3600); // 1 hour

    // Create ticket if order-related
    if (orderId) {
      const ticket = await ticketService.createTicketFromChat(session, orderId);
      session.ticketId = ticket.id;
    }

    logger.info('Chat session created', {
      sessionId: session.id,
      customerId,
      orderId,
    });

    return session;
  }

  async createMessage(messageData: {
    sessionId: string;
    senderId: string;
    senderType: 'customer' | 'agent' | 'system';
    content: string;
    messageType?: string;
    attachments?: any[];
  }): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: messageData.sessionId,
      senderId: messageData.senderId,
      senderType: messageData.senderType,
      content: messageData.content,
      messageType: messageData.messageType || 'text',
      attachments: messageData.attachments,
      timestamp: new Date().toISOString(),
    };

    // Store message in database
    await this.storeMessage(message);

    // Cache recent messages
    await this.cacheMessage(message);

    return message;
  }

  async findAvailableAgent(): Promise<Agent | null> {
    try {
      // Get agents from cache or database
      const agents = await this.getOnlineAgents();
      
      // Find agent with lowest current load
      const availableAgent = agents
        .filter(agent => agent.currentLoad < agent.maxConcurrentChats)
        .sort((a, b) => a.currentLoad - b.currentLoad)[0];

      return availableAgent || null;
    } catch (error) {
      logger.error('Find available agent error:', error);
      return null;
    }
  }

  async assignAgentToSession(sessionId: string, agentId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.agentId = agentId;
    this.activeSessions.set(sessionId, session);

    // Update agent sessions
    if (!this.agentSessions.has(agentId)) {
      this.agentSessions.set(agentId, new Set());
    }
    this.agentSessions.get(agentId)!.add(sessionId);

    // Update cache
    await cacheService.set(`session:${sessionId}`, session, 3600);

    // Increment agent load
    await this.incrementAgentLoad(agentId);

    logger.info('Agent assigned to session', { sessionId, agentId });
  }

  async endChatSession(sessionId: string, reason?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = 'ended';
    session.endedAt = new Date().toISOString();

    // Update database
    await this.updateSession(session);

    // Clean up
    this.activeSessions.delete(sessionId);
    
    if (session.agentId) {
      this.agentSessions.get(session.agentId)?.delete(sessionId);
      await this.decrementAgentLoad(session.agentId);
    }

    // Remove from cache
    await cacheService.delete(`session:${sessionId}`);

    logger.info('Chat session ended', { sessionId, reason });
  }

  async escalateToCall(sessionId: string, reason: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Create escalation ticket if not exists
    if (!session.ticketId) {
      const ticket = await ticketService.createTicketFromChat(session);
      session.ticketId = ticket.id;
    }

    // Update ticket priority to urgent
    await ticketService.updateTicket(session.ticketId, {
      priority: 'urgent',
      tags: [...(await ticketService.getTicket(session.ticketId)).tags, 'escalated_call'],
    });

    // Trigger call notification
    await notificationService.sendCallEscalation({
      ticketId: session.ticketId,
      customerId: session.customerId,
      reason,
      customerPhone: session.metadata.customerInfo.phone,
    });

    logger.info('Chat escalated to call', { sessionId, reason });
  }

  async getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      // Try cache first
      const cached = await cacheService.get(`messages:${sessionId}`);
      if (cached) {
        return cached.slice(-limit);
      }

      // Fetch from database
      const messages = await this.getMessagesFromDB(sessionId, limit);
      
      // Cache for future requests
      await cacheService.set(`messages:${sessionId}`, messages, 1800); // 30 minutes

      return messages;
    } catch (error) {
      logger.error('Get chat history error:', error);
      throw error;
    }
  }

  async getSessionMetrics(): Promise<{
    activeSessions: number;
    queuedSessions: number;
    onlineAgents: number;
    averageWaitTime: number;
  }> {
    const activeSessions = this.activeSessions.size;
    const queuedSessions = await this.getQueueSize();
    const onlineAgents = (await this.getOnlineAgents()).length;
    const averageWaitTime = await this.calculateAverageWaitTime();

    return {
      activeSessions,
      queuedSessions,
      onlineAgents,
      averageWaitTime,
    };
  }

  // Private helper methods
  private async getCustomerInfo(customerId: string): Promise<CustomerInfo> {
    // Mock implementation - would fetch from customer service
    return {
      id: customerId,
      name: 'Customer Name',
      email: 'customer@example.com',
      isVerified: true,
      orderHistory: [],
      supportHistory: [],
    };
  }

  private async getOnlineAgents(): Promise<Agent[]> {
    // Mock implementation - would fetch from agent service
    return [
      {
        id: 'agent-1',
        name: 'Support Agent',
        email: 'agent@example.com',
        status: 'online',
        skills: ['general', 'orders'],
        currentLoad: 2,
        maxConcurrentChats: 5,
        responseTime: { average: 120, target: 180 },
      },
    ];
  }

  private async storeMessage(message: ChatMessage): Promise<void> {
    // Store in database
    logger.debug('Storing message', { messageId: message.id });
  }

  private async cacheMessage(message: ChatMessage): Promise<void> {
    const key = `messages:${message.sessionId}`;
    const cached = await cacheService.get(key) || [];
    cached.push(message);
    
    // Keep only last 100 messages in cache
    if (cached.length > 100) {
      cached.splice(0, cached.length - 100);
    }
    
    await cacheService.set(key, cached, 1800);
  }

  private async updateSession(session: ChatSession): Promise<void> {
    // Update in database
    logger.debug('Updating session', { sessionId: session.id });
  }

  private async getMessagesFromDB(sessionId: string, limit: number): Promise<ChatMessage[]> {
    // Mock implementation - would query database
    return [];
  }

  private async addToQueue(sessionId: string): Promise<void> {
    await cacheService.lpush('chat_queue', sessionId);
  }

  private async getQueuePosition(sessionId: string): Promise<number> {
    const queue = await cacheService.lrange('chat_queue', 0, -1);
    return queue.indexOf(sessionId) + 1;
  }

  private async getQueueSize(): Promise<number> {
    return await cacheService.llen('chat_queue');
  }

  private async incrementAgentLoad(agentId: string): Promise<void> {
    await cacheService.incr(`agent_load:${agentId}`);
  }

  private async decrementAgentLoad(agentId: string): Promise<void> {
    await cacheService.decr(`agent_load:${agentId}`);
  }

  private async updateAgentStatus(agentId: string, status: string): Promise<void> {
    await cacheService.set(`agent_status:${agentId}`, status, 3600);
  }

  private async getAgentSessions(agentId: string): Promise<string[]> {
    return Array.from(this.agentSessions.get(agentId) || []);
  }

  private async handleAgentDisconnect(agentId: string): Promise<void> {
    await this.updateAgentStatus(agentId, 'offline');
    
    // Reassign sessions if needed
    const sessions = this.agentSessions.get(agentId);
    if (sessions) {
      for (const sessionId of sessions) {
        await this.reassignSession(sessionId);
      }
    }
  }

  private async handleCustomerDisconnect(sessionId: string): Promise<void> {
    // Mark session as waiting
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'waiting';
      this.activeSessions.set(sessionId, session);
    }
  }

  private async reassignSession(sessionId: string): Promise<void> {
    const agent = await this.findAvailableAgent();
    if (agent) {
      await this.assignAgentToSession(sessionId, agent.id);
    } else {
      await this.addToQueue(sessionId);
    }
  }

  private async calculateAverageWaitTime(): Promise<number> {
    // Mock calculation - would analyze historical data
    return 120; // 2 minutes
  }

  private async notifyOfflineParticipants(sessionId: string, message: ChatMessage): Promise<void> {
    // Send notifications to offline participants
    logger.debug('Notifying offline participants', { sessionId, messageId: message.id });
  }

  private startSessionCleanup(): void {
    // Clean up inactive sessions every 5 minutes
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  private async cleanupInactiveSessions(): Promise<void> {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const lastActivity = new Date(session.startedAt).getTime();
      
      if (now - lastActivity > timeout && session.status === 'waiting') {
        await this.endChatSession(sessionId, 'timeout');
      }
    }
  }
}

export const chatService = new ChatService();