import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_PRESETS } from '../data/mockAnalysis';

const AppContext = createContext();

const STORAGE_KEYS = {
  SAVED_SHADES: 'tmm_saved_shades',
  ANALYSIS_RESULT: 'tmm_current_analysis',
  ANALYSIS_HISTORY: 'tmm_analysis_history',
  PREFERENCES: 'tmm_user_preferences',
};

const DEFAULT_PREFERENCES = {
  skinType: 'Combination',
  undertone: 'warm',
  budgetMaxPKR: 10000,
  preferredFinish: 'Luminous Matte',
  pakistaniBrandsOnly: false,
  climateRegion: 'Punjab / Sindh (Warm & Humid)',
};

export const AppProvider = ({ children }) => {
  // 1. Saved shades state with localStorage fallback
  const [savedShades, setSavedShades] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_SHADES);
      if (stored) return JSON.parse(stored);
      // Pre-seed with 2 initial demo favorites for rich first-time UI
      return [
        {
          productId: 'fnd-mm-01',
          productBrand: 'Masarrat Misbah',
          productName: 'Silk Foundation',
          productPricePKR: 4950,
          productImage: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&auto=format&fit=crop&q=80',
          shadeId: 'mm-01-beige',
          shadeName: 'Warm Beige',
          hexColor: '#D8AE88',
          undertone: 'warm',
          monkScale: 'MST 05',
          skinToneCategory: 'Medium',
          savedAt: new Date().toISOString(),
        },
        {
          productId: 'fnd-mayb-02',
          productBrand: 'Maybelline New York',
          productName: 'Fit Me Matte + Poreless',
          productPricePKR: 3450,
          productImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
          shadeId: 'mayb-220',
          shadeName: '220 Natural Beige',
          hexColor: '#D3A37C',
          undertone: 'warm',
          monkScale: 'MST 05',
          skinToneCategory: 'Medium',
          savedAt: new Date().toISOString(),
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // 2. Current analysis result state
  const [currentAnalysis, setCurrentAnalysis] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS_RESULT);
      return stored ? JSON.parse(stored) : DEMO_PRESETS[0]; // Default to Wheatish Warm Demo
    } catch (e) {
      return DEMO_PRESETS[0];
    }
  });

  // 3. Analysis history
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
      if (stored) return JSON.parse(stored);
      return [
        {
          id: 'hist-demo-01',
          date: 'Yesterday, 3:45 PM',
          presetName: 'Wheatish Warm Analysis (Natural Daylight)',
          skinTone: 'Medium (Wheatish)',
          undertone: 'warm',
          monkScale: 'MST 05',
          hexSample: '#CB986C',
          confidenceScore: 94.8,
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // 4. User preferences
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch (e) {
      return DEFAULT_PREFERENCES;
    }
  });

  // 5. Toast Notifications system
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync savedShades to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_SHADES, JSON.stringify(savedShades));
    } catch (e) {
      console.warn('Failed to sync saved shades to localStorage', e);
    }
  }, [savedShades]);

  // Sync current analysis
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_RESULT, JSON.stringify(currentAnalysis));
    } catch (e) {
      console.warn('Failed to sync current analysis to localStorage', e);
    }
  }, [currentAnalysis]);

  // Sync analysis history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(analysisHistory));
    } catch (e) {
      console.warn('Failed to sync history to localStorage', e);
    }
  }, [analysisHistory]);

  // Sync preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to sync preferences to localStorage', e);
    }
  }, [preferences]);

  // Toggle save shade handler
  const toggleSaveShade = useCallback((product, shade) => {
    setSavedShades((prev) => {
      const exists = prev.some((item) => item.shadeId === shade.shadeId);
      if (exists) {
        addToast(`Removed ${shade.name} from saved shades`, 'info');
        return prev.filter((item) => item.shadeId !== shade.shadeId);
      } else {
        addToast(`Saved ${shade.name} (${product.brand}) to your collection`, 'success');
        return [
          {
            productId: product.id,
            productBrand: product.brand,
            productName: product.name,
            productPricePKR: product.pricePKR,
            productImage: product.image,
            shadeId: shade.shadeId,
            shadeName: shade.name,
            hexColor: shade.hexColor,
            undertone: shade.undertone,
            monkScale: shade.monkScale,
            skinToneCategory: shade.skinToneCategory,
            savedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      }
    });
  }, [addToast]);

  const isShadeSaved = useCallback((shadeId) => {
    return savedShades.some((item) => item.shadeId === shadeId);
  }, [savedShades]);

  // Update current analysis and push to history
  const saveNewAnalysis = useCallback((newResult) => {
    setCurrentAnalysis(newResult);
    const historyEntry = {
      id: 'scan-' + Date.now(),
      date: 'Just now',
      presetName: newResult.name,
      skinTone: newResult.skinTone,
      undertone: newResult.undertone,
      monkScale: newResult.monkScale,
      hexSample: newResult.hexSample,
      confidenceScore: newResult.confidenceScore,
    };
    setAnalysisHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
    addToast(`New skin tone profile generated: ${newResult.skinTone}`, 'success');
  }, [addToast]);

  // Reset/Clear all stored mock data
  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_SHADES);
      localStorage.removeItem(STORAGE_KEYS.ANALYSIS_RESULT);
      localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      setSavedShades([]);
      setCurrentAnalysis(DEMO_PRESETS[0]);
      setAnalysisHistory([]);
      setPreferences(DEFAULT_PREFERENCES);
      addToast('All demo data and saved preferences have been reset.', 'info');
    } catch (e) {
      console.warn('Error clearing data', e);
    }
  }, [addToast]);

  // 5. Desktop Workstation Live Skin Analysis State
  const [liveAnalysis, setLiveAnalysis] = useState(() => {
    return {
      lab: { L: 62.4, a: 14.2, b: 19.8 },
      ita: 32.6,
      monkScale: 5,
      undertone: 'Warm Olive',
      hex: '#d29d6e',
      bestDelta: '1.12',
      bestMatchBrand: 'Maybelline Fit Me',
      bestMatchShade: '220 Natural Beige',
      bestMatchScore: '93.3%',
    };
  });

  const updateFromLiveCapture = useCallback((sample) => {
    const { lab, ita, monkScale, undertone, hex } = sample;
    // Calculate best delta against standard reference
    const delta = (Math.abs(lab.L - 62.1) * 0.3 + Math.abs(lab.a - 14.8) * 0.3 + Math.abs(lab.b - 20.3) * 0.4).toFixed(2);
    const score = Math.max(75, Math.min(98.5, +(100 - Number(delta) * 5.5).toFixed(1)));
    
    setLiveAnalysis({
      lab,
      ita,
      monkScale,
      undertone,
      hex,
      bestDelta: delta > 0.5 ? delta : '1.12',
      bestMatchBrand: 'Maybelline Fit Me',
      bestMatchShade: '220 Natural Beige',
      bestMatchScore: `${score}%`,
      lastUpdated: new Date().toLocaleTimeString(),
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        savedShades,
        toggleSaveShade,
        isShadeSaved,
        currentAnalysis,
        saveNewAnalysis,
        analysisHistory,
        preferences,
        setPreferences,
        clearAllData,
        toasts,
        addToast,
        removeToast,
        liveAnalysis,
        setLiveAnalysis,
        updateFromLiveCapture,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
