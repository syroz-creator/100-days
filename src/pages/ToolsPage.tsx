import React from 'react';
import { Award, Share2 } from 'lucide-react';
import { Achievement, DailyLog } from '../types';
import { buildWeeklyReview } from '../utils/beginnerFeatures';
import { formatDateToISO } from '../utils/calculations';
import { PlateCalculator } from '../components/workout/PlateCalculator';

interface ToolsPageProps {
  dailyLogs: Record<string, DailyLog>;
  achievements: Achievement[];
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ dailyLogs, achievements }) => {
  const review = buildWeeklyReview(dailyLogs, formatDateToISO(new Date()));
  const shareText = [
    '100 DAYS weekly review',
    `Workouts: ${review.completedWorkouts} completed, ${review.missedWorkouts} missed`,
    `Sets: ${review.totalSets}`,
    `Avg protein: ${review.averageProtein}g`,
    `Goal: ${review.goal}`,
  ].join('\n');

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: '100 DAYS Weekly Review', text: shareText }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(shareText).catch(() => undefined);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-black font-display text-white">Tools</h2>
        <p className="text-sm text-[#94A3B8]">Offline-ready training helpers and weekly review.</p>
      </div>

      <PlateCalculator />

      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Sunday review</p>
            <h3 className="text-xl font-black font-display text-white">Weekly Review</h3>
          </div>
          <button onClick={share} className="p-2 rounded-xl bg-[#122131] border border-[#273647] text-[#c3f400]" title="Share clean summary">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <Metric label="Start weight" value={review.startWeight ? `${review.startWeight} kg` : '--'} />
          <Metric label="End weight" value={review.endWeight ? `${review.endWeight} kg` : '--'} />
          <Metric label="7-day average" value={review.averageWeight ? `${review.averageWeight} kg` : '--'} />
          <Metric label="Previous change" value={review.previousWeekChange !== undefined ? `${review.previousWeekChange} kg` : '--'} />
          <Metric label="Workouts" value={`${review.completedWorkouts} / ${review.completedWorkouts + review.missedWorkouts}`} />
          <Metric label="Sets" value={String(review.totalSets)} />
          <Metric label="Avg calories" value={`${review.averageCalories} kcal`} />
          <Metric label="Avg protein" value={`${review.averageProtein} g`} />
          <Metric label="Meals" value={`${review.mealConsistency}%`} />
          <Metric label="Water" value={`${review.waterConsistency}%`} />
          <Metric label="Sleep" value={`${review.averageSleep} h`} />
          <Metric label="Energy / soreness" value={`${review.averageEnergy} / ${review.averageSoreness}`} />
        </div>

        <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 space-y-2 text-sm">
          <p><span className="text-[#8e9379] font-bold">Best strength:</span> {review.bestStrength}</p>
          {review.photoReminder && <p className="text-[#00eefc] font-semibold">Progress-photo checkpoint needs attention.</p>}
          <p><span className="text-[#c3f400] font-bold">Went well:</span> {review.wentWell}</p>
          <p><span className="text-[#00eefc] font-bold">Improve:</span> {review.improve}</p>
          <p><span className="text-white font-bold">Next goal:</span> {review.goal}</p>
        </div>
        <p className="text-[10px] text-[#8e9379]">Share card excludes private measurements and photos unless you deliberately add them elsewhere.</p>
      </section>

      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-[#c3f400]" /> Achievements
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {achievements.length === 0 ? (
            <p className="text-xs text-[#8e9379]">Achievements appear here permanently after you earn them.</p>
          ) : achievements.map((achievement) => (
            <div key={achievement.id} className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
              <p className="text-sm font-bold text-white">{achievement.title}</p>
              <p className="text-xs text-[#94A3B8]">{achievement.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-[#010f1f] border border-[#273647] rounded-xl p-3">
    <p className="text-[10px] text-[#8e9379] font-bold uppercase">{label}</p>
    <p className="text-base font-black text-white mt-1">{value}</p>
  </div>
);
