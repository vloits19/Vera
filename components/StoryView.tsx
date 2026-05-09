import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, BookOpen, X, Sparkles, LogIn, Lock, Globe } from 'lucide-react';
import { useAura } from '@/lib/AuraContext';
import { STORIES, Story, StoryNode } from '@/lib/StoryData';
import { t, TRANSLATIONS, UI_TRANSLATIONS } from '@/lib/i18n';

export function StoryView({ onClose, initialStoryId }: { onClose: () => void, initialStoryId?: string }) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { userProfile, updateUserProfile, clearedStories, clearStory, storyFlags, setStoryFlag } = useAura();

  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    if (initialStoryId) {
      const initStory = STORIES.find(s => s.id === initialStoryId);
      if (initStory) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedStory(initStory);
        setCurrentNodeId(initStory.startNodeId);
      }
    }
  }, [initialStoryId]);

  const processText = (text: string) => {
    let trans = t(text, userProfile?.language || 'en', TRANSLATIONS);
    return trans.replace(/{name}/g, userProfile?.name || 'Traveler');
  };

  const ui = (text: string) => {
    return t(text, userProfile?.language || 'en', UI_TRANSLATIONS);
  };

  const isStoryUnlocked = (story: Story) => {
    let unlocked = true;
    if (story.requiredClears && story.requiredClears.length > 0) {
      unlocked = unlocked && story.requiredClears.every(id => clearedStories.includes(id));
    }
    if (story.requiredFlags && story.requiredFlags.length > 0) {
      unlocked = unlocked && story.requiredFlags.every(flag => storyFlags[flag]);
    }
    return unlocked;
  };
  
  useEffect(() => {
    if (currentNodeId && selectedStory?.nodes[currentNodeId]) {
      const node = selectedStory.nodes[currentNodeId];
      // Only typewrite narration and dialogue
      if (node.type === 'narration' || node.type === 'dialogue') {
         const fullText = processText(node.text);
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setDisplayedText('');
         setIsTyping(true);
         let i = 0;
         const interval = setInterval(() => {
           setDisplayedText(fullText.substring(0, i + 1));
           i++;
           if (i >= fullText.length) {
             setIsTyping(false);
             clearInterval(interval);
           }
         }, 25);
         return () => clearInterval(interval);
      } else {
         setDisplayedText(processText(node.text));
         setIsTyping(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeId, selectedStory]);

  const handleStartStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentNodeId(story.startNodeId);
  };

  const handleNext = () => {
    if (!selectedStory || !currentNodeId) return;
    const node = selectedStory.nodes[currentNodeId];
    
    let nextId = node.nextNodeId;
    if (node.nextNodeIfFlag) {
      nextId = storyFlags[node.nextNodeIfFlag.flag] ? node.nextNodeIfFlag.nodeId : node.nextNodeIfFlag.fallbackNodeId;
    }
    
    if (nextId) {
      setCurrentNodeId(nextId);
    } else {
      // End of story
      clearStory(selectedStory.id);
      setSelectedStory(null);
      setCurrentNodeId(null);
    }
  };
  
  const handleNextOrSkip = () => {
    if (isTyping) {
      setIsTyping(false);
      if (currentNodeId && selectedStory) {
        setDisplayedText(processText(selectedStory.nodes[currentNodeId].text));
      }
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        {!selectedStory ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl max-h-[80vh] flex flex-col bg-[#0a0c10]/95 backdrop-blur-xl border border-[#1a2838] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="p-6 border-b border-[#1a2838] flex items-center justify-between bg-black/40">
              <h2 className="text-xl font-serif text-white tracking-widest uppercase flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-cyan-500" />
                {ui('Archive Fragments')}
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex gap-8">
              <div className="flex-1 space-y-6">
                <h3 className="text-sm font-mono text-cyan-500 uppercase tracking-widest border-b border-cyan-900/50 pb-2">{ui('Main Sequence')}</h3>
                <div className="space-y-3">
                  {STORIES.filter(s => s.category === 'main' && isStoryUnlocked(s)).map((story) => (
                    <button
                      key={story.id}
                      onClick={() => handleStartStory(story)}
                      className="w-full text-left p-4 rounded bg-[#0f141c]/50 hover:bg-[#151c26] border border-white/5 hover:border-cyan-500/50 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-serif text-lg text-white group-hover:text-cyan-400 transition-colors">{ui(story.title)}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-500" />
                      </div>
                      <p className="text-sm text-slate-400">{ui(story.description)}</p>
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-mono text-purple-500 uppercase tracking-widest border-b border-purple-900/50 pb-2 mt-8">{ui('Deep Data (Extras)')}</h3>
                <div className="space-y-3">
                  {STORIES.filter(s => s.category === 'additional' && isStoryUnlocked(s)).map((story) => (
                    <button
                      key={story.id}
                      onClick={() => handleStartStory(story)}
                      className="w-full text-left p-4 rounded bg-[#0f141c]/50 hover:bg-[#1c1526] border border-white/5 hover:border-purple-500/50 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-serif text-lg text-white group-hover:text-purple-400 transition-colors">{ui(story.title)}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-500" />
                      </div>
                      <p className="text-sm text-slate-400">{ui(story.description)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile setup on the side */}
              <div className="w-64 border-l border-white/5 pl-8 shrink-0 flex flex-col gap-6">
                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h4 className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2"><Globe className="w-4 h-4"/> {ui('Language Settings')}</h4>
                  <div className="relative">
                    <button 
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                      className="w-full bg-black/50 hover:bg-black/80 border border-white/10 hover:border-cyan-500/50 rounded px-3 py-2 text-sm text-left text-white font-mono outline-none flex justify-between items-center transition-colors"
                    >
                      <span>{
                         userProfile?.language === 'id' ? 'Indonesia' :
                         userProfile?.language === 'ja' ? '日本語 (Japan)' :
                         userProfile?.language === 'ko' ? '한국어 (Korea)' :
                         userProfile?.language === 'de' ? 'Deutsch (German)' :
                         userProfile?.language === 'fr' ? 'Français (French)' :
                         'English'
                      }</span>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showLangDropdown ? '-rotate-90 text-cyan-500' : 'rotate-90'}`} />
                    </button>
                    <AnimatePresence>
                      {showLangDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-[#0a0c10] border border-cyan-900/50 rounded overflow-hidden shadow-2xl z-50"
                          >
                            {[
                              { val: 'en', label: 'English' },
                              { val: 'id', label: 'Indonesia' },
                              { val: 'ja', label: '日本語 (Japan)' },
                              { val: 'ko', label: '한국어 (Korea)' },
                              { val: 'de', label: 'Deutsch (German)' },
                              { val: 'fr', label: 'Français (French)' }
                            ].map(lang => (
                              <button
                                key={lang.val}
                                onClick={() => {
                                  updateUserProfile({ language: lang.val });
                                  setShowLangDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm font-mono hover:bg-cyan-900/30 transition-colors ${userProfile?.language === lang.val ? 'text-cyan-400 bg-cyan-950/20' : 'text-slate-300'}`}
                              >
                                {lang.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{ui('User Identity')}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-500 mb-1">{ui('Current Alias')}</label>
                      <div className="text-sm text-white font-mono">{userProfile?.name || 'Unknown'}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-500 mb-1">{ui('Update Alias')}</label>
                      <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter name..."
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (inputValue.trim()) {
                            updateUserProfile({ name: inputValue.trim() });
                            setInputValue('');
                          }
                        }}
                        disabled={!inputValue.trim()}
                        className="mt-2 w-full py-2 bg-slate-800 hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider text-white rounded transition-colors"
                      >
                        {ui('Set Name')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
             key="story-player"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex flex-col justify-end"
           >
              {/* Invisible Click Target for progressing story */}
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={(e) => {
                  if (currentNodeId && selectedStory?.nodes[currentNodeId]) {
                    const type = selectedStory.nodes[currentNodeId].type;
                    if (type !== 'input' && type !== 'choice') {
                      handleNextOrSkip();
                    }
                  }
                }}
              />

              {/* Top Right Controls */}
              <div className="absolute top-8 right-8 z-50 pointer-events-auto">
                 <button 
                   onClick={() => { setSelectedStory(null); setCurrentNodeId(null); }} 
                   className="bg-black/50 hover:bg-black/80 border border-white/10 backdrop-blur-md px-4 py-2 rounded text-white/50 hover:text-white uppercase tracking-widest text-xs transition-colors font-mono"
                 >
                   {ui('Skip / Close')}
                 </button>
              </div>

              {/* Dialogue Box Container */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                onClick={(e) => {
                  if (currentNodeId && selectedStory?.nodes[currentNodeId]) {
                    const type = selectedStory.nodes[currentNodeId].type;
                    if (type !== 'input' && type !== 'choice') {
                      handleNextOrSkip();
                    }
                  }
                }}
                className="w-full h-[35vh] min-h-[250px] max-h-[350px] bg-gradient-to-t from-[#02050a] via-[#050810]/95 to-transparent border-t border-cyan-900/30 relative px-[10%] pb-[4%] pt-20 flex flex-col justify-end pointer-events-auto shadow-[0_-40px_100px_rgba(0,0,0,0.8)] backdrop-blur-sm cursor-pointer"
              >
                 {currentNodeId && selectedStory?.nodes[currentNodeId] && (
                   <>
                     {/* Character Name Badge */}
                     <AnimatePresence mode="wait">
                       {selectedStory.nodes[currentNodeId].name && (
                         <motion.div 
                           key={selectedStory.nodes[currentNodeId].name}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, transition: { duration: 0.1 } }}
                           className="absolute top-0 left-[10%] -translate-y-1/2 bg-gradient-to-r from-[#0f1423] to-[#151c2f] border border-cyan-900/50 px-10 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-serif text-cyan-50 tracking-[0.2em] text-xl uppercase before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-cyan-500"
                         >
                           {processText(selectedStory.nodes[currentNodeId].name)}
                         </motion.div>
                       )}
                     </AnimatePresence>
                     
                     {/* Text Content */}
                     <div className="flex-1 flex flex-col justify-center max-w-5xl">
                       <AnimatePresence mode="wait">
                         <motion.div 
                           key={currentNodeId}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           className={`text-3xl leading-[1.6] ${selectedStory.nodes[currentNodeId].type === 'narration' ? 'text-white/60 italic font-serif' : 'text-white/95 font-sans'}`}
                         >
                           {displayedText}
                           {isTyping && <span className="inline-block w-3 h-6 bg-cyan-500/50 animate-pulse ml-2 align-middle"></span>}
                         </motion.div>
                       </AnimatePresence>
                     </div>

                     {/* Context Actions (Inputs / Choices / Flow) */}
                     <div className="mt-8">
                       {selectedStory.nodes[currentNodeId].type === 'input' && (
                         <div className="flex items-center gap-4 max-w-xl">
                           <input
                             type="text"
                             value={inputValue}
                             onChange={(e) => setInputValue(e.target.value)}
                             placeholder="Type your designation..."
                             autoFocus
                             className="flex-1 bg-black/60 border border-cyan-900/50 rounded-none px-6 py-4 text-white font-mono focus:border-cyan-400 outline-none text-xl"
                             onKeyDown={(e) => {
                               if (e.key === 'Enter' && inputValue.trim()) {
                                 updateUserProfile({ name: inputValue.trim() });
                                 setInputValue('');
                                 handleNext();
                               }
                             }}
                           />
                           <button
                             onClick={() => {
                               if (inputValue.trim()) {
                                 updateUserProfile({ name: inputValue.trim() });
                                 setInputValue('');
                                 handleNext();
                               }
                             }}
                             disabled={!inputValue.trim()}
                             className="px-10 py-4 bg-cyan-950 hover:bg-cyan-800 text-cyan-50 border border-cyan-800 uppercase tracking-[0.2em] disabled:opacity-50 transition-colors font-mono"
                           >
                             {ui('Confirm')}
                           </button>
                         </div>
                       )}

                       {selectedStory.nodes[currentNodeId].type === 'choice' && (
                         <div className="flex flex-col gap-4 max-w-3xl ml-8">
                           {selectedStory.nodes[currentNodeId].choices?.map((choice, i) => (
                             <button
                               key={i}
                               onClick={() => {
                                 if (choice.setFlag) {
                                   setStoryFlag(choice.setFlag, true);
                                 }
                                 if (choice.nextNodeId) {
                                   setCurrentNodeId(choice.nextNodeId);
                                 } else {
                                   setSelectedStory(null);
                                   setCurrentNodeId(null);
                                 }
                               }}
                               className="bg-[#0f1423]/80 hover:bg-[#1a233b] border border-[#2a3754] hover:border-cyan-500/50 px-8 py-5 text-left transition-all flex items-center justify-between group transform hover:translate-x-2 shadow-lg"
                             >
                               <span className="text-white/80 group-hover:text-white font-serif text-xl">{processText(choice.text)}</span>
                               <ChevronRight className="w-6 h-6 text-cyan-900 group-hover:text-cyan-400" />
                             </button>
                           ))}
                         </div>
                       )}

                       {(selectedStory.nodes[currentNodeId].type === 'dialogue' || selectedStory.nodes[currentNodeId].type === 'narration') && !isTyping && (
                         <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="text-cyan-500/70 animate-pulse text-sm tracking-[0.3em] uppercase font-mono flex items-center gap-3 absolute bottom-[10%] right-[10%]"
                         >
                            {selectedStory.nodes[currentNodeId].nextNodeId ? ui('Click to continue') : ui('Skip / Close')}
                            <ChevronRight className="w-5 h-5" />
                         </motion.div>
                       )}
                     </div>
                   </>
                 )}
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
