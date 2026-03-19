
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Landing from './components/Landing';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import LiveVoice from './components/LiveVoice';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simple hash-based "routing"
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppView;
      if (['landing', 'chat', 'image', 'video', 'voice'].includes(hash)) {
        setView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <Landing onStart={() => window.location.hash = 'chat'} />;
      case 'chat':
        return <ChatInterface />;
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      case 'voice':
        return <LiveVoice />;
      default:
        return <Landing onStart={() => window.location.hash = 'chat'} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#f0f0f0]">
      {view !== 'landing' && <Navbar currentView={view} />}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
