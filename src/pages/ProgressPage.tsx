import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Scale,
  Dumbbell,
  Calendar,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { DailyLog, UserProfile, CheckpointPhoto, PoseType } from '../types';
import { computeWeightTrends, kgToLbs } from '../utils/calculations';
import { getPhotosFromIDB } from '../utils/indexedDB';
import { ComparisonSlider } from '../components/progress/ComparisonSlider';
import { PhotoCheckpointModal } from '../components/progress/PhotoCheckpointModal';

interface ProgressPageProps {
  log: DailyLog;
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  onSelectDate: (dateStr: string) => void;
  onUpdateLog: (log: DailyLog) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  log,
  profile,
  dailyLogs,
  onSelectDate,
  onUpdateLog,
}) => {
  const [selectedRange, setSelectedRange] = useState<'30' | '100'>('30');
  const [photos, setPhotos] = useState<CheckpointPhoto[]>([]);
  const [selectedCheckpointDay, setSelectedCheckpointDay] = useState<number | null>(null);
  const [selectedPose, setSelectedPose] = useState<PoseType>('front');
  const [strengthExercise, setStrengthExercise] = useState<string>('bench_press');

  // Load photos from IndexedDB
  const refreshPhotos = async () => {
    const loaded = await getPhotosFromIDB();
    setPhotos(loaded);
    const poses = new Set(loaded.filter((photo) => photo.programDay === log.programDay).map((photo) => photo.pose));
    if (poses.size === 4 && !log.tasks.photo) {
      onUpdateLog({ ...log, tasks: { ...log.tasks, photo: true }, photoCheckpointSkipped: false });
    }
  };

  useEffect(() => {
    refreshPhotos();
  }, []);

  // Compute weight chart data
  const rawTrends = computeWeightTrends(dailyLogs, profile.unitSystem);
  const chartData =
    selectedRange === '30' ? rawTrends.slice(Math.max(0, rawTrends.length - 30)) : rawTrends;

  // Fallback if very few data points: ensure at least baseline
  const displayChartData =
    chartData.length > 0
      ? chartData
      : [
          {
            date: profile.startDate,
            displayDate: 'Day 1',
            programDay: 1,
            weight: profile.startWeightKg,
            movingAverage: profile.startWeightKg,
          },
        ];

  // Calculate stats
  const currentWeightKg = log.weightKg || profile.currentWeightKg;
  const currentWeightDisplay = profile.unitSystem === 'lbs' ? kgToLbs(currentWeightKg) : currentWeightKg;
  const startWeightDisplay = profile.unitSystem === 'lbs' ? kgToLbs(profile.startWeightKg) : profile.startWeightKg;
  const weightDiff = Number((currentWeightDisplay - startWeightDisplay).toFixed(1));

  // Compute 7-day weekly avg
  const allLogs: DailyLog[] = (Object.values(dailyLogs) as DailyLog[]).sort((a, b) => a.date.localeCompare(b.date));
  const last7Logs = allLogs.filter((item) => item.weightKg !== undefined).slice(-7);
  const weeklyAvg =
    last7Logs.length > 0
      ? (
          last7Logs.reduce((sum: number, l: DailyLog) => sum + (profile.unitSystem === 'lbs' ? kgToLbs(l.weightKg as number) : (l.weightKg as number)), 0) /
          last7Logs.length
        ).toFixed(1)
      : currentWeightDisplay.toFixed(1);

  // Checkpoints list
  const checkpointDays = [1, 15, 30, 45, 60, 75, 100];

  const day1Photo = photos.find((p) => p.programDay === 1 && p.pose === selectedPose)?.imageDataUrl;
  const availableCheckpointDays = checkpointDays.filter((day) =>
    photos.some((photo) => photo.programDay === day && photo.pose === selectedPose)
  );
  const latestCheckpointDay = availableCheckpointDays.filter((day) => day > 1).pop();
  const afterPhoto = latestCheckpointDay
    ? photos.find((p) => p.programDay === latestCheckpointDay && p.pose === selectedPose)?.imageDataUrl
    : undefined;

  const workoutVolumes = allLogs.filter((item) => item.loggedExercises?.length).map((item) => ({
    date: item.date,
    volume: (item.loggedExercises || []).flatMap((exercise) => exercise.sets)
      .filter((set) => set.completed)
      .reduce((sum, set) => sum + Math.max(0, set.weightKg) * set.reps, 0),
  })).filter((item) => item.volume > 0);
  const strengthChange = workoutVolumes.length >= 2
    ? Math.round(((workoutVolumes.at(-1)!.volume - workoutVolumes[0].volume) / workoutVolumes[0].volume) * 100)
    : null;

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">Your Progress</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Day {log.programDay} of 100 • Complete transformation analytics
        </p>
      </div>

      {/* Weight Trend Recharts Area Chart */}
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#00eefc]" /> Weight Trend
          </span>
          <div className="flex bg-[#010f1f] border border-[#1E293B] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSelectedRange('30')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                selectedRange === '30'
                  ? 'bg-[#00eefc]/20 text-[#00eefc]'
                  : 'text-[#8e9379] hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedRange('100')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                selectedRange === '100'
                  ? 'bg-[#00eefc]/20 text-[#00eefc]'
                  : 'text-[#8e9379] hover:text-white'
              }`}
            >
              100 Days
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00eefc" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#051424" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2b3c" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#8e9379"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1c2b3c' }}
              />
              <YAxis
                stroke="#8e9379"
                fontSize={10}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickLine={false}
                axisLine={{ stroke: '#1c2b3c' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1421',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#d4e4fa',
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                name="Weight (kg)"
                stroke="#00eefc"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weightGrad)"
              />
              <Line
                type="monotone"
                dataKey="movingAverage"
                name="7-Day Avg"
                stroke="#c3f400"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Highlight Current Metric */}
        <div className="mt-3 flex items-baseline justify-between border-t border-[#1E293B] pt-3">
          <div className="text-xs text-[#8e9379]">
            <span>Net Change: </span>
            <span className={`font-bold ${weightDiff >= 0 ? 'text-[#c3f400]' : 'text-[#ffb4ab]'}`}>
              {weightDiff >= 0 ? `+${weightDiff}` : weightDiff} {profile.unitSystem}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-display text-white">{currentWeightDisplay}</span>
            <span className="text-xs font-bold text-[#8e9379] ml-1">{profile.unitSystem}</span>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="card-bg rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8e9379] uppercase tracking-widest">
            <Scale className="w-4 h-4 text-[#00eefc]" /> Weekly Avg
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-display text-white">{weeklyAvg}</span>
            <span className="text-xs text-[#8e9379] ml-1">{profile.unitSystem}</span>
          </div>
        </div>

        <div className="card-bg rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8e9379] uppercase tracking-widest">
            <Dumbbell className="w-4 h-4 text-[#c3f400]" /> Strength
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black font-display text-[#c3f400]">{strengthChange === null ? '--' : `${strengthChange >= 0 ? '+' : ''}${strengthChange}%`}</span>
            <span className="text-xs text-[#8e9379] ml-1">Logged Volume</span>
          </div>
        </div>
      </div>

      {/* 100-Day Consistency Matrix Grid (10x10) */}
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#c3f400]" /> Consistency Matrix (100 Days)
          </h3>
          <span className="text-xs font-bold text-[#c3f400]">
            {allLogs.filter((l: DailyLog) => l.workoutCompleted || l.tasks.workout).length} Days Logged
          </span>
        </div>

        {/* 10 x 10 Squares Grid */}
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          {Array.from({ length: 100 }).map((_, index) => {
            const dayNum = index + 1;
            const dayLog = allLogs.find((item) => item.programDay === dayNum);
            const isCompleted = !!dayLog && (dayLog.workoutCompleted || Object.values(dayLog.tasks).filter(Boolean).length >= 4);
            const isCurrent = dayNum === log.programDay;
            const isFuture = dayNum > log.programDay;

            return (
              <button
                key={dayNum}
                type="button"
                disabled={!dayLog}
                onClick={() => dayLog && onSelectDate(dayLog.date)}
                title={`Day ${dayNum}${isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ' (Upcoming)'}`}
                className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#c3f400] text-[#050810] shadow-[0_0_12px_#c3f400] scale-110 z-10 font-black ring-2 ring-[#00eefc]'
                    : isCompleted
                    ? 'bg-[#c3f400] text-[#050810] opacity-90 hover:opacity-100'
                    : isFuture
                    ? 'bg-[#010f1f] text-[#273647] border border-[#1c2b3c] hover:border-[#8e9379]'
                    : 'bg-[#1c2b3c] text-[#8e9379]'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#8e9379] mt-3 text-center">
          100 consecutive days of hypertrophic progressive overload.
        </p>
      </section>

      {/* Before & After Transform Comparison Slider */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00eefc]" /> Transform Comparison
          </h3>
          <span className="text-xs font-bold text-[#00eefc]">
            {latestCheckpointDay ? `Day 1 vs Day ${latestCheckpointDay}` : 'Waiting for two checkpoints'}
          </span>
        </div>

        {/* Interactive Comparison Slider */}
        {day1Photo && afterPhoto && latestCheckpointDay ? <ComparisonSlider
          beforeImage={day1Photo}
          afterImage={afterPhoto}
          beforeLabel="Day 1"
          afterLabel={`Day ${latestCheckpointDay}`}
        /> : <div className="h-56 rounded-2xl bg-[#010f1f] border border-dashed border-[#273647] flex flex-col items-center justify-center text-center p-6"><Camera className="w-8 h-8 text-[#273647] mb-2" /><p className="text-sm font-bold text-white">Add the same pose at two checkpoints</p><p className="text-xs text-[#8e9379] mt-1">Your private before-and-after slider will appear here.</p></div>}

        {/* Pose Selection Filters */}
        <div className="flex justify-center gap-2 pt-1">
          {(['front', 'side', 'back', 'biceps'] as PoseType[]).map((pose) => (
            <button
              key={pose}
              onClick={() => setSelectedPose(pose)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedPose === pose
                  ? 'bg-[#c3f400]/20 border-[#c3f400] text-[#c3f400] shadow-[0_0_10px_rgba(195,244,0,0.2)]'
                  : 'bg-[#122131] border-[#273647] text-[#8e9379] hover:text-white'
              }`}
            >
              {pose === 'front' ? 'Front' : pose === 'side' ? 'Side' : pose === 'back' ? 'Back' : 'Biceps'}
            </button>
          ))}
        </div>
      </section>

      {/* Timeline Checkpoint Snapshots Gallery */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#00eefc]" /> Checkpoint Snapshots
          </h3>
          <span className="text-xs text-[#8e9379]">Tap to upload/view</span>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 pt-1">
          {checkpointDays.map((chkDay) => {
            const dayPhotoObj = photos.find((p) => p.programDay === chkDay);
            const isUnlocked = chkDay <= log.programDay;

            return (
              <div
                key={chkDay}
                onClick={() => isUnlocked && setSelectedCheckpointDay(chkDay)}
                className={`flex-shrink-0 w-32 rounded-2xl border p-2 flex flex-col gap-2 cursor-pointer transition-all ${
                  isUnlocked
                    ? 'card-bg hover:border-[#c3f400] hover:scale-105'
                    : 'bg-[#010f1f] border-[#1c2b3c] opacity-60'
                }`}
              >
                <div className="h-40 w-full rounded-xl overflow-hidden bg-[#050810] border border-[#273647] flex items-center justify-center relative">
                  {dayPhotoObj?.imageDataUrl ? (
                    <img
                      src={dayPhotoObj.imageDataUrl}
                      alt={`Day ${chkDay}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#8e9379] gap-1 p-2 text-center">
                      <Camera className="w-6 h-6 text-[#273647]" />
                      <span className="text-[10px] font-semibold">
                        {isUnlocked ? 'Add Photo' : 'Locked'}
                      </span>
                    </div>
                  )}
                  {chkDay === log.programDay && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#c3f400] text-[#050810] font-black text-[9px]">
                      TODAY
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-center text-[#d4e4fa]">
                  Day {chkDay}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Photo Upload/View Checkpoint Modal */}
      {selectedCheckpointDay !== null && (
        <PhotoCheckpointModal
          day={selectedCheckpointDay}
          initialPhotos={photos.filter((p) => p.programDay === selectedCheckpointDay)}
          onClose={() => setSelectedCheckpointDay(null)}
          onPhotosUpdated={refreshPhotos}
        />
      )}
    </div>
  );
};
