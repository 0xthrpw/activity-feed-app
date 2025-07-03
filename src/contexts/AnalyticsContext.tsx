import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import {
  TransactionAnalytics,
  AddressAnalytics,
  StreamAnalytics,
  SystemHealth,
  TransactionVolumeData
} from '../types';
import { AnalyticsAPI } from '../services/AnalyticsAPI';

interface AnalyticsContextValue {
  // Data fetching methods
  fetchTransactionAnalytics: (hash: string) => Promise<TransactionAnalytics>;
  fetchAddressAnalytics: (address: string, params?: {
    chainId?: number;
    from?: string;
    to?: string;
  }) => Promise<AddressAnalytics>;
  fetchStreamAnalytics: (streamKey: string) => Promise<StreamAnalytics>;
  fetchSystemHealth: () => Promise<SystemHealth>;
  fetchTransactionVolume: (params?: {
    from?: string;
    to?: string;
    chainId?: number;
    groupBy?: 'hour' | 'day' | 'week';
  }) => Promise<TransactionVolumeData>;
  
  // Cache management
  clearCache: () => void;
  getCacheStats: () => {
    size: number;
    keys: string[];
    oldestEntry?: number;
    newestEntry?: number;
  };
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const analyticsAPIRef = useRef<AnalyticsAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Analytics API
  if (!analyticsAPIRef.current) {
    analyticsAPIRef.current = AnalyticsAPI.create();
  }

  const handleAsyncOperation = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactionAnalytics = useCallback(async (hash: string): Promise<TransactionAnalytics> => {
    return handleAsyncOperation(() => 
      analyticsAPIRef.current!.getTransactionAnalytics(hash)
    );
  }, [handleAsyncOperation]);

  const fetchAddressAnalytics = useCallback(async (
    address: string, 
    params?: {
      chainId?: number;
      from?: string;
      to?: string;
    }
  ): Promise<AddressAnalytics> => {
    return handleAsyncOperation(() => 
      analyticsAPIRef.current!.getAddressAnalytics(address, params)
    );
  }, [handleAsyncOperation]);

  const fetchStreamAnalytics = useCallback(async (streamKey: string): Promise<StreamAnalytics> => {
    return handleAsyncOperation(() => 
      analyticsAPIRef.current!.getStreamAnalytics(streamKey)
    );
  }, [handleAsyncOperation]);

  const fetchSystemHealth = useCallback(async (): Promise<SystemHealth> => {
    return handleAsyncOperation(() => 
      analyticsAPIRef.current!.getSystemHealth()
    );
  }, [handleAsyncOperation]);

  const fetchTransactionVolume = useCallback(async (params?: {
    from?: string;
    to?: string;
    chainId?: number;
    groupBy?: 'hour' | 'day' | 'week';
  }): Promise<TransactionVolumeData> => {
    return handleAsyncOperation(() => 
      analyticsAPIRef.current!.getTransactionVolume(params)
    );
  }, [handleAsyncOperation]);

  const clearCache = useCallback(() => {
    analyticsAPIRef.current?.clearCache();
    setError(null);
  }, []);

  const getCacheStats = useCallback(() => {
    return analyticsAPIRef.current?.getCacheStats() || {
      size: 0,
      keys: [],
      oldestEntry: undefined,
      newestEntry: undefined
    };
  }, []);

  const contextValue: AnalyticsContextValue = {
    fetchTransactionAnalytics,
    fetchAddressAnalytics,
    fetchStreamAnalytics,
    fetchSystemHealth,
    fetchTransactionVolume,
    clearCache,
    getCacheStats,
    isLoading,
    error
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}