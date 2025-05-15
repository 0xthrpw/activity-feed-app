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
    summaries: string[];
    method: string;
    blockTimestamp: string;
    network: string;
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
    const summaries = tx.summaries
    let story = ''
    for (let i = 0; i < summaries.length; i++) {
        story += summaries[i]
    }
    return summary + '\n' + story
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
