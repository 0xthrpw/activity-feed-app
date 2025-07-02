import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import {
  ConnectionConfig,
  ConnectionStatus,
  ConnectionStats,
  TxRecord,
  MultiplexFilters,
  HistoryCompleteMessage,
  SubscriptionAckMessage,
  ErrorMessage
} from '../types';
import { WebSocketManager } from '../services/WebSocketManager';

interface FeedState {
  transactions: TxRecord[];
  connectionConfig: ConnectionConfig | null;
  connectionStatus: ConnectionStatus;
  connectionStats: ConnectionStats | null;
  error: string | null;
  filters: MultiplexFilters;
}

type FeedAction =
  | { type: 'SET_CONNECTION_CONFIG'; payload: ConnectionConfig }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_CONNECTION_STATS'; payload: ConnectionStats }
  | { type: 'ADD_TRANSACTION'; payload: TxRecord }
  | { type: 'CLEAR_TRANSACTIONS' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: MultiplexFilters }
  | { type: 'RESET_STATE' };

const initialState: FeedState = {
  transactions: [],
  connectionConfig: null,
  connectionStatus: 'disconnected',
  connectionStats: null,
  error: null,
  filters: {}
};

function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'SET_CONNECTION_CONFIG':
      return { ...state, connectionConfig: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    
    case 'SET_CONNECTION_STATS':
      return { ...state, connectionStats: action.payload };
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions.slice(0, 99)] // Keep last 100
      };
    
    case 'CLEAR_TRANSACTIONS':
      return { ...state, transactions: [] };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

interface FeedContextValue {
  // State
  transactions: TxRecord[];
  connectionConfig: ConnectionConfig | null;
  connectionStatus: ConnectionStatus;
  connectionStats: ConnectionStats | null;
  error: string | null;
  filters: MultiplexFilters;
  
  // Actions
  setConnectionConfig: (config: ConnectionConfig) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  setFilters: (filters: MultiplexFilters) => void;
  updateMultiplexSubscription: (addresses?: string[], filters?: MultiplexFilters, action?: 'subscribe' | 'unsubscribe' | 'update') => void;
  clearTransactions: () => void;
  clearError: () => void;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(feedReducer, initialState);
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  // Initialize WebSocket manager
  useEffect(() => {
    wsManagerRef.current = new WebSocketManager();
    
    wsManagerRef.current.setEventHandlers({
      onTransaction: (tx: TxRecord) => {
        dispatch({ type: 'ADD_TRANSACTION', payload: tx });
      },
      
      onHistoryComplete: (data: HistoryCompleteMessage) => {
        dispatch({ type: 'SET_CONNECTION_STATS', payload: data.data });
      },
      
      onSubscriptionAck: (data: SubscriptionAckMessage) => {
        dispatch({ type: 'SET_CONNECTION_STATS', payload: data.metadata });
      },
      
      onError: (error: ErrorMessage) => {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      },
      
      onStatusChange: (status: ConnectionStatus) => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
      },
      
      onStatsUpdate: (stats: ConnectionStats) => {
        dispatch({ type: 'SET_CONNECTION_STATS', payload: stats });
      }
    });

    return () => {
      wsManagerRef.current?.destroy();
    };
  }, []);

  const setConnectionConfig = useCallback((config: ConnectionConfig) => {
    dispatch({ type: 'SET_CONNECTION_CONFIG', payload: config });
  }, []);

  const connect = useCallback(async () => {
    if (!state.connectionConfig || !wsManagerRef.current) {
      throw new Error('No connection configuration set');
    }

    dispatch({ type: 'CLEAR_TRANSACTIONS' });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await wsManagerRef.current.connect(state.connectionConfig);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  }, [state.connectionConfig]);

  const disconnect = useCallback(() => {
    wsManagerRef.current?.disconnect();
  }, []);

  const setFilters = useCallback((filters: MultiplexFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    
    // If connected in multiplex mode, update the subscription
    if (state.connectionConfig?.mode === 'multiplex' && wsManagerRef.current) {
      try {
        wsManagerRef.current.updateMultiplexSubscription(undefined, filters, 'update');
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      }
    }
  }, [state.connectionConfig]);

  const updateMultiplexSubscription = useCallback((
    addresses?: string[], 
    filters?: MultiplexFilters, 
    action: 'subscribe' | 'unsubscribe' | 'update' = 'update'
  ) => {
    if (!wsManagerRef.current) return;

    try {
      wsManagerRef.current.updateMultiplexSubscription(addresses, filters, action);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, []);

  const clearTransactions = useCallback(() => {
    dispatch({ type: 'CLEAR_TRANSACTIONS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const contextValue: FeedContextValue = {
    // State
    transactions: state.transactions,
    connectionConfig: state.connectionConfig,
    connectionStatus: state.connectionStatus,
    connectionStats: state.connectionStats,
    error: state.error,
    filters: state.filters,
    
    // Actions
    setConnectionConfig,
    connect,
    disconnect,
    setFilters,
    updateMultiplexSubscription,
    clearTransactions,
    clearError
  };

  return (
    <FeedContext.Provider value={contextValue}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
}