import React, { useState, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import { Menu, X, Lock } from 'lucide-react';

export default function Header({ onNavigate }) {
  const { data } = useCMS();
  const { header } = data;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!header) return null;

  const handleCtaClick = (e, link) => {
    if (link.type === 'internal') {
      e.preventDefault();
      const target = document.querySelector(link.value);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {header.logoVisible && (
              <a href="#" className="flex items-center gap-2 group">
                <img
                  src="/assets/logo.png"
                  alt="EH Consultoria Logo"
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="font-heading font-bold text-lg text-zinc-900 tracking-tight leading-none">
                  EH <span className="text-[var(--color-primary)] font-normal text-sm block">Saúde Mental</span>
                </span>
              </a>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {header.menuItems.map(item => (
              <a
                key={item.id}
                href={item.anchor}
                className="text-sm font-medium text-zinc-700 hover:text-[var(--color-primary)] transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              title="Área Administrativa"
              className="p-2 text-zinc-400 hover:text-[var(--color-primary)] transition-colors duration-200"
            >
              <Lock className="w-4 h-4" />
            </button>
            
            <a
              href={header.ctaLink.value}
              onClick={(e) => handleCtaClick(e, header.ctaLink)}
              target={header.ctaLink.type === 'external' ? '_blank' : undefined}
              rel={header.ctaLink.type === 'external' ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors duration-300 rounded-full shadow-sm hover:shadow-md"
            >
              {header.ctaText}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => onNavigate('admin')}
              title="Área Administrativa"
              className="p-2 text-zinc-400 hover:text-[var(--color-primary)]"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-[var(--color-primary)] focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {header.menuItems.map(item => (
              <a
                key={item.id}
                href={item.anchor}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-800 hover:bg-slate-50 hover:text-[var(--color-primary)] transition-all"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-slate-100">
              <a
                href={header.ctaLink.value}
                onClick={(e) => handleCtaClick(e, header.ctaLink)}
                target={header.ctaLink.type === 'external' ? '_blank' : undefined}
                rel={header.ctaLink.type === 'external' ? 'noopener noreferrer' : undefined}
                className="block w-full text-center px-5 py-3 text-base font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-full transition-colors duration-300"
              >
                {header.ctaText}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
