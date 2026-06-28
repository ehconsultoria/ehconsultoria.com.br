import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { 
  LogOut, Save, Download, RotateCcw, ArrowLeft, 
  Layout, Palette, Image as ImageIcon, Settings, 
  Trash2, Plus, Check, AlertTriangle, Eye, EyeOff,
  Github, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

// Help component for link target configuration
function LinkConfigInput({ label, value, onChange }) {
  const [type, setType] = useState(value?.type || 'internal');
  const [urlValue, setUrlValue] = useState(value?.value || '');
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    let defaultVal = newType === 'internal' ? '#contato' : 'https://';
    setUrlValue(defaultVal);
    onChange({ type: newType, value: defaultVal });
    setError('');
  };

  const handleValChange = (val) => {
    setUrlValue(val);
    if (type === 'external') {
      if (!val.startsWith('https://')) {
        setError('O link externo deve obrigatoriamente iniciar com https://');
      } else {
        setError('');
      }
    } else {
      setError('');
    }
    onChange({ type, value: val });
  };

  return (
    <div className="space-y-2 border border-slate-100 bg-slate-50/70 p-4 rounded-xl">
      <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">{label}</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer">
          <input
            type="radio"
            checked={type === 'internal'}
            onChange={() => handleTypeChange('internal')}
            className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          Link Interno (Âncora)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer">
          <input
            type="radio"
            checked={type === 'external'}
            onChange={() => handleTypeChange('external')}
            className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          Link Externo
        </label>
      </div>

      <div>
        {type === 'internal' ? (
          <select
            value={urlValue}
            onChange={(e) => handleValChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="#solucoes">#solucoes (Seção Soluções)</option>
            <option value="#diferenciais">#diferenciais (Seção Diferenciais)</option>
            <option value="#sobre">#sobre (Seção Sobre Nós)</option>
            <option value="#blog">#blog (Seção Blog & Mídia)</option>
            <option value="#faq">#faq (Seção Dúvidas Frequentes)</option>
            <option value="#contato">#contato (Seção Formulário de Contato)</option>
          </select>
        ) : (
          <div className="space-y-1">
            <input
              type="text"
              value={urlValue}
              onChange={(e) => handleValChange(e.target.value)}
              placeholder="https://exemplo.com"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                error ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-100' : 'border-slate-200 focus:border-[var(--color-primary)]'
              }`}
            />
            {error && <span className="block text-xs text-red-500 font-medium">{error}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// Collapsible editor section
function CollapsibleSection({ title, isOpen, onToggle, children, isVisible, onToggleVisible }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100 select-none">
        <div className="flex items-center gap-3 cursor-pointer flex-grow" onClick={onToggle}>
          {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
          <h4 className="font-heading font-bold text-base text-zinc-950">{title}</h4>
        </div>
        
        {onToggleVisible && (
          <button
            onClick={onToggleVisible}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 text-zinc-500 transition-colors"
            title={isVisible ? 'Ocultar Seção no Site' : 'Mostrar Seção no Site'}
          >
            {isVisible ? <Eye className="w-4.5 h-4.5 text-[var(--color-primary)]" /> : <EyeOff className="w-4.5 h-4.5 text-zinc-300" />}
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="p-6 space-y-6 border-t border-slate-50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({ onNavigate }) {
  const { data, updateField, saveConfiguration, resetToDefault, gitConfig, updateGitConfig, palettes, fontPairs } = useCMS();

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('eh_admin_logged') === 'true';
  });
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // CMS active tab
  const [activeTab, setActiveTab] = useState('content');
  const [openSections, setOpenSections] = useState({
    header: true,
    hero: false,
    solutions: false,
    differentials: false,
    achievements: false,
    about: false,
    blog: false,
    faq: false,
    contact: false
  });

  const [saveStatus, setSaveStatus] = useState({ success: false, gitSuccess: false, error: null, submitting: false });

  // Handle Login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'ehadmin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('eh_admin_logged', 'true');
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('eh_admin_logged');
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Save changes wrapper
  const handleSave = async () => {
    setSaveStatus({ success: false, gitSuccess: false, error: null, submitting: true });
    try {
      const { localSaveSuccess, gitSaveSuccess } = await saveConfiguration();
      setSaveStatus({ 
        success: true, 
        gitSuccess: gitSaveSuccess, 
        error: null, 
        submitting: false 
      });
      setTimeout(() => setSaveStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setSaveStatus({ 
        success: false, 
        gitSuccess: false, 
        error: err.message || 'Ocorreu um erro ao salvar as alterações', 
        submitting: false 
      });
    }
  };

  // Reset to default wrapper
  const handleReset = () => {
    if (window.confirm("Deseja realmente restaurar todos os textos e estilos originais? Isso apagará as alterações atuais.")) {
      resetToDefault();
      setSaveStatus({ success: true, gitSuccess: false, error: null, submitting: false });
      setTimeout(() => setSaveStatus(prev => ({ ...prev, success: false })), 3000);
    }
  };

  // Export JSON file config for Git-based CMS workflow
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "cms-data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Login view fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <img src="/assets/logo.png" alt="Logo" className="h-14 w-auto mx-auto object-contain" />
            <h1 className="text-2xl font-bold text-zinc-950 font-heading">Painel de Login CMS</h1>
            <p className="text-sm text-zinc-500">EH Consultoria em Saúde Mental</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-700 rounded-lg">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Usuário</label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-[var(--color-primary)] outline-none text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Senha</label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-[var(--color-primary)] outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-all duration-300 shadow-md text-sm"
            >
              Acessar Painel
            </button>
          </form>

          <div className="pt-2 text-center">
            <button 
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[var(--color-primary)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* CMS Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-45 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="EH" className="h-8 w-auto" />
          <h2 className="font-heading font-extrabold text-lg text-zinc-900">
            Painel Administrativo <span className="text-[var(--color-primary)] font-normal text-sm">CMS</span>
          </h2>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saveStatus.submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm disabled:opacity-50 transition-all"
            title="Salvar alterações"
          >
            <Save className="w-4 h-4" />
            {saveStatus.submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-all"
            title="Baixar cms-data.json"
          >
            <Download className="w-4 h-4" />
            Exportar JSON
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Restaurar originais"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all"
          >
            <Eye className="w-4 h-4" />
            Ver Site
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-slate-100 rounded-lg transition-all"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row items-stretch">
        {/* Sidebar tabs selection */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'content'
                ? 'bg-cyan-50 text-[var(--color-primary)]'
                : 'text-zinc-600 hover:bg-slate-50'
            }`}
          >
            <Layout className="w-4 h-4" />
            Conteúdo das Seções
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'theme'
                ? 'bg-cyan-50 text-[var(--color-primary)]'
                : 'text-zinc-600 hover:bg-slate-50'
            }`}
          >
            <Palette className="w-4 h-4" />
            Tema & Tipografia
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'github'
                ? 'bg-cyan-50 text-[var(--color-primary)]'
                : 'text-zinc-600 hover:bg-slate-50'
            }`}
          >
            <Github className="w-4 h-4" />
            Integração GitHub
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-cyan-50 text-[var(--color-primary)]'
                : 'text-zinc-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            E-mails & Geral
          </button>
        </aside>

        {/* Content area based on selected tab */}
        <main className="flex-grow p-6 sm:p-8 max-w-4xl overflow-y-auto">
          {saveStatus.success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex flex-col gap-1.5 animate-slide-up text-sm font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                Alterações salvas localmente com sucesso!
              </div>
              {gitConfig.token && saveStatus.gitSuccess && (
                <div className="text-xs text-green-700 pl-6 font-semibold">
                  🚀 Alterações enviadas para o seu repositório GitHub! A Cloudflare foi notificada e o site está sendo atualizado agora.
                </div>
              )}
            </div>
          )}

          {saveStatus.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 animate-slide-up text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              {saveStatus.error}
            </div>
          )}

          {/* TAB 1: Content editing */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">Editar Conteúdo do Site</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure o conteúdo textual e interativo de cada bloco da Landing Page.</p>
              </div>

              {/* 1. Header Editor */}
              <CollapsibleSection title="Cabeçalho (Header)" isOpen={openSections.header} onToggle={() => toggleSection('header')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Texto do Botão CTA</label>
                    <input
                      type="text"
                      value={data.header.ctaText}
                      onChange={(e) => updateField('header', 'ctaText', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="logo-visible"
                      checked={data.header.logoVisible}
                      onChange={(e) => updateField('header', 'logoVisible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <label htmlFor="logo-visible" className="text-sm text-zinc-700 font-semibold cursor-pointer">Mostrar Logotipo</label>
                  </div>
                </div>
                <LinkConfigInput
                  label="Destino do Botão CTA do Header"
                  value={data.header.ctaLink}
                  onChange={(val) => updateField('header', 'ctaLink', val)}
                />
              </CollapsibleSection>

              {/* 2. Hero Editor */}
              <CollapsibleSection 
                title="Seção Inicial (Hero)" 
                isOpen={openSections.hero} 
                onToggle={() => toggleSection('hero')}
                isVisible={data.hero.visible}
                onToggleVisible={() => updateField('hero', 'visible', !data.hero.visible)}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título Principal</label>
                    <input
                      type="text"
                      value={data.hero.title}
                      onChange={(e) => updateField('hero', 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo de Impacto</label>
                    <textarea
                      rows={3}
                      value={data.hero.subtitle}
                      onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Texto do Botão</label>
                    <input
                      type="text"
                      value={data.hero.ctaText}
                      onChange={(e) => updateField('hero', 'ctaText', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">URL da Imagem</label>
                    <input
                      type="text"
                      value={data.hero.imageUrl}
                      onChange={(e) => updateField('hero', 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <LinkConfigInput
                    label="Destino do Botão Hero"
                    value={data.hero.ctaLink}
                    onChange={(val) => updateField('hero', 'ctaLink', val)}
                  />
                </div>
              </CollapsibleSection>

              {/* 3. Solutions Editor */}
              <CollapsibleSection 
                title="Seção Programas & Soluções (Carrossel)" 
                isOpen={openSections.solutions} 
                onToggle={() => toggleSection('solutions')}
                isVisible={data.solutions.visible}
                onToggleVisible={() => updateField('solutions', 'visible', !data.solutions.visible)}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título da Seção</label>
                    <input
                      type="text"
                      value={data.solutions.title}
                      onChange={(e) => updateField('solutions', 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo</label>
                    <input
                      type="text"
                      value={data.solutions.subtitle}
                      onChange={(e) => updateField('solutions', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  
                  {/* Item Cards Titles editing */}
                  <div className="space-y-4 pt-2">
                    <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Cards de Solução</span>
                    {data.solutions.items.map((item, idx) => (
                      <div key={item.id} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-400">Card #{idx + 1}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Título do Card</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updatedItems = [...data.solutions.items];
                                updatedItems[idx].title = e.target.value;
                                updateField('solutions', 'items', updatedItems);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">URL Imagem</label>
                            <input
                              type="text"
                              value={item.imageUrl}
                              onChange={(e) => {
                                const updatedItems = [...data.solutions.items];
                                updatedItems[idx].imageUrl = e.target.value;
                                updateField('solutions', 'items', updatedItems);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Descrição</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const updatedItems = [...data.solutions.items];
                              updatedItems[idx].description = e.target.value;
                              updateField('solutions', 'items', updatedItems);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs resize-none"
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Texto do Link</label>
                            <input
                              type="text"
                              value={item.ctaText || 'Saber Mais'}
                              onChange={(e) => {
                                const updatedItems = [...data.solutions.items];
                                updatedItems[idx].ctaText = e.target.value;
                                updateField('solutions', 'items', updatedItems);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destino (ID ou URL)</label>
                            <input
                              type="text"
                              value={item.ctaLink?.value || '#contato'}
                              onChange={(e) => {
                                const updatedItems = [...data.solutions.items];
                                updatedItems[idx].ctaLink = {
                                  type: e.target.value.startsWith('http') ? 'external' : 'internal',
                                  value: e.target.value
                                };
                                updateField('solutions', 'items', updatedItems);
                              }}
                              placeholder="#contato ou https://"
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* 4. Differentials Editor */}
              <CollapsibleSection 
                title="Seção Diferenciais" 
                isOpen={openSections.differentials} 
                onToggle={() => toggleSection('differentials')}
                isVisible={data.differentials.visible}
                onToggleVisible={() => updateField('differentials', 'visible', !data.differentials.visible)}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título Geral</label>
                    <input
                      type="text"
                      value={data.differentials.title}
                      onChange={(e) => updateField('differentials', 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo Geral</label>
                    <input
                      type="text"
                      value={data.differentials.subtitle}
                      onChange={(e) => updateField('differentials', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Editar Pilares (Diferenciais)</span>
                    {data.differentials.items.map((item, idx) => (
                      <div key={item.id} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Título do Diferencial</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updatedItems = [...data.differentials.items];
                                updatedItems[idx].title = e.target.value;
                                updateField('differentials', 'items', updatedItems);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ícone (Nome Lucide)</label>
                            <select
                              value={item.iconName}
                              onChange={(e) => {
                                const updatedItems = [...data.differentials.items];
                                updatedItems[idx].iconName = e.target.value;
                                updateField('differentials', 'items', updatedItems);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            >
                              <option value="Heart">Coração (Acolhimento)</option>
                              <option value="Shield">Escudo (Segurança/Sigilo)</option>
                              <option value="Award">Medalha (Excelência/Qualidade)</option>
                              <option value="TrendingUp">Gráfico Crescimento (ROH)</option>
                              <option value="Users">Usuários (Equipe)</option>
                              <option value="Clock">Relógio (Agilidade)</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Descrição</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const updatedItems = [...data.differentials.items];
                              updatedItems[idx].description = e.target.value;
                              updateField('differentials', 'items', updatedItems);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs resize-none"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* 5. Achievements Editor */}
              <CollapsibleSection 
                title="Seção Conquistas (Números e Parceiros)" 
                isOpen={openSections.achievements} 
                onToggle={() => toggleSection('achievements')}
                isVisible={data.achievements.visible}
                onToggleVisible={() => updateField('achievements', 'visible', !data.achievements.visible)}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título Principal</label>
                    <input
                      type="text"
                      value={data.achievements.title}
                      onChange={(e) => updateField('achievements', 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo</label>
                    <input
                      type="text"
                      value={data.achievements.subtitle}
                      onChange={(e) => updateField('achievements', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  {/* Stats Counter List */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Contadores Numéricos</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.achievements.stats.map((stat, idx) => (
                        <div key={stat.id} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-zinc-400">Contador #{idx + 1}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={stat.number}
                              onChange={(e) => {
                                const updatedStats = [...data.achievements.stats];
                                updatedStats[idx].number = parseInt(e.target.value) || 0;
                                updateField('achievements', 'stats', updatedStats);
                              }}
                              className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                              placeholder="Número"
                            />
                            <input
                              type="text"
                              value={stat.suffix}
                              onChange={(e) => {
                                const updatedStats = [...data.achievements.stats];
                                updatedStats[idx].suffix = e.target.value;
                                updateField('achievements', 'stats', updatedStats);
                              }}
                              className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                              placeholder="Sufixo (Ex: + ou %)"
                            />
                          </div>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const updatedStats = [...data.achievements.stats];
                              updatedStats[idx].label = e.target.value;
                              updateField('achievements', 'stats', updatedStats);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs"
                            placeholder="Rótulo descriptivo"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Corporate Partners Badges list */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Empresas Parceiras (Logotipos Texto)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {data.achievements.partners.map((partner, idx) => (
                        <div key={partner.id} className="p-3 border border-slate-200 bg-white rounded-xl space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400">Parceiro #{idx + 1}</label>
                          <input
                            type="text"
                            value={partner.logoText}
                            onChange={(e) => {
                              const updatedPartners = [...data.achievements.partners];
                              updatedPartners[idx].logoText = e.target.value;
                              updatedPartners[idx].name = e.target.value;
                              updateField('achievements', 'partners', updatedPartners);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* 6. About Us Editor */}
              <CollapsibleSection 
                title="Seção Sobre Nós" 
                isOpen={openSections.about} 
                onToggle={() => toggleSection('about')}
                isVisible={data.about.visible}
                onToggleVisible={() => updateField('about', 'visible', !data.about.visible)}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título da Seção</label>
                    <input
                      type="text"
                      value={data.about.title}
                      onChange={(e) => updateField('about', 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Slogan / Subtítulo</label>
                    <input
                      type="text"
                      value={data.about.subtitle}
                      onChange={(e) => updateField('about', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Texto Institucional</label>
                    <textarea
                      rows={5}
                      value={data.about.content}
                      onChange={(e) => updateField('about', 'content', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Link Vídeo YouTube (Opcional)</label>
                      <input
                        type="text"
                        value={data.about.videoUrl}
                        onChange={(e) => updateField('about', 'videoUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">URL Imagem Estática Fallback</label>
                      <input
                        type="text"
                        value={data.about.imageUrl}
                        onChange={(e) => updateField('about', 'imageUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* 7. Blog Editor */}
              <CollapsibleSection 
                title="Seção Blog & Mídia" 
                isOpen={openSections.blog} 
                onToggle={() => toggleSection('blog')}
                isVisible={data.blog.visible}
                onToggleVisible={() => updateField('blog', 'visible', !data.blog.visible)}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título</label>
                    <input
                      type="text"
                      value={data.blog.title}
                      onChange={(e) => updateField('blog', 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo</label>
                    <input
                      type="text"
                      value={data.blog.subtitle}
                      onChange={(e) => updateField('blog', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  {/* Blog Articles list editing */}
                  <div className="space-y-4 pt-2">
                    <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Artigos do Blog</span>
                    {data.blog.posts.map((post, idx) => (
                      <div key={post.id} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                        <span className="text-xs font-bold text-zinc-400">Artigo #{idx + 1}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Título do Artigo</label>
                            <input
                              type="text"
                              value={post.title}
                              onChange={(e) => {
                                const updatedPosts = [...data.blog.posts];
                                updatedPosts[idx].title = e.target.value;
                                updateField('blog', 'posts', updatedPosts);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">URL Imagem</label>
                            <input
                              type="text"
                              value={post.imageUrl}
                              onChange={(e) => {
                                const updatedPosts = [...data.blog.posts];
                                updatedPosts[idx].imageUrl = e.target.value;
                                updateField('blog', 'posts', updatedPosts);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tempo Leitura</label>
                            <input
                              type="text"
                              value={post.readTime}
                              onChange={(e) => {
                                const updatedPosts = [...data.blog.posts];
                                updatedPosts[idx].readTime = e.target.value;
                                updateField('blog', 'posts', updatedPosts);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Data Publicação</label>
                            <input
                              type="date"
                              value={post.date}
                              onChange={(e) => {
                                const updatedPosts = [...data.blog.posts];
                                updatedPosts[idx].date = e.target.value;
                                updateField('blog', 'posts', updatedPosts);
                              }}
                              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs text-zinc-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Resumo</label>
                          <textarea
                            value={post.excerpt}
                            onChange={(e) => {
                              const updatedPosts = [...data.blog.posts];
                              updatedPosts[idx].excerpt = e.target.value;
                              updateField('blog', 'posts', updatedPosts);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs resize-none"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* 8. FAQ Editor */}
              <CollapsibleSection 
                title="Seção Dúvidas Frequentes (FAQ)" 
                isOpen={openSections.faq} 
                onToggle={() => toggleSection('faq')}
                isVisible={data.faq.visible}
                onToggleVisible={() => updateField('faq', 'visible', !data.faq.visible)}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título Geral</label>
                    <input
                      type="text"
                      value={data.faq.title}
                      onChange={(e) => updateField('faq', 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo</label>
                    <input
                      type="text"
                      value={data.faq.subtitle}
                      onChange={(e) => updateField('faq', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  {/* FAQ Items management */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Perguntas & Respostas</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newItem = {
                            id: `f_${Date.now()}`,
                            question: 'Nova pergunta frequente?',
                            answer: 'Digite a resposta aqui...'
                          };
                          updateField('faq', 'items', [...data.faq.items, newItem]);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Pergunta
                      </button>
                    </div>

                    {data.faq.items.map((item, idx) => (
                      <div key={item.id} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedItems = data.faq.items.filter(i => i.id !== item.id);
                            updateField('faq', 'items', updatedItems);
                          }}
                          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                          title="Remover Pergunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <span className="text-xs font-bold text-zinc-400">Pergunta #{idx + 1}</span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) => {
                              const updatedItems = [...data.faq.items];
                              updatedItems[idx].question = e.target.value;
                              updateField('faq', 'items', updatedItems);
                            }}
                            className="w-[90%] px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                            placeholder="Pergunta?"
                          />
                          <textarea
                            value={item.answer}
                            onChange={(e) => {
                              const updatedItems = [...data.faq.items];
                              updatedItems[idx].answer = e.target.value;
                              updateField('faq', 'items', updatedItems);
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs resize-none"
                            placeholder="Resposta..."
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* 9. Contact Section Editor */}
              <CollapsibleSection 
                title="Seção Contato & Mapa" 
                isOpen={openSections.contact} 
                onToggle={() => toggleSection('contact')}
                isVisible={data.contact.visible}
                onToggleVisible={() => updateField('contact', 'visible', !data.contact.visible)}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título Principal</label>
                      <input
                        type="text"
                        value={data.contact.title}
                        onChange={(e) => updateField('contact', 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo</label>
                      <input
                        type="text"
                        value={data.contact.subtitle}
                        onChange={(e) => updateField('contact', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Endereço Comercial</label>
                    <input
                      type="text"
                      value={data.contact.address}
                      onChange={(e) => updateField('contact', 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={data.contact.phone}
                        onChange={(e) => updateField('contact', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">E-mail Comercial</label>
                      <input
                        type="email"
                        value={data.contact.email}
                        onChange={(e) => updateField('contact', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">URL Iframe do Google Maps</label>
                    <input
                      type="text"
                      value={data.contact.mapIframeUrl}
                      onChange={(e) => updateField('contact', 'mapIframeUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="https://www.google.com/maps/embed?..."
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* TAB 2: Theme settings */}
          {activeTab === 'theme' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">Tema & Tipografia</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure o esquema de cores corporativo e o emparelhamento de fontes do site.</p>
              </div>

              {/* Color selector */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Paleta de Cores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'turquoise-corp'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Turquesa Corporativo</span>
                      <span className="text-xs text-zinc-400">Identidade padrão EH Saúde Mental</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'turquoise-corp'}
                        onChange={() => updateField('theme', 'activePalette', 'turquoise-corp')}
                        className="text-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#0093b8]"></span>
                      <span className="w-5 h-5 rounded-full bg-[#1e1e1e]"></span>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'ocean-serene'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Azul Oceano Sereno</span>
                      <span className="text-xs text-zinc-400">Tom de calmaria organizacional</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'ocean-serene'}
                        onChange={() => updateField('theme', 'activePalette', 'ocean-serene')}
                        className="text-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#0284c7]"></span>
                      <span className="w-5 h-5 rounded-full bg-[#0f172a]"></span>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'forest-relax'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Verde Acolhedor</span>
                      <span className="text-xs text-zinc-400">Harmonia preventiva organizacional</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'forest-relax'}
                        onChange={() => updateField('theme', 'activePalette', 'forest-relax')}
                        className="text-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#0d9488]"></span>
                      <span className="w-5 h-5 rounded-full bg-[#111827]"></span>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'charcoal-luxury'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Cinza Luxo Sóbrio</span>
                      <span className="text-xs text-zinc-400">Estética moderna e requintada</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'charcoal-luxury'}
                        onChange={() => updateField('theme', 'activePalette', 'charcoal-luxury')}
                        className="text-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#4b5563]"></span>
                      <span className="w-5 h-5 rounded-full bg-[#8b5cf6]"></span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Font selector */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Tipografia</h4>
                <div className="space-y-3">
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activeFontPair === 'outfit-inter'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-950 font-heading">Outfit & Inter (Padrão)</span>
                      <span className="text-xs text-zinc-400 font-sans">Combinação geométrica ideal para consultoria empresarial moderna</span>
                    </div>
                    <input
                      type="radio"
                      checked={data.theme.activeFontPair === 'outfit-inter'}
                      onChange={() => updateField('theme', 'activeFontPair', 'outfit-inter')}
                      className="text-[var(--color-primary)]"
                    />
                  </label>

                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activeFontPair === 'playfair-lato'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-950" style={{ fontFamily: 'Playfair Display, serif' }}>Playfair Display & Inter</span>
                      <span className="text-xs text-zinc-400">Layout refinado com toques clínicos tradicionais acolhedores</span>
                    </div>
                    <input
                      type="radio"
                      checked={data.theme.activeFontPair === 'playfair-lato'}
                      onChange={() => updateField('theme', 'activeFontPair', 'playfair-lato')}
                      className="text-[var(--color-primary)]"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GitHub automation settings */}
          {activeTab === 'github' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">Integração GitHub & Auto-Deploy</h3>
                <p className="text-xs text-zinc-400 mt-1">Conecte o CMS diretamente à sua conta do GitHub para automatizar os deploys na Cloudflare Pages.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-cyan-50/40 border border-cyan-100 text-sm text-zinc-700 leading-relaxed">
                  <Github className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-zinc-900">Como funciona o deploy automatizado?</h4>
                    <p className="text-xs text-zinc-600">
                      Ao preencher as credenciais clássicas abaixo, toda vez que você clicar no botão **Salvar Alterações** no topo da página, o CMS fará o commit do novo conteúdo diretamente na branch do seu repositório. O GitHub avisa a Cloudflare e ela atualiza seu site no ar de forma instantânea!
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Token de Acesso Pessoal Clássico (PAT)</label>
                      <a 
                        href="https://github.com/settings/tokens" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-0.5"
                      >
                        <HelpCircle className="w-3 h-3" /> Criar Token no GitHub
                      </a>
                    </div>
                    <input
                      type="password"
                      value={gitConfig.token}
                      onChange={(e) => updateGitConfig({ ...gitConfig, token: e.target.value })}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:border-[var(--color-primary)] outline-none"
                    />
                    <span className="block text-[10px] text-zinc-400">O Token clássico do GitHub precisa ter a permissão <strong>repo</strong> selecionada durante a criação no site do GitHub.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Proprietário (User/Org)</label>
                      <input
                        type="text"
                        value={gitConfig.owner}
                        onChange={(e) => updateGitConfig({ ...gitConfig, owner: e.target.value })}
                        placeholder="ehconsultoria"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Repositório (Repo Name)</label>
                      <input
                        type="text"
                        value={gitConfig.repo}
                        onChange={(e) => updateGitConfig({ ...gitConfig, repo: e.target.value })}
                        placeholder="ehconsultoria.com.br"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Branch Principal</label>
                      <input
                        type="text"
                        value={gitConfig.branch}
                        onChange={(e) => updateGitConfig({ ...gitConfig, branch: e.target.value })}
                        placeholder="main"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>O token clássico do GitHub é guardado apenas no seu navegador.</span>
                  </div>
                  {gitConfig.token ? (
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Integração Ativada
                    </span>
                  ) : (
                    <span className="text-zinc-400">Integração Inativa</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: General system settings / Email CC configuration */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">E-mails & Configurações de Leads</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure as chaves e destinatários de e-mails disparados pelo formulário comercial.</p>
              </div>

              {/* Email config */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Destinatários de E-mail (CC / Cópia)</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Quando um usuário envia o formulário "Fale com um Especialista", ele recebe uma confirmação, e cópias em CC são enviadas para:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Cópia Primária (Erica - Fixo)</label>
                    <input
                      type="email"
                      value={data.contact.emailConfig.ccEmailPrimary}
                      disabled
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-zinc-400 rounded-lg text-sm font-medium cursor-not-allowed"
                      title="Este e-mail é fixo e obrigatório pelo sistema"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Cópia Secundária (Institucional - Editável)</label>
                    <input
                      type="email"
                      value={data.contact.emailConfig.ccEmailCorporate}
                      onChange={(e) => {
                        const updatedConfig = { ...data.contact.emailConfig, ccEmailCorporate: e.target.value };
                        updateField('contact', 'emailConfig', updatedConfig);
                      }}
                      placeholder="contato@ehconsultoria.com.br"
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-heading font-bold text-md text-zinc-900">Status do Envio de E-mails</h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs text-zinc-600 leading-relaxed">
                  <HelpCircle className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-zinc-800">Chave de Envio do Resend</h5>
                    <p className="mt-1">
                      O disparo real de e-mails em produção depende da variável **`RESEND_API_KEY`** estar configurada no painel da sua **Cloudflare Pages** (como indicado no passo anterior). O CMS lê os destinatários daqui e repassa à rota da Cloudflare de forma segura.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
