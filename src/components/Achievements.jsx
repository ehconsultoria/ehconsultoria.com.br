import React, { useState, useEffect, useRef } from 'react';
import { useCMS } from '../context/CMSContext';

function Counter({ endValue, suffix }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let start = 0;
    const end = parseInt(endValue);
    if (isNaN(end)) {
      setCount(endValue);
      return;
    }

    const duration = 1500; // 1.5 seconds
    const frameRate = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      // Easing function (easeOutQuad)
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);
      
      const currentValue = Math.round(easeProgress * end);
      
      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(currentValue);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [hasAnimated, endValue]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Achievements() {
  const { data } = useCMS();
  const { achievements } = data;

  if (!achievements || !achievements.visible) return null;

  return (
    <section className="py-20 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center border-b border-zinc-800 pb-16">
          {achievements.stats.map((stat) => (
            <div key={stat.id} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-[var(--color-primary)] font-heading tracking-tight">
                <Counter endValue={stat.number} suffix={stat.suffix} />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Partner Companies Logos Section */}
        <div className="pt-16 space-y-8">
          <div className="text-center">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-500">
              Grandes empresas que confiam na nossa equipe
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center">
            {achievements.partners.map((partner) => (
              <div
                key={partner.id}
                className="w-full max-w-[160px] py-4 px-6 rounded-xl border border-zinc-800/40 bg-zinc-900/30 text-center flex items-center justify-center hover:bg-zinc-800/20 hover:border-cyan-600/30 transition-all duration-300 group select-none"
              >
                <span className="font-heading font-bold text-sm tracking-widest text-zinc-500 group-hover:text-[var(--color-primary-light)] transition-colors duration-300">
                  {partner.logoText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
