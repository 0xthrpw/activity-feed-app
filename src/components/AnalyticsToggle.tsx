import { useUI } from '../contexts/UIContext';

export default function AnalyticsToggle() {
  const { viewMode, toggleViewMode } = useUI();
  
  const isAnalyticsMode = viewMode === 'analytics';

  return (
    <div className="settings-button-container" style={{ margin: '48px 0 0 0' }}>
      <button
        onClick={toggleViewMode}
        className={`w-10 h-10 border border-gray-300 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isAnalyticsMode
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-white hover:bg-gray-50'
        }`}
        title={isAnalyticsMode ? 'Analytics Mode: ON' : 'Analytics Mode: OFF'}
      >
        📊
      </button>
    </div>
  );
}