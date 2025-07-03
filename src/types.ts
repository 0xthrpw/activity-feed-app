// Enhanced TypeScript types for EthFollow Feed v2 application

export type TxRecord = {
  hash: string;
  chainId: number;
  fromAddress: string;
  fromName: string;
  fromAvatar: string;
  toAddress: string;
  value: string;
  input: string;
  summary: string;
  summaries: string;
  method: string;
  blockTimestamp: string;
  network: string;
  parsedLogs: ParsedLog[];
};

export type ParsedLog = {
  address: string;
  contractName: string;
  name: string;
  args: Record<string, unknown>;
  summary: string;
  icon?: string;
};

// WebSocket Connection Types
export type ConnectionMode = 'efp' | 'legacy' | 'multiplex';

export interface EFPConfig {
  listId: string | number;
}

export interface LegacyConfig {
  address: string;
  chainId?: number;
}

export interface MultiplexFilters {
  minValue?: string;
  maxValue?: string;
  contractTypes?: string[];
  methods?: string[];
  chains?: number[];
  timeRange?: {
    from?: string;
    to?: string;
  };
}

export interface MultiplexConfig {
  addresses: string[];
  filters?: MultiplexFilters;
  clientId: string;
}

export type ConnectionConfig = {
  mode: 'efp';
  config: EFPConfig;
} | {
  mode: 'legacy';
  config: LegacyConfig;
} | {
  mode: 'multiplex';
  config: MultiplexConfig;
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

export interface ConnectionState {
  status: ConnectionStatus;
  config: ConnectionConfig | null;
  error?: string;
  stats?: ConnectionStats;
}

export interface ConnectionStats {
  totalConnections?: number;
  activeConnections?: number;
  totalMessages?: number;
  averageSessionDuration?: number;
  historicalTransactions?: number;
  activeAddresses?: number;
  totalAddresses?: number;
  addressesQueried?: number;
  processingTimeMs?: number;
}

// WebSocket Message Types
export type WebSocketMessage = TransactionMessage | HistoryCompleteMessage | SubscriptionAckMessage | ErrorMessage;

export interface TransactionMessage extends TxRecord {
  type?: never;
}

export interface HistoryCompleteMessage {
  type: 'history_complete';
  clientId: string;
  data: {
    historicalTransactions: number;
    activeAddresses: number;
    totalAddresses: number;
    addressesQueried: number;
    processingTimeMs: number;
  };
}

export interface SubscriptionAckMessage {
  type: 'subscription_ack';
  clientId: string;
  data: {
    addresses: string[];
    filters: MultiplexFilters;
    activeStreams: number;
    lastUpdate: string;
    status: string;
  };
  metadata: {
    totalAddresses: number;
    activeStreams: number;
    lastUpdate: string;
    clientCount: number;
  };
}

export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
  timestamp?: string;
  clientId?: string;
  data?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    totalAddresses: number;
    activeStreams: number;
    lastUpdate: string;
    clientCount: number;
  };
}

// Multiplex Action Types
export interface SubscribeAction {
  action: 'subscribe';
  clientId: string;
  addresses: string[];
  filters?: MultiplexFilters;
}

export interface UnsubscribeAction {
  action: 'unsubscribe';
  clientId: string;
  addresses: string[];
}

export interface UpdateFiltersAction {
  action: 'update';
  clientId: string;
  filters: MultiplexFilters;
}

export type MultiplexAction = SubscribeAction | UnsubscribeAction | UpdateFiltersAction;

// Analytics API Types
export interface TransactionAnalytics {
  hash: string;
  chainId: number;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  method: string;
  summary: string;
  subscribers: number;
  broadcastCount: number;
  deliveryLatency: number;
}

export interface AddressAnalytics {
  address: string;
  totalTransactions: number;
  totalVolumeSent: string;
  totalVolumeReceived: string;
  firstTransaction: string;
  lastTransaction: string;
  chainActivity: Record<string, {
    transactions: number;
    volume: string;
  }>;
  subscribers: number;
  monitoringStatus: string;
}

export interface StreamAnalytics {
  streamKey: string;
  address: string;
  chainId: number;
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  averageSessionDuration: number;
  lastActivity: string;
  recentSessions: Array<{
    sessionId: string;
    connectedAt: string;
    disconnectedAt: string;
    messageCount: number;
    duration: number;
  }>;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  version: string;
  activeConnections: number;
  totalMemoryUsage: string;
  databaseStatus: string;
  redisStatus: string;
  blockchainProviders: Record<string, string>;
  lastBlockProcessed: Record<string, number>;
  processingLatency: {
    average: number;
    p95: number;
    p99: number;
  };
}

export interface TransactionVolumeData {
  totalTransactions: number;
  totalVolume: string;
  averageValue: string;
  timeSeriesData: Array<{
    timestamp: string;
    transactionCount: number;
    volume: string;
    averageValue: string;
  }>;
  chainBreakdown: Record<string, {
    transactions: number;
    volume: string;
  }>;
}

// UI State Types
export type ViewMode = 'normal' | 'analytics';

export interface UIState {
  viewMode: ViewMode;
  isAnalyticsModalOpen: boolean;
  analyticsModalType: 'transaction' | 'address' | null;
  analyticsModalData: unknown;
  isConnectionControlsOpen: boolean;
  isFilterPanelOpen: boolean;
}

// Application State Types
export interface FeedState {
  transactions: TxRecord[];
  connection: ConnectionState;
  ui: UIState;
  filters: MultiplexFilters;
}

// Hook Types
export interface UseFeedConfigReturn {
  connectionConfig: ConnectionConfig | null;
  setConnectionConfig: (config: ConnectionConfig) => void;
  connectionStatus: ConnectionStatus;
  connectionStats: ConnectionStats | undefined;
  connect: () => void;
  disconnect: () => void;
}

export interface UseAnalyticsReturn {
  fetchTransactionAnalytics: (hash: string) => Promise<TransactionAnalytics>;
  fetchAddressAnalytics: (address: string) => Promise<AddressAnalytics>;
  fetchStreamAnalytics: (streamKey: string) => Promise<StreamAnalytics>;
  fetchSystemHealth: () => Promise<SystemHealth>;
  fetchTransactionVolume: (params?: {
    from?: string;
    to?: string;
    chainId?: number;
    groupBy?: 'hour' | 'day' | 'week';
  }) => Promise<TransactionVolumeData>;
  cache: Map<string, { data: unknown; timestamp: number }>;
  clearCache: () => void;
}

// Error Types
export class WebSocketConnectionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'WebSocketConnectionError';
  }
}

export class AnalyticsAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AnalyticsAPIError';
  }
}