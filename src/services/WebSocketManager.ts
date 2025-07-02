import {
  ConnectionConfig,
  ConnectionStatus,
  WebSocketMessage,
  MultiplexAction,
  MultiplexFilters,
  ConnectionStats,
  WebSocketConnectionError,
  TxRecord,
  HistoryCompleteMessage,
  SubscriptionAckMessage,
  ErrorMessage
} from '../types';

export type WebSocketEventHandler = {
  onTransaction?: (tx: TxRecord) => void;
  onHistoryComplete?: (data: HistoryCompleteMessage) => void;
  onSubscriptionAck?: (data: SubscriptionAckMessage) => void;
  onError?: (error: ErrorMessage) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onStatsUpdate?: (stats: ConnectionStats) => void;
};

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: ConnectionConfig | null = null;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: WebSocketEventHandler = {};
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  public setEventHandlers(handlers: WebSocketEventHandler) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public connect(config: ConnectionConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.disconnect();
        this.config = config;
        this.status = 'connecting';
        this.eventHandlers.onStatusChange?.(this.status);

        const url = this.buildConnectionUrl(config);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.eventHandlers.onStatusChange?.(this.status);
          
          // For multiplex mode, send initial subscription after connection
          if (config.mode === 'multiplex') {
            this.sendMultiplexAction({
              action: 'subscribe',
              clientId: config.config.clientId,
              addresses: config.config.addresses,
              filters: config.config.filters
            });
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.status = 'error';
          this.eventHandlers.onStatusChange?.(this.status);
          reject(new WebSocketConnectionError('WebSocket connection failed'));
        };

        this.ws.onclose = (event) => {
          if (this.status === 'connected' && !event.wasClean) {
            this.handleReconnection();
          } else {
            this.status = 'disconnected';
            this.eventHandlers.onStatusChange?.(this.status);
          }
        };

      } catch (error) {
        this.status = 'error';
        this.eventHandlers.onStatusChange?.(this.status);
        reject(new WebSocketConnectionError(`Failed to create WebSocket: ${error}`));
      }
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status = 'disconnected';
    this.reconnectAttempts = 0;
    this.eventHandlers.onStatusChange?.(this.status);
  }

  public sendMultiplexAction(action: MultiplexAction) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketConnectionError('WebSocket is not connected');
    }

    if (this.config?.mode !== 'multiplex') {
      throw new WebSocketConnectionError('Multiplex actions can only be sent in multiplex mode');
    }

    this.ws.send(JSON.stringify(action));
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getConfig(): ConnectionConfig | null {
    return this.config;
  }

  private buildConnectionUrl(config: ConnectionConfig): string {
    const url = new URL(this.baseUrl);

    switch (config.mode) {
      case 'efp':
        url.searchParams.set('list', config.config.listId.toString());
        break;
      
      case 'legacy': {
        const streamKey = config.config.chainId 
          ? `addr:${config.config.address}:${config.config.chainId}`
          : `addr:${config.config.address}`;
        url.searchParams.set('stream', streamKey);
        break;
      }
      
      case 'multiplex':
        url.searchParams.set('mode', 'multiplex');
        break;
      
      default:
        throw new WebSocketConnectionError(`Unsupported connection mode`);
    }

    return url.toString();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      if (data.type === 'history_complete') {
        this.eventHandlers.onHistoryComplete?.(data);
        this.eventHandlers.onStatsUpdate?.(data.data);
      } else if (data.type === 'subscription_ack') {
        this.eventHandlers.onSubscriptionAck?.(data);
        this.eventHandlers.onStatsUpdate?.(data.metadata);
      } else if (data.type === 'error') {
        this.eventHandlers.onError?.(data);
      } else if (!data.type) {
        // Individual transaction
        this.eventHandlers.onTransaction?.(data as TxRecord);
      } else {
        console.warn('Unknown message type:', data);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.status = 'error';
      this.eventHandlers.onStatusChange?.(this.status);
      this.eventHandlers.onError?.({
        type: 'error',
        code: 'MAX_RECONNECT_ATTEMPTS_EXCEEDED',
        message: `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      });
      return;
    }

    this.status = 'reconnecting';
    this.eventHandlers.onStatusChange?.(this.status);
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(() => {
      if (this.config) {
        this.connect(this.config).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  public updateMultiplexSubscription(
    addresses?: string[], 
    filters?: MultiplexFilters, 
    action: 'subscribe' | 'unsubscribe' | 'update' = 'update'
  ) {
    if (this.config?.mode !== 'multiplex') {
      throw new WebSocketConnectionError('Can only update subscriptions in multiplex mode');
    }

    const clientId = this.config.config.clientId;

    switch (action) {
      case 'subscribe': {
        if (addresses) {
          this.sendMultiplexAction({
            action: 'subscribe',
            clientId,
            addresses,
            filters
          });
        }
        break;
      }
      
      case 'unsubscribe': {
        if (addresses) {
          this.sendMultiplexAction({
            action: 'unsubscribe',
            clientId,
            addresses
          });
        }
        break;
      }
      
      case 'update': {
        if (filters) {
          this.sendMultiplexAction({
            action: 'update',
            clientId,
            filters
          });
        }
        break;
      }
    }
  }

  public destroy() {
    this.disconnect();
    this.eventHandlers = {};
    this.config = null;
  }
}