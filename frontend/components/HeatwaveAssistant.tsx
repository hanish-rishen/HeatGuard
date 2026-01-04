import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { DISTRICTS_DATA } from '../constants';
import { ChatMessage } from '../types';

interface HeatwaveAssistantProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

export const HeatwaveAssistant: React.FC<HeatwaveAssistantProps> = ({ onClose, isDarkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am HeatGuard AI. How can I assist you with heatwave planning today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await chatWithAssistant(input, DISTRICTS_DATA);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    setLoading(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 z-50 flex flex-col animate-in slide-in-from-right duration-300 font-sans">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-900 dark:bg-black text-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-zinc-800 rounded-lg">
             <Bot size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm">HeatGuard Assistant</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-zinc-800 p-2 rounded-lg transition-colors text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-50 dark:bg-black" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm font-medium shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-red-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-red-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Processing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your query here..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-zinc-900 dark:bg-white text-white dark:text-black p-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};