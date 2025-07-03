import { useState, useEffect } from 'react';
import { useFeed } from '../contexts/FeedContext';
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

export default function FilterControls() {
  const { 
    filters, 
    setFilters, 
    connectionStatus 
  } = useFeed();
  
  const [localFilters, setLocalFilters] = useState<MultiplexFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const isConnected = connectionStatus === 'connected';

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
    <div className="space-y-4">
      {/* Value Filters */}
      <div>
        <h4 className="font-medium mb-2 text-sm">Value Range (ETH)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">Min Value</label>
            <input
              type="number"
              step="0.001"
              value={localFilters.minValue ? parseFloat(localFilters.minValue) / 1e18 : ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                minValue: e.target.value ? (parseFloat(e.target.value) * 1e18).toString() : undefined
              })}
              placeholder="0.001"
              className="w-full p-1.5 border rounded text-xs"
              disabled={!isConnected}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Max Value</label>
            <input
              type="number"
              step="0.001"
              value={localFilters.maxValue ? parseFloat(localFilters.maxValue) / 1e18 : ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                maxValue: e.target.value ? (parseFloat(e.target.value) * 1e18).toString() : undefined
              })}
              placeholder="1000"
              className="w-full p-1.5 border rounded text-xs"
              disabled={!isConnected}
            />
          </div>
        </div>
      </div>

      {/* Chain Filters */}
      <div>
        <h4 className="font-medium mb-2 text-sm">Chains</h4>
        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
          {CHAIN_OPTIONS.map(chain => (
            <label key={chain.id} className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={localFilters.chains?.includes(chain.id) || false}
                onChange={() => handleChainToggle(chain.id)}
                className="mr-1.5 scale-75"
                disabled={!isConnected}
              />
              <span>{chain.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Contract Type & Methods in a row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contract Type Filters */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Contract Types</h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {CONTRACT_TYPES.map(type => (
              <label key={type} className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={localFilters.contractTypes?.includes(type) || false}
                  onChange={() => handleContractTypeToggle(type)}
                  className="mr-1.5 scale-75"
                  disabled={!isConnected}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Method Filters */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Methods</h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {COMMON_METHODS.map(method => (
              <label key={method} className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={localFilters.methods?.includes(method) || false}
                  onChange={() => handleMethodToggle(method)}
                  className="mr-1.5 scale-75"
                  disabled={!isConnected}
                />
                <span>{method}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Time Range Filters */}
      <div>
        <h4 className="font-medium mb-2 text-sm">Time Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">From</label>
            <input
              type="datetime-local"
              value={formatDateForInput(localFilters.timeRange?.from)}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="w-full p-1.5 border rounded text-xs"
              disabled={!isConnected}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">To</label>
            <input
              type="datetime-local"
              value={formatDateForInput(localFilters.timeRange?.to)}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="w-full p-1.5 border rounded text-xs"
              disabled={!isConnected}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2 border-t">
        <button
          onClick={handleApplyFilters}
          className="flex-1 bg-blue-500 text-white py-1.5 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
          disabled={!isConnected}
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="flex-1 bg-gray-500 text-white py-1.5 rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {/* Active Filters Summary */}
      {Object.keys(localFilters).length > 0 && (
        <div className="mt-3 p-2 bg-gray-100 rounded">
          <h5 className="font-medium mb-1 text-xs">Active Filters</h5>
          <div className="text-xs space-y-0.5 text-gray-700">
            {localFilters.minValue && (
              <div>Min: {(parseFloat(localFilters.minValue) / 1e18).toFixed(4)} ETH</div>
            )}
            {localFilters.maxValue && (
              <div>Max: {(parseFloat(localFilters.maxValue) / 1e18).toFixed(4)} ETH</div>
            )}
            {localFilters.chains && localFilters.chains.length > 0 && (
              <div>Chains: {localFilters.chains.length} selected</div>
            )}
            {localFilters.contractTypes && localFilters.contractTypes.length > 0 && (
              <div>Types: {localFilters.contractTypes.length} selected</div>
            )}
            {localFilters.methods && localFilters.methods.length > 0 && (
              <div>Methods: {localFilters.methods.length} selected</div>
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
  );
}