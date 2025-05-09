// React client that connects to the Redis stream WebSocket server and displays Ethereum transactions

import { useEffect, useRef, useState } from 'react';

const getStreamFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('address') || '';
};

type TxRecord = {
  hash: string;
  fromAddress: string;
  fromName: string;
  toAddress: string;
  value: string;
  input: string;
  summary: string;
  method: string;
  blockTimestamp: string;
};
let socket: WebSocket;
export default function TransactionFeed() {
  const [records, setRecords] = useState<TxRecord[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [stream] = useState(getStreamFromUrl());
  const timeSince = (timestamp: string) => {
    const now = Date.now();
    const elapsed = now - Number(timestamp);

    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day(s) ago`;
    if (hours > 0) return `${hours} hour(s) ago`;
    if (minutes > 0) return `${minutes} minute(s) ago`;
    return `${seconds} second(s) ago`;
  };

  useEffect(() => {
    if (!stream) return;

    if (socketRef.current) {
      socketRef.current.close();
    }
    console.log(import.meta.env.VITE_SOCKET_URL)
    const url = `${import.meta.env.VITE_SOCKET_URL}?stream=addr:${stream}`
    
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
    <div className="p-4 max-w-2xl mx-auto">
      {!stream && (
        <div className="text-red-600 mb-4">Missing address in URL. Use ?address=YOUR_STREAM_KEY</div>
      )}
      {!socket && (
        <div className="text-red-600 mb-4">Websocket Fail</div>
      )}

      <ul className="space-y-2">
        {records.map((tx, i) => (
          <div className="card border rounded" key={i}>
          <li key={`${tx.hash}-${i}`} className="p-2 ">
            <div>
              <div className="left">{tx.fromName}</div>
              <div className="right" title={new Date(Number(tx.blockTimestamp)).toLocaleString()}> {timeSince(tx.blockTimestamp)}</div>
            </div>
            <div className="clearfix">
              <div>{tx.summary}</div>
              <div>{tx.method}</div>
              {/* <div>{tx.input}</div> */}
            </div>

          </li>
          </div>
        ))}
      </ul>
    </div>
  );
}
