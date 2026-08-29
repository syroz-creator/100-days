import React, { useMemo, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Exercise } from '../../types';
import { suggestStartingWeight } from '../../utils/beginnerFeatures';

export const StartingWeightFinder: React.FC<{
  exercise: Exercise;
  onApply: (weightKg: number) => void;
  onClose: () => void;
}> = ({ exercise, onApply, onClose }) => {
  const [testWeight, setTestWeight] = useState(Math.max(0, Math.min(10, exercise.sets[0]?.weightKg || 0)));
  const [cleanReps, setCleanReps] = useState(10);
  const [difficulty, setDifficulty] = useState(3);
  const suggestion = useMemo(() => suggestStartingWeight(testWeight, cleanReps, difficulty), [testWeight, cleanReps, difficulty]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050810]/90 backdrop-blur-md flex items-start justify-center p-4 pt-safe overflow-y-auto">
      <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-5 my-3 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#c3f400] font-bold uppercase tracking-widest">Starting-weight finder</p>
            <h2 className="text-2xl font-black font-display text-white">{exercise.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#010f1f] border border-[#273647] text-[#94A3B8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 text-sm text-[#d4e4fa] space-y-2">
          <p className="font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#00eefc]" /> Safe test set</p>
          <p>Start with the empty machine, lightest available weight, or a very light test weight. Do one clean test set and stop before form breaks.</p>
          <p className="text-[#ffb4ab] text-xs">Never use body weight alone to calculate a heavy first weight. Never do one-rep maximum testing.</p>
        </div>

        <label className="block text-[11px] text-[#8e9379] font-bold uppercase">
          Test weight kg
          <input type="number" step="0.5" value={testWeight} onChange={(e) => setTestWeight(Number(e.target.value) || 0)} className="input-dark w-full rounded-xl px-3 py-2 mt-1 text-sm" />
        </label>
        <label className="block text-[11px] text-[#8e9379] font-bold uppercase">
          Clean reps completed
          <input type="number" value={cleanReps} onChange={(e) => setCleanReps(Number(e.target.value) || 0)} className="input-dark w-full rounded-xl px-3 py-2 mt-1 text-sm" />
        </label>
        <div>
          <div className="flex justify-between text-xs mb-2"><span className="font-bold text-white">Difficulty</span><span className="text-[#c3f400]">{difficulty}/5</span></div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} onClick={() => setDifficulty(value)} className={`h-10 rounded-xl border font-bold ${difficulty === value ? 'bg-[#c3f400] border-[#c3f400] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#94A3B8]'}`}>
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#c3f400]/10 border border-[#c3f400]/30 rounded-xl p-3">
          <p className="text-[11px] text-[#c3f400] font-bold uppercase">Conservative suggestion</p>
          <p className="text-3xl font-black font-display text-white">{suggestion.weightKg} kg</p>
          <p className="text-xs text-[#94A3B8]">{suggestion.explanation} Ask a trainer to check unfamiliar setup.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onClose} className="py-3 rounded-xl bg-[#010f1f] border border-[#273647] text-xs font-bold text-[#d4e4fa]">Reject</button>
          <button onClick={() => { onApply(suggestion.weightKg); onClose(); }} className="neon-btn py-3 rounded-xl text-xs font-bold">Use Suggestion</button>
        </div>
      </div>
    </div>
  );
};
