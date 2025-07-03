import { useUI } from '../contexts/UIContext';

export default function SettingsMenu() {
  const { toggleConnectionControls } = useUI();

  return (
    <div className="settings-button-container">
      <button
        onClick={toggleConnectionControls}
        className="w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Connection Settings"
      >
        ⚙️
      </button>
    </div>
  );
}