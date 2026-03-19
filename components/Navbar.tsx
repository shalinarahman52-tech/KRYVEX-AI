
import React from 'react';
import { AppView } from '../types';
import { MessageSquare, ImageIcon, Video, Mic, Zap } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
}

const Navbar: React.FC<NavbarProps> = ({ currentView }) => {
  const navItems = [
    { id: 'chat', label: 'Chat (আলাপ)', icon: <MessageSquare size={18} />, href: '#chat' },
    { id: 'image', label: 'Images (ছবি)', icon: <ImageIcon size={18} />, href: '#image' },
    { id: 'video', label: 'Videos (ভিডিও)', icon: <Video size={18} />, href: '#video' },
    { id: 'voice', label: 'Voice (কথা)', icon: <Mic size={18} />, href: '#voice' },
  ];

  return (
    <nav className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-50">
      <a href="#landing" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg kryvex-gradient flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-black text-xl tracking-tight uppercase">
          KRYVEX <span className="text-pink-500">AI</span>
        </span>
      </a>

      <div className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === item.id 
                ? 'bg-white/10 text-pink-500' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
        <button className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
          Pro Account
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
