import React, { useState, useEffect } from 'react';
import { CMSProvider } from './context/CMSContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Solutions from './components/Solutions';
import Differentials from './components/Differentials';
import Achievements from './components/Achievements';
import About from './components/About';
import Blog from './components/Blog';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

function MainApp() {
  const [view, setView] = useState('landing'); // 'landing' | 'admin'

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  if (view === 'admin') {
    return <AdminPanel onNavigate={setView} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onNavigate={setView} />
      <main className="flex-grow">
        <Hero />
        <Solutions />
        <Differentials />
        <Achievements />
        <About />
        <Blog />
        <FAQ />
        <Contact />
      </main>
      <Footer onNavigate={setView} />
    </div>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <MainApp />
    </CMSProvider>
  );
}
