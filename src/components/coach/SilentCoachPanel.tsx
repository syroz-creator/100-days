import React, { useMemo } from 'react';
import { AlertTriangle, BrainCircuit, CalendarClock, Dumbbell, Play, ShieldCheck } from 'lucide-react';
import { DailyLog, UserProfile } from '../../types';
import { WORKOUT_TEMPLATES } from '../../data/initialData';
import { calculateCoachPlan } from '../../utils/calculations';

interface SilentCoachPanelProps {
  profile: UserProfile;
  log: DailyLog;
  dailyLogs: Record<string, DailyLog>;
  onStartPlan?: () => void;
}

function weeklyVolume() {
  const groups: Record<string, number> = {};
  Object.values(WORKOUT_TEMPLATES).filter((workout) => workout.type === 'strength').forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const group = exercise.targetMuscle.split('/')[0].split('&')[0].trim();
      groups[group] = (groups[group] || 0) + exercise.targetSets;
    });
  });
  return Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

export const SilentCoachPanel: React.FC<SilentCoachPanelProps> = ({ profile, log, dailyLogs, onStartPlan }) => {
  const coach = useMemo(() => calculateCoachPlan(profile, dailyLogs, log), [profile, dailyLogs, log]);
  const volume = useMemo(weeklyVolume, []);
  const isPreview = !profile.planStarted;

  return (
    <section className={`bg-[#0E1421] border ${isPreview ? 'border-[#c3f400]/50' : 'border-[#1E293B]'} rounded-2xl p-4 sm:p-5 shadow-xl space-y-4`}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest flex items-center gap-1.5"><BrainCircuit className="w-4 h-4" /> Silent AI Coach</p><h2 className="text-xl font-bold text-white mt-1">{isPreview ? 'Complete plan preview' : "Today's Recommendation"}</h2></div><span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${coach.recoveryStatus === 'ready' ? 'bg-[#c3f400]/15 text-[#c3f400]' : coach.recoveryStatus === 'moderate' ? 'bg-[#00eefc]/15 text-[#00eefc]' : 'bg-[#ffb4ab]/15 text-[#ffb4ab]'}`}>{coach.recoveryStatus}</span></div>

      <p className="text-sm text-[#d4e4fa] leading-relaxed">{coach.todayRecommendation}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[['BMI context', coach.bmi], ['Maintenance', `${coach.maintenanceCalories} kcal`], ['Muscle gain', `${coach.calorieTarget} kcal`], ['Protein', `${coach.proteinGrams} g`], ['Carbs', `${coach.carbsGrams} g`], ['Fat', `${coach.fatGrams} g`], ['Water', `${coach.waterLiters} L`], ['Sleep', `${coach.sleepHours} h`]].map(([label, value]) => <div key={label} className="bg-[#010f1f] border border-[#1c2b3c] rounded-xl p-2.5"><span className="block text-[10px] text-[#8e9379] uppercase">{label}</span><strong className="text-sm text-white">{value}</strong></div>)}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center"><div><span className="block text-[10px] text-[#8e9379] uppercase">Weekly gain</span><strong className="text-xs text-white">{coach.weeklyGainMinKg}-{coach.weeklyGainMaxKg} kg</strong></div><div><span className="block text-[10px] text-[#8e9379] uppercase">Remaining</span><strong className="text-xs text-white">{coach.kilogramsRemaining} kg</strong></div><div><span className="block text-[10px] text-[#8e9379] uppercase">Time estimate</span><strong className="text-xs text-white">{coach.estimatedWeeks} weeks</strong></div></div>

      <div><p className="text-[11px] text-[#8e9379] uppercase font-bold mb-2">Weekly working sets by primary muscle</p><div className="flex flex-wrap gap-1.5">{volume.map(([group, sets]) => <span key={group} className="px-2 py-1 rounded-lg bg-[#122131] border border-[#273647] text-[10px] text-[#d4e4fa]">{group}: {sets}</span>)}</div></div>

      {isPreview && <>
        <div className="grid grid-cols-2 gap-3 text-xs"><div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3"><CalendarClock className="w-4 h-4 text-[#00eefc] mb-2" /><p className="text-[#8e9379]">Estimated healthy gain</p><strong className="text-white">{coach.weeklyGainMinKg}-{coach.weeklyGainMaxKg} kg/week</strong><p className="text-[#8e9379] mt-2">To target</p><strong className="text-white">{coach.kilogramsRemaining} kg, about {coach.estimatedWeeks} weeks</strong></div><div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3"><Dumbbell className="w-4 h-4 text-[#c3f400] mb-2" /><p className="text-[#8e9379]">Four-day upper/lower</p><strong className="text-white">{profile.gymDays.length} training days</strong><p className="text-[#8e9379] mt-2">Starting intensity</p><strong className="text-white">2-3 reps in reserve</strong></div></div>
        <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 text-xs text-[#94A3B8] flex gap-2"><ShieldCheck className="w-4 h-4 text-[#c3f400] shrink-0" /><p>You can explore workouts, meals, schedule, progress photos, and settings now. The 100-day countdown has not started.</p></div>
        <button onClick={onStartPlan} className="neon-btn w-full py-4 rounded-xl text-lg flex items-center justify-center gap-2"><Play className="w-5 h-5 fill-current" /> Make Today Day 1</button>
      </>}

      {!isPreview && coach.nutritionTrend.action !== 'maintain' && <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 flex gap-2"><AlertTriangle className="w-4 h-4 text-[#00eefc] shrink-0 mt-0.5" /><p className="text-xs text-[#94A3B8]">{coach.nutritionTrend.message} No target changes automatically.</p></div>}
      <p className="text-[10px] text-[#8e9379] leading-relaxed">BMI, calorie, nutrition, body-composition, and timeline values are estimates, not diagnoses. Food values vary by brand, preparation, and measured portion. Avoid one-rep maximum testing. Users under 18 should involve a parent or guardian and qualified health or training professional.</p>
    </section>
  );
};
