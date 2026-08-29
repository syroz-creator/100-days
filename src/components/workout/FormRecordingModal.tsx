import React, { useEffect, useRef, useState } from 'react';
import { Camera, Square, Trash2, X } from 'lucide-react';
import { DailyLog, Exercise, FormRecording } from '../../types';
import { getExerciseGuide } from '../../utils/beginnerFeatures';
import { deleteRecordingFromIDB, saveRecordingToIDB } from '../../utils/indexedDB';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export const FormRecordingModal: React.FC<{
  exercise: Exercise;
  log: DailyLog;
  onSaved: (recordingId: string) => void;
  onClose: () => void;
}> = ({ exercise, log, onSaved, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<'idle' | 'ready' | 'recording' | 'recorded' | 'saved'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const guide = getExerciseGuide(exercise);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        setError('Camera recording is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('ready');
    } catch {
      setError('Camera permission was not available. Recording stays optional.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      setVideoUrl(URL.createObjectURL(blob));
      setStatus('recorded');
    };
    recorder.start();
    setStatus('recording');
  };

  const stopRecording = () => recorderRef.current?.stop();

  const saveRecording = async (autoDeleteAfterReview: boolean) => {
    const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || 'video/webm' });
    const id = `form_${exercise.id}_${Date.now()}`;
    const recording: FormRecording = {
      id,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      date: log.date,
      programDay: log.programDay,
      videoDataUrl: await blobToDataUrl(blob),
      mimeType: blob.type,
      createdAt: new Date().toISOString(),
      autoDeleteAfterReview,
    };
    await saveRecordingToIDB(recording);
    setRecordingId(id);
    setStatus('saved');
    onSaved(id);
  };

  const deleteNow = async () => {
    if (!window.confirm('Delete this private form recording now?')) return;
    if (recordingId) await deleteRecordingFromIDB(recordingId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050810]/90 backdrop-blur-md flex items-start justify-center p-4 pt-safe overflow-y-auto">
      <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-5 my-3 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Private form recording</p>
            <h2 className="text-2xl font-black font-display text-white">{exercise.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#010f1f] border border-[#273647] text-[#94A3B8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#010f1f] border border-[#273647] aspect-video">
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          )}
        </div>

        <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
          <p className="text-[11px] text-[#8e9379] font-bold uppercase mb-2">Form checklist</p>
          <ul className="list-disc pl-4 text-xs text-[#d4e4fa] space-y-1">
            <li>{guide.start}</li>
            {guide.movement.slice(0, 2).map((item) => <li key={item}>{item}</li>)}
            <li>{guide.breathing}</li>
          </ul>
        </div>

        <p className="text-[11px] text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-3">
          Stored only on this device. The app cannot guarantee perfect form; a qualified trainer is more reliable. No video is uploaded or analyzed without explicit permission.
        </p>
        {error && <p className="text-xs text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-3">{error}</p>}

        {status === 'idle' && <button onClick={startCamera} className="neon-btn w-full py-3 rounded-xl flex items-center justify-center gap-2"><Camera className="w-4 h-4" /> Enable Camera</button>}
        {status === 'ready' && <button onClick={startRecording} className="neon-btn w-full py-3 rounded-xl flex items-center justify-center gap-2"><Camera className="w-4 h-4" /> Record Set</button>}
        {status === 'recording' && <button onClick={stopRecording} className="w-full py-3 rounded-xl bg-[#ffb4ab] text-[#050810] font-bold flex items-center justify-center gap-2"><Square className="w-4 h-4" /> Stop Recording</button>}
        {status === 'recorded' && (
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => saveRecording(false)} className="neon-btn py-3 rounded-xl text-xs font-bold">Save Privately</button>
            <button onClick={() => saveRecording(true)} className="py-3 rounded-xl bg-[#00eefc] text-[#050810] text-xs font-bold">Automatically Delete After Review</button>
            <button onClick={deleteNow} className="py-3 rounded-xl bg-[#010f1f] border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs font-bold flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Delete Now</button>
          </div>
        )}
        {status === 'saved' && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={deleteNow} className="py-3 rounded-xl bg-[#010f1f] border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs font-bold">Delete Now</button>
            <button onClick={onClose} className="neon-btn py-3 rounded-xl text-xs font-bold">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};
