import React from 'react';
import { useCMS } from '../context/CMSContext';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function Blog() {
  const { data } = useCMS();
  const { blog } = data;

  if (!blog || !blog.visible) return null;

  // Format date helper
  const formatDate = (dateStr) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('pt-BR', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <section id="blog" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {blog.title}
          </h2>
          <p className="text-lg text-zinc-600 font-normal leading-relaxed">
            {blog.subtitle}
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blog.posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Content Box */}
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-3">
                  {/* Meta tag */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 font-heading leading-snug group-hover:text-[var(--color-primary)] transition-colors duration-200">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-zinc-500 font-normal leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <a
                    href={post.link || '#'}
                    className="inline-flex items-center text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] group-hover:gap-2 transition-all"
                  >
                    Ler Artigo Completo
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
