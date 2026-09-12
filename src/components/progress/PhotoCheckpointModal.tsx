import React, { useState } from 'react';
import { Camera, X, Upload, CheckCircle, Info, Trash2 } from 'lucide-react';
import { CheckpointPhoto, PoseType } from '../../types';
import { savePhotoToIDB, compressImage, deletePhotoFromIDB } from '../../utils/indexedDB';

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
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
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
        weightKg: weight ? Number(weight) : undefined,
        notes: notes.trim() || undefined,
      };

      await savePhotoToIDB(newPhoto);
      setPreviewUrls((prev) => ({ ...prev, [activePose]: compressedDataUrl }));
      onPhotosUpdated();
    } catch (err) {
      console.error('Error saving photo checkpoint:', err);
      alert('Failed to process image. Please try another photo.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    const photo = initialPhotos.find((p) => p.pose === activePose);
    if (!photo) return;
    if (!window.confirm(`Delete the Day ${day} ${activePose} progress photo?`)) return;
    await deletePhotoFromIDB(photo.id);
    setPreviewUrls((prev) => ({ ...prev, [activePose]: undefined }));
    onPhotosUpdated();
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

          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-dark rounded-xl px-3 py-2 text-sm" placeholder="Weight kg" />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input-dark rounded-xl px-3 py-2 text-sm" placeholder="Note" />
          </div>

          <div className="relative h-60 w-full rounded-xl border-2 border-dashed border-[#273647] hover:border-[#00eefc]/60 bg-[#050810] flex flex-col items-center justify-center overflow-hidden group">
            {previewUrls[activePose] ? (
              <>
                <img
                  src={previewUrls[activePose]}
                  alt={activePose}
                  onClick={() => setFullscreenImage(previewUrls[activePose] || null)}
                  className="w-full h-full object-contain cursor-zoom-in"
                />
                <div className="absolute inset-0 bg-[#050810]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer px-3 py-2 bg-[#c3f400] text-[#050810] rounded-xl text-xs font-bold uppercase shadow-lg flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> Take
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <label className="cursor-pointer px-3 py-2 bg-[#122131] border border-[#00eefc]/40 text-[#00eefc] rounded-xl text-xs font-bold uppercase shadow-lg flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                <div className="w-12 h-12 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00eefc] mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">Upload {poseInfo[activePose].title}</span>
                <span className="text-[10px] text-[#8e9379] mt-1">Use a new camera shot or choose one already on your phone.</span>
                <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-xs">
                  <label className="cursor-pointer py-2.5 rounded-xl bg-[#c3f400] text-[#050810] text-xs font-bold flex items-center justify-center gap-1.5">
                    <Camera className="w-4 h-4" /> Take Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <label className="cursor-pointer py-2.5 rounded-xl bg-[#122131] border border-[#273647] text-[#00eefc] text-xs font-bold flex items-center justify-center gap-1.5">
                    <Upload className="w-4 h-4" /> From Phone
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
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
          {previewUrls[activePose] && (
            <button
              onClick={handleDelete}
              className="mr-auto px-4 py-2.5 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-bold flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="neon-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
      {fullscreenImage && (
        <div className="fixed inset-0 z-[120] bg-[#050810]/95 flex items-center justify-center p-4" onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} alt="Full screen progress" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};
