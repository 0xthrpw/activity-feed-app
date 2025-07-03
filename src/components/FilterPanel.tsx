import { useState, useEffect } from 'react';
import { useFeed } from '../contexts/FeedContext';
import { useUI } from '../contexts/UIContext';
import { MultiplexFilters } from '../types';

const CHAIN_OPTIONS = [
  { id: 1, name: 'Ethereum' },
  { id: 10, name: 'Optimism' },
  { id: 137, name: 'Polygon' },
  { id: 8453, name: 'Base' },
  { id: 42161, name: 'Arbitrum' },
  { id: 324, name: 'zkSync' },
  { id: 59144, name: 'Linea' },
  { id: 534352, name: 'Scroll' },
  { id: 7777777, name: 'Zora' }
];

const CONTRACT_TYPES = [
  'ERC20',
  'ERC721',
  'ERC1155',
  'Uniswap',
  'DEX',
  'Lending',
  'Bridge'
];

const COMMON_METHODS = [
  'transfer',
  'approve',
  'mint',
  'burn',
  'swap',
  'deposit',
  'withdraw',
  'stake',
  'unstake'
];

export default function FilterPanel() {
  const { 
    filters, 
    setFilters, 
    connectionConfig, 
    connectionStatus 
  } = useFeed();
  
  const { isFilterPanelOpen, toggleFilterPanel } = useUI();
  
  const [localFilters, setLocalFilters] = useState<MultiplexFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const isMultiplexMode = connectionConfig?.mode === 'multiplex';
  const isConnected = connectionStatus === 'connected';

  if (!isFilterPanelOpen) {
    return null;
  }

  const handleApplyFilters = () => {
    setFilters(localFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters: MultiplexFilters = {};
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const timeRange = localFilters.timeRange || {};
    const newTimeRange = { ...timeRange };
    
    if (value) {
      newTimeRange[field] = new Date(value).toISOString();
    } else {
      delete newTimeRange[field];
    }
    
    setLocalFilters({
      ...localFilters,
      timeRange: Object.keys(newTimeRange).length > 0 ? newTimeRange : undefined
    });
  };

  const handleChainToggle = (chainId: number) => {
    const currentChains = localFilters.chains || [];
    const newChains = currentChains.includes(chainId)
      ? currentChains.filter(id => id !== chainId)
      : [...currentChains, chainId];
    
    setLocalFilters({
      ...localFilters,
      chains: newChains.length > 0 ? newChains : undefined
    });
  };

  const handleContractTypeToggle = (type: string) => {
    const currentTypes = localFilters.contractTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setLocalFilters({
      ...localFilters,
      contractTypes: newTypes.length > 0 ? newTypes : undefined
    });
  };

  const handleMethodToggle = (method: string) => {
    const currentMethods = localFilters.methods || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    
    setLocalFilters({
      ...localFilters,
      methods: newMethods.length > 0 ? newMethods : undefined
    });
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg border-l overflow-y-auto z-40">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Filters</h2>
          <button 
            onClick={toggleFilterPanel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {!isMultiplexMode && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800 text-sm">
              Filters are only available in Multiplex mode. Switch to Multiplex mode to use advanced filtering.
            </p>
          </div>
        )}

        {isMultiplexMode && (
          <div className="space-y-6">
            {/* Value Filters */}
            <div>
              <h3 className="font-medium mb-3">Value Range (ETH)</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Value</label>
                  <input
                    type="number"
                    step="0.001"
                    value={localFilters.minValue ? parseFloat(localFilters.minValue) / 1e18 : ''}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      minValue: e.target.value ? (parseFloat(e.target.value) * 1e18).toString() : undefined
                    })}
                    placeholder="0.001"
                    className="w-full p-2 border rounded text-sm"
                    disabled={!isConnected}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maximum Value</label>
                  <input
                    type="number"
                    step="0.001"
                    value={localFilters.maxValue ? parseFloat(localFilters.maxValue) / 1e18 : ''}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      maxValue: e.target.value ? (parseFloat(e.target.value) * 1e18).toString() : undefined
                    })}
                    placeholder="1000"
                    className="w-full p-2 border rounded text-sm"
                    disabled={!isConnected}
                  />
                </div>
              </div>
            </div>

            {/* Chain Filters */}
            <div>
              <h3 className="font-medium mb-3">Chains</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {CHAIN_OPTIONS.map(chain => (
                  <label key={chain.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.chains?.includes(chain.id) || false}
                      onChange={() => handleChainToggle(chain.id)}
                      className="mr-2"
                      disabled={!isConnected}
                    />
                    <span className="text-sm">{chain.name} ({chain.id})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contract Type Filters */}
            <div>
              <h3 className="font-medium mb-3">Contract Types</h3>
              <div className="space-y-2">
                {CONTRACT_TYPES.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.contractTypes?.includes(type) || false}
                      onChange={() => handleContractTypeToggle(type)}
                      className="mr-2"
                      disabled={!isConnected}
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Method Filters */}
            <div>
              <h3 className="font-medium mb-3">Methods</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {COMMON_METHODS.map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.methods?.includes(method) || false}
                      onChange={() => handleMethodToggle(method)}
                      className="mr-2"
                      disabled={!isConnected}
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range Filters */}
            <div>
              <h3 className="font-medium mb-3">Time Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <input
                    type="datetime-local"
                    value={formatDateForInput(localFilters.timeRange?.from)}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    disabled={!isConnected}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <input
                    type="datetime-local"
                    value={formatDateForInput(localFilters.timeRange?.to)}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    disabled={!isConnected}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                disabled={!isConnected}
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Reset All
              </button>
            </div>

            {/* Active Filters Summary */}
            {Object.keys(localFilters).length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <h4 className="font-medium mb-2">Active Filters</h4>
                <div className="text-sm space-y-1">
                  {localFilters.minValue && (
                    <div>Min Value: {(parseFloat(localFilters.minValue) / 1e18).toFixed(4)} ETH</div>
                  )}
                  {localFilters.maxValue && (
                    <div>Max Value: {(parseFloat(localFilters.maxValue) / 1e18).toFixed(4)} ETH</div>
                  )}
                  {localFilters.chains && localFilters.chains.length > 0 && (
                    <div>Chains: {localFilters.chains.join(', ')}</div>
                  )}
                  {localFilters.contractTypes && localFilters.contractTypes.length > 0 && (
                    <div>Types: {localFilters.contractTypes.join(', ')}</div>
                  )}
                  {localFilters.methods && localFilters.methods.length > 0 && (
                    <div>Methods: {localFilters.methods.join(', ')}</div>
                  )}
                  {localFilters.timeRange?.from && (
                    <div>From: {new Date(localFilters.timeRange.from).toLocaleDateString()}</div>
                  )}
                  {localFilters.timeRange?.to && (
                    <div>To: {new Date(localFilters.timeRange.to).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}