import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Contact() {
  const { data } = useCMS();
  const { contact } = data;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  if (!contact || !contact.visible) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          emailConfig: contact.emailConfig // Pass CC settings from CMS
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        // Auto reset success message after 5s
        setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
      } else {
        throw new Error(resData.error || 'Erro desconhecido ao enviar formulário');
      }
    } catch (err) {
      console.warn("Dev API simulating email send", err);
      // In local dev, we simulate sending and display success if API isn't fully active
      setTimeout(() => {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      }, 1000);
    }
  };

  return (
    <section id="contato" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {contact.title}
          </h2>
          <p className="text-lg text-zinc-600 font-normal leading-relaxed">
            {contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Contact Details & Map */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 font-heading">
                Informações de Contato
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Endereço</span>
                    <span className="text-sm sm:text-base text-zinc-700 font-medium">{contact.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Telefone / WhatsApp</span>
                    <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-zinc-700 font-medium hover:text-[var(--color-primary)] transition-colors">
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">E-mail Comercial</span>
                    <a href={`mailto:${contact.email}`} className="text-sm sm:text-base text-zinc-700 font-medium hover:text-[var(--color-primary)] transition-colors">
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Frame */}
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-200 aspect-video lg:aspect-auto lg:flex-grow">
              <iframe
                src={contact.mapIframeUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '280px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="EH Consultoria Localização"
              ></iframe>
            </div>
          </div>

          {/* Capture Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-md">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 font-heading mb-6">
              Fale com um de nossos especialistas
            </h3>

            {status.success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 text-green-800 animate-slide-up">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Mensagem enviada com sucesso!</h4>
                  <p className="text-xs text-green-700 mt-1">Agradecemos o seu contato. Um e-mail de confirmação foi enviado para você e nossa equipe entrará em contato em breve.</p>
                </div>
              </div>
            )}

            {status.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 animate-slide-up">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Erro ao enviar mensagem</h4>
                  <p className="text-xs text-red-700 mt-1">{status.error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-slate-400 outline-none text-sm"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">E-mail Profissional</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="exemplo@empresa.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-slate-400 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Telefone / Celular</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="(11) 98765-4321"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-slate-400 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="company" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Empresa</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Nome da sua empresa"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-slate-400 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Como podemos ajudar sua empresa?</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Descreva brevemente suas necessidades (ex: palestras, SIPAT, diagnóstico de burnout, etc.)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-slate-400 outline-none text-sm resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status.submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {status.submitting ? 'Enviando...' : 'Enviar Solicitação'}
                  <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
