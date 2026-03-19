
import React from 'react';
import { Cpu, Zap, Image as ImageIcon, Video, Mic, ArrowRight } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f0f0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff0055] rounded-full filter blur-[128px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7000ff] rounded-full filter blur-[128px] opacity-10 animate-pulse delay-700"></div>

      <div className="z-10 text-center max-w-4xl mx-auto">
        <div className="mb-6 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-pink-500 text-sm font-medium tracking-wider uppercase">
          <Zap size={14} className="fill-current" />
          <span>Next-Generation Intelligence</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          KRYVEX <span className="text-transparent bg-clip-text kryvex-gradient">AI</span>
        </h1>
        
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate synthetic intelligence platform with a warm Desi heart. Create cinematic videos, photorealistic imagery, and converse with high-fidelity voice.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-[#ff0055] hover:bg-[#ff1a66] text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,85,0.4)] flex items-center gap-2"
          >
            Launch Experience
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="relative group">
            <input 
              type="email" 
              placeholder="Enter email for updates" 
              className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-pink-500/50 transition-colors w-72"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-zinc-500">
          <FeatureCard icon={<Cpu size={24} />} title="Smart Reasoning" desc="Gemini 3 Pro" />
          <FeatureCard icon={<ImageIcon size={24} />} title="Ultra Images" desc="2.5 Flash Image" />
          <FeatureCard icon={<Video size={24} />} title="Veo Motion" desc="3.1 Fast Video" />
          <FeatureCard icon={<Mic size={24} />} title="Live Voice" desc="Low Latency" />
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-zinc-600 text-sm">
        © 2024 KRYVEX AI. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-pink-500/20 hover:bg-white/[0.04] transition-all">
    <div className="text-pink-500 mb-2">{icon}</div>
    <div className="text-white font-semibold text-sm">{title}</div>
    <div className="text-[10px] uppercase tracking-widest">{desc}</div>
  </div>
);

export default Landing;
