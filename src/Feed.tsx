import { useEffect } from 'react';
import { useFeed } from './contexts/FeedContext';
import { useUI } from './contexts/UIContext';
import Card from './Card';
import ConnectionControls from './components/ConnectionControls';
import FilterPanel from './components/FilterPanel';
import AnalyticsModal from './components/AnalyticsModal';
import ViewModeToggle from './components/ViewModeToggle';

export default function TransactionFeed() {
  const { 
    transactions, 
    connectionConfig, 
    connectionStatus, 
    setConnectionConfig, 
    connect, 
    error 
  } = useFeed();

  const { viewMode } = useUI();

  // Auto-connect with default EFP configuration if no config is set
  useEffect(() => {
    if (!connectionConfig) {
      const defaultConfig = {
        mode: 'efp' as const,
        config: { listId: '88' }
      };
      setConnectionConfig(defaultConfig);
      connect().catch(console.error);
    }
  }, [connectionConfig, setConnectionConfig, connect]);

  return (
    <>
      {/* Connection Controls Panel */}
      <ConnectionControls />
      
      {/* Filter Panel */}
      <FilterPanel />
      
      {/* View Mode Toggle */}
      <ViewModeToggle />
      
      {/* Analytics Modal */}
      <AnalyticsModal />

      {/* Main Feed Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {/* Connection Status */}
        {connectionStatus === 'disconnected' && !connectionConfig && (
          <div className="text-gray-600 mb-4 text-center">
            <p>Use the Connection Settings to configure your feed.</p>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="text-blue-600 mb-4 text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Connecting...
          </div>
        )}

        {connectionStatus === 'reconnecting' && (
          <div className="text-yellow-600 mb-4 text-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
            Reconnecting...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 rounded p-4 mb-4">
            <h3 className="font-medium text-red-800">Connection Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Transaction Feed */}
        <div className="space-y-2 feed-wrapper">
          {transactions.length === 0 && connectionStatus === 'connected' && (
            <div className="text-gray-600 text-center py-8">
              <p>Waiting for transactions...</p>
              <p className="text-sm mt-2">
                {viewMode === 'analytics' 
                  ? 'In analytics mode - click links to view analytics data'
                  : 'In normal mode - click links to visit external sites'
                }
              </p>
            </div>
          )}
          
          {transactions.map((tx, i) => (
            <Card key={`${tx.hash}-${i}`} tx={tx} index={i} />
          ))}
        </div>

        {/* Footer Info */}
        {transactions.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-8 pb-4">
            Showing {transactions.length} recent transactions
            {connectionConfig?.mode === 'efp' && (
              <span> from EFP list {connectionConfig.config.listId}</span>
            )}
            {connectionConfig?.mode === 'legacy' && (
              <span> for {connectionConfig.config.address}</span>
            )}
            {connectionConfig?.mode === 'multiplex' && (
              <span> for {connectionConfig.config.addresses.length} addresses</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
