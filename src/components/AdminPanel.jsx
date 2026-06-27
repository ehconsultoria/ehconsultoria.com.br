import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { 
  LogOut, Save, Download, RotateCcw, ArrowLeft, 
  Layout, Palette, Image as ImageIcon, Settings, 
  Trash2, Plus, Check, AlertTriangle, Eye, EyeOff 
} from 'lucide-react';

// Help component for link target configuration
function LinkConfigInput({ label, value, onChange }) {
  const [type, setType] = useState(value.type || 'internal');
  const [urlValue, setUrlValue] = useState(value.value || '');
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

export default function AdminPanel({ onNavigate }) {
  const { data, updateField, saveConfiguration, resetToDefault, palettes, fontPairs } = useCMS();

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('eh_admin_logged') === 'true';
  });
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // CMS active tab
  const [activeTab, setActiveTab] = useState('content');
  const [saveStatus, setSaveStatus] = useState({ success: false, error: null });

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

  // Save changes wrapper
  const handleSave = async () => {
    setSaveStatus({ success: false, error: null });
    const success = await saveConfiguration();
    if (success) {
      setSaveStatus({ success: true, error: null });
      setTimeout(() => setSaveStatus({ success: false, error: null }), 3000);
    } else {
      setSaveStatus({ success: false, error: 'Ocorreu um erro ao salvar as alterações' });
    }
  };

  // Reset to default wrapper
  const handleReset = () => {
    if (window.confirm("Deseja realmente restaurar todos os textos e estilos originais? Isso apagará as alterações atuais.")) {
      resetToDefault();
      setSaveStatus({ success: true, error: null });
      setTimeout(() => setSaveStatus({ success: false, error: null }), 3000);
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all"
            title="Salvar alterações"
          >
            <Save className="w-4 h-4" />
            Salvar
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
            Visualizar Site
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
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'media'
                ? 'bg-cyan-50 text-[var(--color-primary)]'
                : 'text-zinc-600 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Mídias & Galeria
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
            Configurações Gerais
          </button>
        </aside>

        {/* Content area based on selected tab */}
        <main className="flex-grow p-6 sm:p-8 max-w-4xl overflow-y-auto">
          {saveStatus.success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-2 animate-slide-up text-sm font-medium">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              Configurações salvas e aplicadas com sucesso!
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
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">Editar Conteúdo do Site</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure todos os cabeçalhos, parágrafos e botões de chamada à ação.</p>
              </div>

              {/* Header Editor */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900 border-b border-slate-100 pb-2">Cabeçalho (Header)</h4>
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
                      className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <label htmlFor="logo-visible" className="text-sm text-zinc-700 font-semibold cursor-pointer">Mostrar Logotipo Oficial</label>
                  </div>
                </div>
                <LinkConfigInput
                  label="Destino do Botão CTA do Header"
                  value={data.header.ctaLink}
                  onChange={(val) => updateField('header', 'ctaLink', val)}
                />
              </div>

              {/* Hero Editor */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-bold text-md text-zinc-900">Seção Inicial (Hero)</h4>
                  <button
                    onClick={() => updateField('hero', 'visible', !data.hero.visible)}
                    className="p-1 rounded hover:bg-slate-100 text-zinc-500"
                    title={data.hero.visible ? 'Ocultar Seção' : 'Mostrar Seção'}
                  >
                    {data.hero.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-zinc-300" />}
                  </button>
                </div>
                {data.hero.visible && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título de Forte Impacto</label>
                      <input
                        type="text"
                        value={data.hero.title}
                        onChange={(e) => updateField('hero', 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Subtítulo Explicativo</label>
                      <textarea
                        rows={3}
                        value={data.hero.subtitle}
                        onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                      ></textarea>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Texto do Botão Hero</label>
                      <input
                        type="text"
                        value={data.hero.ctaText}
                        onChange={(e) => updateField('hero', 'ctaText', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <LinkConfigInput
                      label="Destino do Botão Hero"
                      value={data.hero.ctaLink}
                      onChange={(val) => updateField('hero', 'ctaLink', val)}
                    />
                  </div>
                )}
              </div>

              {/* Solutions Editor */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-bold text-md text-zinc-900">Seção Programas & Soluções</h4>
                  <button
                    onClick={() => updateField('solutions', 'visible', !data.solutions.visible)}
                    className="p-1 rounded hover:bg-slate-100 text-zinc-500"
                  >
                    {data.solutions.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-zinc-300" />}
                  </button>
                </div>
                {data.solutions.visible && (
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
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Descrição Subtítulo</label>
                      <input
                        type="text"
                        value={data.solutions.subtitle}
                        onChange={(e) => updateField('solutions', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    
                    {/* Item Cards Titles editing */}
                    <div className="space-y-3 pt-2">
                      <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Editar Cards (Títulos e Textos)</span>
                      {data.solutions.items.map((item, idx) => (
                        <div key={item.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-3">
                          <span className="text-xs font-bold text-zinc-400">Card #{idx + 1}</span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updatedItems = [...data.solutions.items];
                              updatedItems[idx].title = e.target.value;
                              updateField('solutions', 'items', updatedItems);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                            placeholder="Título do programa"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const updatedItems = [...data.solutions.items];
                              updatedItems[idx].description = e.target.value;
                              updateField('solutions', 'items', updatedItems);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm resize-none"
                            placeholder="Breve descrição"
                          ></textarea>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* About Us Editor */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-bold text-md text-zinc-900">Seção Sobre a Empresa</h4>
                  <button
                    onClick={() => updateField('about', 'visible', !data.about.visible)}
                    className="p-1 rounded hover:bg-slate-100 text-zinc-500"
                  >
                    {data.about.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-zinc-300" />}
                  </button>
                </div>
                {data.about.visible && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Título</label>
                      <input
                        type="text"
                        value={data.about.title}
                        onChange={(e) => updateField('about', 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Slogan Institucional</label>
                      <input
                        type="text"
                        value={data.about.subtitle}
                        onChange={(e) => updateField('about', 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Texto Institucional Completo</label>
                      <textarea
                        rows={6}
                        value={data.about.content}
                        onChange={(e) => updateField('about', 'content', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Editor */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-heading font-bold text-md text-zinc-900">Seção de Contato</h4>
                  <button
                    onClick={() => updateField('contact', 'visible', !data.contact.visible)}
                    className="p-1 rounded hover:bg-slate-100 text-zinc-500"
                  >
                    {data.contact.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-zinc-300" />}
                  </button>
                </div>
                {data.contact.visible && (
                  <div className="space-y-4">
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
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Telefone para Exibição</label>
                        <input
                          type="text"
                          value={data.contact.phone}
                          onChange={(e) => updateField('contact', 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">E-mail Comercial de Exibição</label>
                        <input
                          type="email"
                          value={data.contact.email}
                          onChange={(e) => updateField('contact', 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Theme settings */}
          {activeTab === 'theme' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">Tema & Tipografia</h3>
                <p className="text-xs text-zinc-400 mt-1">Defina as cores corporativas e o emparelhamento de fontes do seu site institucional.</p>
              </div>

              {/* Color palettes selector */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Paleta de Cores do Site</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Palette Option 1 */}
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'turquoise-corp'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Turquesa Corporativo</span>
                      <span className="text-xs text-zinc-400">Paleta padrão EH Saúde Mental</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'turquoise-corp'}
                        onChange={() => updateField('theme', 'activePalette', 'turquoise-corp')}
                        className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#0093b8]" title="Turquesa"></span>
                      <span className="w-5 h-5 rounded-full bg-[#1e1e1e]" title="Preto Artesanal"></span>
                    </div>
                  </label>

                  {/* Palette Option 2 */}
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'ocean-serene'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Azul Oceano Sereno</span>
                      <span className="text-xs text-zinc-400">Tom clínico calmo e seguro</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'ocean-serene'}
                        onChange={() => updateField('theme', 'activePalette', 'ocean-serene')}
                        className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#0284c7]"></span>
                      <span className="w-5 h-5 rounded-full bg-[#0f172a]"></span>
                    </div>
                  </label>

                  {/* Palette Option 3 */}
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'forest-relax'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Verde Acolhedor</span>
                      <span className="text-xs text-zinc-400">Paz, saúde preventiva e harmonia</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'forest-relax'}
                        onChange={() => updateField('theme', 'activePalette', 'forest-relax')}
                        className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#0d9488]"></span>
                      <span className="w-5 h-5 rounded-full bg-[#111827]"></span>
                    </div>
                  </label>

                  {/* Palette Option 4 */}
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activePalette === 'charcoal-luxury'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900">Cinza Premium</span>
                      <span className="text-xs text-zinc-400">Sóbrio, requintado e minimalista</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <input
                        type="radio"
                        checked={data.theme.activePalette === 'charcoal-luxury'}
                        onChange={() => updateField('theme', 'activePalette', 'charcoal-luxury')}
                        className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="w-5 h-5 rounded-full bg-[#4b5563]"></span>
                      <span className="w-5 h-5 rounded-full bg-[#8b5cf6]"></span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Font pairs selector */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Combinação Tipográfica</h4>
                <div className="space-y-3">
                  
                  {/* Font pair 1 */}
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activeFontPair === 'outfit-inter'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold font-heading text-zinc-900">Outfit & Inter (Recomendado)</span>
                      <span className="text-xs text-zinc-400">Títulos geométricos elegantes e leitura extremamente fluida</span>
                    </div>
                    <input
                      type="radio"
                      checked={data.theme.activeFontPair === 'outfit-inter'}
                      onChange={() => updateField('theme', 'activeFontPair', 'outfit-inter')}
                      className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </label>

                  {/* Font pair 2 */}
                  <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    data.theme.activeFontPair === 'playfair-lato'
                      ? 'border-[var(--color-primary)] bg-cyan-50/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-900" style={{ fontFamily: 'Playfair Display, serif' }}>Playfair Display & Inter</span>
                      <span className="text-xs text-zinc-400">Estilo editorial humanizado e acolhedor (serifado)</span>
                    </div>
                    <input
                      type="radio"
                      checked={data.theme.activeFontPair === 'playfair-lato'}
                      onChange={() => updateField('theme', 'activeFontPair', 'playfair-lato')}
                      className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Media & Gallery */}
          {activeTab === 'media' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">Imagens & Mídia</h3>
                <p className="text-xs text-zinc-400 mt-1">Gerencie as imagens de destaque, galeria de soluções e vídeos institucionais.</p>
              </div>

              {/* Hero Image & Youtube video URL */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Mídias Principais</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">URL da Imagem do Hero</label>
                    <input
                      type="text"
                      value={data.hero.imageUrl}
                      onChange={(e) => updateField('hero', 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Link do Vídeo do YouTube (Seção Sobre)</label>
                    <input
                      type="text"
                      value={data.about.videoUrl}
                      onChange={(e) => updateField('about', 'videoUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <span className="block text-xs text-zinc-400 mt-1">Insira um link do YouTube comum ou o link de compartilhamento. O sistema converterá para embed automaticamente. Deixe em branco para forçar exibição da imagem estática de fallback.</span>
                  </div>
                </div>
              </div>

              {/* Solutions Carousel Images manager */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Imagens da Galeria de Programas (Carrossel)</h4>
                <div className="space-y-4">
                  {data.solutions.items.map((item, idx) => (
                    <div key={item.id} className="p-4 border border-slate-100 rounded-xl flex items-center gap-4 bg-slate-50/40">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-20 h-14 object-cover rounded-lg border border-slate-200 bg-white"
                      />
                      <div className="flex-grow space-y-1">
                        <span className="block text-xs font-bold text-zinc-700">{item.title}</span>
                        <input
                          type="text"
                          value={item.imageUrl}
                          onChange={(e) => {
                            const updatedItems = [...data.solutions.items];
                            updatedItems[idx].imageUrl = e.target.value;
                            updateField('solutions', 'items', updatedItems);
                          }}
                          className="w-full px-3 py-1 border border-slate-200 rounded-lg text-xs"
                          placeholder="URL da imagem do card"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: General system settings / Email recipients */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold text-zinc-900 font-heading">Configurações Gerais & E-mails</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure os destinatários de cópia oculta do formulário de contato e controle a visibilidade das seções da Landing Page.</p>
              </div>

              {/* Email configuration fields */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Configuração de Disparo de Leads</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Os leads capturados no formulário disparam um e-mail de confirmação para o interessado, e enviam cópias administrativas (CC) para os e-mails configurados abaixo:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Cópia 1 (erica.ehconsultltda@gmail.com)</label>
                    <input
                      type="email"
                      value={data.contact.emailConfig.ccEmailPrimary}
                      onChange={(e) => {
                        const updatedConfig = { ...data.contact.emailConfig, ccEmailPrimary: e.target.value };
                        updateField('contact', 'emailConfig', updatedConfig);
                      }}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-zinc-500 cursor-not-allowed font-medium"
                      disabled
                      title="Destinatário fixo obrigatório"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Cópia 2 (E-mail Institucional editável)</label>
                    <input
                      type="email"
                      value={data.contact.emailConfig.ccEmailCorporate}
                      onChange={(e) => {
                        const updatedConfig = { ...data.contact.emailConfig, ccEmailCorporate: e.target.value };
                        updateField('contact', 'emailConfig', updatedConfig);
                      }}
                      required
                      placeholder="contato@ehconsultoria.com.br"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Active sections toggle */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-md text-zinc-900">Visibilidade das Seções da Landing Page</h4>
                <p className="text-xs text-zinc-500">Marque quais seções devem ser exibidas no site. Desmarcar oculta a seção automaticamente sem apagar os dados.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.hero.visible}
                      onChange={(e) => updateField('hero', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção Inicial (Hero)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.solutions.visible}
                      onChange={(e) => updateField('solutions', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção Soluções (Carrossel)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.differentials.visible}
                      onChange={(e) => updateField('differentials', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção Diferenciais</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.achievements.visible}
                      onChange={(e) => updateField('achievements', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção Resultados (Números)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.about.visible}
                      onChange={(e) => updateField('about', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção Sobre Nós (Vídeo)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.blog.visible}
                      onChange={(e) => updateField('blog', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção Blog & Mídia</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.faq.visible}
                      onChange={(e) => updateField('faq', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção FAQ (Dúvidas)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={data.contact.visible}
                      onChange={(e) => updateField('contact', 'visible', e.target.checked)}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-zinc-700">Seção Contato</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
