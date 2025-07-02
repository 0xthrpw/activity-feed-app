import React, { useEffect, useState } from 'react';
import { useUI } from '../contexts/UIContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { TransactionAnalytics, AddressAnalytics } from '../types';

export default function AnalyticsModal() {
  const { 
    isAnalyticsModalOpen, 
    analyticsModalType, 
    analyticsModalData, 
    closeAnalyticsModal 
  } = useUI();
  
  const { 
    fetchTransactionAnalytics, 
    fetchAddressAnalytics, 
    isLoading, 
    error 
  } = useAnalytics();

  const [data, setData] = useState<TransactionAnalytics | AddressAnalytics | null>(null);

  useEffect(() => {
    if (!isAnalyticsModalOpen || !analyticsModalData) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      try {
        if (analyticsModalType === 'transaction') {
          const result = await fetchTransactionAnalytics((analyticsModalData as { hash: string }).hash);
          setData(result);
        } else if (analyticsModalType === 'address') {
          const result = await fetchAddressAnalytics((analyticsModalData as { address: string }).address);
          setData(result);
        }
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      }
    };

    fetchData();
  }, [isAnalyticsModalOpen, analyticsModalType, analyticsModalData, fetchTransactionAnalytics, fetchAddressAnalytics]);

  if (!isAnalyticsModalOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAnalyticsModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {analyticsModalType === 'transaction' ? 'Transaction Analytics' : 'Address Analytics'}
            </h2>
            <button 
              onClick={closeAnalyticsModal}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading analytics data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 rounded p-4 mb-4">
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {data && !isLoading && (
            <>
              {analyticsModalType === 'transaction' && (
                <TransactionAnalyticsContent data={data as TransactionAnalytics} />
              )}
              {analyticsModalType === 'address' && (
                <AddressAnalyticsContent data={data as AddressAnalytics} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionAnalyticsContent({ data }: { data: TransactionAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Basic Transaction Info */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Transaction Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Hash:</span>
            <p className="text-gray-600 break-all">{data.hash}</p>
          </div>
          <div>
            <span className="font-medium">Chain ID:</span>
            <p className="text-gray-600">{data.chainId}</p>
          </div>
          <div>
            <span className="font-medium">Block Number:</span>
            <p className="text-gray-600">{data.blockNumber}</p>
          </div>
          <div>
            <span className="font-medium">Timestamp:</span>
            <p className="text-gray-600">{new Date(data.timestamp).toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium">From:</span>
            <p className="text-gray-600 break-all">{data.from}</p>
          </div>
          <div>
            <span className="font-medium">To:</span>
            <p className="text-gray-600 break-all">{data.to}</p>
          </div>
          <div>
            <span className="font-medium">Value:</span>
            <p className="text-gray-600">{data.value} ETH</p>
          </div>
          <div>
            <span className="font-medium">Method:</span>
            <p className="text-gray-600">{data.method || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Gas Information */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Gas Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Gas Used:</span>
            <p className="text-gray-600">{parseInt(data.gasUsed).toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium">Gas Price:</span>
            <p className="text-gray-600">{parseInt(data.gasPrice).toLocaleString()} wei</p>
          </div>
        </div>
      </div>

      {/* Analytics Metrics */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-medium mb-3">Analytics Metrics</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Subscribers:</span>
            <p className="text-blue-600 text-lg font-bold">{data.subscribers}</p>
          </div>
          <div>
            <span className="font-medium">Broadcast Count:</span>
            <p className="text-blue-600 text-lg font-bold">{data.broadcastCount}</p>
          </div>
          <div>
            <span className="font-medium">Delivery Latency:</span>
            <p className="text-blue-600 text-lg font-bold">{data.deliveryLatency}ms</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Summary</h3>
        <p className="text-gray-700">{data.summary}</p>
      </div>
    </div>
  );
}

function AddressAnalyticsContent({ data }: { data: AddressAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Address Overview */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Address Overview</h3>
        <div className="text-sm">
          <div className="mb-2">
            <span className="font-medium">Address:</span>
            <p className="text-gray-600 break-all">{data.address}</p>
          </div>
          <div className="mb-2">
            <span className="font-medium">Monitoring Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              data.monitoringStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {data.monitoringStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Statistics */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-medium mb-3">Transaction Statistics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Transactions:</span>
            <p className="text-blue-600 text-lg font-bold">{data.totalTransactions.toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium">Subscribers:</span>
            <p className="text-blue-600 text-lg font-bold">{data.subscribers}</p>
          </div>
        </div>
      </div>

      {/* Volume Information */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Volume Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Volume Sent:</span>
            <p className="text-gray-600">{parseFloat(data.totalVolumeSent).toFixed(4)} ETH</p>
          </div>
          <div>
            <span className="font-medium">Total Volume Received:</span>
            <p className="text-gray-600">{parseFloat(data.totalVolumeReceived).toFixed(4)} ETH</p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Activity Timeline</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">First Transaction:</span>
            <p className="text-gray-600">{new Date(data.firstTransaction).toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium">Last Transaction:</span>
            <p className="text-gray-600">{new Date(data.lastTransaction).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Chain Activity Breakdown */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Chain Activity</h3>
        <div className="space-y-3">
          {Object.entries(data.chainActivity).map(([chainId, activity]) => (
            <div key={chainId} className="flex justify-between items-center p-2 bg-white rounded">
              <span className="font-medium">Chain {chainId}:</span>
              <div className="text-sm text-gray-600">
                <span>{activity.transactions} txs</span>
                <span className="ml-2">{parseFloat(activity.volume).toFixed(4)} ETH</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}