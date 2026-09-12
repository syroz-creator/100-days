import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Check, Clock, MapPin, StickyNote, Upload, X } from 'lucide-react';
import {
  CompleteWithoutProofReason,
  ProofEntry,
  ProofRequirement,
  ProofType,
  ScheduleTaskType,
  ScheduledTask,
} from '../../types';
import { buildProofEntry } from '../../utils/schedule';
import { compressImage, saveProofEntryToIDB } from '../../utils/indexedDB';

type ProofTask = Pick<ScheduledTask, 'id' | 'title' | 'type' | 'proofTypes'> | {
  id: string;
  title: string;
  type: ScheduleTaskType | 'workout' | 'meal';
  proofTypes: ProofType[];
};

interface ProofModalProps {
  task: ProofTask;
  date: string;
  requirement: ProofRequirement;
  allowPhotoUpload: boolean;
  allowLocation: boolean;
  onProofSaved: (entry: ProofEntry) => void;
  onCompleteWithoutProof: (reason: CompleteWithoutProofReason, note: string, entry: ProofEntry) => void;
  onSkipOptional: () => void;
  onClose: () => void;
}

const withoutProofReasons: { value: CompleteWithoutProofReason; label: string }[] = [
  { value: 'forgot_photo', label: 'Forgot to take a picture' },
  { value: 'camera_unavailable', label: 'Camera unavailable' },
  { value: 'permission_denied', label: 'Permission denied' },
  { value: 'completed_elsewhere', label: 'Completed somewhere else' },
  { value: 'other', label: 'Other' },
];

export const ProofModal: React.FC<ProofModalProps> = ({
  task,
  date,
  requirement,
  allowPhotoUpload,
  allowLocation,
  onProofSaved,
  onCompleteWithoutProof,
  onSkipOptional,
  onClose,
}) => {
  const availableTypes = task.proofTypes.filter((type) => allowPhotoUpload || type !== 'upload_photo');
  const [proofType, setProofType] = useState<ProofType>(availableTypes[0] || 'note');
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [checklistText, setChecklistText] = useState('Completed the task\nPacked what I need\nReady for tomorrow');
  const [timerSeconds, setTimerSeconds] = useState(5 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [location, setLocation] = useState<ProofEntry['location']>();
  const [locationStatus, setLocationStatus] = useState('');
  const [withoutReason, setWithoutReason] = useState<CompleteWithoutProofReason>('forgot_photo');

  useEffect(() => {
    if (!timerRunning) return undefined;
    const id = window.setInterval(() => {
      setTimerSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const valid = useMemo(() => {
    if (proofType === 'live_photo' || proofType === 'upload_photo') return Boolean(imagePreview);
    if (proofType === 'note') return note.trim().length > 0;
    if (proofType === 'checklist') return checklistText.split('\n').some((item) => item.trim());
    if (proofType === 'timer') return timerSeconds === 0;
    if (proofType === 'location') return Boolean(location);
    return true;
  }, [checklistText, imagePreview, location, note, proofType, timerSeconds]);

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImagePreview(await compressImage(file, 1600, 0.9));
    } catch {
      window.alert('Could not save that image. Try another photo.');
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation || !allowLocation) {
      setLocationStatus('Location check-in is not supported or not enabled.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationStatus('Location saved privately on this device.');
      },
      () => setLocationStatus('Location permission was not available.'),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const save = async () => {
    if (!valid) return;
    const entry = buildProofEntry({
      task,
      date,
      proofType,
      imageDataUrl: imagePreview,
      note: note.trim() || undefined,
      checklist: proofType === 'checklist' ? checklistText.split('\n').map((item) => item.trim()).filter(Boolean) : undefined,
      timerSeconds: proofType === 'timer' ? 5 * 60 : undefined,
      location,
    });
    await saveProofEntryToIDB(entry);
    onProofSaved(entry);
  };

  const saveWithoutProof = async () => {
    const entry: ProofEntry = {
      id: `proof_without_${task.id}_${Date.now()}`,
      taskId: task.id,
      taskName: task.title,
      taskType: task.type,
      date,
      createdAt: new Date().toISOString(),
      proofType: 'note',
      status: 'completed_without_proof',
      completedWithoutProof: true,
      completedWithoutProofReason: withoutReason,
      note: note.trim() || undefined,
    };
    await saveProofEntryToIDB(entry);
    onCompleteWithoutProof(withoutReason, note, entry);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#050810]/90 backdrop-blur-md flex items-start justify-center p-4 pt-safe overflow-y-auto">
      <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-5 my-3 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">{requirement === 'required' ? 'Proof required' : 'Proof optional'}</p>
            <h2 className="text-2xl font-black font-display text-white">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#010f1f] border border-[#273647] text-[#94A3B8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {availableTypes.map((type) => (
            <button key={type} onClick={() => setProofType(type)} className={`py-2 rounded-xl border text-xs font-bold ${proofType === type ? 'bg-[#c3f400] border-[#c3f400] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#d4e4fa]'}`}>
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {(proofType === 'live_photo' || proofType === 'upload_photo') && (
          <label className="block rounded-xl border-2 border-dashed border-[#273647] bg-[#010f1f] overflow-hidden cursor-pointer">
            {imagePreview ? <img src={imagePreview} alt="Proof preview" className="w-full max-h-80 object-contain" /> : <div className="h-48 flex flex-col items-center justify-center text-center p-4"><Upload className="w-8 h-8 text-[#00eefc]" /><span className="text-sm font-bold text-white mt-2">{proofType === 'live_photo' ? 'Take proof photo' : 'Upload proof photo'}</span><span className="text-xs text-[#8e9379]">Original aspect ratio is preserved.</span></div>}
            <input type="file" accept="image/*" capture={proofType === 'live_photo' ? 'environment' : undefined} onChange={handleImage} className="hidden" />
          </label>
        )}

        {proofType === 'note' && <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="input-dark w-full rounded-xl p-3 text-sm resize-none" placeholder="Short note" />}
        {proofType === 'checklist' && <textarea value={checklistText} onChange={(e) => setChecklistText(e.target.value)} rows={4} className="input-dark w-full rounded-xl p-3 text-sm resize-none" />}
        {proofType === 'timer' && <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-4 text-center"><Clock className="w-6 h-6 text-[#00eefc] mx-auto" /><p className="text-4xl font-mono font-black text-white mt-2">{String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}</p><button onClick={() => setTimerRunning((value) => !value)} className="mt-3 py-2 px-4 rounded-xl bg-[#00eefc] text-[#050810] text-xs font-bold">{timerRunning ? 'Pause Timer' : 'Start Timer'}</button></div>}
        {proofType === 'location' && <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-4"><button onClick={requestLocation} className="w-full py-3 rounded-xl bg-[#00eefc] text-[#050810] text-xs font-bold flex items-center justify-center gap-2"><MapPin className="w-4 h-4" /> Save Location Check-In</button>{locationStatus && <p className="text-xs text-[#94A3B8] mt-2">{locationStatus}</p>}</div>}

        <button onClick={save} disabled={!valid} className="neon-btn disabled:bg-[#1c2b3c] disabled:text-[#8e9379] w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> Save Proof and Complete
        </button>

        {requirement === 'optional' && <button onClick={onSkipOptional} className="w-full py-2 rounded-xl bg-[#010f1f] border border-[#273647] text-xs font-bold text-[#94A3B8]">Complete Without Optional Proof</button>}

        {requirement === 'required' && (
          <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 space-y-2">
            <p className="text-[11px] text-[#8e9379] font-bold uppercase flex items-center gap-1"><StickyNote className="w-3.5 h-3.5" /> Complete without proof</p>
            <select value={withoutReason} onChange={(e) => setWithoutReason(e.target.value as CompleteWithoutProofReason)} className="input-dark w-full rounded-lg px-2 py-2 text-xs">
              {withoutProofReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
            </select>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input-dark w-full rounded-lg px-2 py-2 text-xs resize-none" placeholder="Optional detail" />
            <button onClick={saveWithoutProof} className="w-full py-2 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-bold">
              Complete Without Proof
            </button>
          </div>
        )}

        <p className="text-[10px] text-[#8e9379] text-center">Proof is private on this device and is never uploaded unless you knowingly enable cloud backup.</p>
      </div>
    </div>
  );
};
