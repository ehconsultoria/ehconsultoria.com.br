import React from 'react';
import { useCMS } from '../context/CMSContext';

export default function About() {
  const { data } = useCMS();
  const { about } = data;

  if (!about || !about.visible) return null;

  // Helper to extract clean youtube embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {
      console.warn("Could not parse YouTube URL", e);
    }
    return url;
  };

  const embedUrl = getEmbedUrl(about.videoUrl);

  return (
    <section id="sobre" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text block */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
              Nossa Missão e Fundamentos
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-heading">
              {about.title}
            </h2>
            
            <h3 className="text-xl font-medium text-zinc-700 leading-relaxed">
              {about.subtitle}
            </h3>
            
            <p className="text-sm sm:text-base text-zinc-500 font-normal leading-relaxed whitespace-pre-line">
              {about.content}
            </p>
          </div>

          {/* Media block (video or image) */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-4 rounded-3xl bg-slate-100/50 -z-10 blur-sm"></div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50 aspect-video">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="EH Consultoria Vídeo Institucional"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <img
                  src={about.imageUrl || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"}
                  alt="EH Consultoria Equipe"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
