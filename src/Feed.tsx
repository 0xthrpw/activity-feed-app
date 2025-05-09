// React client that connects to the Redis stream WebSocket server and displays Ethereum transactions

import { useEffect, useRef, useState } from 'react';

const getStreamFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('address') || '';
};

type TxRecord = {
  hash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  input: string;
  summary: string;
  method: string;
};

export default function TransactionFeed() {
  const [records, setRecords] = useState<TxRecord[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [stream] = useState(getStreamFromUrl());

  useEffect(() => {
    if (!stream) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const url = `${import.meta.env.VITE_SOCKET_URL}?stream=addr:${encodeURIComponent(stream)}`
    const socket = new WebSocket(url);
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
    <div className="p-4 max-w-2xl mx-auto">
      {!stream && (
        <div className="text-red-600 mb-4">Missing address in URL. Use ?address=YOUR_STREAM_KEY</div>
      )}

      <ul className="space-y-2">
        {records.map((tx, i) => (
          <li key={`${tx.hash}-${i}`} className="p-2 border rounded">
            <div><strong>From:</strong> {tx.fromAddress}</div>
            <div><strong>To:</strong> {tx.toAddress}</div>
            <div>{tx.summary}</div>
            <div>{tx.method}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
