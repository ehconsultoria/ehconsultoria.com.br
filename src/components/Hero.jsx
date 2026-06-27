import React from 'react';
import { useCMS } from '../context/CMSContext';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const { data } = useCMS();
  const { hero } = data;

  if (!hero || !hero.visible) return null;

  const handleCtaClick = (e, link) => {
    if (link.type === 'internal') {
      e.preventDefault();
      const target = document.querySelector(link.value);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 lg:pb-36 bg-gradient-to-br from-slate-50 via-slate-50 to-cyan-50/30">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-sky-100/30 rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
              EH Consultoria em Saúde Mental
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.1] font-heading">
              {hero.title.split(':').map((part, index) => (
                <React.Fragment key={index}>
                  {index > 0 ? <span className="text-[var(--color-primary)] block mt-1">{part}</span> : part}
                </React.Fragment>
              ))}
            </h1>
            
            <p className="text-lg sm:text-xl text-zinc-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {hero.subtitle}
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={hero.ctaLink.value}
                onClick={(e) => handleCtaClick(e, hero.ctaLink)}
                target={hero.ctaLink.type === 'external' ? '_blank' : undefined}
                rel={hero.ctaLink.type === 'external' ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group"
              >
                {hero.ctaText}
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              
              <a
                href="#solucoes"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-zinc-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full shadow-sm transition-all duration-300"
              >
                Conhecer Programas
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-5 relative animate-fade-in delay-200">
            {/* Visual background frames for premium aesthetic */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[var(--color-primary)]/10 to-transparent -z-10 blur-sm scale-95 translate-x-2 translate-y-2"></div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={hero.imageUrl}
                alt="Saúde Mental Corporativa"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
            </div>

            {/* Float badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 hidden sm:flex items-center gap-3 animate-slide-up">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-[var(--color-primary)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="block text-xs text-zinc-400 font-medium">Ambiente Saudável</span>
                <span className="block text-sm font-bold text-zinc-800">Segurança Psicologia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
