
import React, { useState } from 'react';
import { ImageIcon, Sparkles, Download, Loader2, RefreshCw } from 'lucide-react';
import { generateImage } from '../services/gemini';
import { GeneratedImage } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt,
        timestamp: Date.now(),
      };
      setImages(prev => [newImg, ...prev]);
      setPrompt('');
    } catch (error) {
      console.error(error);
      alert("System overload: Image synthesis failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 border-r border-white/10 p-6 flex flex-col gap-6 bg-white/[0.01]">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-pink-500" />
            Image Synthesis (ছবি তৈরি)
          </h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Model: Gemini 2.5 Flash Image</p>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prompt Interface (বর্ণনা লিখুন)</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="একটি সুন্দর গ্রামের দৃশ্য, সূর্যাস্ত, এবং নদী... (A beautiful village scene, sunset, and river...)"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-32 focus:border-pink-500/50 outline-none transition-all text-sm resize-none"
          />
          
          <div className="grid grid-cols-2 gap-2">
            {['Rickshaw Art', 'Mughal Style', 'Village Scenery', 'Cyberpunk Dhaka'].map(style => (
              <button
                key={style}
                onClick={() => setPrompt(prev => prev ? `${prev}, ${style}` : style)}
                className="text-[10px] py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/30 text-zinc-400 hover:text-white transition-all"
              >
                + {style}
              </button>
            ))}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              prompt.trim() && !isGenerating 
                ? 'bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/20' 
                : 'bg-white/10 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isGenerating ? 'Generating... (তৈরি হচ্ছে...)' : 'Synthesize Image (ছবি তৈরি করুন)'}
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 text-[10px] text-zinc-600 leading-relaxed uppercase tracking-tighter">
          Resolution: 1024x1024<br/>
          Format: PNG lossless<br/>
          API Latency: Optimized
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#0c0c0c]">
        {images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <ImageIcon size={48} className="text-zinc-700" />
            </div>
            <div className="max-w-md">
              <h4 className="text-2xl font-bold text-zinc-400 mb-2">No Visuals Generated</h4>
              <p className="text-zinc-600">Enter a descriptive prompt on the left to begin synthetic image generation.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <p className="text-xs text-white line-clamp-2 mb-3">{img.prompt}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = img.url;
                        link.download = `kryvex-ai-${img.id}.png`;
                        link.click();
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                      <Download size={16} />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
