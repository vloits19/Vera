import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropUtils';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropSave: (croppedImage: string) => void;
  onClose: () => void;
}

export function ImageCropperModal({ imageSrc, onCropSave, onClose }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: {x: number, y: number, width: number, height: number}) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropSave(croppedImage as string);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1e2630] border border-white/10 rounded-3xl w-full max-w-md p-6 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Crop Picture</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[300px] bg-black/50 rounded-2xl overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/50 uppercase tracking-wider font-bold">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value))
            }}
            className="w-full accent-[#718eb6]"
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#718eb6] hover:bg-[#5a7295] text-white flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" /> Save Picture
          </button>
        </div>
      </motion.div>
    </div>
  );
}
