import { useUI } from '../contexts/UIContext';

export default function ViewModeToggle() {
  const { viewMode, toggleViewMode } = useUI();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white border rounded-lg shadow-lg p-2 flex items-center">
        <span className="text-sm font-medium mr-3">View Mode:</span>
        <button
          onClick={toggleViewMode}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'normal'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Normal
        </button>
        <button
          onClick={toggleViewMode}
          className={`ml-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'analytics'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Analytics
        </button>
      </div>
      
      {viewMode === 'analytics' && (
        <div className="mt-2 bg-purple-100 border border-purple-300 rounded-lg p-3 text-sm">
          <div className="font-medium text-purple-800 mb-1">Analytics Mode Active</div>
          <div className="text-purple-700">
            • Click timestamps to view transaction analytics<br/>
            • Click addresses to view address analytics<br/>
            • Cards are highlighted in blue
          </div>
        </div>
      )}
    </div>
  );
}