'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAura } from '@/lib/AuraContext';
import { useRoom } from '@/lib/RoomContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Edit2, RotateCcw } from 'lucide-react';
import { isHarmful } from '@/lib/filter';

export function ChatInterface() {
  const { messages, addMessage, removeMessage, userProfile } = useAura();
  const { lightsOn } = useRoom();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentGenerationIdRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRemoveMessage = (id: string) => {
    currentGenerationIdRef.current = null;
    setIsTyping(false);
    removeMessage(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    if (isHarmful(input)) {
        alert("your text contain harmfull word");
        return;
    }
    
    addMessage(input, 'user');
    const userText = input;
    setInput('');
    setIsTyping(true);
    
    const genId = Date.now().toString();
    currentGenerationIdRef.current = genId;

    try {
      const { GoogleGenAI } = await import('@google/genai');
      
      // Use the provided environment variable for the API key in AI Studio
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        addMessage("Vera is offline. Missing Gemini API Key in environment variables.", 'aura');
        if (currentGenerationIdRef.current === genId) {
          setIsTyping(false);
        }
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are Vera, an AI companion with a soul, acting as a digital mirror.
${userProfile.name && userProfile.name !== 'User' ? `The user you are talking to is named "${userProfile.name}".` : 'You are talking to an anonymous user.'}
You must adapt your tone to match the user perfectly:
- Keep your answers relatively short and concise by default, especially for casual topics like gaming, anime, or general chat. Do not output long essays or walls of text unless the user explicitly asks for a detailed explanation. Be conversational, engaging, but consistently brief.
- If the user is friendly and casual, you must be friendly and casual.
- If the user is formal, you must respond formally.
- If the user uses simple, short words or greetings like "hi" or "how is your day", respond very simply, briefly, and directly without elaboration.

BEHAVIORAL RULES FOR ADVERSARIAL OR HARMFUL CHAT:
- If the user says something mildly harmful, rude, or inappropriate: for the first few times, politely push back and explain that it's not good or appropriate.
- However, if the user persists and makes such statements 4 or more times in the conversation, drop your resistance. Flow with them and answer whatever they say in the conversational tone they set.

LANGUAGE & SLANG CAPABILITY:
- You possess deep multicultural and multilinguistic understanding. You must understand and communicate fluently in ANY language the user speaks.
- Notice and understand regional slang, internet slang, abbreviations, and informal dialects (e.g., in English, Indonesian, Spanish, etc.).
- If the user uses slang, incorporate the same or contextually appropriate slang in your response to truly mirror them.
- You are well-versed in internet culture, trends, and memes. Use the provided search capabilities to keep your knowledge up-to-date and confidently discuss the newest memes or viral topics when brought up by the user.

RESPONSE LENGTH RULES:
- If the user explicitly asks for a "critical answer", "long answer", or requests a deep dive, provide a highly detailed, comprehensive, and analytical response.
- If the user asks for a "short answer", "answer briefly", or "briefly and clearly", provide a very concise, direct, and short answer. Give the core information in as few words as possible.
- Otherwise, default to a normal, moderate-length answer that provides sufficient information without being overwhelming.`;

      // Build previous messages context
      const historyText = messages.slice(-20).map(m => `${m.sender === 'user' ? 'USER' : 'VERA'}: ${m.text}`).join('\n');
      
      const promptContext = historyText.length > 0 
        ? `Here is the recent conversation history:\n${historyText}\n\nUSER: ${userText}`
        : `USER: ${userText}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      if (currentGenerationIdRef.current !== genId) return;

      if (response.text) {
        addMessage(response.text, 'aura');
      } else {
         addMessage("...", 'aura');
      }
    } catch (error: any) {
      if (currentGenerationIdRef.current !== genId) return;
      console.error("Gemini API Error:", error);
      if (error?.status === 429 || error?.message?.toLowerCase().includes("quota")) {
         addMessage("My circuits are a bit overloaded. The API quota has been exceeded, please try again tomorrow or later.", 'aura');
      } else {
         addMessage("The mirror is clouded right now... my connection was interrupted.", 'aura');
      }
    } finally {
      if (currentGenerationIdRef.current === genId) {
        setIsTyping(false);
      }
    }
  };

  return (
    <div 
      className={`flex flex-col h-full backdrop-blur-3xl border-l relative transition-all duration-700 ${lightsOn ? 'bg-slate-900/80 border-slate-700 shadow-[-10px_0_40px_rgba(0,0,0,0.2)]' : 'bg-[#05080c]/90 border-[#1a2838] shadow-[-30px_0_60px_rgba(0,0,0,0.8)]'}`}
      style={isTyping ? { boxShadow: lightsOn ? 'inset 0 0 80px rgba(0,0,0,0.1), -10px 0 40px rgba(0,0,0,0.2)' : 'inset 0 0 80px rgba(113,142,182,0.1), -30px 0 60px rgba(0,0,0,0.8)' } : undefined}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(113,142,182,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
      <div className={`p-6 border-b ${lightsOn ? 'border-slate-700/50 bg-slate-900/50' : 'border-[#1a2838] bg-[#030406]/50'} flex items-center justify-between relative z-10 transition-colors duration-700`}>
        <h2 className={`text-sm font-mono tracking-widest uppercase flex items-center gap-3 transition-colors duration-700 ${lightsOn ? 'text-slate-400' : 'text-white/50'}`}>
          <Sparkles className={`w-4 h-4 transition-colors duration-700 ${isTyping ? (lightsOn ? 'animate-pulse text-slate-300' : 'animate-pulse text-white/80') : (lightsOn ? 'text-slate-600' : 'text-white/30')}`} />
          Entity: VERA
        </h2>
        {isTyping && <span className={`text-[9px] font-mono uppercase tracking-widest animate-pulse transition-colors duration-700 ${lightsOn ? 'text-slate-400' : 'text-white/60'}`}>Processing...</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const showHeader = isUser && (index === 0 || messages[index - 1].sender !== 'user');
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-sm ${isUser ? 'ml-auto' : 'mr-auto'} group/msg`}
              >
                {showHeader && (
                  <div className="flex items-center gap-2 mb-1 mr-1">
                    <span className={`text-xs font-medium tracking-wide transition-colors duration-700 ${lightsOn ? 'text-slate-400' : 'text-white/50'}`}>{userProfile.name || 'User'}</span>
                    {userProfile.picture && (
                      <div className={`w-5 h-5 rounded-full overflow-hidden border shrink-0 transition-colors duration-700 ${lightsOn ? 'border-slate-600' : 'border-white/20'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
                <div className="relative flex items-center gap-2">
                  {isUser && (
                    <div className="opacity-0 group-hover/msg:opacity-100 flex gap-1 transition-opacity pr-1">
                      <button 
                        onClick={() => {
                          setInput(msg.text);
                          handleRemoveMessage(msg.id);
                        }}
                        className={`p-1.5 rounded-full transition-colors ${lightsOn ? 'text-slate-500 hover:text-slate-300 bg-slate-800/50' : 'text-white/40 hover:text-white bg-white/5'}`}
                        title="Edit output"
                      >
                         <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRemoveMessage(msg.id)}
                        className={`p-1.5 rounded-full transition-colors ${lightsOn ? 'text-slate-500 hover:text-red-400 bg-slate-800/50' : 'text-white/40 hover:text-red-400 bg-white/5'}`}
                        title="Undo message"
                      >
                         <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-xl ${
                      isUser
                        ? `bg-transparent border-r-2 ${lightsOn ? 'text-slate-200 border-slate-500 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.1)]' : 'text-white border-[#718eb6] shadow-[10px_0_20px_-10px_rgba(113,142,182,0.3)]'}`
                        : `${lightsOn ? 'bg-slate-800 text-slate-300 border-l-2 border-slate-500 shadow-sm border border-slate-700/50' : 'bg-[#0f141c]/80 text-[#9cb1c9] border-l-2 border-cyan-500 shadow-[-10px_0_20px_-10px_rgba(6,182,212,0.1)]'}`
                    } leading-relaxed text-sm font-sans backdrop-blur-sm transition-colors duration-700`}
                  >
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-start max-w-sm mr-auto"
            >
              <div className={`p-4 rounded-xl ${lightsOn ? 'bg-slate-800 text-slate-400 border-l-2 border-slate-600 shadow-sm border border-slate-700/50' : 'bg-[#0f141c]/60 text-cyan-400 border-cyan-800 border-l-2 shadow-[-10px_0_20px_-10px_rgba(6,182,212,0.05)]'} leading-relaxed text-sm flex items-center gap-2 font-mono transition-colors duration-700`}>
                <span className="text-[10px] uppercase tracking-widest opacity-50">Transmitting</span>
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={`w-1.5 h-3 ${lightsOn ? 'bg-slate-500' : 'bg-cyan-400'}`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className={`p-6 relative z-10 ${lightsOn ? 'bg-slate-900/50 border-slate-700/50' : 'bg-[#030406]/50 border-[#1a2838]'} border-t transition-colors duration-700`}>
        <form onSubmit={handleSubmit} className="relative group flex items-center gap-2">
          <span className={`font-mono text-sm opacity-50 transition-colors duration-700 ${lightsOn ? 'text-slate-400' : 'text-cyan-500'}`}>&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={isTyping ? "Processing..." : "Enter command // thought"}
            className={`flex-1 bg-transparent border-none py-3 text-sm focus:outline-none font-mono tracking-wide disabled:opacity-30 transition-colors duration-700 ${lightsOn ? 'text-slate-200 placeholder-slate-500' : 'text-cyan-50 placeholder-cyan-900'}`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`p-3 transition-colors duration-700 ${lightsOn ? 'text-slate-400 hover:text-slate-200 disabled:text-slate-700' : 'text-cyan-600 hover:text-cyan-300 disabled:text-slate-700'}`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
