// import { useEffect } from 'react';
export type TxRecord = {
    hash: string;
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
    parsedLogs: string;
  };

export type ParsedLog = {
    address: string;
    contractName: string;
    name: string;
    args: Record<string, unknown>;
    summary: string;
    icon?: string;
};

export default function Card({ tx, index }: { tx: TxRecord, index: number }) {

  const timeSince = (timestamp: string) => {
    const now = Date.now();

    //2025-04-01T04:15:23+00:00
    // Convert timestamp to milliseconds
    if (!timestamp) {
      return ' - ';
    }

    if (timestamp.length === 24) {
      // Convert ISO 8601 string to milliseconds
      timestamp = timestamp.replace('Z', '+00:00'); // Ensure it has a timezone
      timestamp = new Date(timestamp).getTime().toString();
    } else if (timestamp.length === 19) {
      // Convert ISO 8601 string without timezone to milliseconds
      timestamp = new Date(`${timestamp}Z`).getTime().toString();
    }else{
      timestamp = new Date(timestamp).getTime().toString();
    }

    // console.log("timestamp", timestamp)
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

  const getExplorerUrl = (tx: TxRecord) => {
    const network = tx.network
    const txHash = tx.hash
    const explorer = network === 'eth-mainnet' ? 'etherscan.io' : 'basescan.org'
    
    const explorerUrl = `https://${explorer}/tx/${txHash}`
    return explorerUrl
  };

  const getEFPUrl = (tx: TxRecord) => {
    const user = tx.fromName
    const url = `https://efp.app/${user}`
    return url
  }

  const getExtendedSummary = (tx: TxRecord) => {
    const summary = tx.summary
    const logs = tx.parsedLogs
    // console.log("summaries", logs)
    if (!logs) {
      return 
    }
    const parsedSummaries: ParsedLog[] = JSON.parse(logs)
    if (!parsedSummaries) {
      return summary
    }
    if (parsedSummaries.length === 0) {
      return summary
    }
    console.log("story", parsedSummaries)
    const story = parsedSummaries.map((item: ParsedLog, i: number) => (
      <div key={i} style={{ marginBottom: '0.25rem' }}>{item?.summary}</div>
    ))
    
    return <div className="summary">{summary} <br /> {story}</div>
  }

  return (
    <div className="card border rounded" key={index}>
        <li key={`${tx.hash}-${index}`} className="p-2 ">
            <div>
              <div className="leftcell">
                <a href={getEFPUrl(tx)}>{tx.fromName}</a>
              </div>
              <div className="rightcell top" title={new Date(Number(tx.blockTimestamp)).toLocaleString()}>
                <a href={getExplorerUrl(tx)}>{timeSince(tx.blockTimestamp)}</a>
              </div>
            </div>
            <div>
              <div className="inline">
                {tx.fromAvatar && <img src={tx.fromAvatar} alt={`${tx.fromName}'s avatar`} className="avatar" />}
              </div>
              <div className="inline top">
                
                {tx.method && <div className="action">{tx.method}</div>}
                {/* <div>{tx.input}</div> */}

              </div>
            </div>
            <div>{getExtendedSummary(tx)} </div>


        </li>
    </div>
  )
}
