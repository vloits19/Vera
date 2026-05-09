'use client';

import React, { useState } from 'react';
import { AuraProvider } from '@/lib/AuraContext';
import { RoomProvider } from '@/lib/RoomContext';
import { InsightPanel } from '@/components/InsightPanel';
import { DigitalRoom } from '@/components/DigitalRoom';
import { Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <AuraProvider>
      <div className="flex h-screen bg-[#111a22] overflow-hidden text-slate-200 font-sans selection:bg-[#718eb6]/30 relative">
        <button 
          onClick={() => setShowSettings(true)}
          className="absolute top-10 left-10 z-50 p-4 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 rounded-full text-slate-500 hover:text-slate-400 transition-all shadow-lg backdrop-blur-md group"
          title="Access Identity Array"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <div className="absolute inset-0 bg-emerald-400/10 rounded-full animate-ping opacity-20" />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 z-40 bg-transparent flex"
            >
              <InsightPanel onClose={() => setShowSettings(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <DigitalRoom />
      </div>
    </AuraProvider>
  );
}
