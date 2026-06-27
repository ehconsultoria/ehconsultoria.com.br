import React, { useRef } from 'react';
import { useCMS } from '../context/CMSContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Solutions() {
  const { data } = useCMS();
  const { solutions } = data;
  const carouselRef = useRef(null);

  if (!solutions || !solutions.visible) return null;

  const handleScroll = (direction) => {
    const container = carouselRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75; // Scroll about 75% of container width
      const targetScroll = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

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
    <section id="solucoes" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header section with buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-heading">
              {solutions.title}
            </h2>
            <p className="text-lg text-zinc-600 font-normal leading-relaxed">
              {solutions.subtitle}
            </p>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => handleScroll('left')}
              className="p-3 rounded-full border border-slate-200 bg-white text-zinc-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-300"
              aria-label="Voltar slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-3 rounded-full border border-slate-200 bg-white text-zinc-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-300"
              aria-label="Avançar slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CSS Scroll Snap Slider Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {solutions.items.map((item) => (
            <div
              key={item.id}
              className="flex-none w-[85%] sm:w-[50%] lg:w-[31%] snap-align-start select-none"
            >
              <div className="h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {/* Image header */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Content body */}
                <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-zinc-900 font-heading">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-500 font-normal leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="pt-6">
                    <a
                      href={item.ctaLink?.value || '#contato'}
                      onClick={(e) => handleCtaClick(e, item.ctaLink || { type: 'internal', value: '#contato' })}
                      target={item.ctaLink?.type === 'external' ? '_blank' : undefined}
                      rel={item.ctaLink?.type === 'external' ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] group"
                    >
                      {item.ctaText || 'Saber Mais'}
                      <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
