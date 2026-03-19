
export type AppView = 'landing' | 'chat' | 'image' | 'video' | 'voice';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}
