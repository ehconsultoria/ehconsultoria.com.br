import React from 'react';
import { useCMS } from '../context/CMSContext';
import { Plus } from 'lucide-react';

export default function FAQ() {
  const { data } = useCMS();
  const { faq } = data;

  if (!faq || !faq.visible) return null;

  return (
    <section id="faq" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {faq.title}
          </h2>
          <p className="text-lg text-zinc-600 font-normal leading-relaxed">
            {faq.subtitle}
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faq.items.map((item) => (
            <details
              key={item.id}
              className="group border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between gap-4 p-6 sm:p-8 cursor-pointer select-none focus:outline-none">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 font-heading">
                  {item.question}
                </h3>
                
                <span className="flex-none p-1 bg-white rounded-full border border-slate-200 text-zinc-400 group-hover:text-[var(--color-primary)] group-open:rotate-45 group-hover:border-[var(--color-primary)]/20 transition-all duration-300">
                  <Plus className="w-5 h-5 transition-transform" />
                </span>
              </summary>

              <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-slate-100 pt-4">
                <p className="text-sm sm:text-base text-zinc-500 font-normal leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
