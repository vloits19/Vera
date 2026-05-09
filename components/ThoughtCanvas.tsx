'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAura } from '@/lib/AuraContext';
import { useRoom } from '@/lib/RoomContext';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Clock, Bell, FileText, Plus, Trash2 } from 'lucide-react';
import type { ThoughtNode } from '@/lib/AuraContext';
import { isHarmful } from '@/lib/filter';

export function ThoughtCanvas() {
  const { thoughtNodes, addNode, updateNode } = useAura();
  const { lightsOn } = useRoom();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [newNodeText, setNewNodeText] = useState('');
  const [isTypingNode, setIsTypingNode] = useState<{x: number, y: number} | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only handle double click on the container directly to avoid triggering when double clicking nodes
    if (e.target !== containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsTypingNode({ x, y });
    setNewNodeText('');
  };

  const handleNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNodeText.trim() && isTypingNode) {
      if (isHarmful(newNodeText)) {
        alert("your text contain harmfull word");
        return;
      }
      addNode(newNodeText.trim(), isTypingNode.x, isTypingNode.y);
    }
    setIsTypingNode(null);
  };

  const handleQuickAdd = (text: string, x?: number, y?: number) => {
    if (!containerRef.current) return;
    if (isHarmful(text)) {
      alert("Please keep your thoughts respectful.");
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const spawnX = x ?? (rect.width / 2 + Math.random() * 50);
    const spawnY = y ?? (rect.height / 2 + Math.random() * 50);
    addNode(text, spawnX, spawnY);
    setIsTypingNode(null);
    setIsFabOpen(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden cursor-crosshair bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:200px_200px] transition-opacity duration-1000 ${lightsOn ? 'opacity-30' : 'opacity-70'}`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-colors duration-1000 pointer-events-none ${lightsOn ? 'bg-transparent' : 'bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/40'}`} />
      
      {/* Light Mode Grid Pattern */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${lightsOn ? 'opacity-100' : 'opacity-0'} bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:32px_32px]`} />
      
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[100px] rounded-full pointer-events-none transition-colors duration-1000 ${lightsOn ? 'bg-[#e2e8f0]/40 mix-blend-normal' : 'bg-[#9ebae1]/10 mix-blend-screen'}`} />
      
      {/* Connections (Visual only - simulated) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {thoughtNodes.map((n1, i) => 
          thoughtNodes.slice(i + 1).map((n2, j) => {
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist < 300) {
              return (
                <motion.line
                  key={`${n1.id}-${n2.id}`}
                  x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              )
            }
            return null;
          })
        )}
      </svg>

      {/* Instruction Toast */}
      {thoughtNodes.length === 0 && !isTypingNode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-white/30 pointer-events-none">
          <Network className="w-12 h-12 stroke-1" />
          <p className="text-sm tracking-widest font-light uppercase">Double click anywhere to drop a thought</p>
        </div>
      )}

      {/* Nodes */}
      {thoughtNodes.map(node => (
        <ThoughtNodeItem key={node.id} node={node} />
      ))}

      {/* Typing Node input */}
      {isTypingNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-50 w-[240px]"
          style={{ left: isTypingNode.x - 120, top: isTypingNode.y - 30 }}
        >
          <form onSubmit={handleNodeSubmit} className="bg-[#0f1423] border gap-2 border-[#718eb6]/50 rounded-2xl p-2 shadow-2xl flex flex-col">
             <input
               autoFocus
               type="text"
               value={newNodeText}
               onChange={e => setNewNodeText(e.target.value)}
               placeholder="Thought fragment..."
               className="bg-transparent border-none outline-none text-sm text-white placeholder-white/30 px-2 py-1 w-full"
               onBlur={(e) => {
                 // Ignore blur if we are clicking a quick action button inside the form
                 if (e.relatedTarget?.closest('form')) return;
                 if(!newNodeText.trim()) setIsTypingNode(null);
               }}
             />
             
             <div className="flex flex-col gap-1 px-1 pb-1">
               <div className="text-[10px] text-white/40 uppercase tracking-widest pl-1 mb-1 font-bold">Quick Presets</div>
               <div className="grid grid-cols-2 gap-1">
                 <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); handleQuickAdd('timer 5m', isTypingNode.x, isTypingNode.y); }} 
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg text-white/70 transition-colors"
                 >
                   <Clock className="w-3.5 h-3.5 text-[#718eb6]" /> 5m Timer
                 </button>
                 <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); handleQuickAdd('timer 15m', isTypingNode.x, isTypingNode.y); }} 
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg text-white/70 transition-colors"
                 >
                   <Clock className="w-3.5 h-3.5 text-[#718eb6]" /> 15m Timer
                 </button>
                 <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); handleQuickAdd('alarm 08:30', isTypingNode.x, isTypingNode.y); }} 
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg text-white/70 transition-colors"
                 >
                   <Bell className="w-3.5 h-3.5 text-amber-400" /> Alarm 8:30
                 </button>
                 <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); handleQuickAdd('Note: Read Article', isTypingNode.x, isTypingNode.y); }} 
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg text-white/70 transition-colors"
                 >
                   <FileText className="w-3.5 h-3.5 text-pink-400" /> Quick Note
                 </button>
               </div>
             </div>
             
             <div className="flex justify-end px-2 mt-1">
               <span className="text-[9px] text-white/30 tracking-widest uppercase">Press Enter</span>
             </div>
          </form>
        </motion.div>
      )}

      {/* Floating Action Button - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-40 flex flex-col gap-3">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="flex flex-col gap-2 mb-2 bg-[#0f1423]/90 border border-white/10 p-2 rounded-2xl backdrop-blur-md shadow-xl"
            >
              <button onClick={() => { setIsFabOpen(false); setIsTypingNode({ x: dimensions.width / 2, y: dimensions.height / 2 }); setNewNodeText('Note: '); }} className="flex items-center gap-2 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors">
                <FileText className="w-4 h-4 text-pink-400" /> Add Note
              </button>
              <button onClick={() => { setIsFabOpen(false); setIsTypingNode({ x: dimensions.width / 2, y: dimensions.height / 2 }); setNewNodeText('timer '); }} className="flex items-center gap-2 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors">
                <Clock className="w-4 h-4 text-[#718eb6]" /> Custom Timer
              </button>
              <button onClick={() => { setIsFabOpen(false); setIsTypingNode({ x: dimensions.width / 2, y: dimensions.height / 2 }); setNewNodeText('alarm '); }} className="flex items-center gap-2 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors">
                <Bell className="w-4 h-4 text-amber-400" /> Custom Alarm
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-12 h-12 bg-[#718eb6] hover:bg-[#5a7295] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <motion.div animate={{ rotate: isFabOpen ? 45 : 0 }}>
            <Plus className="w-6 h-6" />
          </motion.div>
        </button>
      </div>
    </div>
  );
}

function ThoughtNodeItem({ node }: { node: ThoughtNode }) {
  const { updateNode, removeNode } = useAura();
  const { lightsOn } = useRoom();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!node.triggerAt || (node.type !== 'timer' && node.type !== 'alarm')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(null);
      return;
    }
    
    const tick = () => {
      const now = Date.now();
      const diff = node.triggerAt! - now;
      if (diff <= 0) {
        setTimeLeft('TRIGGERED');
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        let formatted = '';
        if (h > 0) formatted += `${h}h `;
        if (m > 0 || h > 0) formatted += `${m}m `;
        formatted += `${s}s`;
        setTimeLeft(formatted);
      }
    };
    
    tick(); // Initial call
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [node.triggerAt, node.type]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(e, info) => updateNode(node.id, node.x + info.offset.x, node.y + info.offset.y)}
      initial={{ opacity: 0, scale: 0.5, x: node.x, y: node.y }}
      animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
      className="absolute origin-center cursor-grab active:cursor-grabbing p-4 min-w-[120px] max-w-[200px]"
      style={{ x: node.x, y: node.y, left: '-60px', top: '-24px' }}
    >
      <div className={`backdrop-blur-md border rounded-2xl p-4 shadow-xl group transition-all relative ${lightsOn ? 'bg-slate-800/80 border-slate-600 hover:border-slate-500 shadow-black/20' : 'bg-[#0f1423]/80 border-white/10 hover:border-white/20 shadow-black/40'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${lightsOn ? '' : 'shadow-[0_0_8px_currentColor]'}`} style={{ backgroundColor: node.color, color: node.color }} />
            <p className={`text-[9px] uppercase tracking-widest ${lightsOn ? 'text-slate-500' : 'text-white/40'}`}>
              {node.type === 'timer' ? 'Timer' : node.type === 'alarm' ? 'Alarm' : 'Node'}
            </p>
          </div>
          <button 
            type="button"
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => removeNode(node.id)} 
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${lightsOn ? 'text-slate-400 hover:text-red-400' : 'text-white/30 hover:text-red-400'}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        <p className={`text-sm leading-snug ${lightsOn ? 'text-slate-200 font-medium' : 'text-slate-200'}`}>{node.text}</p>
        
        {timeLeft && (
          <div className={`mt-3 text-center py-1.5 px-2 rounded-lg border ${lightsOn ? 'bg-slate-900/50 border-slate-700' : 'bg-white/5 border-white/5'}`}>
            <div className={`text-xs font-mono font-bold ${timeLeft === 'TRIGGERED' ? 'text-amber-500 animate-pulse' : (lightsOn ? 'text-slate-400' : 'text-[#718eb6]')}`}>
              {timeLeft}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
