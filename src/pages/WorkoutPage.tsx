import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell,
  Lightbulb,
  Timer,
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Maximize2,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyLog, UserProfile, WorkoutTemplate, WorkoutSplitId, Exercise, ExerciseSet } from '../types';
import { WORKOUT_TEMPLATES } from '../data/initialData';
import { playTimerCompleteSound, playClickBeep } from '../utils/sound';
import { recommendNextExercise } from '../utils/calculations';

interface WorkoutPageProps {
  log: DailyLog;
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  onUpdateLog: (updatedLog: DailyLog) => void;
  onNavigateToDashboard: () => void;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({
  log,
  profile,
  dailyLogs,
  onUpdateLog,
  onNavigateToDashboard,
}) => {
  const currentSplitId: WorkoutSplitId = log.workoutSplitId || 'upper_a';
  const template = WORKOUT_TEMPLATES[currentSplitId] || WORKOUT_TEMPLATES.upper_a;

  const getAcceptedWeight = (exerciseId: string) => (Object.values(dailyLogs) as DailyLog[])
    .filter((item) => item.date < log.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap((item) => item.loggedExercises || [])
    .find((item) => item.exerciseId === exerciseId && item.recommendationAccepted)?.recommendation?.suggestedWeightKg;

  // Initialize active exercises state from log or template
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (log.loggedExercises && log.loggedExercises.length > 0) {
      return template.exercises.map((templateEx) => {
        const logged = log.loggedExercises?.find((l) => l.exerciseId === templateEx.id);
        if (logged) {
          return {
            ...templateEx,
            sets: logged.sets.map((s, idx) => ({
              ...templateEx.sets[idx],
              setNumber: s.setNumber,
              weightKg: s.weightKg,
              reps: s.reps,
              completed: s.completed,
              prevWeightKg: templateEx.sets[idx]?.prevWeightKg || s.weightKg,
              prevReps: templateEx.sets[idx]?.prevReps || s.reps,
            })),
          };
        }
        return templateEx;
      });
    }
    return template.exercises.map((exercise) => {
      const acceptedWeight = getAcceptedWeight(exercise.id);
      return acceptedWeight === undefined ? exercise : {
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set, weightKg: acceptedWeight, prevWeightKg: set.weightKg })),
      };
    });
  });

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showTips, setShowTips] = useState<Record<string, boolean>>({});
  const [exerciseDifficulty, setExerciseDifficulty] = useState<Record<string, number>>(() =>
    Object.fromEntries((log.loggedExercises || []).map((exercise) => [exercise.exerciseId, exercise.difficulty || 3]))
  );

  // Rest Timer State
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(profile.restTimeSeconds || 90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync exercises to parent log
  const syncToLog = (updatedExList: Exercise[], difficulties = exerciseDifficulty) => {
    setExercises(updatedExList);
    const loggedExercises = updatedExList.map((ex) => {
      const existing = log.loggedExercises?.find((item) => item.exerciseId === ex.id);
      const difficulty = difficulties[ex.id] || existing?.difficulty || 3;
      const isFinished = ex.sets.every((set) => set.completed);
      return {
      exerciseId: ex.id,
      exerciseName: ex.name,
      difficulty,
      recommendation: isFinished
        ? recommendNextExercise(ex, difficulty, log.sorenessLevel)
        : existing?.recommendation,
      recommendationAccepted: existing?.recommendationAccepted || false,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        weightKg: s.weightKg,
        reps: s.reps,
        completed: s.completed,
      })),
    };});

    const allCompleted = updatedExList.every((ex) => ex.sets.every((s) => s.completed));

    onUpdateLog({
      ...log,
      loggedExercises,
      workoutCompleted: allCompleted || log.workoutCompleted,
      tasks: {
        ...log.tasks,
        workout: allCompleted || log.tasks.workout,
      },
    });
  };

  const handleDifficulty = (exerciseId: string, value: number) => {
    const updated = { ...exerciseDifficulty, [exerciseId]: value };
    setExerciseDifficulty(updated);
    syncToLog(exercises, updated);
  };

  const acceptRecommendation = (exerciseId: string) => {
    const loggedExercises = (log.loggedExercises || []).map((exercise) =>
      exercise.exerciseId === exerciseId
        ? { ...exercise, recommendationAccepted: true }
        : exercise
    );
    onUpdateLog({ ...log, loggedExercises });
  };

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current as NodeJS.Timeout);
            setIsTimerRunning(false);
            playTimerCompleteSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const handleStartTimer = (seconds?: number) => {
    if (seconds) setTimerSecondsLeft(seconds);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = (seconds?: number) => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(seconds || profile.restTimeSeconds || 90);
  };

  const handleAdd30s = () => {
    setTimerSecondsLeft((prev) => prev + 30);
  };

  const toggleTip = (exId: string) => {
    setShowTips((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleUpdateSet = (exIndex: number, setIndex: number, field: 'weightKg' | 'reps', value: number) => {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex][field] = value;
    syncToLog(updated);
  };

  const handleToggleSetComplete = (exIndex: number, setIndex: number) => {
    playClickBeep();
    const updated = [...exercises];
    const targetSet = updated[exIndex].sets[setIndex];
    const willBeCompleted = !targetSet.completed;
    targetSet.completed = willBeCompleted;

    syncToLog(updated);

    // If just completed set, trigger rest timer
    if (willBeCompleted) {
      const restSec = updated[exIndex].restSeconds || profile.restTimeSeconds || 90;
      handleResetTimer(restSec);
      handleStartTimer(restSec);
    }
  };

  const handleAddSet = (exIndex: number) => {
    const updated = [...exercises];
    const ex = updated[exIndex];
    const lastSet = ex.sets[ex.sets.length - 1];
    ex.sets.push({
      setNumber: ex.sets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 20,
      reps: lastSet ? lastSet.reps : ex.minReps,
      completed: false,
      prevWeightKg: lastSet?.weightKg,
      prevReps: lastSet?.reps,
    });
    syncToLog(updated);
  };

  const handleCompleteWorkout = () => {
    playTimerCompleteSound();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#c3f400', '#00eefc', '#ffffff'],
    });

    const updated = exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s, completed: true })),
    }));
    syncToLog(updated);
  };

  // Progressive overload check: Check if all sets hit maximum target rep range
  const checkProgressiveOverload = (ex: Exercise) => {
    const allSetsMaxed = ex.sets.length > 0 && ex.sets.every((s) => s.completed && s.reps >= ex.maxReps);
    return allSetsMaxed;
  };

  // Calculation of overall completed sets percentage
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const workoutProgressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  // Format timer MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Workout Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToDashboard}
              className="p-1.5 rounded-lg bg-[#0E1421] border border-[#1E293B] text-[#94A3B8] hover:text-[#c3f400] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">
                {template.name}
              </h2>
              <p className="text-xs text-[#00dbe9] font-semibold mt-0.5">
                {template.estimatedMinutes} min est. • {template.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-display border ${
                workoutProgressPercent === 100
                  ? 'bg-[#c3f400]/20 text-[#c3f400] border-[#c3f400]/40'
                  : 'bg-[#c3f400]/10 text-[#c3f400] border-[#c3f400]/30'
              }`}
            >
              {workoutProgressPercent === 100 ? 'COMPLETED' : 'IN PROGRESS'}
            </span>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-2 rounded-xl bg-[#0E1421] border border-[#1E293B] text-[#94A3B8] hover:text-[#00eefc]"
              title={isFocusMode ? 'Show List View' : 'Single Exercise Focus View'}
            >
              {isFocusMode ? <ListFilter className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress Line */}
        <div className="h-1.5 w-full bg-[#1c2b3c] rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-[#c3f400] rounded-full transition-all duration-500 shadow-[0_0_8px_#c3f400]"
            style={{ width: `${workoutProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Focus Mode Exercise Stepper Header */}
      {isFocusMode && (
        <div className="flex items-center justify-between bg-[#122131] border border-[#273647] p-2.5 rounded-xl text-xs font-bold">
          <button
            disabled={activeExerciseIndex === 0}
            onClick={() => setActiveExerciseIndex((prev) => Math.max(0, prev - 1))}
            className="px-2 py-1 rounded bg-[#010f1f] text-[#d4e4fa] disabled:opacity-30 hover:text-[#c3f400]"
          >
            ← Previous
          </button>
          <span className="text-[#00eefc]">
            Exercise {activeExerciseIndex + 1} of {exercises.length}
          </span>
          <button
            disabled={activeExerciseIndex === exercises.length - 1}
            onClick={() => setActiveExerciseIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
            className="px-2 py-1 rounded bg-[#010f1f] text-[#d4e4fa] disabled:opacity-30 hover:text-[#c3f400]"
          >
            Next →
          </button>
        </div>
      )}

      {/* Exercises List / Focus Component */}
      <div className="space-y-4">
        {exercises.map((ex, exIndex) => {
          if (isFocusMode && exIndex !== activeExerciseIndex) return null;

          const isCurrentActive = exIndex === activeExerciseIndex;
          const loggedExercise = log.loggedExercises?.find((item) => item.exerciseId === ex.id);
          const recommendation = loggedExercise?.recommendation;
          const exerciseFinished = ex.sets.every((set) => set.completed);

          return (
            <div
              key={ex.id}
              onClick={() => setActiveExerciseIndex(exIndex)}
              className={`card-bg rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 ${
                isCurrentActive ? 'border-[#00eefc]/50 shadow-[0_0_15px_rgba(0,238,252,0.1)]' : ''
              }`}
            >
              {/* Left Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isCurrentActive
                    ? 'bg-[#c3f400] shadow-[0_0_10px_#c3f400]'
                    : ex.sets.every((s) => s.completed)
                    ? 'bg-[#00eefc]'
                    : 'bg-[#1c2b3c]'
                }`}
              />

              <div className="pl-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-[#94A3B8] flex items-center gap-2 mt-1 font-medium">
                      <span className="text-[#00dbe9]">
                        {ex.minReps === ex.maxReps ? `${ex.minReps} Reps` : `${ex.minReps}–${ex.maxReps} Reps`}
                      </span>
                      <span className="w-1 h-1 bg-[#273647] rounded-full" />
                      <span className="text-[#00dbe9]">{ex.restSeconds}s Rest</span>
                      <span className="w-1 h-1 bg-[#273647] rounded-full" />
                      <span>{ex.targetMuscle}</span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTip(ex.id);
                    }}
                    className="text-xs font-semibold text-[#00dbe9] hover:text-[#7df4ff] flex items-center gap-1 bg-[#122131] px-2.5 py-1 rounded-lg border border-[#273647]"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Tips
                  </button>
                </div>

                {/* Form Tips Collapsible */}
                {showTips[ex.id] && (
                  <div className="mt-3 bg-[#122131] border border-[#273647] rounded-xl p-3 text-xs text-[#d4e4fa] leading-relaxed animate-in fade-in">
                    <p className="font-semibold text-[#c3f400] mb-0.5">Form Execution:</p>
                    <p className="text-[#94A3B8]">{ex.formTips}</p>
                  </div>
                )}

                {exerciseFinished && (
                  <div className="mt-3 bg-[#122131] border border-[#273647] rounded-xl p-3 space-y-3">
                    <div><p className="text-[11px] font-bold text-[#8e9379] uppercase mb-2">Perceived difficulty</p><div className="grid grid-cols-5 gap-1.5">{[1,2,3,4,5].map((value) => <button key={value} onClick={() => handleDifficulty(ex.id, value)} className={`h-8 rounded-lg border text-xs font-bold ${(exerciseDifficulty[ex.id] || 3) === value ? 'bg-[#00eefc] border-[#00eefc] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#94A3B8]'}`}>{value}</button>)}</div></div>
                    {recommendation && <div className="flex items-start gap-2"><Zap className="w-4 h-4 text-[#c3f400] shrink-0 mt-0.5" /><div className="flex-1"><p className="text-xs font-bold text-[#c3f400] capitalize">{recommendation.action.replace('_', ' ')} next session{recommendation.suggestedWeightKg !== undefined ? ` at ${recommendation.suggestedWeightKg} kg` : ''}</p><p className="text-[11px] text-[#94A3B8] mt-0.5">{recommendation.explanation}</p></div>{!loggedExercise?.recommendationAccepted ? <button onClick={() => acceptRecommendation(ex.id)} className="px-2.5 py-1.5 rounded-lg bg-[#c3f400] text-[#050810] text-[10px] font-bold">Apply</button> : <span className="text-[10px] text-[#c3f400] font-bold">APPLIED</span>}</div>}
                  </div>
                )}

                {/* Sets Table */}
                <div className="mt-4 space-y-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-[36px_1fr_1fr_42px] gap-2 items-center text-[11px] font-bold uppercase tracking-wider text-[#8e9379] px-2">
                    <span>Set</span>
                    <span>{profile.unitSystem}</span>
                    <span>Reps</span>
                    <span className="text-center">Done</span>
                  </div>

                  {/* Set Rows */}
                  {ex.sets.map((set, setIndex) => (
                    <div
                      key={set.setNumber}
                      className={`grid grid-cols-[36px_1fr_1fr_42px] gap-2 items-center p-2 rounded-xl transition-all ${
                        set.completed
                          ? 'bg-[#c3f400]/10 border border-[#c3f400]/30 opacity-90'
                          : isCurrentActive
                          ? 'bg-[#122131] border border-[#273647]'
                          : 'bg-[#0E1421] border border-transparent'
                      }`}
                    >
                      <span
                        className={`text-sm font-bold font-display ${
                          set.completed ? 'text-[#c3f400]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {set.setNumber}
                      </span>

                      {/* Weight Input with Previous Badge */}
                      <div className="relative">
                        {set.prevWeightKg !== undefined && (
                          <span className="absolute -top-2.5 left-2 text-[9px] font-bold text-[#8e9379] bg-[#050810] px-1 rounded">
                            Prev: {set.prevWeightKg}
                          </span>
                        )}
                        <input
                          type="number"
                          step="0.5"
                          value={set.weightKg || ''}
                          onChange={(e) =>
                            handleUpdateSet(exIndex, setIndex, 'weightKg', parseFloat(e.target.value) || 0)
                          }
                          className="input-dark w-full rounded-lg py-1.5 px-2 text-center text-sm font-semibold"
                          placeholder="kg"
                        />
                      </div>

                      {/* Reps Input with Previous Badge */}
                      <div className="relative">
                        {set.prevReps !== undefined && (
                          <span className="absolute -top-2.5 left-2 text-[9px] font-bold text-[#8e9379] bg-[#050810] px-1 rounded">
                            Prev: {set.prevReps}
                          </span>
                        )}
                        <input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) =>
                            handleUpdateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)
                          }
                          className="input-dark w-full rounded-lg py-1.5 px-2 text-center text-sm font-semibold"
                          placeholder="reps"
                        />
                      </div>

                      {/* Complete Checkbox Button */}
                      <button
                        onClick={() => handleToggleSetComplete(exIndex, setIndex)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          set.completed
                            ? 'bg-[#c3f400] text-[#050810] shadow-[0_0_10px_rgba(195,244,0,0.5)] font-black'
                            : 'bg-[#050810] border border-[#444933] text-[#8e9379] hover:border-[#c3f400] hover:text-white'
                        }`}
                        title="Mark Set Complete"
                      >
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </button>
                    </div>
                  ))}

                  {/* Add Set Button */}
                  <button
                    onClick={() => handleAddSet(exIndex)}
                    className="w-full py-1.5 text-xs text-[#00dbe9] hover:text-[#7df4ff] flex items-center justify-center gap-1.5 border border-dashed border-[#273647] rounded-lg hover:border-[#00dbe9]/50 transition-colors mt-2"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Set
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Rest Timer Module */}
      <section className="sticky bottom-20 md:bottom-6 bg-[#0E1421]/95 backdrop-blur-md border border-[#1E293B] rounded-2xl p-4 shadow-2xl z-30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full border-2 border-[#00dbe9]/30 border-t-[#00dbe9] flex items-center justify-center ${
              isTimerRunning ? 'animate-spin' : ''
            }`}
          >
            <Timer className="w-6 h-6 text-[#00dbe9]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8e9379] uppercase tracking-wider">Rest Timer</p>
            <p className="text-2xl font-bold font-display text-[#00eefc] font-mono tracking-wider">
              {formatTimer(timerSecondsLeft)}
            </p>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAdd30s}
            className="px-2.5 py-2 rounded-xl bg-[#122131] text-[#00dbe9] text-xs font-bold border border-[#273647] hover:bg-[#1c2b3c]"
            title="Add 30 seconds"
          >
            +30s
          </button>

          {isTimerRunning ? (
            <button
              onClick={handlePauseTimer}
              className="w-10 h-10 rounded-xl bg-[#c3f400] text-[#050810] flex items-center justify-center shadow-[0_0_12px_rgba(195,244,0,0.3)] hover:scale-105 transition-transform"
              title="Pause Timer"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => handleStartTimer()}
              className="w-10 h-10 rounded-xl bg-[#00eefc] text-[#050810] flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.3)] hover:scale-105 transition-transform"
              title="Start Timer"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}

          <button
            onClick={() => handleResetTimer()}
            className="w-10 h-10 rounded-xl bg-[#122131] text-[#94A3B8] flex items-center justify-center border border-[#273647] hover:text-white"
            title="Reset to default rest"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Safety Notice & Complete Workout Button */}
      <div className="space-y-3 pt-2">
        <div className="p-3 rounded-xl bg-[#050810] border border-[#273647] text-[11px] text-[#8e9379] text-center">
          🛡️ <span className="font-semibold text-[#d4e4fa]">Safety Guideline:</span> Prioritize progressive overload in rep ranges (8–12 reps). Never attempt 1-rep maximum testing.
        </div>

        <button
          onClick={handleCompleteWorkout}
          className="w-full neon-btn py-4 rounded-2xl text-lg font-extrabold font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,244,0,0.4)] hover:shadow-[0_0_30px_rgba(195,244,0,0.6)]"
        >
          <Trophy className="w-5 h-5" /> Complete Workout
        </button>
      </div>
    </div>
  );
};
