import React from 'react';
import { Exercise } from '../../types';

export const ExerciseDemo: React.FC<{ exercise: Exercise; compact?: boolean }> = ({ exercise, compact = false }) => {
  const text = `${exercise.name} ${exercise.targetMuscle}`.toLowerCase();
  const isLower = /leg|squat|lunge|calf|thrust|deadlift|curl/.test(text) && !/biceps|triceps/.test(text);
  const isPull = /row|pull|lat|back/.test(text);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#010f1f] border border-[#273647] ${compact ? 'h-24' : 'h-44'}`}>
      <svg viewBox="0 0 320 180" className="w-full h-full">
        <rect width="320" height="180" fill="#050810" />
        <line x1="28" y1="146" x2="292" y2="146" stroke="#1E293B" strokeWidth="4" />
        {isLower ? (
          <>
            <rect x="65" y="48" width="26" height="98" rx="8" fill="#122131" stroke="#00eefc" />
            <rect x="184" y="66" width="72" height="20" rx="6" fill="#122131" stroke="#c3f400" />
            <g className="demo-lower">
              <circle cx="140" cy="48" r="13" fill="#d4e4fa" />
              <line x1="140" y1="62" x2="138" y2="98" stroke="#d4e4fa" strokeWidth="9" strokeLinecap="round" />
              <line x1="137" y1="96" x2="105" y2="132" stroke="#d4e4fa" strokeWidth="9" strokeLinecap="round" />
              <line x1="137" y1="97" x2="172" y2="134" stroke="#d4e4fa" strokeWidth="9" strokeLinecap="round" />
              <line x1="122" y1="78" x2="190" y2="78" stroke="#c3f400" strokeWidth="8" strokeLinecap="round" />
            </g>
          </>
        ) : isPull ? (
          <>
            <line x1="84" y1="34" x2="236" y2="34" stroke="#00eefc" strokeWidth="10" strokeLinecap="round" />
            <g className="demo-pull">
              <circle cx="160" cy="78" r="14" fill="#d4e4fa" />
              <line x1="160" y1="92" x2="160" y2="128" stroke="#d4e4fa" strokeWidth="9" strokeLinecap="round" />
              <line x1="160" y1="101" x2="113" y2="46" stroke="#d4e4fa" strokeWidth="8" strokeLinecap="round" />
              <line x1="160" y1="101" x2="207" y2="46" stroke="#d4e4fa" strokeWidth="8" strokeLinecap="round" />
              <line x1="146" y1="128" x2="122" y2="146" stroke="#d4e4fa" strokeWidth="8" strokeLinecap="round" />
              <line x1="174" y1="128" x2="198" y2="146" stroke="#d4e4fa" strokeWidth="8" strokeLinecap="round" />
            </g>
          </>
        ) : (
          <>
            <rect x="54" y="116" width="180" height="14" rx="7" fill="#122131" stroke="#273647" />
            <g className="demo-press">
              <circle cx="122" cy="88" r="13" fill="#d4e4fa" />
              <line x1="135" y1="94" x2="188" y2="116" stroke="#d4e4fa" strokeWidth="9" strokeLinecap="round" />
              <line x1="145" y1="96" x2="176" y2="66" stroke="#d4e4fa" strokeWidth="8" strokeLinecap="round" />
              <line x1="174" y1="66" x2="230" y2="66" stroke="#c3f400" strokeWidth="8" strokeLinecap="round" />
              <circle cx="230" cy="66" r="13" fill="#00eefc" opacity="0.65" />
            </g>
          </>
        )}
      </svg>
    </div>
  );
};
