// React client that connects to the Redis stream WebSocket server and displays Ethereum transactions

import { useEffect, useRef, useState } from 'react';
import Card from './Card';
import type { TxRecord } from './Card';

const getStreamFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('address') || '';
};

let socket: WebSocket;
export default function TransactionFeed() {
  const [records, setRecords] = useState<TxRecord[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [stream] = useState(getStreamFromUrl());

  useEffect(() => {
    if (!stream) return;

    if (socketRef.current) {
      socketRef.current.close();
    }
    console.log(import.meta.env.VITE_SOCKET_URL)
    // const url = `${import.meta.env.VITE_SOCKET_URL}?stream=addr:${stream}`
    const url = `${import.meta.env.VITE_SOCKET_URL}?list=88`

    
    try {
        socket = new WebSocket(url);
    } catch (err) {
        console.error('Invalid WebSocket URL:', err);
        return;
    }
    
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setRecords((prev) => [data as TxRecord, ...prev]);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    socket.onclose = () => {
      socketRef.current = null;
    };

    return () => {
      socket.close();
    };
  }, [stream]);

  return (
    <div className="p-4 max-w-2xl mx-auto ">
      {!stream && (
        <div className="text-red-600 mb-4">Missing address in URL. Use ?address=YOUR_STREAM_KEY</div>
      )}
      {!socket && (
        <div className="text-red-600 mb-4">Websocket Fail</div>
      )}

      <div className="space-y-2 feed-wrapper">
        {records.map((tx, i) => (
            <Card key={i} tx={tx} index={i} />
        ))}
      </div>
    </div>
  );
}
