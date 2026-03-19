
import React, { useState, useEffect } from 'react';
import { Video, Film, Download, Loader2, AlertCircle, Info, Key } from 'lucide-react';
import { startVideoGeneration, pollVideoOperation, downloadVideo } from '../services/gemini';
import { GeneratedVideo } from '../types';

// Accessing environment-provided aistudio via window casting to avoid declaration conflicts.
const getAiStudio = () => (window as any).aistudio;

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = getAiStudio();
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleKeySelect = async () => {
    const aistudio = getAiStudio();
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume the key selection was successful after triggering openSelectKey and proceed
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !hasKey) return;

    setIsGenerating(true);
    setStatus('Initializing Veo clusters...');
    
    try {
      let operation = await startVideoGeneration(prompt);
      
      const poll = async () => {
        while (!operation.done) {
          setStatus('Synthesizing frames (this may take a few minutes)...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await pollVideoOperation(operation);
        }
        
        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) {
          setStatus('Downloading final render...');
          const localUrl = await downloadVideo(uri);
          const newVid: GeneratedVideo = {
            id: Date.now().toString(),
            url: localUrl,
            prompt,
            timestamp: Date.now(),
          };
          setVideos(prev => [newVid, ...prev]);
        }
      };

      await poll();
      setPrompt('');
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('Requested entity was not found')) {
        setHasKey(false);
        const aistudio = getAiStudio();
        if (aistudio) {
          await aistudio.openSelectKey();
          setHasKey(true);
        }
      } else {
        alert("Generative error: Video pipeline failed.");
      }
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  if (!hasKey) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6">
          <div className="w-20 h-20 rounded-3xl kryvex-gradient flex items-center justify-center mx-auto mb-4">
            <Key size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black">Authentication Required</h2>
          <p className="text-zinc-500 text-sm">
            High-fidelity video synthesis requires a verified Billing API Key from Google AI Studio.
          </p>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs text-left flex gap-3">
            <Info size={24} className="flex-shrink-0" />
            <p>Ensure you have a paid project enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-bold">Billing Docs</a></p>
          </div>
          <button 
            onClick={handleKeySelect}
            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      <div className="w-full md:w-80 border-r border-white/10 p-6 flex flex-col gap-6 bg-white/[0.01]">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
            <Film size={18} className="text-pink-500" />
            Video Synthesis (ভিডিও তৈরি)
          </h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Model: Veo 3.1 Fast Preview</p>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cinematic Prompt (বর্ণনা লিখুন)</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="একটি সুন্দর গ্রামের মেলা, নাগরদোলা, এবং মানুষের ভিড়... (A beautiful village fair, carousel, and crowd...)"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-32 focus:border-pink-500/50 outline-none transition-all text-sm resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            {['Village Fair', 'Rainy Monsoon', 'Rickshaw Ride', 'Wedding Dance'].map(style => (
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
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Video size={20} />}
            {isGenerating ? 'Synthesizing... (তৈরি হচ্ছে...)' : 'Generate Motion (ভিডিও তৈরি করুন)'}
          </button>
        </div>

        {isGenerating && (
          <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20 animate-pulse">
            <p className="text-xs text-pink-500 font-bold mb-1">Status:</p>
            <p className="text-[10px] text-zinc-400 leading-tight uppercase tracking-tighter">{status}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#0c0c0c]">
        {videos.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <Film size={48} className="text-zinc-700" />
            </div>
            <div className="max-w-md">
              <h4 className="text-2xl font-bold text-zinc-400 mb-2">Theater is Empty</h4>
              <p className="text-zinc-600">Motion synthesis takes time. Start your first render to see results.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {isGenerating && (
              <div className="aspect-video rounded-3xl bg-white/[0.02] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-zinc-600">
                <Loader2 className="animate-spin text-pink-500" size={40} />
                <p className="text-sm font-medium animate-pulse">Processing Synthetic Motion...</p>
              </div>
            )}
            {videos.map((vid) => (
              <div key={vid.id} className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
                <video src={vid.url} controls className="w-full h-full" autoPlay loop muted />
                <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {vid.prompt}
                </div>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = vid.url;
                    link.download = `kryvex-video-${vid.id}.mp4`;
                    link.click();
                  }}
                  className="absolute bottom-4 right-4 p-3 bg-pink-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <Download size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
