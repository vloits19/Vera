'use client';

import React, { useState, useRef } from 'react';
import { useAura } from '@/lib/AuraContext';
import { motion } from 'motion/react';
import { User, Brain, Fingerprint, Activity, X, Edit2, Check, Camera } from 'lucide-react';

import { isHarmful } from '@/lib/filter';
import { ImageCropperModal } from './ImageCropperModal';

export function InsightPanel({ onClose }: { onClose?: () => void }) {
  const { metrics, profile, userProfile, updateUserProfile } = useAura();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    if (isHarmful(editName)) {
      setNameError("Please choose a more appropriate name.");
      return;
    }
    
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName: editName.trim() })
    });

    if (!res.ok) {
      const errorData = await res.json();
      setNameError(errorData.error || "Failed to update name. Did you reach the limit?");
      return;
    }
    
    updateUserProfile({ name: editName.trim() });
    setIsEditingProfile(false);
    setNameError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCropSave = (croppedImage: string) => {
    updateUserProfile({ picture: croppedImage });
    setCropImageSrc(null);
  };

  return (
    <div className="w-[380px] h-[80%] my-auto ml-10 shrink-0 border border-emerald-500/30 bg-[#020504]/50 backdrop-blur-md p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(16,185,129,0.1)] z-10 relative rounded-2xl [transform:perspective(1000px)_rotateY(10deg)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none rounded-2xl" />
      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onCropSave={handleCropSave}
          onClose={() => setCropImageSrc(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white/90">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5a7295]/20 to-[#718eb6]/20 border border-white/10 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-[#718eb6]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase">Digital Mirror</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Passive Insights</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest text-[#718eb6] font-bold flex items-center gap-2">
            <User className="w-3 h-3" /> Identity
          </p>
          {!isEditingProfile ? (
            <button onClick={() => setIsEditingProfile(true)} className="text-white/50 hover:text-white transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
          ) : (
            <button onClick={handleSaveProfile} className="text-[#718eb6] hover:text-blue-400 transition-colors">
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>

        {nameError && (
          <p className="text-red-400 text-[10px] uppercase font-mono">{nameError}</p>
        )}

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              {userProfile.picture ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white/40" />
              )}
            </div>
            {isEditingProfile && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <div className="flex-1 min-w-0">
            {isEditingProfile ? (
              <div className="flex flex-col gap-1.5">
                {nameError && (
                  <p className="text-[10px] text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">{nameError}</p>
                )}
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  className={`w-full bg-white/5 border ${nameError ? 'border-red-400/50' : 'border-white/20'} rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-[#718eb6]`}
                />
              </div>
            ) : (
              <p className="text-sm text-white font-medium truncate">{userProfile.name}</p>
            )}
          </div>
        </div>
      </div>

      {!profile ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-50 p-6 border border-white/5 rounded-3xl bg-white/[0.02]">
          <Brain className="w-8 h-8 text-white/30" />
          <p className="text-xs text-white/50 leading-relaxed">
            I am learning your cognitive patterns. Keep interacting, chatting, and mapping your thoughts.
          </p>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
             <motion.div 
               className="h-full bg-[#718eb6]/50" 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(100, (metrics.interactionCount / 5) * 100)}%` }}
             />
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#718eb6]/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[9px] uppercase tracking-widest text-[#718eb6] mb-4 font-bold flex items-center gap-2">
              <User className="w-3 h-3" /> Synthesis Profile
            </p>
            <h3 className="text-xl font-light text-white mb-2">{profile.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {profile.description}
            </p>
          </div>

          <div className="space-y-4">
             <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Observed Tendencies</p>
             <div className="space-y-2">
               {profile.tendencies.map((tendency, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm"
                 >
                   <div className="w-1.5 h-1.5 rounded-full bg-[#718eb6] shadow-[0_0_8px_#718eb6]" />
                   <span className="text-xs text-slate-300">{tendency}</span>
                 </motion.div>
               ))}
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Cognitive Ratios
            </p>
            <div className="space-y-3">
               <div className="space-y-1.5">
                 <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-widest">
                   <span>Exploration</span>
                   <span>Structure</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div className="h-full bg-[#718eb6]" animate={{ width: `${metrics.exploration}%` }} />
                    <motion.div className="h-full bg-purple-400" animate={{ width: `${metrics.structure}%` }} />
                 </div>
               </div>
               <div className="space-y-1.5">
                 <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-widest">
                   <span>Analytical</span>
                   <span>Emotional</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <motion.div className="h-full bg-emerald-400" animate={{ width: `${metrics.analytical}%` }} />
                    <motion.div className="h-full bg-rose-400" animate={{ width: `${metrics.emotional}%` }} />
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
