// import { useEffect } from 'react';
export type TxRecord = {
    hash: string;
    chainId: number;
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
    parsedLogs: ParsedLog[];
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

  const parseTimestamp = (timestamp: string): Date => {
    if (!timestamp) return new Date(NaN);
    const numeric = /^\d+$/.test(timestamp);
    if (numeric) {
      const ms = timestamp.length === 10 ? Number(timestamp) * 1000 : Number(timestamp);
      return new Date(ms);
    }
    return new Date(timestamp);
  };

  const timeSince = (timestamp: string) => {
    const date = parseTimestamp(timestamp);
    if (isNaN(date.getTime())) return ' - ';

    const now = Date.now();
    const elapsed = now - date.getTime();

    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day(s) ago`;
    if (hours > 0) return `${hours} hour(s) ago`;
    if (minutes > 0) return `${minutes} minute(s) ago`;
    return `${seconds} second(s) ago`;
  };

  const CHAIN_EXPLORERS: Record<string, string> = {
    '1': 'https://etherscan.io',
    '5': 'https://goerli.etherscan.io',
    '11155111': 'https://sepolia.etherscan.io',
    '10': 'https://optimistic.etherscan.io',
    '420': 'https://goerli-optimism.etherscan.io',
    '137': 'https://polygonscan.com',
    '80001': 'https://mumbai.polygonscan.com',
    '42161': 'https://arbiscan.io',
    '421613': 'https://testnet.arbiscan.io',
    '8453': 'https://basescan.org',
    '84531': 'https://testnet.basescan.org',
  };

  const getExplorerUrl = (tx: TxRecord) => {
    const explorer = CHAIN_EXPLORERS[tx.chainId.toString()] || 'https://etherscan.io';
    return `${explorer}/tx/${tx.hash}`;
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
    const parsedSummaries: ParsedLog[] = Object.values(logs)
    // console.log("parsedSummaries", typeof parsedSummaries, parsedSummaries)
    if (!parsedSummaries) {
      return summary
    }
    if (parsedSummaries.length === 0) {
      return summary
    }
    // console.log("story", parsedSummaries)
    const story = parsedSummaries.map((item) => (
      <div style={{ marginBottom: '0.25rem' }}>{item?.summary}</div>
    ))
    
    return <div className="summary">{summary} <br /> {story}</div>
    // return <div className="summary">{summary} <br /> </div>
  }

  return (
    <div className="card border rounded" key={index}>
        <li key={`${tx.hash}-${index}`} className="p-2 ">
            <div>
              <div className="leftcell">
                <a href={getEFPUrl(tx)}>{tx.fromName}</a>
              </div>
              <div className="rightcell top" title={parseTimestamp(tx.blockTimestamp).toLocaleString()}>
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
                {tx.chainId}
              </div>
            </div>
            <div>{getExtendedSummary(tx)} </div>


        </li>
    </div>
  )
}
