'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';

export interface ThoughtNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  type?: 'note' | 'timer' | 'alarm';
  triggerAt?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
}

export interface HiddenMetrics {
  exploration: number; // 0 to 100
  structure: number;
  emotional: number;
  analytical: number;
  interactionCount: number;
}

export interface InsightProfile {
  title: string;
  description: string;
  tendencies: string[];
}

export interface UserProfile {
  name: string;
  picture: string | null;
  language: string;
}

interface AuraContextType {
  messages: ChatMessage[];
  addMessage: (text: string, sender: 'user' | 'aura') => void;
  thoughtNodes: ThoughtNode[];
  addNode: (text: string, x: number, y: number) => void;
  updateNode: (id: string, x: number, y: number) => void;
  metrics: HiddenMetrics;
  profile: InsightProfile | null;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  removeNode: (id: string) => void;
  removeMessage: (id: string) => void;
  clearedStories: string[];
  clearStory: (storyId: string) => void;
  storyFlags: Record<string, boolean>;
  setStoryFlag: (flag: string, value: boolean) => void;
}

const defaultContext: AuraContextType = {
  messages: [],
  addMessage: () => {},
  thoughtNodes: [],
  addNode: () => {},
  updateNode: () => {},
  metrics: { exploration: 50, structure: 50, emotional: 50, analytical: 50, interactionCount: 0 },
  profile: null,
  userProfile: { name: 'User', picture: null, language: 'en' },
  updateUserProfile: () => {},
  removeNode: () => {},
  removeMessage: () => {},
  clearedStories: [],
  clearStory: () => {},
  storyFlags: {},
  setStoryFlag: () => {}
};

const AuraContext = createContext<AuraContextType>(defaultContext);

const profileStages = [
  {
    title: "The Observer",
    description: "You tend to absorb information. Your thoughts branch out subtly before you make a conclusion.",
    tendencies: ["Cautious pacing", "Wait-and-see approach", "Detail-oriented curiosity"]
  },
  {
    title: "The Chaotic Explorer",
    description: "You jump between ideas rapidly. Your canvas shows a scatter of disconnected thoughts waiting to be unified.",
    tendencies: ["Prefers exploration over structure", "Thinking in branching ideas", "Spontaneous connections"]
  },
  {
    title: "The Deep Analyzer",
    description: "Your conversations often shift towards philosophical or systematic breakdowns of simple concepts.",
    tendencies: ["Overanalyzing future possibilities", "Seeking root causes", "Structured thought progression"]
  }
];

export function AuraProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thoughtNodes, setThoughtNodes] = useState<ThoughtNode[]>([]);
  const [metrics, setMetrics] = useState<HiddenMetrics>({ exploration: 50, structure: 50, emotional: 50, analytical: 50, interactionCount: 0 });
  const [profile, setProfile] = useState<InsightProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'User', picture: null, language: 'en' });
  const [clearedStories, setClearedStories] = useState<string[]>([]);
  const [storyFlags, setStoryFlags] = useState<Record<string, boolean>>({});

  const setStoryFlag = (flag: string, value: boolean) => {
    setStoryFlags(prev => ({ ...prev, [flag]: value }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const clearStory = (storyId: string) => {
    setClearedStories(prev => {
      if (!prev.includes(storyId)) {
        return [...prev, storyId];
      }
      return prev;
    });
  };

  // Simulated AI responses and metric updates
  const addMessage = (text: string, sender: 'user' | 'aura') => {
    setMessages(prev => [...prev, { id: nanoid(), sender, text }]);
    
    if (sender === 'user') {
      setMetrics(prev => {
        const newCount = prev.interactionCount + 1;
        const newState = { ...prev, interactionCount: newCount };
        
        // Naive logic to mock hidden evolution
        if (text.length > 50) {
          newState.analytical = Math.min(100, newState.analytical + 5);
        } else {
          newState.exploration = Math.min(100, newState.exploration + 5);
        }

        if (text.toLowerCase().includes('feel') || text.toLowerCase().includes('fear') || text.toLowerCase().includes('scared')) {
          newState.emotional = Math.min(100, newState.emotional + 10);
        }

        return newState;
      });
    }
  };

  const removeMessage = (id: string) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === id);
      if (idx === -1) return prev;
      
      const nextIdx = idx + 1;
      const removeCount = (nextIdx < prev.length && prev[idx].sender === 'user' && prev[nextIdx].sender === 'aura') ? 2 : 1;
      
      const next = [...prev];
      next.splice(idx, removeCount);
      return next;
    });
  };

  const addNode = (text: string, x: number, y: number) => {
    let type: 'note' | 'timer' | 'alarm' = 'note';
    let triggerAt: number | undefined = undefined;

    const lowerText = text.toLowerCase();
    
    if (lowerText.startsWith('/timer ') || lowerText.startsWith('timer ')) {
      type = 'timer';
      const match = lowerText.match(/timer\s+(\d+)(s|m|h)/);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2];
        let ms = val * 1000;
        if (unit === 'm') ms *= 60;
        if (unit === 'h') ms *= 3600;
        triggerAt = Date.now() + ms;
      }
    } else if (lowerText.startsWith('/alarm ') || lowerText.startsWith('alarm ')) {
      type = 'alarm';
      const match = lowerText.match(/alarm\s+(\d{1,2}):(\d{2})/);
      if (match) {
        const date = new Date();
        const hours = parseInt(match[1]);
        const mins = parseInt(match[2]);
        date.setHours(hours, mins, 0, 0);
        if (date.getTime() < Date.now()) {
          date.setDate(date.getDate() + 1);
        }
        triggerAt = date.getTime();
      }
    }

    const colors = ['#718eb6', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setThoughtNodes(prev => [...prev, { id: nanoid(), text, x, y, color: randomColor, type, triggerAt }]);
    
    setMetrics(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      exploration: Math.min(100, prev.exploration + 8),
      structure: Math.max(0, prev.structure - 5)
    }));
  };

  const updateNode = (id: string, x: number, y: number) => {
    setThoughtNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    setMetrics(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 0.2, // Small change
      structure: Math.min(100, prev.structure + 2) // Organizing nodes increases structure
    }));
  };

  const removeNode = (id: string) => {
    setThoughtNodes(prev => prev.filter(n => n.id !== id));
  };

  // Evolution hook
  useEffect(() => {
    if (metrics.interactionCount >= 5 && !profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(profileStages[0]);
    } else if (metrics.interactionCount >= 15 && metrics.exploration > 70 && profile?.title === profileStages[0].title) {
      setProfile(profileStages[1]);
    } else if (metrics.interactionCount >= 15 && metrics.analytical > 70 && profile?.title === profileStages[0].title) {
      setProfile(profileStages[2]);
    }
  }, [metrics, profile]);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      addMessage("Welcome to your digital mirror. Drop your thoughts here, type them, or sketch them out. I'll silently observe.", 'aura');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Timer/Alarm checker
  useEffect(() => {
    // Request permission once
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      setThoughtNodes(prev => {
        let changed = false;
        const next = prev.map(n => {
          if (n.triggerAt && n.triggerAt <= now) {
            changed = true;
            // Trigger notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Vera Alert', { body: n.text });
              try {
                // Try to play a subtle notification sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play();
              } catch (e) {}
            }
            // Remove trigger so it doesn't fire again
            return { ...n, triggerAt: undefined, text: `[Triggered] ${n.text}` };
          }
          return n;
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuraContext.Provider value={{ messages, addMessage, thoughtNodes, addNode, updateNode, removeNode, removeMessage, metrics, profile, userProfile, updateUserProfile, clearedStories, clearStory, storyFlags, setStoryFlag }}>
      {children}
    </AuraContext.Provider>
  );
}

export function useAura() {
  return useContext(AuraContext);
}
