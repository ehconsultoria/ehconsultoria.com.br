import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultData from '../data/cms-data.json';

const CMSContext = createContext();

const PALETTES = {
  'turquoise-corp': {
    primary: '#0093b8',
    primaryDark: '#007694',
    primaryLight: '#33a9c6',
    accent: '#1e1e1e',
    accentDark: '#121212',
    accentLight: '#2d2d2d',
    bgLight: '#f8fafc',
    bgDark: '#0f172a'
  },
  'ocean-serene': {
    primary: '#0284c7',
    primaryDark: '#0369a1',
    primaryLight: '#38bdf8',
    accent: '#0f172a',
    accentDark: '#020617',
    accentLight: '#1e293b',
    bgLight: '#f8fafc',
    bgDark: '#0f172a'
  },
  'forest-relax': {
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryLight: '#2dd4bf',
    accent: '#111827',
    accentDark: '#030712',
    accentLight: '#1f2937',
    bgLight: '#f9fafb',
    bgDark: '#111827'
  },
  'charcoal-luxury': {
    primary: '#4b5563',
    primaryDark: '#1f2937',
    primaryLight: '#9ca3af',
    accent: '#8b5cf6',
    accentDark: '#6d28d9',
    accentLight: '#a78bfa',
    bgLight: '#fafafa',
    bgDark: '#18181b'
  }
};

const FONTS = {
  'outfit-inter': {
    heading: "'Outfit', sans-serif",
    body: "'Inter', sans-serif"
  },
  'playfair-lato': {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif"
  },
  'montserrat-roboto': {
    heading: "'Outfit', sans-serif",
    body: "'Inter', sans-serif"
  }
};

export const CMSProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('eh_cms_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed };
      } catch (e) {
        console.error("Error parsing saved config:", e);
      }
    }
    return defaultData;
  });

  // Apply visual theme variables
  useEffect(() => {
    if (!data.theme) return;
    const palette = PALETTES[data.theme.activePalette] || PALETTES['turquoise-corp'];
    const font = FONTS[data.theme.activeFontPair] || FONTS['outfit-inter'];

    const root = document.documentElement;
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-dark', palette.primaryDark);
    root.style.setProperty('--color-primary-light', palette.primaryLight);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-accent-dark', palette.accentDark);
    root.style.setProperty('--color-accent-light', palette.accentLight);
    root.style.setProperty('--color-bg-light', palette.bgLight);
    
    root.style.setProperty('--font-heading', font.heading);
    root.style.setProperty('--font-body', font.body);
  }, [data.theme]);

  // Update a nested configuration key in the React state
  const updateField = (section, field, value) => {
    setData(prev => {
      const updatedSection = { ...prev[section] };
      if (typeof field === 'string') {
        updatedSection[field] = value;
      } else if (Array.isArray(field)) {
        let current = updatedSection;
        for (let i = 0; i < field.length - 1; i++) {
          current[field[i]] = { ...current[field[i]] };
          current = current[field[i]];
        }
        current[field[field.length - 1]] = value;
      }
      return {
        ...prev,
        [section]: updatedSection
      };
    });
  };

  // Save config (posts layout to localstorage and triggers the server-side API `/api/save-config`)
  const saveConfiguration = async (configToSave = data) => {
    localStorage.setItem('eh_cms_config', JSON.stringify(configToSave));
    
    let localSaveSuccess = false;
    let gitSaveSuccess = false;

    // Send payload to backend edge API (which handles saving to local dev file or committing to GitHub)
    try {
      const response = await fetch('/api/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave, null, 2),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        localSaveSuccess = true;
        if (result.gitSuccess) {
          gitSaveSuccess = true;
        }
      } else {
        throw new Error(result.error || 'Erro ao salvar alterações no servidor.');
      }
    } catch (error) {
      console.warn("Save API failed or simulated.", error);
      // In local fallback or warning, bubble up if it's a real API error
      if (error.message && error.message.includes('GITHUB_TOKEN')) {
        throw error;
      }
    }

    return { localSaveSuccess, gitSaveSuccess };
  };

  const resetToDefault = () => {
    setData(defaultData);
    localStorage.removeItem('eh_cms_config');
    saveConfiguration(defaultData);
  };

  return (
    <CMSContext.Provider value={{ 
      data, 
      updateField, 
      saveConfiguration, 
      resetToDefault, 
      palettes: PALETTES, 
      fontPairs: FONTS 
    }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
