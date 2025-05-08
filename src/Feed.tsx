// React client that connects to the Redis stream WebSocket server and displays Ethereum transactions

import { useEffect, useRef, useState } from 'react';

type TxRecord = {
  hash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  input: string;
  summary: string;
};

export default function TransactionFeed() {
  const [stream, setStream] = useState('addr:0x983110309620d911731ac0932219af06091b6744');
  const [inputValue, setInputValue] = useState('0x983110309620d911731ac0932219af06091b6744');
  const [records, setRecords] = useState<TxRecord[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!stream) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(`ws://localhost:8080?stream=${encodeURIComponent(stream)}`);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecords([]);
    setStream(`addr:${inputValue.trim()}`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Enter wallet address or stream key"
          className="border p-2 rounded w-full"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go
        </button>
      </form>

      <ul className="space-y-2">
        {records.map((tx, i) => (
          <li key={`${tx.hash}-${i}`} className="p-2 border rounded">
            <div><strong>From:</strong> {tx.fromAddress}</div>
            <div><strong>To:</strong> {tx.toAddress}</div>
            <div><strong>Value:</strong> {tx.value}</div>
            <div><strong>Hash:</strong> <code className="break-all">{tx.hash}</code></div>
            <div>{tx.summary}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

