import React, { useState } from 'react';
import { Activity, ArrowRight, Moon, Scale } from 'lucide-react';
import { DailyLog, UserProfile } from '../../types';
import { CHECKPOINT_DAYS } from '../../utils/calculations';

interface DailyCheckInModalProps {
  log: DailyLog;
  profile: UserProfile;
  onSave: (log: DailyLog, profile: UserProfile) => void;
  onSkip: (log: DailyLog) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ log, profile, onSave, onSkip }) => {
  const [weight, setWeight] = useState(log.weightKg?.toString() || profile.currentWeightKg.toString());
  const [sleep, setSleep] = useState(log.sleepHours?.toString() || '8');
  const [energy, setEnergy] = useState(log.energyLevel || 3);
  const [soreness, setSoreness] = useState(log.sorenessLevel || 3);
  const [note, setNote] = useState(log.notes || '');
  const [height, setHeight] = useState(profile.heightCm.toString());
  const [waist, setWaist] = useState(log.measurements?.waistCm?.toString() || '');
  const [chest, setChest] = useState(log.measurements?.chestCm?.toString() || '');
  const isCheckpoint = CHECKPOINT_DAYS.includes(log.programDay);

  const save = () => {
    const weightKg = Number(weight);
    const heightCm = Number(height);
    const updatedLog: DailyLog = {
      ...log,
      weightKg: Number.isFinite(weightKg) && weightKg > 0 ? weightKg : undefined,
      sleepHours: Math.max(0, Math.min(16, Number(sleep) || 0)),
      energyLevel: energy,
      sorenessLevel: soreness,
      notes: note.trim(),
      checkInStatus: 'completed',
      measurements: isCheckpoint ? {
        ...log.measurements,
        heightCm: Number.isFinite(heightCm) && heightCm > 0 ? heightCm : undefined,
        waistCm: waist ? Number(waist) : undefined,
        chestCm: chest ? Number(chest) : undefined,
      } : log.measurements,
    };
    onSave(updatedLog, {
      ...profile,
      currentWeightKg: updatedLog.weightKg || profile.currentWeightKg,
      heightCm: isCheckpoint && heightCm > 0 ? heightCm : profile.heightCm,
    });
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#050810]/90 backdrop-blur-md flex items-start sm:items-center justify-center p-4 pt-safe overflow-y-auto">
      <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-5 shadow-2xl my-3 space-y-5">
        <div><p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Day {log.programDay} readiness</p><h2 className="text-2xl font-bold text-white mt-1">Quick daily check-in</h2><p className="text-xs text-[#94A3B8]">Used silently to adjust today’s recommendation.</p></div>

        <div className="grid grid-cols-2 gap-3">
          <label className="bg-[#010f1f] border border-[#273647] rounded-xl p-3"><span className="text-[11px] text-[#8e9379] font-bold flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> WEIGHT KG</span><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-transparent text-xl font-bold text-white w-full mt-1 outline-none" /></label>
          <label className="bg-[#010f1f] border border-[#273647] rounded-xl p-3"><span className="text-[11px] text-[#8e9379] font-bold flex items-center gap-1"><Moon className="w-3.5 h-3.5" /> SLEEP HOURS</span><input type="number" step="0.25" value={sleep} onChange={(e) => setSleep(e.target.value)} className="bg-transparent text-xl font-bold text-white w-full mt-1 outline-none" /></label>
        </div>

        {[['Energy', energy, setEnergy], ['Muscle soreness', soreness, setSoreness]].map(([label, value, setter]) => <div key={label as string}><div className="flex justify-between text-xs mb-2"><span className="font-bold text-white">{label as string}</span><span className="text-[#c3f400]">{value as number}/5</span></div><div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map((number) => <button key={number} type="button" onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)(number)} className={`h-10 rounded-xl border font-bold text-sm ${(value as number) === number ? 'bg-[#c3f400] border-[#c3f400] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#94A3B8]'}`}>{number}</button>)}</div></div>)}

        {isCheckpoint && <div className="bg-[#010f1f] border border-[#00eefc]/40 rounded-xl p-3 space-y-3"><div><p className="text-xs font-bold text-[#00eefc]">Day {log.programDay} measurement checkpoint</p><p className="text-[11px] text-[#8e9379]">Height is only requested at major checkpoints. Body measurements are optional.</p></div><div className="grid grid-cols-3 gap-2"><label className="text-[10px] text-[#8e9379]">HEIGHT CM<input className="input-dark w-full rounded-lg px-2 py-2 mt-1 text-sm" type="number" value={height} onChange={(e) => setHeight(e.target.value)} /></label><label className="text-[10px] text-[#8e9379]">CHEST CM<input className="input-dark w-full rounded-lg px-2 py-2 mt-1 text-sm" type="number" value={chest} onChange={(e) => setChest(e.target.value)} /></label><label className="text-[10px] text-[#8e9379]">WAIST CM<input className="input-dark w-full rounded-lg px-2 py-2 mt-1 text-sm" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} /></label></div></div>}

        <label><span className="text-[11px] text-[#8e9379] font-bold">OPTIONAL NOTE</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input-dark w-full rounded-xl px-3 py-2 mt-1 text-sm resize-none" placeholder="Anything affecting training today?" /></label>

        <button onClick={save} className="neon-btn w-full py-3.5 rounded-xl flex items-center justify-center gap-2">Save Check-In <ArrowRight className="w-4 h-4" /></button>
        <button onClick={() => onSkip({ ...log, checkInStatus: 'skipped' })} className="w-full text-xs text-[#94A3B8] py-1">Skip for today</button>
        <p className="text-[10px] text-[#8e9379] text-center flex items-center justify-center gap-1"><Activity className="w-3 h-3" /> One check-in per day. Stored only on this device.</p>
      </div>
    </div>
  );
};
