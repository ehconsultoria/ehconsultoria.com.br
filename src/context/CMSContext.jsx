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

  // GitHub credentials stored strictly in administrator browser local storage
  const [gitConfig, setGitConfig] = useState(() => {
    const saved = localStorage.getItem('eh_github_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing GitHub config:", e);
      }
    }
    return {
      token: '',
      repo: 'ehconsultoria.com.br',
      owner: 'ehconsultoria',
      branch: 'main'
    };
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

  // Helper to commit directly to GitHub via REST API
  const commitToGitHub = async (configToSave) => {
    const { token, owner, repo, branch } = gitConfig;
    if (!token || !owner || !repo) {
      throw new Error("Credenciais do GitHub incompletas. Insira o token, proprietário e repositório nas configurações.");
    }

    const filePath = 'src/data/cms-data.json';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    // 1. Fetch current file to get the SHA hash (required by GitHub API to update files)
    let currentSha = '';
    try {
      const getResponse = await fetch(`${apiUrl}?ref=${branch}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getResponse.ok) {
        const getResult = await getResponse.json();
        currentSha = getResult.sha;
      }
    } catch (err) {
      console.warn("Could not retrieve current SHA from GitHub. Attempting direct write.", err);
    }

    // Convert UTF-8 JSON to base64 properly
    const jsonStr = JSON.stringify(configToSave, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));

    // 2. Commit the changes
    const payload = {
      message: 'chore(cms): update website content from admin panel',
      content: base64Content,
      branch
    };
    if (currentSha) {
      payload.sha = currentSha;
    }

    const putResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(payload)
    });

    if (!putResponse.ok) {
      const errResult = await putResponse.json();
      throw new Error(errResult.message || "Erro desconhecido ao enviar arquivo para o GitHub");
    }

    return true;
  };

  // Save config (local storage, local dev api, and GitHub API commit)
  const saveConfiguration = async (configToSave = data) => {
    localStorage.setItem('eh_cms_config', JSON.stringify(configToSave));
    
    let localSaveSuccess = false;
    let gitSaveSuccess = false;

    // 1. Try local dev API rewrite
    try {
      const response = await fetch('/api/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave, null, 2),
      });
      if (response.ok) {
        localSaveSuccess = true;
        console.log("Configuration saved successfully to local file.");
      }
    } catch (error) {
      // API not available, normal in production
    }

    // 2. Try direct GitHub commit if credentials are set
    if (gitConfig.token) {
      try {
        await commitToGitHub(configToSave);
        gitSaveSuccess = true;
        console.log("Configuration committed directly to GitHub repository.");
      } catch (err) {
        console.error("Error committing to GitHub:", err);
        throw err; // bubble up git errors to alert the user
      }
    }

    return { localSaveSuccess, gitSaveSuccess };
  };

  const updateGitConfig = (newConfig) => {
    setGitConfig(newConfig);
    localStorage.setItem('eh_github_config', JSON.stringify(newConfig));
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
      gitConfig, 
      updateGitConfig, 
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
