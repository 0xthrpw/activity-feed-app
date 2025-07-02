import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ViewMode } from '../types';

interface UIState {
  viewMode: ViewMode;
  isAnalyticsModalOpen: boolean;
  analyticsModalType: 'transaction' | 'address' | null;
  analyticsModalData: unknown;
  isConnectionControlsOpen: boolean;
  isFilterPanelOpen: boolean;
  selectedTransactionHash: string | null;
  selectedAddress: string | null;
}

type UIAction =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'OPEN_ANALYTICS_MODAL'; payload: { type: 'transaction' | 'address'; data: unknown } }
  | { type: 'CLOSE_ANALYTICS_MODAL' }
  | { type: 'TOGGLE_CONNECTION_CONTROLS' }
  | { type: 'TOGGLE_FILTER_PANEL' }
  | { type: 'SET_SELECTED_TRANSACTION'; payload: string | null }
  | { type: 'SET_SELECTED_ADDRESS'; payload: string | null }
  | { type: 'RESET_UI' };

const initialState: UIState = {
  viewMode: 'normal',
  isAnalyticsModalOpen: false,
  analyticsModalType: null,
  analyticsModalData: null,
  isConnectionControlsOpen: false,
  isFilterPanelOpen: false,
  selectedTransactionHash: null,
  selectedAddress: null
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { 
        ...state, 
        viewMode: action.payload,
        // Close modals when switching modes
        isAnalyticsModalOpen: false,
        analyticsModalType: null,
        analyticsModalData: null
      };
    
    case 'OPEN_ANALYTICS_MODAL':
      return {
        ...state,
        isAnalyticsModalOpen: true,
        analyticsModalType: action.payload.type,
        analyticsModalData: action.payload.data
      };
    
    case 'CLOSE_ANALYTICS_MODAL':
      return {
        ...state,
        isAnalyticsModalOpen: false,
        analyticsModalType: null,
        analyticsModalData: null
      };
    
    case 'TOGGLE_CONNECTION_CONTROLS':
      return {
        ...state,
        isConnectionControlsOpen: !state.isConnectionControlsOpen,
        // Close filter panel when opening connection controls
        isFilterPanelOpen: state.isConnectionControlsOpen ? state.isFilterPanelOpen : false
      };
    
    case 'TOGGLE_FILTER_PANEL':
      return {
        ...state,
        isFilterPanelOpen: !state.isFilterPanelOpen,
        // Close connection controls when opening filter panel
        isConnectionControlsOpen: state.isFilterPanelOpen ? state.isConnectionControlsOpen : false
      };
    
    case 'SET_SELECTED_TRANSACTION':
      return { ...state, selectedTransactionHash: action.payload };
    
    case 'SET_SELECTED_ADDRESS':
      return { ...state, selectedAddress: action.payload };
    
    case 'RESET_UI':
      return initialState;
    
    default:
      return state;
  }
}

interface UIContextValue {
  // State
  viewMode: ViewMode;
  isAnalyticsModalOpen: boolean;
  analyticsModalType: 'transaction' | 'address' | null;
  analyticsModalData: unknown;
  isConnectionControlsOpen: boolean;
  isFilterPanelOpen: boolean;
  selectedTransactionHash: string | null;
  selectedAddress: string | null;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  openAnalyticsModal: (type: 'transaction' | 'address', data: unknown) => void;
  closeAnalyticsModal: () => void;
  toggleConnectionControls: () => void;
  toggleFilterPanel: () => void;
  setSelectedTransaction: (hash: string | null) => void;
  setSelectedAddress: (address: string | null) => void;
  resetUI: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const toggleViewMode = useCallback(() => {
    const newMode = state.viewMode === 'normal' ? 'analytics' : 'normal';
    dispatch({ type: 'SET_VIEW_MODE', payload: newMode });
  }, [state.viewMode]);

  const openAnalyticsModal = useCallback((type: 'transaction' | 'address', data: unknown) => {
    dispatch({ type: 'OPEN_ANALYTICS_MODAL', payload: { type, data } });
  }, []);

  const closeAnalyticsModal = useCallback(() => {
    dispatch({ type: 'CLOSE_ANALYTICS_MODAL' });
  }, []);

  const toggleConnectionControls = useCallback(() => {
    dispatch({ type: 'TOGGLE_CONNECTION_CONTROLS' });
  }, []);

  const toggleFilterPanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILTER_PANEL' });
  }, []);

  const setSelectedTransaction = useCallback((hash: string | null) => {
    dispatch({ type: 'SET_SELECTED_TRANSACTION', payload: hash });
  }, []);

  const setSelectedAddress = useCallback((address: string | null) => {
    dispatch({ type: 'SET_SELECTED_ADDRESS', payload: address });
  }, []);

  const resetUI = useCallback(() => {
    dispatch({ type: 'RESET_UI' });
  }, []);

  const contextValue: UIContextValue = {
    // State
    viewMode: state.viewMode,
    isAnalyticsModalOpen: state.isAnalyticsModalOpen,
    analyticsModalType: state.analyticsModalType,
    analyticsModalData: state.analyticsModalData,
    isConnectionControlsOpen: state.isConnectionControlsOpen,
    isFilterPanelOpen: state.isFilterPanelOpen,
    selectedTransactionHash: state.selectedTransactionHash,
    selectedAddress: state.selectedAddress,
    
    // Actions
    setViewMode,
    toggleViewMode,
    openAnalyticsModal,
    closeAnalyticsModal,
    toggleConnectionControls,
    toggleFilterPanel,
    setSelectedTransaction,
    setSelectedAddress,
    resetUI
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}