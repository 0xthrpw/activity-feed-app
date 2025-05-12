// import { useEffect } from 'react';
export type TxRecord = {
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

export default function Card({ tx, index }: { tx: TxRecord, index: number }) {

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

//   useEffect(() => {

//   })

  return (
    <div className="card border rounded" key={index}>
        <li key={`${tx.hash}-${index}`} className="p-2 ">
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
  )
}
