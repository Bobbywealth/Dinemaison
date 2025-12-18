import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import { logger } from './lib/logger';
import { config } from './config';

interface WSClient extends WebSocket {
  isAlive: boolean;
  userId?: string;
  role?: string;
}

interface WSMessage {
  type: string;
  payload?: any;
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WSClient>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  public setup(server: HttpServer) {
    if (!config.websocket.enabled) {
      logger.info('WebSocket disabled in configuration');
      return;
    }

    this.wss = new WebSocketServer({ 
      server,
      path: config.websocket.path,
    });

    this.wss.on('connection', (ws: WSClient, req) => {
      logger.info('WebSocket client connected', { ip: req.socket.remoteAddress });
      
      ws.isAlive = true;
      
      // Handle pong responses
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error);
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.removeClient(ws);
        logger.info('WebSocket client disconnected');
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({ type: 'connected', payload: { message: 'Connected to Dine Maison' } }));
    });

    // Start ping/pong to detect dead connections
    this.startHeartbeat();

    logger.info('WebSocket server started', { path: config.websocket.path });
  }

  private handleMessage(ws: WSClient, message: WSMessage) {
    switch (message.type) {
      case 'auth':
        this.handleAuth(ws, message.payload);
        break;
      
      case 'subscribe':
        this.handleSubscribe(ws, message.payload);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscribe(ws, message.payload);
        break;
      
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
        break;
      
      default:
        logger.warn('Unknown WebSocket message type', { type: message.type });
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Unknown message type' } }));
    }
  }

  private handleAuth(ws: WSClient, payload: any) {
    // In production, validate auth token here
    // For now, just store user info from payload
    if (payload?.userId) {
      ws.userId = payload.userId;
      ws.role = payload.role || 'customer';
      this.addClient(ws);
      
      ws.send(JSON.stringify({ 
        type: 'auth_success', 
        payload: { userId: ws.userId, role: ws.role } 
      }));
      
      logger.info('WebSocket client authenticated', { userId: ws.userId, role: ws.role });
    } else {
      ws.send(JSON.stringify({ type: 'auth_error', payload: { message: 'Invalid credentials' } }));
    }
  }

  private handleSubscribe(ws: WSClient, payload: any) {
    const { channel } = payload;
    if (!channel) {
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Channel required' } }));
      return;
    }

    logger.debug('Client subscribed to channel', { userId: ws.userId, channel });
    ws.send(JSON.stringify({ type: 'subscribed', payload: { channel } }));
  }

  private handleUnsubscribe(ws: WSClient, payload: any) {
    const { channel } = payload;
    logger.debug('Client unsubscribed from channel', { userId: ws.userId, channel });
    ws.send(JSON.stringify({ type: 'unsubscribed', payload: { channel } }));
  }

  private addClient(ws: WSClient) {
    if (!ws.userId) return;
    
    if (!this.clients.has(ws.userId)) {
      this.clients.set(ws.userId, new Set());
    }
    this.clients.get(ws.userId)?.add(ws);
  }

  private removeClient(ws: WSClient) {
    if (!ws.userId) return;
    
    const userClients = this.clients.get(ws.userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(ws.userId);
      }
    }
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws: WSClient) => {
        if (ws.isAlive === false) {
          logger.debug('Terminating inactive WebSocket client');
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, config.websocket.pingInterval);
  }

  // Broadcast message to all connected clients
  public broadcast(message: WSMessage) {
    if (!this.wss) return;

    const data = JSON.stringify(message);
    this.wss.clients.forEach((ws: WSClient) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  // Send message to specific user
  public sendToUser(userId: string, message: WSMessage) {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const data = JSON.stringify(message);
    userClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  // Send message to users with specific role
  public sendToRole(role: string, message: WSMessage) {
    if (!this.wss) return;

    const data = JSON.stringify(message);
    this.wss.clients.forEach((ws: WSClient) => {
      if (ws.role === role && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  // Notify about booking updates
  public notifyBookingUpdate(bookingId: string, customerId: string, chefId: string, status: string) {
    const message: WSMessage = {
      type: 'booking_update',
      payload: {
        bookingId,
        status,
        timestamp: new Date().toISOString(),
      },
    };

    // Notify customer and chef
    this.sendToUser(customerId, message);
    this.sendToUser(chefId, message);
    
    // Notify admins
    this.sendToRole('admin', message);
  }

  // Notify about new review
  public notifyNewReview(chefId: string, reviewId: string, rating: number) {
    const message: WSMessage = {
      type: 'new_review',
      payload: {
        reviewId,
        rating,
        timestamp: new Date().toISOString(),
      },
    };

    this.sendToUser(chefId, message);
  }

  // ============== NOTIFICATION SYSTEM ==============

  /**
   * Broadcast notification to a specific user (all their connected devices)
   */
  public broadcastNotification(userId: string, notification: any) {
    const message: WSMessage = {
      type: 'notification:new',
      payload: notification,
    };

    this.sendToUser(userId, message);
    logger.debug(`Notification broadcasted to user ${userId} via WebSocket`);
  }

  /**
   * Send notification read status update
   */
  public notifyNotificationRead(userId: string, notificationId: string) {
    const message: WSMessage = {
      type: 'notification:read',
      payload: {
        notificationId,
        timestamp: new Date().toISOString(),
      },
    };

    this.sendToUser(userId, message);
  }

  /**
   * Send notification deleted status
   */
  public notifyNotificationDeleted(userId: string, notificationId: string) {
    const message: WSMessage = {
      type: 'notification:deleted',
      payload: {
        notificationId,
        timestamp: new Date().toISOString(),
      },
    };

    this.sendToUser(userId, message);
  }

  /**
   * Send unread count update
   */
  public notifyUnreadCountUpdate(userId: string, count: number) {
    const message: WSMessage = {
      type: 'notification:unread_count',
      payload: {
        count,
        timestamp: new Date().toISOString(),
      },
    };

    this.sendToUser(userId, message);
  }

  /**
   * Check if user is online (has active WebSocket connections)
   */
  public isUserOnline(userId: string): boolean {
    const userClients = this.clients.get(userId);
    return userClients !== undefined && userClients.size > 0;
  }

  /**
   * Get count of active connections for a user
   */
  public getUserConnectionCount(userId: string): number {
    const userClients = this.clients.get(userId);
    return userClients?.size || 0;
  }

  /**
   * Get total number of connected clients
   */
  public getConnectedClientsCount(): number {
    return this.wss?.clients.size || 0;
  }

  /**
   * Get number of authenticated users
   */
  public getAuthenticatedUsersCount(): number {
    return this.clients.size;
  }

  // Cleanup on shutdown
  public destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    if (this.wss) {
      this.wss.clients.forEach((ws) => ws.terminate());
      this.wss.close();
    }

    this.clients.clear();
    logger.info('WebSocket server shut down');
  }
}

export const wsManager = new WebSocketManager();

// Helper function to broadcast notification to user
export function broadcastToUser(userId: string, eventType: string, data: any) {
  wsManager.broadcastNotification(userId, {
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });
}

export const wsManager = new WebSocketManager();
