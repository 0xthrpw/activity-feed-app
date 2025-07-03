import {
  TransactionAnalytics,
  AddressAnalytics,
  StreamAnalytics,
  SystemHealth,
  TransactionVolumeData,
  AnalyticsAPIError
} from '../types';

export interface AnalyticsAPIConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

export class AnalyticsAPI {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: AnalyticsAPIConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const fetchOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new AnalyticsAPIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    clearTimeout(timeoutId);
    throw new AnalyticsAPIError(
      `Failed to fetch after ${this.retries + 1} attempts: ${lastError.message}`
    );
  }

  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramString}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.getFromCache<T>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value.toString());
        }
      });
    }

    const response = await this.fetchWithRetry(url.toString());
    const data = await response.json();
    
    this.setCache(cacheKey, data);
    return data;
  }

  // Transaction Analytics
  public async getTransactionAnalytics(hash: string): Promise<TransactionAnalytics> {
    return this.get<TransactionAnalytics>(`/transactions/${hash}`);
  }

  public async getTransactionVolume(params?: {
    from?: string;
    to?: string;
    chainId?: number;
    groupBy?: 'hour' | 'day' | 'week';
  }): Promise<TransactionVolumeData> {
    return this.get<TransactionVolumeData>('/transactions/volume', params);
  }

  // Address Analytics
  public async getAddressAnalytics(
    address: string,
    params?: {
      chainId?: number;
      from?: string;
      to?: string;
    }
  ): Promise<AddressAnalytics> {
    return this.get<AddressAnalytics>(`/addresses/${address}`, params);
  }

  public async getTopAddresses(params?: {
    sortBy?: 'transactions' | 'volume' | 'subscribers';
    limit?: number;
    chainId?: number;
  }): Promise<{
    addresses: Array<{
      address: string;
      ensName: string | null;
      transactionCount: number;
      totalVolume: string;
      subscribers: number;
      rank: number;
    }>;
    totalResults: number;
    sortedBy: string;
  }> {
    return this.get('/addresses/top', params);
  }

  // Stream Analytics
  public async getStreamAnalytics(streamKey: string): Promise<StreamAnalytics> {
    return this.get<StreamAnalytics>(`/streams/${streamKey}`);
  }

  public async getStreamStatistics(): Promise<{
    totalConnections: number;
    activeConnections: number;
    totalAddresses: number;
    totalMessages: number;
    averageSessionDuration: number;
    connectionsByChain: Record<string, number>;
    topAddresses: Array<{
      address: string;
      connections: number;
      totalMessages: number;
    }>;
    timeRange: {
      from: string;
      to: string;
    };
  }> {
    return this.get('/streams');
  }

  // System Analytics
  public async getSystemHealth(): Promise<SystemHealth> {
    return this.get<SystemHealth>('/system/health');
  }

  public async getPerformanceMetrics(params?: {
    from?: string;
    to?: string;
    metric?: string;
  }): Promise<{
    timeRange: {
      from: string;
      to: string;
    };
    metrics: {
      transactionThroughput: {
        average: number;
        peak: number;
        unit: string;
      };
      connectionThroughput: {
        average: number;
        peak: number;
        unit: string;
      };
      memoryUsage: {
        average: string;
        peak: string;
        current: string;
      };
      responseTime: {
        average: number;
        p95: number;
        p99: number;
        unit: string;
      };
      errorRate: {
        rate: number;
        total: number;
        unit: string;
      };
    };
    timeSeries: Array<{
      timestamp: string;
      transactionThroughput: number;
      connectionThroughput: number;
      memoryUsage: string;
      responseTime: number;
      errorRate: number;
    }>;
  }> {
    return this.get('/system/performance', params);
  }

  // Cache Management
  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): {
    size: number;
    keys: string[];
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined
    };
  }

  public purgeCacheOlderThan(maxAge: number): number {
    const cutoff = Date.now() - maxAge;
    let purged = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < cutoff) {
        this.cache.delete(key);
        purged++;
      }
    }
    
    return purged;
  }

  // Utility method for creating analytics API instance
  public static create(baseUrl?: string): AnalyticsAPI {
    return new AnalyticsAPI({
      baseUrl: baseUrl || import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8080/analytics'
    });
  }
}