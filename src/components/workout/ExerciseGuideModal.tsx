import React from 'react';
import { Check, X } from 'lucide-react';
import { Exercise } from '../../types';
import { getExerciseGuide } from '../../utils/beginnerFeatures';
import { ExerciseDemo } from './ExerciseDemo';

export const ExerciseGuideModal: React.FC<{
  exercise: Exercise;
  onClose: () => void;
}> = ({ exercise, onClose }) => {
  const guide = getExerciseGuide(exercise);
  return (
    <div className="fixed inset-0 z-[100] bg-[#050810]/90 backdrop-blur-md flex items-start justify-center p-4 pt-safe overflow-y-auto">
      <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-4 my-3 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Setup guide</p>
            <h2 className="text-2xl font-black font-display text-white">{exercise.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#010f1f] border border-[#273647] text-[#94A3B8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <ExerciseDemo exercise={exercise} />

        <GuideBlock title="Muscles" items={guide.muscles} />
        <GuideBlock title="Machine or equipment setup" items={guide.setup} ordered />
        <GuideBlock title="Seat, handle, pad, hand, and foot position" items={guide.positioning} />
        <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
          <p className="text-[11px] text-[#8e9379] font-bold uppercase">Starting position</p>
          <p className="text-sm text-[#d4e4fa] mt-1">{guide.start}</p>
        </div>
        <GuideBlock title="Movement" items={guide.movement} ordered />
        <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
          <p className="text-[11px] text-[#8e9379] font-bold uppercase">Breathing</p>
          <p className="text-sm text-[#d4e4fa] mt-1">{guide.breathing}</p>
        </div>
        <GuideBlock title="Common mistakes" items={guide.mistakes} />
        <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-3">
          <p className="text-[11px] text-[#ffb4ab] font-bold uppercase">Safety warning</p>
          <p className="text-sm text-[#d4e4fa] mt-1">{guide.safety}</p>
        </div>

        <button onClick={onClose} className="neon-btn w-full py-3 rounded-xl flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> I understand
        </button>
      </div>
    </div>
  );
};

const GuideBlock: React.FC<{ title: string; items: string[]; ordered?: boolean }> = ({ title, items, ordered = false }) => {
  const List = ordered ? 'ol' : 'ul';
  return (
    <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
      <p className="text-[11px] text-[#8e9379] font-bold uppercase mb-2">{title}</p>
      <List className={`${ordered ? 'list-decimal' : 'list-disc'} pl-4 space-y-1.5 text-sm text-[#d4e4fa] leading-relaxed`}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </div>
  );
};
