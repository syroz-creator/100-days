import React, { useEffect } from 'react';
import { ChevronLeft, Clock3, Dumbbell, Minus, Pause, Play, Plus, RotateCcw, SkipForward, Square, Timer } from 'lucide-react';
import { Exercise, UserProfile } from '../../types';
import { ExerciseDemo } from './ExerciseDemo';
import { PlateCalculator } from './PlateCalculator';

export const LiveGymMode: React.FC<{
  exercises: Exercise[];
  activeExerciseIndex: number;
  profile: UserProfile;
  timerSecondsLeft: number;
  isTimerRunning: boolean;
  onSetActiveExerciseIndex: (index: number) => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps', value: number) => void;
  onCompleteSet: (exerciseIndex: number, setIndex: number) => void;
  onUndoPreviousSet: () => void;
  onSkipExercise: (exerciseIndex: number) => void;
  onReplaceExercise: (exerciseIndex: number) => void;
  onShowGuide: (exercise: Exercise) => void;
  onRecordForm: (exercise: Exercise) => void;
  onPauseTimer: () => void;
  onStartTimer: () => void;
  onAdd30s: () => void;
  onSkipTimer: () => void;
  onEndWorkout: () => void;
}> = ({
  exercises,
  activeExerciseIndex,
  profile,
  timerSecondsLeft,
  isTimerRunning,
  onSetActiveExerciseIndex,
  onUpdateSet,
  onCompleteSet,
  onUndoPreviousSet,
  onSkipExercise,
  onReplaceExercise,
  onShowGuide,
  onRecordForm,
  onPauseTimer,
  onStartTimer,
  onAdd30s,
  onSkipTimer,
  onEndWorkout,
}) => {
  const exercise = exercises[activeExerciseIndex] || exercises[0];
  const setIndex = Math.max(0, exercise.sets.findIndex((set) => !set.completed));
  const activeSetIndex = setIndex === -1 ? exercise.sets.length - 1 : setIndex;
  const activeSet = exercise.sets[activeSetIndex];
  const formatTimer = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;
    const requestWakeLock = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
        wakeLock = await nav.wakeLock?.request('screen') || null;
      } catch {
        wakeLock = null;
      }
    };
    requestWakeLock();
    return () => {
      wakeLock?.release().catch(() => undefined);
    };
  }, []);

  if (!exercise || !activeSet) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-[#010f1f] text-[#d4e4fa] overflow-y-auto pt-safe pb-safe">
      <div className="w-full max-w-lg mx-auto min-h-screen p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button onClick={onEndWorkout} className="p-2 rounded-xl bg-[#0E1421] border border-[#1E293B] text-[#94A3B8]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Live Gym Mode</p>
            <p className="text-xs text-[#8e9379]">One-handed workout logging</p>
          </div>
          <button onClick={onUndoPreviousSet} className="p-2 rounded-xl bg-[#0E1421] border border-[#1E293B] text-[#c3f400]" title="Undo previous set">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[#8e9379] font-bold uppercase">Current exercise</p>
              <h1 className="text-3xl font-black font-display text-white">{exercise.name}</h1>
              <p className="text-sm text-[#00eefc]">{exercise.targetMuscle}</p>
            </div>
            <Dumbbell className="w-6 h-6 text-[#c3f400]" />
          </div>
          <ExerciseDemo exercise={exercise} compact />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onShowGuide(exercise)} className="py-3 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#00eefc]">Demonstration</button>
            <button onClick={() => onRecordForm(exercise)} className="py-3 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#c3f400]">Record Form</button>
          </div>
        </section>

        <section className="bg-[#122131] border border-[#273647] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8e9379] font-bold uppercase">Set</p>
              <p className="text-2xl font-black text-white">{activeSet.setNumber} / {exercise.sets.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#8e9379] font-bold uppercase">Target</p>
              <p className="text-xl font-black text-[#00eefc]">{exercise.minReps}-{exercise.maxReps}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
              <p className="text-[#8e9379] font-bold uppercase">Previous</p>
              <p className="text-lg font-black text-white">{activeSet.prevWeightKg ?? '--'} kg x {activeSet.prevReps ?? '--'}</p>
            </div>
            <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
              <p className="text-[#8e9379] font-bold uppercase">Recommended</p>
              <p className="text-lg font-black text-[#c3f400]">{activeSet.weightKg} kg</p>
            </div>
          </div>

          <Stepper label={`Weight (${profile.unitSystem})`} value={activeSet.weightKg} step={0.5} onChange={(value) => onUpdateSet(activeExerciseIndex, activeSetIndex, 'weightKg', Math.max(0, value))} />
          <Stepper label="Reps" value={activeSet.reps} step={1} onChange={(value) => onUpdateSet(activeExerciseIndex, activeSetIndex, 'reps', Math.max(0, Math.round(value)))} />

          <button onClick={() => onCompleteSet(activeExerciseIndex, activeSetIndex)} className="neon-btn w-full py-5 rounded-2xl text-lg font-black uppercase">
            Complete Set
          </button>
        </section>

        <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className={`w-6 h-6 text-[#00eefc] ${isTimerRunning ? 'animate-pulse' : ''}`} />
              <div>
                <p className="text-xs text-[#8e9379] font-bold uppercase">Rest countdown</p>
                <p className="text-3xl font-mono font-black text-[#00eefc]">{formatTimer(timerSecondsLeft)}</p>
              </div>
            </div>
            <button onClick={isTimerRunning ? onPauseTimer : onStartTimer} className="p-3 rounded-xl bg-[#00eefc] text-[#050810]">
              {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onAdd30s} className="py-3 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#00eefc]"><Clock3 className="w-4 h-4 inline mr-1" /> Add 30s</button>
            <button onClick={onSkipTimer} className="py-3 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#c3f400]"><SkipForward className="w-4 h-4 inline mr-1" /> Skip Rest</button>
          </div>
        </section>

        <PlateCalculator compact />

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onSkipExercise(activeExerciseIndex)} className="py-3 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#d4e4fa]">Skip Exercise</button>
          <button onClick={() => onReplaceExercise(activeExerciseIndex)} className="py-3 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#00eefc]">Replace Exercise</button>
        </div>
        <button onClick={onEndWorkout} className="w-full py-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-bold flex items-center justify-center gap-2">
          <Square className="w-4 h-4" /> End Workout
        </button>

        <div className="flex justify-between gap-2 pb-4">
          <button disabled={activeExerciseIndex === 0} onClick={() => onSetActiveExerciseIndex(Math.max(0, activeExerciseIndex - 1))} className="flex-1 py-3 rounded-xl bg-[#0E1421] border border-[#1E293B] text-xs font-bold disabled:opacity-40">Previous</button>
          <button disabled={activeExerciseIndex === exercises.length - 1} onClick={() => onSetActiveExerciseIndex(Math.min(exercises.length - 1, activeExerciseIndex + 1))} className="flex-1 py-3 rounded-xl bg-[#0E1421] border border-[#1E293B] text-xs font-bold disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
};

const Stepper: React.FC<{ label: string; value: number; step: number; onChange: (value: number) => void }> = ({ label, value, step, onChange }) => (
  <div>
    <p className="text-xs text-[#8e9379] font-bold uppercase mb-2">{label}</p>
    <div className="grid grid-cols-[64px_1fr_64px] gap-2 items-center">
      <button onClick={() => onChange(Number((value - step).toFixed(1)))} className="h-14 rounded-xl bg-[#010f1f] border border-[#273647] text-[#00eefc] flex items-center justify-center">
        <Minus className="w-6 h-6" />
      </button>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="input-dark h-14 rounded-xl text-center text-2xl font-black" />
      <button onClick={() => onChange(Number((value + step).toFixed(1)))} className="h-14 rounded-xl bg-[#010f1f] border border-[#273647] text-[#c3f400] flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  </div>
);
