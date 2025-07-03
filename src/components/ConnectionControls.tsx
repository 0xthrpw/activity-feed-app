import { useState, useEffect } from 'react';
import { useFeed } from '../contexts/FeedContext';
import { useUI } from '../contexts/UIContext';
import { ConnectionMode, EFPConfig, LegacyConfig, MultiplexConfig, MultiplexFilters } from '../types';
import Modal from './Modal';
import FilterControls from './FilterControls';

export default function ConnectionControls() {
  const { 
    connectionConfig, 
    connectionStatus, 
    connectionStats, 
    setConnectionConfig, 
    connect, 
    disconnect, 
    error,
    clearError 
  } = useFeed();
  
  const { isConnectionControlsOpen, toggleConnectionControls } = useUI();
  
  const [selectedMode, setSelectedMode] = useState<ConnectionMode>('efp');
  const [efpConfig, setEfpConfig] = useState<EFPConfig>({ listId: '88' });
  const [legacyConfig, setLegacyConfig] = useState<LegacyConfig>({ address: '' });
  const [multiplexConfig, setMultiplexConfig] = useState<MultiplexConfig>({
    addresses: [],
    clientId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    filters: {}
  });

  // Update form state when connection config changes
  useEffect(() => {
    if (connectionConfig) {
      setSelectedMode(connectionConfig.mode);
      switch (connectionConfig.mode) {
        case 'efp':
          setEfpConfig(connectionConfig.config);
          break;
        case 'legacy':
          setLegacyConfig(connectionConfig.config);
          break;
        case 'multiplex':
          setMultiplexConfig(connectionConfig.config);
          break;
      }
    }
  }, [connectionConfig]);

  const handleConnect = () => {
    clearError();
    
    let config;
    switch (selectedMode) {
      case 'efp':
        if (!efpConfig.listId) {
          alert('Please enter an EFP List ID');
          return;
        }
        config = { mode: 'efp' as const, config: efpConfig };
        break;
      
      case 'legacy':
        if (!legacyConfig.address) {
          alert('Please enter an address');
          return;
        }
        config = { mode: 'legacy' as const, config: legacyConfig };
        break;
      
      case 'multiplex':
        if (multiplexConfig.addresses.length === 0) {
          alert('Please add at least one address');
          return;
        }
        config = { mode: 'multiplex' as const, config: multiplexConfig };
        break;
      
      default:
        return;
    }

    setConnectionConfig(config);
    connect().catch(console.error);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const addMultiplexAddress = () => {
    const address = prompt('Enter an Ethereum address:');
    if (address && address.trim()) {
      setMultiplexConfig(prev => ({
        ...prev,
        addresses: [...prev.addresses, address.trim()]
      }));
    }
  };

  const removeMultiplexAddress = (index: number) => {
    setMultiplexConfig(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal
      isOpen={isConnectionControlsOpen}
      onClose={toggleConnectionControls}
      title="Connection Settings"
      maxWidth="max-w-lg"
    >
        <div className="p-6">

        {/* Connection Status */}
        <div className="mb-4 p-3 rounded border">
          <div className="flex items-center mb-2">
            <span className="font-medium">Status: </span>
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'bg-yellow-100 text-yellow-800' :
              connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {connectionStatus}
            </span>
          </div>
          
          {connectionStats && (
            <div className="text-sm text-gray-600">
              {connectionStats.activeAddresses && <div>Active Addresses: {connectionStats.activeAddresses}</div>}
              {connectionStats.totalMessages && <div>Messages: {connectionStats.totalMessages}</div>}
              {connectionStats.processingTimeMs && <div>Processing Time: {connectionStats.processingTimeMs}ms</div>}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Mode Selection */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Connection Mode</label>
          <div className="space-y-2">
            {(['efp', 'legacy', 'multiplex'] as ConnectionMode[]).map(mode => (
              <label key={mode} className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={selectedMode === mode}
                  onChange={(e) => setSelectedMode(e.target.value as ConnectionMode)}
                  className="mr-2"
                  disabled={connectionStatus === 'connected'}
                />
                <span className="capitalize">{mode}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mode-specific Configuration */}
        {selectedMode === 'efp' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">EFP List ID</label>
            <input
              type="text"
              value={efpConfig.listId}
              onChange={(e) => setEfpConfig({ listId: e.target.value })}
              placeholder="Enter EFP list ID (e.g., 88)"
              className="w-full p-2 border rounded"
              disabled={connectionStatus === 'connected'}
            />
            <p className="text-sm text-gray-600 mt-1">
              Stream transactions for all addresses in an EFP list
            </p>
          </div>
        )}

        {selectedMode === 'legacy' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">Address</label>
            <input
              type="text"
              value={legacyConfig.address}
              onChange={(e) => setLegacyConfig(prev => ({ ...prev, address: e.target.value }))}
              placeholder="0x... or vitalik.eth"
              className="w-full p-2 border rounded mb-2"
              disabled={connectionStatus === 'connected'}
            />
            
            <label className="block font-medium mb-2">Chain ID (Optional)</label>
            <input
              type="number"
              value={legacyConfig.chainId || ''}
              onChange={(e) => setLegacyConfig(prev => ({ 
                ...prev, 
                chainId: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="1 for Ethereum mainnet"
              className="w-full p-2 border rounded"
              disabled={connectionStatus === 'connected'}
            />
            <p className="text-sm text-gray-600 mt-1">
              Stream transactions for a single address
            </p>
          </div>
        )}

        {selectedMode === 'multiplex' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">Addresses</label>
            <div className="space-y-2 mb-2">
              {multiplexConfig.addresses.map((address, index) => (
                <div key={index} className="flex items-center">
                  <span className="flex-1 p-2 bg-gray-100 rounded text-sm">{address}</span>
                  <button
                    onClick={() => removeMultiplexAddress(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    disabled={connectionStatus === 'connected'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addMultiplexAddress}
              className="w-full p-2 border border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400"
              disabled={connectionStatus === 'connected'}
            >
              + Add Address
            </button>
            <p className="text-sm text-gray-600 mt-1">
              Stream transactions for multiple addresses with advanced filtering
            </p>
            
            {/* Filters Section for Multiplex Mode */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium mb-3">Filters</h3>
              <FilterControls />
            </div>
          </div>
        )}

        {/* Connection Controls */}
        <div className="space-y-2">
          {connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
            <button
              onClick={handleConnect}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Current Configuration Display */}
        {connectionConfig && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Current Configuration</h3>
            <div className="text-sm">
              <div>Mode: {connectionConfig.mode}</div>
              {connectionConfig.mode === 'efp' && (
                <div>List ID: {connectionConfig.config.listId}</div>
              )}
              {connectionConfig.mode === 'legacy' && (
                <>
                  <div>Address: {connectionConfig.config.address}</div>
                  {connectionConfig.config.chainId && (
                    <div>Chain ID: {connectionConfig.config.chainId}</div>
                  )}
                </>
              )}
              {connectionConfig.mode === 'multiplex' && (
                <>
                  <div>Addresses: {connectionConfig.config.addresses.length}</div>
                  <div>Client ID: {connectionConfig.config.clientId}</div>
                </>
              )}
            </div>
          </div>
        )}
        </div>
    </Modal>
  );
}