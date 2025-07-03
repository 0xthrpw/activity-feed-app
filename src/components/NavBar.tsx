import { useUI } from '../contexts/UIContext';
import { useFeed } from '../contexts/FeedContext';

export default function NavBar() {
  const { viewMode, toggleViewMode, toggleConnectionControls, toggleFilterPanel } = useUI();
  const { connectionConfig, filters } = useFeed();
  
  const isAnalyticsMode = viewMode === 'analytics';
  const isMultiplexMode = connectionConfig?.mode === 'multiplex';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-40">
      <div className="px-6 py-3">
        <div className="flex items-center space-x-5">
          {/* Connection Settings Button */}
          <button 
            onClick={toggleConnectionControls}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow-sm text-sm font-medium transition-colors"
          >
            Connection Settings
          </button>

          {/* Analytics Mode Toggle */}
          <button
            onClick={toggleViewMode}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center shadow-sm ${
              isAnalyticsMode
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-2">📊</span>
            Analytics Mode
            {isAnalyticsMode && <span className="ml-2">✓</span>}
          </button>

          {/* Filters Button */}
          <button 
            onClick={toggleFilterPanel}
            className={`px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors ${
              isMultiplexMode 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            disabled={!isMultiplexMode}
            title={!isMultiplexMode ? 'Filters are only available in Multiplex mode' : 'Open Filter Panel'}
          >
            Filters
            {isMultiplexMode && Object.keys(filters).length > 0 && (
              <span className="ml-2 bg-white text-green-500 px-1.5 py-0.5 rounded-full text-xs font-bold">
                {Object.keys(filters).length}
              </span>
            )}
          </button>

          {/* Status Indicator */}
          <div className="flex-1"></div>
          {isAnalyticsMode && (
            <div className="bg-purple-100 border border-purple-300 rounded px-3 py-1 text-sm text-purple-800">
              📊 Analytics Mode Active
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}