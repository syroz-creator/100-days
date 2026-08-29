import React, { useState } from 'react';
import {
  Scale,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Footprints,
  Moon,
  Camera,
  Flame,
  Check,
  Edit2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DailyLog, UserProfile, WorkoutSplitId } from '../types';
import { formatWeight } from '../utils/calculations';
import { WORKOUT_TEMPLATES } from '../data/initialData';
import { playClickBeep } from '../utils/sound';
import { SilentCoachPanel } from '../components/coach/SilentCoachPanel';
import { buildWeeklyReview, findMissedStrengthWorkout } from '../utils/beginnerFeatures';

interface TodayDashboardProps {
  log: DailyLog;
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  streak: number;
  onUpdateLog: (updatedLog: DailyLog) => void;
  onUpdateLogs: (updatedLogs: DailyLog[]) => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onNavigateToWorkout: () => void;
  onNavigateToMeals: () => void;
  onNavigateToProgress: () => void;
  onStartPlan: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  log,
  profile,
  dailyLogs,
  streak,
  onUpdateLog,
  onUpdateLogs,
  onUpdateProfile,
  onNavigateToWorkout,
  onNavigateToMeals,
  onNavigateToProgress,
  onStartPlan,
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(log.weightKg?.toString() || profile.currentWeightKg.toString());

  const currentSplitId = log.workoutSplitId || 'upper_a';
  const workoutInfo = WORKOUT_TEMPLATES[currentSplitId] || WORKOUT_TEMPLATES.upper_a;
  const isPhotoCheckpoint = [1, 15, 30, 45, 60, 75, 100].includes(log.programDay);
  const missedWorkout = findMissedStrengthWorkout(dailyLogs, log.date);
  const weeklyReview = buildWeeklyReview(dailyLogs, log.date);
  const isSunday = new Date(`${log.date}T00:00:00`).getDay() === 0;

  // Calculate task completion percentage (6 items)
  const taskKeys: (keyof typeof log.tasks)[] = isPhotoCheckpoint
    ? ['workout', 'meals', 'water', 'steps', 'sleep', 'photo']
    : ['workout', 'meals', 'water', 'steps', 'sleep'];
  const completedCount = taskKeys.filter((k) => log.tasks[k]).length;
  const completionPercentage = Math.round((completedCount / taskKeys.length) * 100);

  // SVG Progress ring math
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // 439.8
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  const toggleTask = (taskKey: keyof typeof log.tasks) => {
    playClickBeep();
    const updatedTasks = {
      ...log.tasks,
      [taskKey]: !log.tasks[taskKey],
    };

    // If toggling workout, also sync workoutCompleted
    const isWorkoutCompleted = taskKey === 'workout' ? updatedTasks.workout : log.workoutCompleted;

    onUpdateLog({
      ...log,
      tasks: updatedTasks,
      workoutCompleted: isWorkoutCompleted,
    });
  };

  const handleSaveWeight = () => {
    const num = parseFloat(tempWeight);
    if (!isNaN(num) && num > 20 && num < 300) {
      onUpdateLog({
        ...log,
        weightKg: num,
      });
      onUpdateProfile({
        ...profile,
        currentWeightKg: num,
      });
    }
    setIsEditingWeight(false);
  };

  const handleMissedWorkout = (decision: NonNullable<DailyLog['missedWorkoutDecision']>) => {
    if (!missedWorkout) return;
    const missedTemplate = WORKOUT_TEMPLATES[missedWorkout.workoutSplitId || 'upper_a'];
    const updatedMissed: DailyLog = {
      ...missedWorkout,
      missedWorkoutDecision: decision,
      scheduleAdjustmentNote: decision === 'rejected'
        ? 'Schedule suggestion rejected.'
        : decision === 'skip'
          ? 'Skipped without changing the rest of the week.'
          : 'Moved one missed workout to today while keeping the next same-muscle day separated.',
    };
    const updatedToday: DailyLog = decision === 'reschedule' || decision === 'complete_today'
      ? {
          ...log,
          workoutSplitId: missedWorkout.workoutSplitId,
          scheduleAdjustmentNote: `Today is set to ${missedTemplate.name}; the next same-muscle workout still needs recovery space.`,
        }
      : log;
    onUpdateLogs(decision === 'reschedule' || decision === 'complete_today' ? [updatedMissed, updatedToday] : [updatedMissed]);
  };

  const getDaySubtitle = (day: number) => {
    if (day === 1) return 'The journey begins now.';
    if (day <= 15) return 'Building the unbreakable foundation.';
    if (day <= 30) return 'Habits locked in. Hypertrophy in motion.';
    if (day <= 60) return 'Consistency is sculpting strength.';
    if (day <= 90) return 'Peak momentum. Push every set.';
    if (day === 100) return 'Final day! The 100-day transformation unlocked!';
    return 'One rep, one meal, one day at a time.';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Day Headline */}
      <div className="text-center pt-2">
        <h2 className="text-4xl md:text-5xl font-extrabold font-display text-white tracking-tighter">
          {profile.planStarted ? `Day ${log.programDay} of 100` : 'Plan Preview'}
        </h2>
        <p className="text-sm md:text-base text-[#94A3B8] mt-1.5 font-medium">
          {profile.planStarted ? getDaySubtitle(log.programDay) : 'Explore everything before starting the countdown.'}
        </p>
      </div>

      <SilentCoachPanel
        profile={profile}
        log={log}
        dailyLogs={dailyLogs}
        onStartPlan={onStartPlan}
      />

      {missedWorkout && (
        <section className="bg-[#122131] border border-[#273647] rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Missed workout recovery</p>
            <h3 className="text-lg font-black font-display text-white">{WORKOUT_TEMPLATES[missedWorkout.workoutSplitId || 'upper_a'].name} was missed</h3>
            <p className="text-xs text-[#94A3B8] mt-1">Pick the cleanest way forward. The countdown stays accurate.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleMissedWorkout('reschedule')} className="py-2.5 rounded-xl bg-[#c3f400] text-[#050810] text-xs font-bold">Reschedule</button>
            <button onClick={() => handleMissedWorkout('complete_today')} className="py-2.5 rounded-xl bg-[#00eefc] text-[#050810] text-xs font-bold">Do Today</button>
            <button onClick={() => handleMissedWorkout('skip')} className="py-2.5 rounded-xl bg-[#010f1f] border border-[#273647] text-[#d4e4fa] text-xs font-bold">Skip</button>
            <button onClick={() => handleMissedWorkout('rejected')} className="py-2.5 rounded-xl bg-[#010f1f] border border-[#273647] text-[#8e9379] text-xs font-bold">Reject</button>
          </div>
        </section>
      )}

      {isSunday && (
        <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-[11px] text-[#c3f400] font-bold uppercase tracking-widest">Automatic weekly review</p>
            <h3 className="text-lg font-black font-display text-white">This week at a glance</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-2"><p className="text-lg font-black text-white">{weeklyReview.completedWorkouts}</p><p className="text-[10px] text-[#8e9379]">Workouts</p></div>
            <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-2"><p className="text-lg font-black text-white">{weeklyReview.totalSets}</p><p className="text-[10px] text-[#8e9379]">Sets</p></div>
            <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-2"><p className="text-lg font-black text-white">{weeklyReview.averageProtein}g</p><p className="text-[10px] text-[#8e9379]">Protein</p></div>
          </div>
          <p className="text-xs text-[#94A3B8]">{weeklyReview.wentWell} Next goal: {weeklyReview.goal}</p>
        </section>
      )}

      {/* Hero Circular Progress Ring */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#1c2b3c"
              strokeWidth="12"
            />
            {/* Animated Glow Progress Bar */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#c3f400"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out drop-shadow-[0_0_8px_rgba(195,244,0,0.5)]"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold font-display text-white tracking-tight">
              {completionPercentage}%
            </span>
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">
              {completedCount} of {taskKeys.length} Tasks
            </span>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="mt-3 bg-[#c3f400]/10 border border-[#c3f400]/30 rounded-full px-4 py-1 flex items-center gap-1.5 shadow-[0_0_12px_rgba(195,244,0,0.15)]">
          <Flame className="w-4 h-4 text-[#c3f400] fill-[#c3f400]" />
          <span className="text-xs font-bold font-display text-[#c3f400] uppercase tracking-wider">
            {streak} Day Streak
          </span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Current Weight Card */}
        <div className="card-bg rounded-2xl p-4 flex flex-col justify-between relative group hover:border-[#00eefc]/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
              Current Weight
            </span>
            <Scale className="w-5 h-5 text-[#00dbe9]" />
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            {isEditingWeight ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  step="0.1"
                  value={tempWeight}
                  onChange={(e) => setTempWeight(e.target.value)}
                  className="input-dark w-28 rounded-lg px-2.5 py-1 text-lg font-bold"
                  autoFocus
                />
                <button
                  onClick={handleSaveWeight}
                  className="px-3 py-1 bg-[#c3f400] text-[#050810] text-xs font-bold rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingWeight(false)}
                  className="px-2 py-1 text-xs text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-display text-white">
                    {log.weightKg ? log.weightKg.toFixed(1) : profile.currentWeightKg.toFixed(1)}
                  </span>
                  <span className="text-sm font-medium text-[#8e9379]">{profile.unitSystem}</span>
                </div>
                <button
                  onClick={() => setIsEditingWeight(true)}
                  className="text-xs text-[#00eefc] hover:underline flex items-center gap-1 opacity-80 group-hover:opacity-100"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Log Weight
                </button>
              </>
            )}
          </div>
        </div>

        {/* Today's Focus Card */}
        <div
          onClick={onNavigateToWorkout}
          className="card-bg rounded-2xl p-4 flex flex-col justify-between border-l-4 border-l-[#7df4ff] cursor-pointer hover:border-[#00eefc] hover:bg-[#122131]/60 transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#8e9379] uppercase tracking-widest">
              Today's Focus
            </span>
            <Dumbbell className="w-5 h-5 text-[#00dbe9] group-hover:scale-110 transition-transform" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-display text-[#7df4ff]">
                {workoutInfo.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1c2b3c] text-[11px] font-semibold text-[#d4e4fa]">
                  {workoutInfo.type === 'strength' ? 'Strength Hypertrophy' : 'Active Recovery'}
                </span>
                <span className="text-[11px] text-[#94A3B8]">{workoutInfo.estimatedMinutes} min</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#7df4ff] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Daily Tasks Checklist */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-white">Daily Tasks</h3>
          <span className="text-xs text-[#8e9379] font-medium">Tap to check off</span>
        </div>

        <div className="space-y-2.5">
          {/* Task 1: Workout */}
          <div
            onClick={() => toggleTask('workout')}
            className={`card-bg rounded-xl p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
              log.tasks.workout
                ? 'border-[#c3f400]/40 bg-[#c3f400]/5'
                : 'hover:border-[#c3f400]/30'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToWorkout();
                }}
                className="w-10 h-10 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00dbe9] hover:text-[#c3f400] transition-colors"
                title="Open Workout"
              >
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Workout</h4>
                <p className="text-xs text-[#8e9379]">Complete {workoutInfo.name}</p>
              </div>
            </div>

            {/* Checkbox */}
            <div
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                log.tasks.workout
                  ? 'border-[#c3f400] bg-[#c3f400]/20 shadow-[0_0_10px_rgba(195,244,0,0.4)] text-[#c3f400]'
                  : 'border-[#8e9379] text-transparent hover:border-[#c3f400]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
          </div>

          {/* Task 2: Meals */}
          <div
            onClick={() => toggleTask('meals')}
            className={`card-bg rounded-xl p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
              log.tasks.meals
                ? 'border-[#c3f400]/40 bg-[#c3f400]/5'
                : 'hover:border-[#c3f400]/30'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToMeals();
                }}
                className="w-10 h-10 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00dbe9] hover:text-[#c3f400] transition-colors"
                title="Open Meals"
              >
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Meals</h4>
                <p className="text-xs text-[#8e9379]">Hit protein & calorie goal ({profile.calorieGoal} kcal)</p>
              </div>
            </div>

            <div
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                log.tasks.meals
                  ? 'border-[#c3f400] bg-[#c3f400]/20 shadow-[0_0_10px_rgba(195,244,0,0.4)] text-[#c3f400]'
                  : 'border-[#8e9379] text-transparent hover:border-[#c3f400]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
          </div>

          {/* Task 3: Water */}
          <div
            onClick={() => toggleTask('water')}
            className={`card-bg rounded-xl p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
              log.tasks.water
                ? 'border-[#c3f400]/40 bg-[#c3f400]/5'
                : 'hover:border-[#c3f400]/30'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToMeals();
                }}
                className="w-10 h-10 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00dbe9]"
              >
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Water</h4>
                <p className="text-xs text-[#8e9379]">{profile.waterGoalLiters} Liters (8 cups)</p>
              </div>
            </div>

            <div
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                log.tasks.water
                  ? 'border-[#c3f400] bg-[#c3f400]/20 shadow-[0_0_10px_rgba(195,244,0,0.4)] text-[#c3f400]'
                  : 'border-[#8e9379] text-transparent hover:border-[#c3f400]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
          </div>

          {/* Task 4: Steps */}
          <div
            onClick={() => toggleTask('steps')}
            className={`card-bg rounded-xl p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
              log.tasks.steps
                ? 'border-[#c3f400]/40 bg-[#c3f400]/5'
                : 'hover:border-[#c3f400]/30'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00dbe9]">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Steps</h4>
                <p className="text-xs text-[#8e9379]">
                  {workoutInfo.type === 'recovery' ? '7,000 – 10,000 steps' : '10,000 steps'}
                </p>
              </div>
            </div>

            <div
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                log.tasks.steps
                  ? 'border-[#c3f400] bg-[#c3f400]/20 shadow-[0_0_10px_rgba(195,244,0,0.4)] text-[#c3f400]'
                  : 'border-[#8e9379] text-transparent hover:border-[#c3f400]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
          </div>

          {/* Task 5: Sleep */}
          <div
            onClick={() => toggleTask('sleep')}
            className={`card-bg rounded-xl p-3.5 flex items-center justify-between cursor-pointer border transition-all ${
              log.tasks.sleep
                ? 'border-[#c3f400]/40 bg-[#c3f400]/5'
                : 'hover:border-[#c3f400]/30'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00dbe9]">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Sleep</h4>
                <p className="text-xs text-[#8e9379]">8 Hours (Wake: {profile.wakeTime} / Sleep: {profile.sleepTime})</p>
              </div>
            </div>

            <div
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                log.tasks.sleep
                  ? 'border-[#c3f400] bg-[#c3f400]/20 shadow-[0_0_10px_rgba(195,244,0,0.4)] text-[#c3f400]'
                  : 'border-[#8e9379] text-transparent hover:border-[#c3f400]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
          </div>

          {isPhotoCheckpoint && <div className={`card-bg rounded-xl p-4 border ${log.tasks.photo || log.photoCheckpointSkipped ? 'border-[#c3f400]/40' : 'border-[#00eefc]/60 shadow-[0_0_16px_rgba(0,238,252,0.1)]'}`}><div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-full bg-[#122131] border border-[#273647] flex items-center justify-center text-[#00dbe9]"><Camera className="w-5 h-5" /></div><div><h4 className="text-base font-semibold text-white">Day {log.programDay} Photo Checkpoint</h4><p className="text-xs text-[#8e9379]">Four standardized poses, stored only on this device.</p></div></div><div className="grid grid-cols-2 gap-2 mt-3"><button onClick={onNavigateToProgress} className="py-2.5 rounded-xl bg-[#00eefc] text-[#050810] text-xs font-bold">Take Photos</button><button onClick={() => onUpdateLog({ ...log, photoCheckpointSkipped: true })} className="py-2.5 rounded-xl bg-[#122131] border border-[#273647] text-[#94A3B8] text-xs font-bold">Skip Checkpoint</button></div>{(log.tasks.photo || log.photoCheckpointSkipped) && <p className="text-[10px] text-[#c3f400] mt-2">{log.tasks.photo ? 'Checkpoint marked complete.' : 'Skipped for this checkpoint.'}</p>}</div>}
        </div>
      </section>

      {/* Motivational Quote */}
      <section className="py-3 text-center border-t border-[#1E293B]/60">
        <p className="text-sm font-medium italic text-[#7df4ff]/80">
          "The hardest part is showing up. You're already ahead."
        </p>
      </section>
    </div>
  );
};
