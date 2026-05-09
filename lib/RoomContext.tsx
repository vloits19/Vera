import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type RoomLevel = 1 | 2 | 3 | 4 | 5;

interface StoreItem {
  id: string;
  name: string;
  cost: number;
  category: 'furniture' | 'decor' | 'setup';
  description: string;
}

export interface SleepData {
  isSleeping: boolean;
  sleepStartUnix: number;
  lastSleepDate: string;
}

export const STORE_ITEMS: StoreItem[] = [
  { id: 'desk', name: 'Desk & PC Setup', cost: 0, category: 'furniture', description: 'A humble beginning. Your portal to the digital mirror.' },
  { id: 'bed', name: 'Floor Mattress', cost: 20, category: 'furniture', description: 'Rest your mind.' },
  { id: 'lamp', name: 'Warm Desk Lamp', cost: 20, category: 'furniture', description: 'Adds ambient lighting.' },
  { id: 'plant', name: 'Potted Fern', cost: 30, category: 'decor', description: 'Brings life to the room.' },
  { id: 'posters', name: 'Retro Posters', cost: 40, category: 'decor', description: 'Personalize your walls.' },
  { id: 'shelf', name: 'Bookshelf', cost: 60, category: 'furniture', description: 'Store your fragmented memories.' },
];

export const INTROSPECTION_PROMPTS = [
  "If your mind was a city, what would it look like?",
  "What kind of person are you at 2 AM?",
  "Describe a memory as a room.",
  "What does silence sound like to you?",
  "If you could fast-forward your life by a year, would you?",
  "What's a feeling you struggle to put into words?",
  "Describe a dream that felt more real than reality.",
  "What is a truth you are avoiding right now?",
  "If your current mood had a color, what would it be?",
  "What is a childhood belief you still hold onto?",
  "When was the last time you felt truly at peace?",
  "What are you most afraid of forgetting?",
  "If you could erase one memory, would you?",
  "What does success look like to you when no one is watching?",
  "What is a question you wish someone would ask you?",
  "If today was a chapter in a book, what would the title be?",
  "What is the most beautiful thing you have seen recently?",
  "What do you need to forgive yourself for?",
  "If you could speak to your younger self, what would you say?",
  "What is a small detail about the world that you love?",
  "How do you know when you are truly happy?"
];

interface RoomContextType {
  dirtLevel: number;
  cleanRoom: () => void;
  curtainsOpen: boolean;
  setCurtainsOpen: (v: boolean) => void;
  lightsOn: boolean;
  setLightsOn: (v: boolean) => void;
  isClean: boolean;

  points: number;
  addPoints: (amount: number) => void;

  ownedItems: string[];
  buyItem: (id: string) => void;
  placedItems: string[];
  placeItem: (id: string, place: boolean) => void;

  roomLevel: RoomLevel;
  upgradeRoom: () => void;

  isComputerActive: boolean;
  toggleComputer: (v: boolean) => void;

  introspectivePrompt: string | null;
  setNewPrompt: () => void;
  answerPrompt: (answer: string) => void;
  closePrompt: () => void;

  waterPlant: () => boolean;
  completePomodoro: (minutes: number) => void;

  sleepData: SleepData | null;
  checkCanSleep: () => Promise<boolean>;
  startSleep: () => Promise<void>;
  wakeUp: () => void;
  fetchTrueTime: () => Promise<{unix: number, dateString: string}>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [dirtLevel, setDirtLevel] = useState(10); // Start with 10 clicks to clean
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [points, setPoints] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [placedItems, setPlacedItems] = useState<string[]>([]);
  const [roomLevel, setRoomLevel] = useState<RoomLevel>(1);
  const [isComputerActive, setIsComputerActive] = useState(false);
  const [introspectivePrompt, setIntrospectivePrompt] = useState<string | null>(null);
  
  const [answeredPrompts, setAnsweredPrompts] = useState<string[]>([]);
  const [lastWateredTime, setLastWateredTime] = useState(0);
  
  const [sleepData, setSleepData] = useState<SleepData | null>(null);

  const { status } = useSession();

  // Load local sleep data if unauthenticated, otherwise API handles it
  useEffect(() => {
    if (status !== 'authenticated') {
      const saved = localStorage.getItem('vera_sleep_data');
      if (saved) {
        try {
          setSleepData(JSON.parse(saved));
        } catch(e) {}
      }
    }
  }, [status]);

  // Sync from DB
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/room')
        .then(res => res.json())
        .then(data => {
          if (data.state) {
             setPoints(data.state.points);
             setRoomLevel(data.state.roomLevel);
             try {
                setOwnedItems(JSON.parse(data.state.ownedItems));
                setPlacedItems(JSON.parse(data.state.placedItems));
                setSleepData(data.state.sleepData !== "null" ? JSON.parse(data.state.sleepData) : null);
             } catch(e) {}
          }
        });
    }
  }, [status]);

  // Sync to DB (Debounced)
  useEffect(() => {
    if (status === 'authenticated') {
      const t = setTimeout(() => {
         fetch('/api/room', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ points, roomLevel, ownedItems, placedItems, sleepData })
         }).catch(() => {});
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [points, roomLevel, ownedItems, placedItems, sleepData, status]);

  const addPoints = (amount: number) => setPoints(p => p + amount);

  const cleanRoom = () => {
    setDirtLevel(prev => {
      if (prev > 0) {
        addPoints(5);
        return prev - 1;
      }
      return 0;
    });
  };

  const isClean = dirtLevel === 0;

  const buyItem = (id: string) => {
    const item = STORE_ITEMS.find(i => i.id === id);
    if (item && points >= item.cost && !ownedItems.includes(id)) {
      setPoints(p => p - item.cost);
      setOwnedItems(prev => [...prev, id]);
    }
  };

  const placeItem = (id: string, place: boolean) => {
    if (place && !placedItems.includes(id) && ownedItems.includes(id)) {
      setPlacedItems(prev => [...prev, id]);
    } else if (!place) {
      setPlacedItems(prev => prev.filter(i => i !== id));
    }
  };

  const upgradeRoom = () => {
    if (roomLevel < 5 && points >= roomLevel * 100) {
      setPoints(p => p - roomLevel * 100);
      setRoomLevel((prev) => (prev + 1) as RoomLevel);
    }
  };

  const toggleComputer = (v: boolean) => setIsComputerActive(v);

  const setNewPrompt = () => {
    const availablePrompts = INTROSPECTION_PROMPTS.filter(p => !answeredPrompts.includes(p));
    if (availablePrompts.length === 0) {
      setIntrospectivePrompt("You have explored all current thoughts. Rest your mind for now.");
      return;
    }
    const p = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    setIntrospectivePrompt(p);
  };

  const answerPrompt = (answer: string) => {
    if (answer.trim().length > 10) {
      if (introspectivePrompt && introspectivePrompt !== "You have explored all current thoughts. Rest your mind for now.") {
        setAnsweredPrompts(prev => [...prev, introspectivePrompt]);
      }
      addPoints(10); // Reduced from 20
      setIntrospectivePrompt(null);
    }
  };

  const closePrompt = () => {
    setIntrospectivePrompt(null);
  };

  const waterPlant = () => {
    const now = Date.now();
    if (now - lastWateredTime > 60000) { // 1 min cooldown
      addPoints(5);
      setLastWateredTime(now);
      return true;
    }
    return false;
  };

  const fetchTrueTime = async () => {
    try {
      const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Jakarta');
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      return {
        unix: data.unixtime,
        dateString: data.datetime.split('T')[0]
      };
    } catch (e) {
      console.warn("Using fallback time");
      const now = new Date();
      return {
        unix: Math.floor(now.getTime() / 1000),
        dateString: now.toISOString().split('T')[0]
      };
    }
  };

  const checkCanSleep = async () => {
    const time = await fetchTrueTime();
    if (sleepData && sleepData.lastSleepDate === time.dateString && !sleepData.isSleeping) {
      return false;
    }
    return true;
  };

  const startSleep = async () => {
    const time = await fetchTrueTime();
    const newSleepData = {
      isSleeping: true,
      sleepStartUnix: time.unix,
      lastSleepDate: time.dateString
    };
    setSleepData(newSleepData);
    localStorage.setItem('vera_sleep_data', JSON.stringify(newSleepData));
  };

  const wakeUp = () => {
    if (sleepData && sleepData.isSleeping) {
      const newSleepData = { ...sleepData, isSleeping: false };
      setSleepData(newSleepData);
      localStorage.setItem('vera_sleep_data', JSON.stringify(newSleepData));
      addPoints(10);
    }
  };

  const completePomodoro = (minutes: number) => {
    addPoints(minutes * 2);
  };

  useEffect(() => {
    // Removed auto pop up note per user request
  }, [isClean]);

  return (
    <RoomContext.Provider value={{
      dirtLevel, cleanRoom, isClean,
      curtainsOpen, setCurtainsOpen,
      lightsOn, setLightsOn,
      points, addPoints,
      ownedItems, buyItem,
      placedItems, placeItem,
      roomLevel, upgradeRoom,
      isComputerActive, toggleComputer,
      introspectivePrompt, setNewPrompt, answerPrompt, closePrompt,
      waterPlant, completePomodoro,
      sleepData, checkCanSleep, startSleep, wakeUp, fetchTrueTime
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
};
