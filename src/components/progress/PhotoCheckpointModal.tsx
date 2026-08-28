import React, { useState } from 'react';
import { Camera, X, Upload, CheckCircle, Info, Image as ImageIcon } from 'lucide-react';
import { CheckpointPhoto, PoseType } from '../../types';
import { savePhotoToIDB, compressImage } from '../../utils/indexedDB';

interface PhotoCheckpointModalProps {
  day: number;
  initialPhotos: CheckpointPhoto[];
  onClose: () => void;
  onPhotosUpdated: () => void;
}

export const PhotoCheckpointModal: React.FC<PhotoCheckpointModalProps> = ({
  day,
  initialPhotos,
  onClose,
  onPhotosUpdated,
}) => {
  const [activePose, setActivePose] = useState<PoseType>('front');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<PoseType, string | undefined>>({
    front: initialPhotos.find((p) => p.pose === 'front')?.imageDataUrl,
    side: initialPhotos.find((p) => p.pose === 'side')?.imageDataUrl,
    back: initialPhotos.find((p) => p.pose === 'back')?.imageDataUrl,
    biceps: initialPhotos.find((p) => p.pose === 'biceps')?.imageDataUrl,
  });

  const poseInfo: Record<PoseType, { title: string; instruction: string }> = {
    front: {
      title: 'Front Relaxed',
      instruction: 'Stand facing camera, arms relaxed at sides, feet shoulder-width, look straight ahead.',
    },
    side: {
      title: 'Left Side Relaxed',
      instruction: 'Turn 90 degrees left, arms hanging naturally, shoulders back and chin level.',
    },
    back: {
      title: 'Back Relaxed',
      instruction: 'Back facing camera, feet shoulder-width, lats slightly spread but not fully flexed.',
    },
    biceps: {
      title: 'Front Double-Biceps',
      instruction: 'Face camera, raise arms to 90 degrees and flex biceps with chest high.',
    },
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedDataUrl = await compressImage(file, 1200, 0.85);

      const newPhoto: CheckpointPhoto = {
        id: `day_${day}_pose_${activePose}`,
        programDay: day,
        date: new Date().toISOString().split('T')[0],
        pose: activePose,
        imageDataUrl: compressedDataUrl,
      };

      await savePhotoToIDB(newPhoto);
      setPreviewUrls((prev) => ({ ...prev, [activePose]: compressedDataUrl }));
      onPhotosUpdated();
    } catch (err) {
      console.error('Error saving photo checkpoint:', err);
      alert('Failed to process image. Please try another photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050810]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#122131] border border-[#273647] rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#273647] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c3f400]/20 text-[#c3f400] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Day {day} Photo Checkpoint</h3>
              <p className="text-[11px] text-[#00dbe9] font-semibold">IndexedDB Local Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1c2b3c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Positioning Rules Checklist */}
        <div className="p-3.5 rounded-xl bg-[#010f1f] border border-[#273647] text-xs text-[#d4e4fa] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#c3f400]">
            <Info className="w-4 h-4" /> Standardized Camera Setup
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[#94A3B8]">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#00eefc]" /> Phone vertical, rear camera at 1×
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#00eefc]" /> Level at belly-button height
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#00eefc]" /> Stand 2.5-3 metres away
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#00eefc]" /> Same room, light, clothing, position
            </li>
            <li className="flex items-center gap-1.5 sm:col-span-2"><CheckCircle className="w-3.5 h-3.5 text-[#00eefc]" /> Morning, after bathroom and before eating</li>
          </ul>
        </div>

        {/* Pose Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['front', 'side', 'back', 'biceps'] as PoseType[]).map((p) => {
            const hasPhoto = !!previewUrls[p];
            const isSelected = activePose === p;
            return (
              <button
                key={p}
                onClick={() => setActivePose(p)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-[#c3f400] text-[#050810] border-[#c3f400] shadow-[0_0_10px_rgba(195,244,0,0.3)]'
                    : hasPhoto
                    ? 'bg-[#1c2b3c] text-[#00eefc] border-[#00eefc]/30'
                    : 'bg-[#0E1421] text-[#94A3B8] border-[#273647] hover:border-[#00eefc]'
                }`}
              >
                {p === 'front' ? 'Front' : p === 'side' ? 'Left Side' : p === 'back' ? 'Back' : 'Biceps'}
                {hasPhoto && ' ✓'}
              </button>
            );
          })}
        </div>

        {/* Active Pose Details & Preview / Upload Box */}
        <div className="space-y-3">
          <div className="text-xs">
            <span className="font-bold text-white block">{poseInfo[activePose].title}</span>
            <span className="text-[#94A3B8] text-[11px]">{poseInfo[activePose].instruction}</span>
          </div>

          <div className="relative h-60 w-full rounded-xl border-2 border-dashed border-[#273647] hover:border-[#00eefc]/60 bg-[#050810] flex flex-col items-center justify-center overflow-hidden group">
            {previewUrls[activePose] ? (
              <>
                <img
                  src={previewUrls[activePose]}
                  alt={activePose}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#050810]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer px-4 py-2 bg-[#c3f400] text-[#050810] rounded-xl text-xs font-bold uppercase shadow-lg">
                    Replace Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full h-full">
                <div className="w-12 h-12 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00eefc] mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">Upload {poseInfo[activePose].title}</span>
                <span className="text-[10px] text-[#8e9379] mt-1">Tap to capture or select image</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-[#050810]/80 flex items-center justify-center text-xs font-bold text-[#c3f400]">
                Compressing & Storing in IndexedDB...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#273647]">
          <button
            onClick={onClose}
            className="neon-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
