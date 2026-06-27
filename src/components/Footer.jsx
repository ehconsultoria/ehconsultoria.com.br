import React from 'react';
import { useCMS } from '../context/CMSContext';
import { Instagram, Linkedin, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const { data } = useCMS();
  const { contact } = data;

  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e, anchor) => {
    e.preventDefault();
    const target = document.querySelector(anchor);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-zinc-900 pb-12">
          
          {/* Logo & Address info */}
          <div className="md:col-span-5 space-y-5">
            <a href="#" className="flex items-center gap-2 group">
              <img
                src="/assets/logo.png"
                alt="EH Consultoria Logo"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="font-heading font-bold text-lg text-white tracking-tight leading-none">
                EH <span className="text-[var(--color-primary-light)] font-normal text-xs block">Saúde Mental</span>
              </span>
            </a>
            
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              Soluções integradas de psicologia clínica, consultoria organizacional e treinamentos corporativos de saúde mental.
            </p>
            
            <p className="text-xs text-zinc-600">
              {contact.address}
            </p>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Navegação</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <a href="#solucoes" onClick={(e) => handleLinkClick(e, '#solucoes')} className="hover:text-white transition-colors">Programas</a>
              <a href="#diferenciais" onClick={(e) => handleLinkClick(e, '#diferenciais')} className="hover:text-white transition-colors">Diferenciais</a>
              <a href="#sobre" onClick={(e) => handleLinkClick(e, '#sobre')} className="hover:text-white transition-colors">Sobre Nós</a>
              <a href="#blog" onClick={(e) => handleLinkClick(e, '#blog')} className="hover:text-white transition-colors">Blog & Mídia</a>
              <a href="#faq" onClick={(e) => handleLinkClick(e, '#faq')} className="hover:text-white transition-colors">Dúvidas</a>
              <a href="#contato" onClick={(e) => handleLinkClick(e, '#contato')} className="hover:text-white transition-colors">Contato</a>
            </div>
          </div>

          {/* Socials & Administration */}
          <div className="md:col-span-3 space-y-5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Acompanhe-nos</h4>
            
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-[var(--color-primary-light)] transition-colors"
              >
                <span>Acesso Restrito CMS</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div>
            &copy; {currentYear} EH Consultoria em Saúde Mental. Todos os direitos reservados. CNPJ: 00.000.000/0001-00.
          </div>
          <div className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para ehconsultoria.com.br
          </div>
        </div>
      </div>
    </footer>
  );
}
