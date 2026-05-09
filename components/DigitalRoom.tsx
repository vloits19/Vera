import React, { useState, useMemo, useEffect } from 'react';
import { useRoom, STORE_ITEMS } from '@/lib/RoomContext';
import { motion, AnimatePresence } from 'motion/react';
import { useSession, signIn } from "next-auth/react";
import { Power, Terminal, Zap, Trash2, Sun, Moon, Sparkles, Store, CornerDownRight, MessageSquare, MapPin, PenLine, Clock, BookOpen, Paintbrush, X, Play, Pause, RotateCcw, Droplets, Book, ChevronRight } from 'lucide-react';
import { ChatInterface } from '@/components/ChatInterface';
import { ThoughtCanvas } from '@/components/ThoughtCanvas';
import { isHarmful } from '@/lib/filter';
import { StoryView } from '@/components/StoryView';

const getRoomTheme = (level: number, lightsOn: boolean = false) => {
  if (lightsOn) {
    switch(level) {
         case 1: return { wall: 'bg-gradient-to-br from-[#231f2d] to-[#1c1825]', floor: 'bg-[#191522]', light: 'from-[#6a3f9e]/10', ambient: 'bg-purple-900/10' };
         case 2: return { wall: 'bg-gradient-to-br from-[#1b2636] to-[#162132]', floor: 'bg-[#141d2d]', light: 'from-[#3a86ff]/15', ambient: 'bg-blue-900/15' };
         case 3: return { wall: 'bg-gradient-to-br from-[#251a33] to-[#201833]', floor: 'bg-[#1d162e]', light: 'from-[#ff006e]/15', ambient: 'bg-pink-900/15' };
         case 4: return { wall: 'bg-gradient-to-br from-[#202939] to-[#1c2433]', floor: 'bg-[#1a2130]', light: 'from-[#06d6a0]/20', ambient: 'bg-emerald-900/15' };
         case 5: return { wall: 'bg-gradient-to-br from-[#301c38] to-[#2a1832]', floor: 'bg-[#26152e]', light: 'from-[#ff9f1c]/25', ambient: 'bg-orange-900/20' };
         default: return { wall: 'bg-gradient-to-br from-[#231f2d] to-[#1c1825]', floor: 'bg-[#191522]', light: 'from-[#6a3f9e]/10', ambient: 'bg-purple-900/10' };
    }
  }
  switch(level) {
     case 1: return { wall: 'bg-gradient-to-br from-[#1c1825] to-[#101420]', floor: 'bg-[#0a0c12]', light: 'from-[#6a3f9e]/10', ambient: 'bg-purple-900/10' };
     case 2: return { wall: 'bg-gradient-to-br from-[#182335] to-[#101726]', floor: 'bg-[#0a0e18]', light: 'from-[#3a86ff]/15', ambient: 'bg-blue-900/15' };
     case 3: return { wall: 'bg-gradient-to-br from-[#241a33] to-[#1a1c38]', floor: 'bg-[#0f111f]', light: 'from-[#ff006e]/15', ambient: 'bg-pink-900/15' };
     case 4: return { wall: 'bg-gradient-to-br from-[#202c38] to-[#1b2233]', floor: 'bg-[#101522]', light: 'from-[#06d6a0]/20', ambient: 'bg-emerald-900/15' };
     case 5: return { wall: 'bg-gradient-to-br from-[#3d1c31] to-[#2b1735]', floor: 'bg-[#1a0e22]', light: 'from-[#ff9f1c]/25', ambient: 'bg-orange-900/20' };
     default: return { wall: 'bg-gradient-to-br from-[#1c1825] to-[#101420]', floor: 'bg-[#0a0c12]', light: 'from-[#6a3f9e]/10', ambient: 'bg-purple-900/10' };
  }
};

export const DigitalRoom = () => {
  const {
    dirtLevel, cleanRoom, isClean,
    curtainsOpen, setCurtainsOpen,
    lightsOn, setLightsOn,
    points,
    ownedItems, buyItem,
    roomLevel, upgradeRoom,
    isComputerActive, toggleComputer,
    introspectivePrompt, answerPrompt, setNewPrompt, closePrompt,
    waterPlant, completePomodoro,
    sleepData, checkCanSleep, startSleep, wakeUp, fetchTrueTime
  } = useRoom();

  const [showStore, setShowStore] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom UI States
  const [showTimer, setShowTimer] = useState(false);
  const [timerTime, setTimerTime] = useState(25 * 60);
  const [timerOriginalTime, setTimerOriginalTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [initialStoryId, setInitialStoryId] = useState<string | undefined>();

  // Furniture Actions
  const [isWatering, setIsWatering] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [upgradeFlash, setUpgradeFlash] = useState(false);
  
  const [showSleepConfirm, setShowSleepConfirm] = useState(false);
  const [isSleepLoading, setIsSleepLoading] = useState(false);
  const [sleepOverlayTimePassed, setSleepOverlayTimePassed] = useState(0);

  const { data: session, status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [veraName, setVeraName] = useState<string | null>(null);

  // Sync user profile after login
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
             setVeraName(data.user.veraName);
             if (!data.user.veraName) {
                setShowNameModal(true);
             }
          }
        });
    }
  }, [status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sleepData && sleepData.isSleeping) {
      const updatePassedTime = async () => {
         const time = await fetchTrueTime();
         const passed = time.unix - sleepData.sleepStartUnix;
         setSleepOverlayTimePassed(passed);
         if (passed >= 28800) { // 8 hours
            wakeUp();
         }
      };
      updatePassedTime();
      interval = setInterval(updatePassedTime, 60000); // Check every minute
    }
    return () => clearInterval(interval);
  }, [sleepData, fetchTrueTime, wakeUp]);
  
  useEffect(() => {
    if (roomLevel > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUpgradeFlash(true);
      const t = setTimeout(() => setUpgradeFlash(false), 1000);
      return () => clearTimeout(t);
    }
  }, [roomLevel]);

  const [hasShownPrologue, setHasShownPrologue] = useState(false);
  const [objectiveAlert, setObjectiveAlert] = useState<string | null>(null);

  const triggerObjective = (msg: string) => {
    setObjectiveAlert(msg);
    setTimeout(() => setObjectiveAlert(null), 4000);
  };

  useEffect(() => {
    if (isClean && !hasShownPrologue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasShownPrologue(true);
      setInitialStoryId('prologue');
      setShowStory(true);
      triggerObjective("NEW OBJECTIVE: Uncover the story");
    }
  }, [isClean, hasShownPrologue]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => setTimerTime(t => t - 1), 1000);
    } else if (timerTime === 0 && isTimerRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsTimerRunning(false);
      completePomodoro(timerOriginalTime / 60);
      triggerObjective("POMODORO COMPLETED");
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timerTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const theme = getRoomTheme(roomLevel, lightsOn);

  // Deterministic positions for trash
  const trashItems = useMemo(() => Array.from({ length: 15 }).map((_, i) => {
    const types = ['box', 'corrupted', 'stain', 'wires'];
    return {
      id: i,
      bottom: 20 + ((i * 17) % 25),
      left: 10 + ((i * 29) % 80),
      type: types[i % 4],
      delay: (i * 0.1) % 1
    };
  }), []);

  const rainDrops = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: (i * 13) % 100,
    delay: (i * 0.1) % 2,
    duration: 0.5 + ((i * 0.7) % 0.5)
  })), []);

  const dustParticles = useMemo(() => Array.from({ length: dirtLevel * 3 }).map((_, i) => ({
    id: i,
    left: (i * 23) % 100,
    top: (i * 19) % 100,
    delay: (i * 0.5) % 5
  })), [dirtLevel]);

  const visibleTrashCount = dirtLevel;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowStore(prev => !prev);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isComputerActive ? (
        <motion.div 
          key="computer"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`flex-1 relative flex overflow-hidden pl-24 w-full h-full transition-colors duration-1000 ${theme.ambient}`}
        >
          <div className={`absolute inset-0 z-50 pointer-events-none opacity-[0.05] ${lightsOn ? 'mix-blend-multiply' : 'mix-blend-overlay'}`}>
              <div className={`w-full h-full bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0)_50%,${lightsOn ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,1)'}_50%,${lightsOn ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,1)'})] bg-[length:100%_4px]`} />
          </div>
          <div className={`absolute inset-0 z-50 pointer-events-none transition-colors duration-1000 ${lightsOn ? 'bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.05)_100%)]' : 'bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.3)_100%)]'}`} />
          <div className="absolute inset-0 z-0">
            <ThoughtCanvas />
          </div>
          <div className={`absolute top-0 right-0 bottom-0 w-[400px] z-20 pointer-events-auto transition-shadow duration-1000 ${lightsOn ? 'shadow-[-20px_0_40px_rgba(0,0,0,0.02)]' : 'shadow-[-20px_0_40px_rgba(0,0,0,0.5)]'}`}>
            <ChatInterface />
          </div>
          <button
            onClick={() => toggleComputer(false)}
            className="absolute top-6 right-[420px] p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full z-50 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-md border border-red-500/20 group"
            title="Disconnect from Mirror"
          >
            <Power className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </motion.div>
      ) : (
        <motion.div 
          key="room"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`relative flex-1 w-full h-full overflow-hidden transition-colors duration-1000 ${theme.ambient} flex items-center justify-center`}
        >
          {/* Background layer */}
          <div className={`absolute inset-0 transition-colors duration-1000 bg-black`} />
      
          <AnimatePresence>
            {upgradeFlash && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-[100] mix-blend-overlay pointer-events-none"
              />
            )}
          </AnimatePresence>

      <AnimatePresence>
        {objectiveAlert && (
          <motion.div 
             initial={{ opacity: 0, y: -50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -50 }}
             className="absolute top-12 left-1/2 -translate-x-1/2 z-[300] pointer-events-none"
          >
             <div className="bg-cyan-950/80 border border-cyan-500/50 backdrop-blur-md px-8 py-4 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex items-center gap-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-50 font-mono tracking-[0.2em] uppercase text-sm">{objectiveAlert}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResting && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1 }}
             className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center pointer-events-none"
          >
             <span className="text-white/20 font-serif tracking-[0.5em] uppercase text-sm animate-pulse">Resting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Parallax Container */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden"
        style={{ width: 'calc(100% + 40px)', height: 'calc(100% + 40px)' }}
        animate={{
          x: mousePos.x * -20,
          y: mousePos.y * -20,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
      >
        
        {/* Sky / Outside Window (Deep Layer) */}
        <motion.div 
          className={`absolute inset-0 flex items-center justify-center transition-colors duration-1000 ${roomLevel >= 3 ? 'bg-gradient-to-br from-[#1a0f2e] via-[#050810] to-[#0a192f]' : (roomLevel >= 5 ? 'bg-gradient-to-tr from-[#38112c] via-[#10081a] to-[#0d1b2a]' : 'bg-[#050810]')}`}
          animate={{ x: mousePos.x * -10, y: mousePos.y * -10 }}
        >
          {curtainsOpen && roomLevel >= 2 && (
            <div className="absolute inset-0 opacity-60 mix-blend-screen">
              <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tr from-cyan-600/10 via-fuchsia-600/10 to-transparent blur-[80px]" />
            </div>
          )}
          {curtainsOpen && roomLevel >= 2 && (
            <div className="absolute inset-0 opacity-40">
              {rainDrops.map((drop) => (
                <div key={drop.id} className="rain-drop" style={{ left: `${drop.left}%`, animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }} />
              ))}
            </div>
          )}
          {curtainsOpen && (
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-fuchsia-900/30 via-cyan-900/10 to-transparent opacity-80" />
          )}
        </motion.div>

        {/* Room Structure Layer */}
        <div className={`absolute inset-0 transition-all duration-1000 ${theme.wall} flex flex-col justify-between ${lightsOn ? 'shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]' : 'shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]'}`}>
           
           {/* Back Wall */}
           <div className="relative w-full h-[65%] shadow-xl">
              {/* Window Cutout */}
              <div className="absolute top-[10%] left-[20%] w-[25%] h-[75%] border-[12px] border-[#0a0c10] bg-transparent shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                {!curtainsOpen ? (
                  <div className={`w-full h-full bg-[#11141a] border-l border-[#2a3040] flex items-center justify-center relative shadow-[inset_-20px_0_40px_rgba(0,0,0,0.5)] group overflow-hidden ${isClean ? 'cursor-pointer hover:bg-[#151921]' : 'cursor-not-allowed opacity-80'} transition-colors duration-500`} onClick={() => isClean && setCurtainsOpen(true)}>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-[#0a0c10]" />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
                  </div>
                ) : (
                  <div className="w-full h-full relative group bg-blue-500/5">
                     {/* Window pane crosses */}
                     <div className="absolute inset-x-0 top-1/2 h-2 bg-[#0a0c10] -translate-y-1/2 z-10 pointer-events-none" />
                     <div className="absolute inset-y-0 left-1/2 w-2 bg-[#0a0c10] -translate-x-1/2 z-10 pointer-events-none" />
                     
                     <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-20">
                        {/* Top Left: Note */}
                        <div 
                          className="relative group/pane cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center p-2"
                          onClick={() => { setNewPrompt(); setShowStore(false); setShowTimer(false); setShowStory(false); setShowMemories(false); }}
                        >
                          <div className="opacity-0 group-hover/pane:opacity-100 transition-all duration-300 text-center text-white/70 font-mono text-[8px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur border border-white/10 shadow-lg pointer-events-none">
                            <PenLine className="w-3 h-3 mx-auto mb-1" /> Note
                          </div>
                        </div>

                        {/* Top Right: Pomodoro */}
                        <div 
                          className="relative group/pane cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center p-2"
                          onClick={() => { setShowTimer(true); setShowStore(false); setShowStory(false); setShowMemories(false); }}
                        >
                          <div className="opacity-0 group-hover/pane:opacity-100 transition-all duration-300 text-center text-white/70 font-mono text-[8px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur border border-white/10 shadow-lg pointer-events-none">
                            <Clock className="w-3 h-3 mx-auto mb-1" /> Pomodoro
                          </div>
                        </div>

                        {/* Bottom Left: Story Visual Novel */}
                        <div 
                          className="relative group/pane cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center p-2"
                          onClick={() => { 
                            setShowStory(true); setShowStore(false); setShowTimer(false); setShowMemories(false); 
                            triggerObjective("SYSTEM: ACCESSING ARCHIVE...");
                          }}
                        >
                          <div className="opacity-0 group-hover/pane:opacity-100 transition-all duration-300 text-center text-white/70 font-mono text-[8px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur border border-white/10 shadow-lg pointer-events-none">
                            <BookOpen className="w-3 h-3 mx-auto mb-1" /> Story
                          </div>
                        </div>

                        {/* Bottom Right: Customize */}
                        <div 
                          className="relative group/pane cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center p-2"
                          onClick={() => { setShowStore(true); setShowTimer(false); setShowStory(false); setShowMemories(false); }}
                        >
                          <div className="opacity-0 group-hover/pane:opacity-100 transition-all duration-300 text-center text-white/70 font-mono text-[8px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur border border-white/10 shadow-lg pointer-events-none">
                            <Paintbrush className="w-3 h-3 mx-auto mb-1" /> Build
                          </div>
                        </div>
                     </div>
                     <button onClick={() => setCurtainsOpen(false)} className="absolute top-2 right-2 z-30 p-1 bg-black/40 hover:bg-black/80 rounded border border-white/10 text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                       <X className="w-3 h-3" />
                     </button>
                  </div>
                )}
              </div>

               {/* Wall Details / Fog */}
               <div className={`absolute inset-0 bg-gradient-to-br ${theme.light} transition-all duration-1000 ${lightsOn ? 'opacity-80' : 'opacity-30'} mix-blend-overlay pointer-events-none`} />
               
               {/* UI / Energy System (Appears only when room is clean) */}
               {isClean && (
                 <div className="absolute top-[10%] left-[8%] flex flex-col gap-4">
                   <div className="w-[140px] bg-[#050608]/60 backdrop-blur-sm border border-white/10 p-3 rounded-md text-white/40 font-mono text-xs uppercase shadow-lg hover:border-white/20 transition-colors duration-500 cursor-default">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <span className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-yellow-500/50 rounded-full animate-pulse" />
                           Energy
                        </span>
                        <span className="text-white/80">{points}</span>
                      </div>
                      <div className="space-y-1">
                        {ownedItems.includes('lamp') && (
                          <div 
                            onClick={() => setLightsOn(!lightsOn)} 
                            className="w-full text-left py-1 group cursor-pointer flex items-center justify-between"
                          >
                            <span className="text-white/40 group-hover:text-white transition-colors">&gt; Lights</span>
                            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors duration-300 ${lightsOn ? 'bg-yellow-500/80' : 'bg-black/50 border border-white/20'}`}>
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 ${lightsOn ? 'translate-x-4 shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'translate-x-0 opacity-50'}`} />
                            </div>
                          </div>
                        )}
                        {points >= roomLevel * 100 && roomLevel < 5 && (
                          <button 
                            onClick={upgradeRoom} 
                            className="w-full text-left text-yellow-500/60 hover:text-yellow-400 mt-2 transition-colors pt-2 border-t border-white/10"
                          >
                            &gt; Focus Space
                          </button>
                        )}
                        <button 
                          onClick={() => { setShowStore(true); setShowTimer(false); setShowStory(false); setShowMemories(false); }}
                          className="w-full text-left text-cyan-500/60 hover:text-cyan-400 mt-2 transition-colors pt-2 border-t border-white/10"
                        >
                          &gt; Build/Store
                        </button>
                      </div>
                   </div>
                   
                   {!placedItems.includes('desk') && (
                     <div className="text-[10px] text-white/30 font-serif max-w-[140px] leading-relaxed italic opacity-80 pl-1 border-l border-white/10">
                       &quot;It&apos;s clean now. I should look out the window to organize myself.&quot;
                     </div>
                   )}
                 </div>
               )}
               
               {/* Shelves rendering */}
               <AnimatePresence>
                 {placedItems.includes('shelf') && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                     className="absolute top-[20%] right-[20%] w-[15%] h-[50%] flex flex-col justify-around drop-shadow-2xl group cursor-pointer"
                     onClick={(e) => {
                       e.stopPropagation();
                       setShowMemories(true);
                       setShowStore(false);
                       setShowTimer(false);
                       setShowStory(false);
                     }}
                   >
                     <div className="absolute inset-x-[-10px] inset-y-[-20px] bg-white/0 group-hover:bg-white/5 border border-transparent group-hover:border-white/10 rounded-lg transition-colors duration-500 pointer-events-none" />
                     <div className="absolute top-[-30px] right-0 px-2 py-1 bg-black/80 border border-white/20 rounded text-[8px] uppercase tracking-wider text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md">
                       Read Memories
                     </div>
                     <div className="w-full h-3 bg-[#181a20] border-b border-[#0a0c10] shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative">
                        {/* Books */}
                        <div className="absolute bottom-full left-4 flex items-end opacity-80 group-hover:opacity-100 transition-opacity">
                           <div className="w-3 h-10 bg-indigo-900/50 group-hover:bg-indigo-700/80 rounded-t-sm transition-colors" />
                           <div className="w-2 h-12 bg-slate-800/80 group-hover:bg-cyan-900/80 rounded-t-sm mx-0.5 transition-colors" />
                           <div className="w-4 h-9 bg-purple-900/60 group-hover:bg-purple-700/80 rounded-t-sm rotate-6 origin-bottom-left transition-colors" />
                        </div>
                     </div>
                     <div className="w-full h-3 bg-[#181a20] border-b border-[#0a0c10] shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative">
                        <div className="absolute bottom-full right-4">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-900/40 to-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <AnimatePresence>
                 {placedItems.includes('posters') && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     className="absolute top-[15%] left-[55%] flex gap-4 cursor-pointer group"
                     onClick={() => { setShowStory(true); setShowStore(false); setShowTimer(false); setShowMemories(false); triggerObjective("SYSTEM: ACCESSING ARCHIVE..."); }}
                   >
                      <div className="absolute inset-x-0 bottom-full mb-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-mono tracking-widest text-white/50 bg-black/50 px-2 py-1 rounded border border-white/10 backdrop-blur whitespace-nowrap">Examine</span>
                      </div>
                      <div className="w-16 h-24 bg-[#0d1522] border border-[#233554] shadow-[0_4px_10px_rgba(0,0,0,0.5)] -rotate-3 p-1 transition-transform group-hover:scale-105">
                         <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]" />
                      </div>
                      <div className="w-20 h-28 bg-[#1a0f14] border border-[#522b3b] shadow-[0_4px_10px_rgba(0,0,0,0.5)] rotate-2 mt-4 flex items-center justify-center overflow-hidden relative transition-transform group-hover:scale-105">
                         <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent" />
                         <span className="text-[6px] tracking-[0.2em] uppercase text-pink-500/50 font-bold whitespace-nowrap -rotate-90">Awake</span>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Wall Shadow Layer */}
               <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${lightsOn ? 'opacity-0' : (curtainsOpen ? 'opacity-50' : 'opacity-90')}`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/95" />
               </div>
               
               {/* Ambient Lights Layer */}
               <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${lightsOn ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent mix-blend-overlay" />
                  <div className="absolute inset-0 bg-white/10 mix-blend-screen" />
                  <div className="absolute top-0 right-[20%] w-[60vw] h-[60vw] bg-yellow-200/5 blur-[150px] rounded-full mix-blend-screen" />
               </div>
           </div>

           {/* Floor */}
           <div className={`relative w-full h-[35%] transition-all duration-1000 ${theme.floor} ${lightsOn ? 'shadow-[inset_0_20px_40px_rgba(0,0,0,0.3)]' : 'shadow-[inset_0_20px_50px_rgba(0,0,0,0.9)]'}`}>
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:60px_30px] [transform:perspective(500px)_rotateX(75deg)] origin-top opacity-30" />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none transition-opacity duration-1000 ${lightsOn ? 'opacity-0' : (curtainsOpen ? 'opacity-50' : 'opacity-90')}`} />
              
              {/* Floor Furniture Rendered Here for Z-index overlap */}
              <AnimatePresence>
                 {placedItems.includes('bed') && (
                   <motion.div 
                     onClick={async () => {
                        setIsSleepLoading(true);
                        const canSleep = await checkCanSleep();
                        setIsSleepLoading(false);
                        if (canSleep) {
                           setShowSleepConfirm(true);
                        } else {
                           triggerObjective("SYSTEM: ALREADY RESTED TODAY");
                        }
                     }}
                     initial={{ scaleY: 0.1, y: 50, opacity: 0, filter: 'blur(20px) hue-rotate(90deg)' }} 
                     animate={{ scaleY: 1, y: 0, opacity: 1, filter: 'blur(0px) hue-rotate(0deg)' }} 
                     exit={{ scaleY: 0.1, y: 50, opacity: 0, filter: 'blur(20px) hue-rotate(-90deg)' }}
                     transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                     className="absolute bottom-[20%] left-[10%] w-[35%] h-[60%] origin-bottom cursor-pointer group"
                     title="Rest"
                   >
                     <div className="absolute inset-x-0 bottom-full mb-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-mono tracking-widest text-white/50 bg-black/50 px-2 py-1 rounded border border-white/10 backdrop-blur">Rest</span>
                     </div>
                     <div className="absolute inset-0 bg-cyan-500/20 mix-blend-screen animate-pulse pointer-events-none rounded-xl" />
                     <div className="w-full h-full bg-[#11131a] rounded-xl border-t border-l border-[#2a3040]/30 shadow-[20px_20px_60px_rgba(0,0,0,0.8)] relative flex">
                        {/* Mattress */}
                        <div className="absolute inset-2 bg-[#181b24] rounded-lg border-t border-l border-white/5">
                           {/* Blanket fold */}
                           <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#0f1118] rounded-b-lg border-t border-white/5 opacity-50" />
                           <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] h-12 bg-[#202532] rounded-md shadow-lg transition-colors group-hover:bg-[#252a38]" />
                        </div>
                     </div>
                   </motion.div>
                 )}
              </AnimatePresence>

              <AnimatePresence>
                 {placedItems.includes('lamp') && (
                   <motion.div 
                      onClick={() => setLightsOn(!lightsOn)}
                      initial={{ scaleY: 0.1, opacity: 0, filter: 'blur(10px)' }} 
                      animate={{ scaleY: 1, opacity: 1, filter: 'blur(0px)' }} 
                      exit={{ scaleY: 0.1, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.8 }}
                      className="absolute bottom-[40%] left-[8%] w-[5%] h-[120%] pointer-events-auto cursor-pointer origin-bottom group z-30"
                   >
                      <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/5 transition-colors duration-500" />
                      <div className="absolute bottom-[280px] left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 border border-yellow-500/30 rounded text-[6px] uppercase tracking-widest text-yellow-500/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md">
                        {lightsOn ? 'Extinguish' : 'Illuminate'}
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-4 bg-[#0a0c10] rounded-full shadow-2xl group-hover:bg-[#111] transition-colors" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-full max-h-[250px] bg-gradient-to-b from-[#1a1c22] to-[#0a0c10]" />
                      <div className={`absolute bottom-[230px] left-1/2 -translate-x-1/2 w-16 h-40 border-[3px] border-yellow-500/20 rounded-md transition-all duration-700 flex items-center justify-center drop-shadow-2xl bg-[#0a0c10]/50 ${lightsOn ? 'shadow-[0_0_80px_rgba(234,179,8,0.4)] border-yellow-500/50' : 'group-hover:border-yellow-500/40'}`}>
                         <div className={`w-8 h-full rounded-sm mx-auto transition-all duration-700 blur-[2px] ${lightsOn ? 'bg-yellow-200/90 shadow-[0_0_40px_rgba(250,204,21,0.8)]' : 'bg-white/5 group-hover:bg-white/10'}`} />
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>

              <AnimatePresence>
                 {placedItems.includes('plant') && (
                   <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     className="absolute bottom-[20%] right-[10%] w-12 h-32 cursor-pointer group z-30"
                     onClick={(e) => {
                       e.stopPropagation();
                       setIsWatering(true);
                       if (waterPlant()) {
                          triggerObjective("SYSTEM: PLANT WATERED (+5 EN)");
                       }
                       setTimeout(() => setIsWatering(false), 2000);
                     }}
                   >
                      <div className="absolute inset-x-0 bottom-full mb-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-mono tracking-widest text-emerald-500/70 bg-black/80 px-2 py-1 rounded border border-emerald-500/30 backdrop-blur whitespace-nowrap">Water Plant</span>
                      </div>
                      <div className="w-10 h-10 bg-[#0d1512] border-b-4 border-[#070b09] rounded-b-xl mx-auto z-10 relative transition-transform group-hover:scale-105" />
                      <div className={`absolute top-6 left-1/2 w-16 h-24 -translate-x-1/2 transition-all ${isWatering ? 'opacity-100 scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'opacity-60'}`}>
                         {/* Leaves via CSS shapes approximations */}
                         <div className="absolute top-0 left-2 w-6 h-10 bg-emerald-900 border border-emerald-500/20 rounded-t-full rounded-bl-full rotate-[-20deg]" />
                         <div className="absolute top-4 right-0 w-8 h-12 bg-green-950 border border-green-500/10 rounded-t-full rounded-br-full rotate-[30deg]" />
                         <div className="absolute top-10 left-0 w-5 h-8 bg-teal-950 border border-teal-500/20 rounded-t-full rounded-bl-full rotate-[-45deg]" />
                      </div>
                      {isWatering && (
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 text-cyan-400">
                           <Droplets className="w-4 h-4 animate-bounce" />
                         </div>
                       )}
                   </motion.div>
                 )}
              </AnimatePresence>

              <AnimatePresence>
                 {placedItems.includes('desk') && (
                   <motion.div 
                      initial={{ scale: 0.8, y: 100, opacity: 0, filter: 'blur(15px)' }} 
                      animate={{ scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }} 
                      exit={{ scale: 0.8, y: 100, opacity: 0, filter: 'blur(15px)' }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute bottom-[10%] right-[10%] w-[35%] h-[50%] z-20 origin-bottom"
                   >
                      {/* Desk Surface */}
                      <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-[#181b24] to-[#0f1118] border-t border-l border-white/10 rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-10" />
                      {/* Desk Legs */}
                      <div className="absolute top-[20%] left-[5%] w-[4%] h-[80%] bg-gradient-to-r from-[#0a0c10] to-[#11131a]" />
                      <div className="absolute top-[20%] right-[5%] w-[4%] h-[80%] bg-gradient-to-l from-[#0a0c10] to-[#11131a]" />
                      
                      {/* Computer Setup on Desk */}
                      <div className="absolute bottom-[80%] left-1/2 -translate-x-1/2 w-[45%] h-[140%] z-20 flex flex-col justify-end">
                         <div className="relative w-full h-full flex flex-col items-center group cursor-pointer" onClick={() => toggleComputer(true)}>
                            {/* Monitor Stand */}
                            <div className="w-[20%] h-[20%] bg-[#0a0c10] mt-auto relative z-0" />
                            {/* Monitor Body */}
                              <div className="absolute bottom-[15%] w-full h-[85%] bg-gradient-to-tr from-[#11131a] to-[#1d2230] rounded-md border border-[#2a3040]/50 p-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-105 group-hover:-translate-y-2 duration-500 z-10">
                                 {/* Screen */}
                                 <div className={`w-full h-full bg-[#050508] rounded-sm overflow-hidden relative ${lightsOn ? 'shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' : 'shadow-[0_0_10px_rgba(255,255,255,0.1)]'} transition-shadow duration-1000 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                                    <motion.div 
                                       className="absolute inset-0 bg-white/5 mix-blend-screen"
                                       animate={{ opacity: [0.3, 0.4, 0.3] }}
                                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <div className="absolute inset-0 overflow-hidden opacity-30">
                                       <div className="w-full h-[200%] bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_4px] animate-[scan_4s_linear_infinite]" />
                                    </div>
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                                       <Terminal className="text-white/60 w-5 h-5 mb-2 group-hover:animate-pulse" />
                                       <div className="bg-black/80 border border-white/20 px-2 py-1 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                         <span className="text-[8px] text-white/80 tracking-wider uppercase font-mono">Boot up PC</span>
                                       </div>
                                    </div>
                                    {/* Fake desktop subtle UI */}
                                    <div className="absolute top-1 left-1 flex gap-1 opacity-20">
                                       <div className="w-2 h-2 bg-white/60 rounded-sm" />
                                       <div className="w-2 h-2 bg-white/60 rounded-sm" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 flex justify-end gap-1 opacity-50">
                                       <div className="w-1 h-3 bg-white/40 animate-pulse" />
                                       <div className="w-1 h-3 bg-white/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                   </motion.div>
                 )}
              </AnimatePresence>

              {/* Trash rendering within the room floor boundary */}
              {!isClean && (
                <div className="absolute inset-0">
                  <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
                     <span className="text-xs text-white/40 font-serif tracking-widest uppercase bg-black/20 px-4 py-2 border border-white/5 rounded backdrop-blur">
                       Clean the space to begin
                     </span>
                  </div>
                  {trashItems.slice(0, visibleTrashCount).map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); cleanRoom(); }}
                      className="absolute z-10 text-white/20 hover:text-white/60 transition-colors drop-shadow-xl saturate-0 hover:saturate-100 group"
                      style={{ bottom: `${item.bottom}%`, left: `${item.left}%` }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
                      transition={{ y: { duration: 2 + item.delay, repeat: Infinity, ease: "easeInOut" } }}
                      title="Clean up"
                    >
                      <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 px-2 py-1 bg-white/10 border border-white/20 rounded text-[8px] uppercase text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md">
                        Clean (+5 PTS)
                      </div>
                      {item.type === 'box' && (
                        <div className="w-10 h-8 bg-amber-900/20 border border-amber-700/30 rounded-sm italic text-[8px] text-amber-700/40 p-1 flex items-center justify-center rotate-12 shadow-lg backdrop-blur-sm">FRAGILE</div>
                      )}
                      {item.type === 'corrupted' && (
                        <div className="w-10 h-7 bg-cyan-900/40 border-2 border-dashed border-cyan-500/50 rounded-sm italic text-[8px] text-cyan-300/70 p-1 flex items-center justify-center -rotate-6 shadow-[0_0_10px_rgba(0,255,255,0.2)] backdrop-blur-md">
                          ERR_0x{item.id}A
                        </div>
                      )}
                      {item.type === 'stain' && (
                        <div className="w-10 h-10 relative opacity-40 mix-blend-multiply">
                          <div className="absolute top-2 left-2 w-6 h-6 bg-emerald-900/80 rounded-full blur-[1.5px]" />
                          <div className="absolute top-1 left-5 w-3 h-3 bg-emerald-800/60 rounded-full blur-[0.5px]" />
                          <div className="absolute top-6 left-1 w-2 h-2 bg-emerald-700/90 rounded-full" />
                        </div>
                      )}
                      {item.type === 'wires' && (
                        <div className="w-8 h-8 relative opacity-50 rotate-45">
                          <div className="absolute top-2 left-1/2 w-0.5 h-6 bg-slate-400 rounded-full rotate-45 border border-slate-600/50" />
                          <div className="absolute top-1 left-1 w-6 h-0.5 bg-slate-500 rounded-full rotate-12 border border-slate-700/50" />
                          <div className="absolute top-4 left-0 w-8 h-0.5 bg-red-900/70 rounded-full -rotate-12 border border-red-500/20" />
                          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-yellow-400 opacity-60" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
           </div>

           {/* Global Dust Particles */}
           {dirtLevel > 0 && (
             <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-30">
               {dustParticles.map((dust) => (
                 <div key={dust.id} className="dust-particle" style={{ left: `${dust.left}%`, top: `${dust.top}%`, animationDelay: `${dust.delay}s` }} />
               ))}
             </div>
           )}

           {/* Vignette Overlay for cinematic feel */}
           <div className={`absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] z-40 transition-opacity duration-1000 ${lightsOn ? 'opacity-30' : 'opacity-100'}`} />

        </div>
      </motion.div>

       {/* Cinematic Introspection Prompt as a Diegetic Cassette / Sticky Note / Terminal */}
      <AnimatePresence>
        {introspectivePrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto"
          >
              <div className="w-[600px] bg-[#f8f9e9] shadow-[0_20px_50px_rgba(0,0,0,0.5),auto_auto_30px_rgba(255,255,255,0.1)] p-8 rounded-sm rotate-1 border-t-8 border-[#e2e8c8] relative">
                 <button onClick={closePrompt} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">
                   <X className="w-5 h-5" />
                 </button>
                 <h2 className="text-xl font-serif text-slate-800 mb-6 leading-relaxed pr-8">
                   {introspectivePrompt}
                 </h2>
                 
                 <form 
                   onSubmit={(e) => { 
                     e.preventDefault();
                     if (isHarmful(promptInput)) {
                       alert("your text contain harmfull word");
                       return;
                     }
                     answerPrompt(promptInput); 
                     setPromptInput(''); 
                   }}
                   className="w-full flex"
                 >
                   <textarea
                     value={promptInput}
                     onChange={(e) => setPromptInput(e.target.value)}
                     placeholder="Scribble down your thoughts..."
                     className="flex-1 bg-transparent border-b-2 border-slate-300 focus:border-slate-500 focus:outline-none resize-none h-auto min-h-[40px] font-serif text-slate-700 placeholder:text-slate-400 text-lg leading-relaxed mix-blend-multiply py-2"
                     autoFocus
                   />
                   <button 
                     type="submit"
                     disabled={promptInput.trim().length <= 10}
                     className="ml-4 px-4 py-2 bg-slate-800 text-slate-200 hover:bg-black rounded-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[10px] font-mono h-fit mt-auto"
                   >
                     Leave Note (+20)
                   </button>
                 </form>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Store Sidebar (Notebook Catalog) */}
      <AnimatePresence>
        {showStore && isClean && (
          <motion.div 
            initial={{ opacity: 0, rotateY: -10, x: 20 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: -10, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ perspective: 1000 }}
            className="absolute right-10 top-[20%] bottom-[20%] w-[380px] pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="w-full h-full bg-[#f8f9e9]/95 backdrop-blur-md border border-[#e2e8c8] p-6 flex flex-col shadow-2xl pointer-events-auto rounded-sm">
               <div className="flex justify-between items-center border-b border-[#e2e8c8] pb-4 mb-6">
                 <h3 className="text-lg text-slate-800 font-serif tracking-wide flex items-center gap-3">
                   <Store className="w-4 h-4 text-slate-500" /> Catalog
                 </h3>
                 <button onClick={() => setShowStore(false)} className="px-2 py-1 hover:bg-slate-200 rounded text-slate-500 hover:text-black transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar-light">
                 {STORE_ITEMS.map((item) => {
                   const isOwned = ownedItems.includes(item.id);
                   const isPlaced = placedItems.includes(item.id);
                   return (
                     <div key={item.id} className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-serif text-sm text-slate-800 group-hover:text-black">{item.name}</span>
                          {!isOwned && (
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {item.cost} PTS
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mb-4 leading-relaxed font-sans">{item.description}</p>
                        
                        {!isOwned ? (
                          <button 
                            onClick={() => buyItem(item.id)}
                            disabled={points < item.cost}
                            className="w-full py-2 bg-slate-800 hover:bg-black text-white disabled:opacity-30 disabled:hover:bg-slate-800 rounded text-[9px] uppercase tracking-[0.1em] transition-all"
                          >
                            Order
                          </button>
                        ) : (
                          <button 
                            onClick={() => placeItem(item.id, !isPlaced)}
                            className={`w-full py-2 rounded text-[9px] uppercase tracking-[0.1em] transition-all border ${
                              isPlaced 
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isPlaced ? 'Store Away' : 'Place in Room'}
                          </button>
                        )}
                     </div>
                   )
                 })}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Sidebar */}
      <AnimatePresence>
        {showTimer && isClean && (
          <motion.div 
            initial={{ opacity: 0, rotateY: -10, x: 20 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: -10, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ perspective: 1000 }}
            className="absolute right-10 top-[20%] bottom-[20%] w-[380px] pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="w-full h-fit bg-[#f8f9e9]/95 backdrop-blur-md border border-[#e2e8c8] p-8 flex flex-col shadow-2xl pointer-events-auto rounded-sm">
               <div className="flex justify-between items-center border-b border-[#e2e8c8] pb-4 mb-8">
                 <h3 className="text-lg text-slate-800 font-serif tracking-wide flex items-center gap-3">
                   <Clock className="w-4 h-4 text-slate-500" /> Pomodoro
                 </h3>
                 <button onClick={() => setShowTimer(false)} className="px-2 py-1 hover:bg-slate-200 rounded text-slate-500 hover:text-black transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <div className="flex flex-col items-center justify-center py-8">
                 <div className="text-7xl font-mono text-slate-800 font-light tracking-wider mb-8 tabular-nums">
                   {formatTime(timerTime)}
                 </div>
                 <div className="flex gap-4">
                   <button 
                     onClick={() => setIsTimerRunning(!isTimerRunning)}
                     className="w-16 h-16 rounded-full bg-slate-800 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg"
                   >
                     {isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                   </button>
                   <button 
                     onClick={() => { setIsTimerRunning(false); setTimerTime(25 * 60); setTimerOriginalTime(25 * 60); }}
                     className="w-12 h-12 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all mt-2"
                   >
                     <RotateCcw className="w-4 h-4" />
                   </button>
                 </div>
               </div>
               <div className="mt-8 pt-6 border-t border-[#e2e8c8] flex gap-2">
                 {[15, 25, 50].map(mins => (
                   <button 
                     key={mins}
                     onClick={() => { setIsTimerRunning(false); setTimerTime(mins * 60); setTimerOriginalTime(mins * 60); }}
                     className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-mono transition-colors"
                   >
                     {mins}m
                   </button>
                 ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Novel Story Overlay */}
      <AnimatePresence>
        {showStory && isClean && (
          <StoryView onClose={() => { 
             setShowStory(false); 
             if (initialStoryId === 'prologue' && status === 'unauthenticated') {
               setShowLoginModal(true);
             }
             setInitialStoryId(undefined); 
          }} initialStoryId={initialStoryId} />
        )}
      </AnimatePresence>

      {/* Memories Sidebar */}
      <AnimatePresence>
        {showMemories && isClean && (
          <motion.div 
            initial={{ opacity: 0, rotateY: -10, x: 20 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: -10, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ perspective: 1000 }}
            className="absolute right-10 top-[20%] bottom-[20%] w-[380px] pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="w-full h-full bg-[#f8f9e9]/95 backdrop-blur-md border border-[#e2e8c8] p-8 flex flex-col shadow-2xl pointer-events-auto rounded-sm">
               <div className="flex justify-between items-center border-b border-[#e2e8c8] pb-4 mb-6">
                 <h3 className="text-lg text-slate-800 font-serif tracking-wide flex items-center gap-3">
                   <Book className="w-4 h-4 text-slate-500" /> Memories
                 </h3>
                 <button onClick={() => setShowMemories(false)} className="px-2 py-1 hover:bg-slate-200 rounded text-slate-500 hover:text-black transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar-light">
                 {/* Dummy Memories List for now */}
                 <div className="p-4 bg-white border border-slate-200 rounded shadow-sm">
                   <p className="text-xs text-slate-400 font-mono mb-2">2026-05-09</p>
                   <p className="text-sm text-slate-700 font-serif leading-relaxed italic">&quot;It feels good to have cleaned up.&quot;</p>
                 </div>
                 <div className="p-4 bg-white border border-slate-200 rounded shadow-sm">
                   <p className="text-xs text-slate-400 font-mono mb-2">2026-05-08</p>
                   <p className="text-sm text-slate-700 font-serif leading-relaxed italic">&quot;I started building the space. The little desk makes a big difference.&quot;</p>
                 </div>
                 <div className="p-4 bg-white border border-slate-200 rounded shadow-sm">
                   <p className="text-xs text-slate-400 font-mono mb-2">2026-05-07</p>
                   <p className="text-sm text-slate-700 font-serif leading-relaxed italic">&quot;It was dark. I found a corner.&quot;</p>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
          >
            <div className="bg-[#11131a] border border-[#2a3040] p-8 rounded-md shadow-2xl max-w-sm text-center">
              <h3 className="text-xl text-slate-200 font-serif mb-4">Identity Required</h3>
              <p className="text-slate-400 text-sm mb-8">
                To continue your journey and permanently save your room, please authenticate.
              </p>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  signIn('google');
                }}
                className="w-full px-4 py-3 bg-white text-slate-900 font-medium rounded hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                Sign in with Google
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Setup Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
          >
            <div className="bg-[#11131a] border border-[#2a3040] p-8 rounded-md shadow-2xl max-w-sm text-center">
              <h3 className="text-xl text-slate-200 font-serif mb-4">Who are you?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Please set your identity. You can change this name up to 2 times a year.
              </p>
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Your Name"
                maxLength={20}
                className="w-full bg-[#1a1c23] border border-[#2a3040] text-slate-200 px-4 py-2 rounded focus:outline-none focus:border-blue-500 transition-colors mb-6 text-center"
              />
              <button 
                disabled={tempName.trim().length < 2}
                onClick={async () => {
                  const res = await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newName: tempName.trim() })
                  });
                  if (res.ok) {
                     setVeraName(tempName.trim());
                     setShowNameModal(false);
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
              >
                Confirm Identity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
      <AnimatePresence>
        {showSleepConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-[#11131a] border border-[#2a3040] p-6 rounded-md shadow-2xl max-w-sm text-center">
              <h3 className="text-xl text-slate-200 font-serif mb-4">Are you ready to sleep?</h3>
              <p className="text-slate-400 text-sm mb-6">
                You will be inactive for at least 1 hour. You can wake up anytime after that. If left alone, you will wake up automatically in 8 hours.
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setShowSleepConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowSleepConfirm(false);
                    startSleep();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                >
                  Sleep
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleep Overlay */}
      <AnimatePresence>
        {sleepData && sleepData.isSleeping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-[500] bg-black flex flex-col items-center justify-center pointer-events-auto"
          >
            <motion.div 
               animate={{ opacity: [0.3, 1, 0.3] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="text-white/40 font-serif tracking-[0.5em] uppercase text-sm mb-8"
            >
               Resting...
            </motion.div>
            
            {sleepOverlayTimePassed >= 3600 && (
               <motion.button 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 onClick={() => wakeUp()}
                 className="px-6 py-2 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white rounded backdrop-blur transition-all"
               >
                 Wake Up
               </motion.button>
            )}
            {sleepOverlayTimePassed < 3600 && (
               <div className="text-white/20 text-xs font-mono">
                 {Math.max(0, Math.floor((3600 - sleepOverlayTimePassed) / 60))}m remaining until you can wake up.
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rainDrop {
          0% { transform: translateY(-20px) translateX(10px); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(400px) translateX(-30px); opacity: 0; }
        }
        .rain-drop {
           position: absolute;
           top: -20px;
           width: 1px;
           height: 30px;
           background: linear-gradient(to bottom, transparent, rgba(150,200,255,0.7));
           animation: rainDrop 1s linear infinite;
        }
        @keyframes dustWander {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          50% { transform: translate(30px, -30px) scale(1.5); opacity: 0.6; }
          100% { transform: translate(-10px, -60px) scale(1); opacity: 0; }
        }
        .dust-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #d0d0e0;
          filter: blur(1.5px);
          animation: dustWander 10s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
      `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
