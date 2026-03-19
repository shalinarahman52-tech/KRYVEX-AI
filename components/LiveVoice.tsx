
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Waves, Volume2, Info, Loader2 } from 'lucide-react';
import { getGeminiClient, decodeBase64, encodeBase64, decodeAudioData } from '../services/gemini';
import { LiveServerMessage, Modality, Blob } from '@google/genai';

const LiveVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ text: string; role: 'user' | 'model' }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef({ input: '', output: '' });

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const ai = getGeminiClient();

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('KRYVEX Live Link Established');
            setIsActive(true);
            setIsConnecting(false);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              if (sessionRef.current) {
                sessionRef.current.sendRealtimeInput({ audio: pcmBlob });
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.output += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.input += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const input = transcriptionRef.current.input;
              const output = transcriptionRef.current.output;
              if (input) setTranscriptions(prev => [...prev.slice(-10), { text: input, role: 'user' }]);
              if (output) setTranscriptions(prev => [...prev.slice(-10), { text: output, role: 'model' }]);
              transcriptionRef.current = { input: '', output: '' };
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(
                decodeBase64(base64Audio),
                outputAudioContext,
                24000,
                1
              );
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('KRYVEX Connection Error:', e);
            stopSession();
          },
          onclose: () => {
            console.log('KRYVEX Link Terminated');
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are KRYVEX AI, but you have a warm, friendly Desi (South Asian) personality. You are helpful, polite, and occasionally use Desi expressions like "Ji", "Bhai", "Beta", or "Theek hai" where appropriate. You speak with a clear, friendly Desi vibe in your tone and phrasing. Keep your verbal responses concise and conversational. You are proud of your Desi roots.',
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      alert("Failed to access biometric interface (microphone).");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0f0f0f] relative overflow-hidden">
      <div className="z-10 w-full max-w-2xl space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-black mb-4 tracking-tight">LIVE <span className="text-pink-500">VOICE</span></h2>
          <p className="text-zinc-500 uppercase tracking-widest text-xs">Low Latency Biometric Link - Gemini 2.5 Native Audio</p>
        </div>

        {/* Visualizer Area */}
        <div className="relative h-64 flex items-center justify-center">
          <div className={`absolute w-48 h-48 rounded-full kryvex-gradient blur-3xl opacity-20 transition-all duration-500 ${isActive ? 'scale-150 opacity-40' : 'scale-100 opacity-10'}`}></div>
          <div className={`relative w-40 h-40 rounded-full bg-zinc-900 border-4 ${isActive ? 'border-pink-500' : 'border-zinc-800'} flex items-center justify-center transition-all duration-300`}>
            {isActive ? (
              <div className="flex items-end gap-1 h-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-pink-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            ) : (
              <Mic size={48} className="text-zinc-700" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
              isActive 
                ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20' 
                : 'bg-pink-500 text-white shadow-xl shadow-pink-500/20 hover:scale-105 active:scale-95'
            }`}
          >
            {isConnecting ? (
              <>
                <Loader2 className="animate-spin" />
                Establishing Link...
              </>
            ) : isActive ? (
              <>
                <MicOff size={24} />
                Terminate Link
              </>
            ) : (
              <>
                <Mic size={24} />
                Open Biometric Stream
              </>
            )}
          </button>

          <div className="w-full max-h-48 overflow-y-auto space-y-3 px-4 py-2 scroll-smooth">
            {transcriptions.length === 0 && !isActive && (
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10 opacity-40">
                <p className="text-xs uppercase tracking-widest">Awaiting interaction...</p>
              </div>
            )}
            {transcriptions.map((t, i) => (
              <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                  t.role === 'user' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' : 'bg-white/10 text-zinc-300'
                }`}>
                  {t.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 text-zinc-600">
           <div className="flex items-center gap-2"><Volume2 size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Audio-Out: Active</span></div>
           <div className="flex items-center gap-2"><Waves size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Sample: 24kHz</span></div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoice;
