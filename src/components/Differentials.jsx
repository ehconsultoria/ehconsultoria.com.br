import React from 'react';
import { useCMS } from '../context/CMSContext';
import * as Icons from 'lucide-react';

export default function Differentials() {
  const { data } = useCMS();
  const { differentials } = data;

  if (!differentials || !differentials.visible) return null;

  return (
    <section id="diferenciais" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative radial gradients for premium feel */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-50/50 rounded-full blur-3xl -z-10 -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {differentials.title}
          </h2>
          <p className="text-lg text-zinc-600 font-normal leading-relaxed">
            {differentials.subtitle}
          </p>
        </div>

        {/* Grid Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differentials.items.map((item) => {
            // Dynamically resolve lucide icons
            const Icon = Icons[item.iconName] || Icons.Award;
            
            return (
              <div
                key={item.id}
                className="relative p-6 sm:p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Decorative border highlight */}
                <div className="absolute inset-0 border border-transparent group-hover:border-[var(--color-primary)]/20 rounded-2xl transition-colors duration-300"></div>

                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-[var(--color-primary)] mb-6 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 font-heading mb-3">
                  {item.title}
                </h3>
                
                <p className="text-sm sm:text-base text-zinc-500 font-normal leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
