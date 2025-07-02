# API Specifications - EthFollow Feed v2

This document provides comprehensive API specifications for the EthFollow Feed v2 service, including WebSocket modes and HTTP analytics endpoints.

## Table of Contents

1. [WebSocket API](#websocket-api)
   - [EFP Mode](#efp-mode)
   - [Multiplex Mode](#multiplex-mode)
   - [Legacy Mode](#legacy-mode)
2. [HTTP Analytics API](#http-analytics-api)
3. [Response Formats](#response-formats)
4. [Error Handling](#error-handling)
5. [Performance Considerations](#performance-considerations)

---

## WebSocket API

The service supports three WebSocket modes for real-time transaction streaming. All WebSocket connections are established using standard WebSocket protocols.

### Connection URL Format
```
ws://localhost:8080[?parameters]
```

---

## EFP Mode

**Purpose**: Stream transactions for all addresses followed by an Ethereum Follow Protocol (EFP) list.

### Connection

**URL Pattern**: `ws://localhost:8080?list={listId}`

**Parameters**:
- `list` (required): EFP list identifier (string or number)

**Example Connection**:
```javascript
const ws = new WebSocket('ws://localhost:8080?list=9');
```

### Connection Flow

1. **Initial Connection**: WebSocket upgrade with EFP list parameter
2. **Address Fetching**: Server fetches addresses from EFP API
3. **Historical Data**: Server sends recent transaction history
4. **Real-time Streaming**: Server streams new transactions as they occur

### Response Types

#### 1. Individual Transactions
Each transaction is sent as a separate message in legacy format:

```json
{
  "hash": "0x25d5ee953af002f23163569f6b97f907156b7a894be129b00026c7e4da473763",
  "blockTimestamp": "2025-07-01T05:15:47.000+00:00",
  "blockNumber": 22822242,
  "blockHash": "0xcb1b4e751e8320f069f5a5007268f5ae8c9ef10e341627f5ebb52751c8294128",
  "chainId": 1,
  "nonce": "0x1e5",
  "transactionIndex": 169,
  "fromAddress": "0x3821578737a8cb6cb557b3e21214419ef046cfc8",
  "fromName": "0x3821578737a8cb6cb557b3e21214419ef046cfc8",
  "fromAvatar": "",
  "fromHeader": "",
  "toAddress": "0xba5bde662c17e2adff1075610382b9b691296350",
  "value": "0x0",
  "gasPrice": "0x19ea83c4",
  "gas": "0x53684",
  "network": "ethereum",
  "summary": "Unrecognized contract call TransparentUpgradeableProxy",
  "summaries": "",
  "method": "",
  "input": {},
  "events": "",
  "logs": [...],
  "parsedLogs": [...]
}
```

#### 2. History Complete Message
Sent after initial historical data is loaded:

```json
{
  "type": "history_complete",
  "clientId": "efp_9_1751381522019_wihgp2687",
  "data": {
    "historicalTransactions": 14,
    "activeAddresses": 150,
    "totalAddresses": 1898,
    "addressesQueried": 150,
    "processingTimeMs": 1936
  }
}
```

#### 3. Error Messages
```json
{
  "type": "error",
  "code": "INVALID_LIST_ID",
  "message": "EFP list 9 not found",
  "timestamp": "2025-07-02T10:30:00.000Z"
}
```

### Supported Chains
EFP mode supports transactions from all configured chains:
- Ethereum (1)
- Optimism (10)
- Polygon (137)
- Base (8453)
- Arbitrum (42161)
- zkSync (324)
- Linea (59144)
- Scroll (534352)
- Zora (7777777)

### Error Codes
- `INVALID_LIST_ID`: List ID format is invalid
- `EMPTY_LIST`: EFP list contains no addresses
- `EFP_API_TIMEOUT`: EFP API request timed out
- `EFP_API_ERROR`: EFP API returned an error
- `INTERNAL_ERROR`: Unexpected server error

---

## Multiplex Mode

**Purpose**: Subscribe to transactions for custom address lists with advanced filtering.

### Connection

**URL Pattern**: `ws://localhost:8080?mode=multiplex`

**Example Connection**:
```javascript
const ws = new WebSocket('ws://localhost:8080?mode=multiplex');
```

### Subscription Management

After connecting, send subscription messages to manage address monitoring:

#### Subscribe to Addresses
```json
{
  "action": "subscribe",
  "clientId": "client_123",
  "addresses": [
    "0x1234567890123456789012345678901234567890",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  ],
  "filters": {
    "minValue": "1000000000000000000",
    "maxValue": "10000000000000000000",
    "contractTypes": ["ERC20", "ERC721"],
    "methods": ["transfer", "mint"],
    "chains": [1, 137],
    "timeRange": {
      "from": "2025-01-01T00:00:00Z",
      "to": "2025-12-31T23:59:59Z"
    }
  }
}
```

#### Unsubscribe from Addresses
```json
{
  "action": "unsubscribe",
  "clientId": "client_123",
  "addresses": [
    "0x1234567890123456789012345678901234567890"
  ]
}
```

#### Update Filters
```json
{
  "action": "update",
  "clientId": "client_123",
  "filters": {
    "minValue": "2000000000000000000"
  }
}
```

### Response Types

#### 1. Subscription Acknowledgment
```json
{
  "type": "subscription_ack",
  "clientId": "client_123",
  "data": {
    "addresses": ["0x1234..."],
    "filters": {...},
    "activeStreams": 1,
    "lastUpdate": "2025-07-02T10:30:00.000Z",
    "status": "active"
  },
  "metadata": {
    "totalAddresses": 5,
    "activeStreams": 1,
    "lastUpdate": "2025-07-02T10:30:00.000Z",
    "clientCount": 1
  }
}
```

#### 2. Individual Transactions
Same format as EFP mode transactions.

#### 3. Error Messages
```json
{
  "type": "error",
  "clientId": "client_123",
  "data": {
    "code": "UPDATE_FAILED",
    "message": "Failed to update subscription",
    "details": {...}
  },
  "metadata": {
    "totalAddresses": 5,
    "activeStreams": 1,
    "lastUpdate": "2025-07-02T10:30:00.000Z",
    "clientCount": 1
  }
}
```

### Filter Options

#### Value Filters
- `minValue`: Minimum transaction value in wei (string)
- `maxValue`: Maximum transaction value in wei (string)

#### Contract Filters
- `contractTypes`: Array of contract types to include
- `methods`: Array of method names to include

#### Chain Filters
- `chains`: Array of chain IDs to monitor

#### Time Filters
- `timeRange.from`: Start date (ISO 8601 string)
- `timeRange.to`: End date (ISO 8601 string)

---

## Legacy Mode

**Purpose**: Stream transactions for a single address (backwards compatibility).

### Connection

**URL Pattern**: `ws://localhost:8080?stream={streamKey}`

**Stream Key Format**: `addr:{address}[:{chainId}]`

**Examples**:
```javascript
// Single address on all chains
const ws = new WebSocket('ws://localhost:8080?stream=addr:0x1234567890123456789012345678901234567890');

// Single address on specific chain
const ws = new WebSocket('ws://localhost:8080?stream=addr:0x1234567890123456789012345678901234567890:1');

// ENS name support
const ws = new WebSocket('ws://localhost:8080?stream=addr:vitalik.eth');
```

### Response Format

Legacy mode sends transactions in the same format as EFP and Multiplex modes, but only for the specified address.

---

## HTTP Analytics API

The analytics API provides insights into system usage, transaction volume, and performance metrics.

### Base URL
```
http://localhost:8080/analytics
```

---

### Stream Analytics

#### Get Stream Statistics
**Endpoint**: `GET /analytics/streams`

**Description**: Returns aggregated statistics about stream connections and usage.

**Response**:
```json
{
  "totalConnections": 1250,
  "activeConnections": 45,
  "totalAddresses": 890,
  "totalMessages": 125000,
  "averageSessionDuration": 1200,
  "connectionsByChain": {
    "1": 450,
    "137": 200,
    "8453": 350,
    "42161": 250
  },
  "topAddresses": [
    {
      "address": "0x1234567890123456789012345678901234567890",
      "connections": 25,
      "totalMessages": 1500
    }
  ],
  "timeRange": {
    "from": "2025-07-01T00:00:00Z",
    "to": "2025-07-02T00:00:00Z"
  }
}
```

#### Get Stream Details
**Endpoint**: `GET /analytics/streams/{streamKey}`

**Parameters**:
- `streamKey`: Stream identifier (e.g., "addr:0x1234...")

**Response**:
```json
{
  "streamKey": "addr:0x1234567890123456789012345678901234567890",
  "address": "0x1234567890123456789012345678901234567890",
  "chainId": 1,
  "totalConnections": 15,
  "activeConnections": 2,
  "totalMessages": 850,
  "averageSessionDuration": 900,
  "lastActivity": "2025-07-02T10:25:00Z",
  "recentSessions": [
    {
      "sessionId": "session_123",
      "connectedAt": "2025-07-02T10:00:00Z",
      "disconnectedAt": "2025-07-02T10:15:00Z",
      "messageCount": 25,
      "duration": 900
    }
  ]
}
```

---

### Transaction Analytics

#### Get Transaction Volume
**Endpoint**: `GET /analytics/transactions/volume`

**Query Parameters**:
- `from`: Start date (ISO 8601, optional)
- `to`: End date (ISO 8601, optional)
- `chainId`: Filter by chain ID (optional)
- `groupBy`: Grouping interval - "hour", "day", "week" (default: "day")

**Example**: `GET /analytics/transactions/volume?from=2025-07-01&to=2025-07-02&groupBy=hour`

**Response**:
```json
{
  "totalTransactions": 45000,
  "totalVolume": "1250000000000000000000",
  "averageValue": "27777777777777777777",
  "timeSeriesData": [
    {
      "timestamp": "2025-07-01T00:00:00Z",
      "transactionCount": 1200,
      "volume": "45000000000000000000",
      "averageValue": "37500000000000000000"
    },
    {
      "timestamp": "2025-07-01T01:00:00Z",
      "transactionCount": 980,
      "volume": "32000000000000000000",
      "averageValue": "32653061224489795918"
    }
  ],
  "chainBreakdown": {
    "1": {
      "transactions": 20000,
      "volume": "800000000000000000000"
    },
    "137": {
      "transactions": 15000,
      "volume": "250000000000000000000"
    }
  }
}
```

#### Get Transaction Details
**Endpoint**: `GET /analytics/transactions/{hash}`

**Parameters**:
- `hash`: Transaction hash

**Response**:
```json
{
  "hash": "0x25d5ee953af002f23163569f6b97f907156b7a894be129b00026c7e4da473763",
  "chainId": 1,
  "blockNumber": 22822242,
  "timestamp": "2025-07-01T05:15:47Z",
  "from": "0x3821578737a8cb6cb557b3e21214419ef046cfc8",
  "to": "0xba5bde662c17e2adff1075610382b9b691296350",
  "value": "0",
  "gasUsed": "342660",
  "gasPrice": "437139396",
  "method": "approve",
  "summary": "Approved spending of RARE tokens",
  "subscribers": 3,
  "broadcastCount": 3,
  "deliveryLatency": 150
}
```

---

### Address Analytics

#### Get Address Statistics
**Endpoint**: `GET /analytics/addresses/{address}`

**Parameters**:
- `address`: Ethereum address

**Query Parameters**:
- `chainId`: Filter by chain ID (optional)
- `from`: Start date (optional)
- `to`: End date (optional)

**Response**:
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "totalTransactions": 1250,
  "totalVolumeSent": "45000000000000000000",
  "totalVolumeReceived": "32000000000000000000",
  "firstTransaction": "2024-01-15T10:30:00Z",
  "lastTransaction": "2025-07-02T09:45:00Z",
  "chainActivity": {
    "1": {
      "transactions": 800,
      "volume": "40000000000000000000"
    },
    "137": {
      "transactions": 450,
      "volume": "37000000000000000000"
    }
  },
  "subscribers": 5,
  "monitoringStatus": "active"
}
```

#### Get Top Addresses
**Endpoint**: `GET /analytics/addresses/top`

**Query Parameters**:
- `sortBy`: "transactions", "volume", "subscribers" (default: "transactions")
- `limit`: Number of results (default: 50, max: 100)
- `chainId`: Filter by chain ID (optional)

**Response**:
```json
{
  "addresses": [
    {
      "address": "0x1234567890123456789012345678901234567890",
      "ensName": "vitalik.eth",
      "transactionCount": 2500,
      "totalVolume": "150000000000000000000",
      "subscribers": 12,
      "rank": 1
    },
    {
      "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "ensName": null,
      "transactionCount": 1800,
      "totalVolume": "95000000000000000000",
      "subscribers": 8,
      "rank": 2
    }
  ],
  "totalResults": 150,
  "sortedBy": "transactions"
}
```

---

### System Analytics

#### Get System Health
**Endpoint**: `GET /analytics/system/health`

**Response**:
```json
{
  "status": "healthy",
  "uptime": 86400,
  "version": "2.0.0",
  "activeConnections": 45,
  "totalMemoryUsage": "512MB",
  "databaseStatus": "connected",
  "redisStatus": "connected",
  "blockchainProviders": {
    "ethereum": "connected",
    "polygon": "connected",
    "base": "connected",
    "arbitrum": "degraded",
    "optimism": "connected"
  },
  "lastBlockProcessed": {
    "1": 22822500,
    "137": 62450000,
    "8453": 25680000
  },
  "processingLatency": {
    "average": 150,
    "p95": 300,
    "p99": 500
  }
}
```

#### Get Performance Metrics
**Endpoint**: `GET /analytics/system/performance`

**Query Parameters**:
- `from`: Start date (optional)
- `to`: End date (optional)
- `metric`: Specific metric to retrieve (optional)

**Response**:
```json
{
  "timeRange": {
    "from": "2025-07-01T00:00:00Z",
    "to": "2025-07-02T00:00:00Z"
  },
  "metrics": {
    "transactionThroughput": {
      "average": 125.5,
      "peak": 450,
      "unit": "transactions/second"
    },
    "connectionThroughput": {
      "average": 5.2,
      "peak": 15,
      "unit": "connections/second"
    },
    "memoryUsage": {
      "average": "245MB",
      "peak": "512MB",
      "current": "267MB"
    },
    "responseTime": {
      "average": 180,
      "p95": 320,
      "p99": 580,
      "unit": "milliseconds"
    },
    "errorRate": {
      "rate": 0.02,
      "total": 45,
      "unit": "percentage"
    }
  },
  "timeSeries": [
    {
      "timestamp": "2025-07-01T00:00:00Z",
      "transactionThroughput": 120,
      "connectionThroughput": 4,
      "memoryUsage": "240MB",
      "responseTime": 175,
      "errorRate": 0.01
    }
  ]
}
```

---

## Response Formats

### Transaction Object
Standard transaction format used across all WebSocket modes:

```typescript
interface Transaction {
  hash: string;                    // Transaction hash
  blockTimestamp: string;          // ISO 8601 timestamp
  blockNumber: number;             // Block number
  blockHash: string;               // Block hash
  chainId: number;                 // Chain identifier
  nonce: string;                   // Hex-encoded nonce
  transactionIndex: number;        // Index in block
  fromAddress: string;             // Sender address
  fromName: string;                // ENS name or address
  fromAvatar: string;              // ENS avatar URL
  fromHeader: string;              // ENS header URL
  toAddress: string;               // Recipient address
  value: string;                   // Hex-encoded value in wei
  gasPrice: string;                // Hex-encoded gas price
  gas: string;                     // Hex-encoded gas used
  network: string;                 // Network name
  summary: string;                 // Human-readable summary
  summaries: string;               // Legacy field
  method: string;                  // Method name
  input: object;                   // Decoded input data
  events: string;                  // Legacy field
  logs: object[];                  // Raw transaction logs
  parsedLogs: object[];            // Parsed transaction logs
}
```

### Error Object
Standard error format:

```typescript
interface ErrorResponse {
  type: "error";
  code: string;                    // Error code
  message: string;                 // Human-readable message
  timestamp?: string;              // ISO 8601 timestamp
  details?: any;                   // Additional error details
}
```

---

## Error Handling

### WebSocket Errors

**Connection Errors**: Sent as HTTP responses during upgrade
```json
{
  "type": "error",
  "code": "EFP_CONNECTION_FAILED",
  "message": "Failed to connect to EFP list"
}
```

**Runtime Errors**: Sent as WebSocket messages
```json
{
  "type": "error",
  "clientId": "client_123",
  "data": {
    "code": "SUBSCRIPTION_FAILED",
    "message": "Address format invalid"
  }
}
```

### HTTP Errors

**400 Bad Request**: Invalid parameters
```json
{
  "error": "Invalid date format",
  "code": "INVALID_PARAMETER",
  "parameter": "from"
}
```

**404 Not Found**: Resource not found
```json
{
  "error": "Transaction not found",
  "code": "NOT_FOUND",
  "resource": "transaction"
}
```

**500 Internal Server Error**: Server error
```json
{
  "error": "Database connection failed",
  "code": "INTERNAL_ERROR"
}
```

---

## Performance Considerations

### WebSocket Connections

1. **Connection Limits**: Server supports up to 1000 concurrent connections
2. **Message Rate**: Maximum 100 messages per second per connection
3. **Address Limits**: 
   - EFP mode: Supports thousands of addresses (auto-optimized)
   - Multiplex mode: Recommended maximum 100 addresses per client
   - Legacy mode: Single address only

### Historical Data

1. **Time Range**: Historical data limited to last 30 days by default
2. **Transaction Limits**: Maximum 1000 transactions per initial load
3. **Performance**: EFP lists with 1000+ addresses load in <3 seconds

### Analytics API

1. **Rate Limiting**: 100 requests per minute per IP
2. **Data Retention**: Analytics data retained for 90 days
3. **Caching**: Response caching with 5-minute TTL for performance

### Best Practices

1. **Connection Management**: 
   - Use connection pooling for multiple addresses
   - Implement reconnection logic with exponential backoff
   - Close connections when no longer needed

2. **Filtering**: 
   - Use specific filters to reduce message volume
   - Filter on client side for complex logic

3. **Error Handling**:
   - Implement retry logic for failed connections
   - Handle partial data scenarios gracefully
   - Log errors for debugging

4. **Performance**:
   - Batch address subscriptions when possible
   - Use appropriate time ranges for historical data
   - Monitor connection and message rates

---

## Example Integration

### React Hook for EFP Streaming

```javascript
import { useState, useEffect, useRef } from 'react';

function useEFPStream(listId) {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState('disconnected');
  const [stats, setStats] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!listId) return;

    const ws = new WebSocket(`ws://localhost:8080?list=${listId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'history_complete') {
        setStats(data.data);
      } else if (data.type === 'error') {
        console.error('EFP Stream Error:', data);
        setStatus('error');
      } else {
        // Individual transaction
        setTransactions(prev => [data, ...prev.slice(0, 99)]); // Keep last 100
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
    };

    return () => {
      ws.close();
    };
  }, [listId]);

  return { transactions, status, stats };
}
```

This comprehensive API specification should provide the next developer with all the information needed to build a robust frontend for the EthFollow Feed v2 service.