import React, { useState } from 'react';
import { Repeat2, X } from 'lucide-react';
import { Exercise, ReplacementReason, UserProfile } from '../../types';
import { createReplacementExercise, getExerciseAlternatives } from '../../utils/beginnerFeatures';

const reasons: { value: ReplacementReason; label: string }[] = [
  { value: 'machine_occupied', label: 'Machine is occupied' },
  { value: 'equipment_unavailable', label: 'Equipment is unavailable' },
  { value: 'uncomfortable', label: 'Exercise feels uncomfortable' },
  { value: 'temporary_soreness', label: 'Temporary soreness' },
  { value: 'preference', label: 'User preference' },
];

export const ReplacementModal: React.FC<{
  exercise: Exercise;
  profile: UserProfile;
  onReplace: (exercise: Exercise) => void;
  onClose: () => void;
}> = ({ exercise, profile, onReplace, onClose }) => {
  const [reason, setReason] = useState<ReplacementReason>('machine_occupied');
  const [permanent, setPermanent] = useState(false);
  const alternatives = getExerciseAlternatives(exercise, profile);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050810]/90 backdrop-blur-md flex items-start justify-center p-4 pt-safe overflow-y-auto">
      <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-5 my-3 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Replace exercise</p>
            <h2 className="text-2xl font-black font-display text-white">{exercise.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#010f1f] border border-[#273647] text-[#94A3B8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="text-[11px] text-[#8e9379] font-bold uppercase mb-2">Reason</p>
          <div className="grid grid-cols-1 gap-2">
            {reasons.map((item) => (
              <button key={item.value} onClick={() => setReason(item.value)} className={`text-left px-3 py-2 rounded-xl border text-xs font-bold ${reason === item.value ? 'bg-[#00eefc] border-[#00eefc] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#d4e4fa]'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 bg-[#010f1f] border border-[#273647] rounded-xl p-3 text-sm">
          <span><span className="font-bold text-white">Use permanently</span><span className="block text-xs text-[#8e9379]">Otherwise this replacement only affects the current workout.</span></span>
          <input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} className="w-5 h-5 accent-[#c3f400]" />
        </label>

        {reason === 'uncomfortable' && (
          <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-3 text-xs text-[#ffb4ab]">
            Do not continue movements that cause sharp or joint pain.
          </div>
        )}

        <div className="space-y-3">
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              onClick={() => {
                onReplace(createReplacementExercise(exercise, alt, reason, permanent));
                onClose();
              }}
              className="w-full text-left bg-[#010f1f] border border-[#273647] rounded-xl p-3 hover:border-[#c3f400]/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2"><Repeat2 className="w-4 h-4 text-[#c3f400]" /> {alt.name}</h3>
                  <p className="text-xs text-[#00eefc] mt-1">{alt.muscles} • {alt.equipment}</p>
                </div>
                <span className="text-[10px] font-bold text-[#8e9379]">{exercise.sets.length} sets</span>
              </div>
              <p className="text-xs text-[#d4e4fa] mt-2">{alt.setup}</p>
              <p className="text-[11px] text-[#8e9379] mt-1">{alt.why}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
