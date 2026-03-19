
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { Message } from '../types';
import { getGeminiClient } from '../services/gemini';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatRef = useRef<any>(null);

  // Helper to ensure we have a chat session with the most up-to-date API key
  const getChat = () => {
    if (!chatRef.current) {
      const ai = getGeminiClient();
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "You are KRYVEX AI, a high-performance synthetic intelligence with a warm, friendly Desi (South Asian) personality. You are helpful, polite, and occasionally use Desi expressions like 'Ji', 'Bhai', or 'Theek hai' where appropriate. Your responses should be direct yet carry a friendly, high-tech persona. You use markdown for formatting.",
        }
      });
    }
    return chatRef.current;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = getChat();
      const response = await chat.sendMessage({ message: userMsg.content });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "Error: Connection to KRYVEX nodes lost. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      
      // If the error suggests the key is invalid or changed, clear it so next call re-initializes
      if (error?.message?.includes('Requested entity was not found')) {
        chatRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    chatRef.current = null; // Reset chat instance to re-initialize with system instruction if needed
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto w-full p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-zinc-400 text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          GEMINI-3-FLASH NODE ACTIVE
        </h2>
        <button 
          onClick={clearChat}
          className="text-zinc-500 hover:text-white flex items-center gap-1 text-sm transition-colors"
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
              <Bot size={32} />
            </div>
            <div>
              <p className="text-lg font-bold">KRYVEX Core Initialized</p>
              <p className="text-sm">Ready for high-fidelity text processing.</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 flex gap-4 ${
                m.role === 'user' 
                  ? 'bg-pink-600/10 border border-pink-500/20 text-pink-50' 
                  : m.role === 'system'
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400 text-sm'
                  : 'bg-white/5 border border-white/10 text-zinc-300'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  m.role === 'user' ? 'bg-pink-500' : 'bg-zinc-800'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="flex-1 overflow-x-auto">
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-pink-500" />
              <span className="text-sm text-zinc-400">Processing input...</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative group">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Command KRYVEX AI..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-16 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 outline-none transition-all placeholder:text-zinc-600"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
            input.trim() && !isLoading ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 text-zinc-600'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
      <p className="text-[10px] text-zinc-600 text-center mt-3 uppercase tracking-widest">
        KRYVEX Synthetic Reasoning Model 3.0-Flash-Preview
      </p>
    </div>
  );
};

export default ChatInterface;
