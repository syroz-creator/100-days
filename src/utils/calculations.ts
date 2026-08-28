import { DailyLog, Exercise, ExerciseRecommendation, UserProfile, UnitSystem } from '../types';

export function calculateProgramDay(startDateStr: string, targetDateStr?: string): number {
  try {
    if (!startDateStr) return 1;
    const start = new Date(startDateStr + 'T00:00:00');
    const target = targetDateStr ? new Date(targetDateStr + 'T00:00:00') : new Date();
    target.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime())) return 1;
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(100, diffDays));
  } catch {
    return 1;
  }
}

export const CHECKPOINT_DAYS = [1, 15, 30, 45, 60, 75, 100];

export interface NutritionTrendAnalysis {
  action: 'insufficient_data' | 'maintain' | 'increase' | 'decrease';
  suggestedChange: number;
  message: string;
}

export interface CoachPlan {
  bmi: number;
  maintenanceCalories: number;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  sleepHours: number;
  weeklyGainMinKg: number;
  weeklyGainMaxKg: number;
  kilogramsRemaining: number;
  estimatedWeeks: number;
  recoveryStatus: 'ready' | 'moderate' | 'recover';
  todayRecommendation: string;
  nutritionTrend: NutritionTrendAnalysis;
}

const ACTIVITY_MULTIPLIERS: Record<UserProfile['dailyActivity'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

export function analyzeNutritionTrend(
  dailyLogs: Record<string, DailyLog>,
  profile: UserProfile
): NutritionTrendAnalysis {
  const weights = Object.values(dailyLogs)
    .filter((log) => typeof log.weightKg === 'number')
    .sort((a, b) => a.date.localeCompare(b.date));
  if (weights.length < 15) {
    return {
      action: 'insufficient_data',
      suggestedChange: 0,
      message: 'Keep the current calorie target while the coach builds at least two weeks of weight trends.',
    };
  }

  const byDate = new Map(weights.map((log) => [log.date, log.weightKg as number]));
  const dates = [...byDate.keys()];
  const weeklyAverage = (endIndex: number) => {
    const values = dates
      .slice(Math.max(0, endIndex - 6), endIndex + 1)
      .map((date) => byDate.get(date))
      .filter((value): value is number => value !== undefined);
    return values.length >= 4 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
  const latest = weeklyAverage(dates.length - 1);
  const previous = weeklyAverage(dates.length - 8);
  const earlier = weeklyAverage(dates.length - 15);
  if (latest === null || previous === null || earlier === null) {
    return {
      action: 'insufficient_data',
      suggestedChange: 0,
      message: 'More consistent weigh-ins are needed before suggesting a calorie change.',
    };
  }

  const gainOne = previous - earlier;
  const gainTwo = latest - previous;
  const upperGain = Math.max(0.25, profile.currentWeightKg * 0.005);
  if (gainOne <= 0.1 && gainTwo <= 0.1) {
    return {
      action: 'increase',
      suggestedChange: 175,
      message: 'Your seven-day average was flat for two trends; consider adding 175 estimated kcal per day.',
    };
  }
  if (gainOne > upperGain && gainTwo > upperGain) {
    return {
      action: 'decrease',
      suggestedChange: -150,
      message: 'Your seven-day average rose faster than the suggested range for two trends; consider reducing 150 estimated kcal per day.',
    };
  }
  return {
    action: 'maintain',
    suggestedChange: 0,
    message: 'Your weight trend supports maintaining the current estimated calorie target.',
  };
}

export function calculateCoachPlan(
  profile: UserProfile,
  dailyLogs: Record<string, DailyLog>,
  currentLog?: DailyLog
): CoachPlan {
  const weight = currentLog?.weightKg || profile.currentWeightKg || profile.startWeightKg;
  const heightMeters = Math.max(1, profile.heightCm / 100);
  const bmi = weight / (heightMeters * heightMeters);
  const sexOffset = profile.sex === 'male' ? 5 : profile.sex === 'female' ? -161 : -78;
  const bmr = 10 * weight + 6.25 * profile.heightCm - 5 * profile.age + sexOffset;
  const maintenance = Math.round((bmr * ACTIVITY_MULTIPLIERS[profile.dailyActivity]) / 25) * 25;
  const surplus = profile.age < 18 ? 175 : 250;
  const calorieTarget = Math.max(1600, Math.min(4000, maintenance + surplus));
  const protein = Math.round(weight * (profile.age < 18 ? 1.6 : 1.8));
  const fat = Math.round(weight * 0.9);
  const carbs = Math.max(130, Math.round((calorieTarget - protein * 4 - fat * 9) / 4));
  const water = Number(Math.max(2, Math.min(4, weight * 0.035)).toFixed(1));
  const sleep = profile.age < 18 ? 9 : 8;
  const weeklyGainMin = Number(Math.max(0.1, weight * 0.0025).toFixed(2));
  const weeklyGainMax = Number(Math.max(0.2, weight * 0.005).toFixed(2));
  const remaining = Number(Math.max(0, profile.targetWeightKg - weight).toFixed(1));
  const estimatedWeeks = remaining === 0
    ? 0
    : Math.ceil(remaining / ((weeklyGainMin + weeklyGainMax) / 2));
  const sleepHours = currentLog?.sleepHours ?? sleep;
  const energy = currentLog?.energyLevel ?? 3;
  const soreness = currentLog?.sorenessLevel ?? 3;
  const recoveryScore = sleepHours / sleep + energy / 5 - soreness / 5;
  const recoveryStatus = recoveryScore < 0.8 ? 'recover' : recoveryScore < 1.25 ? 'moderate' : 'ready';
  const nutritionTrend = analyzeNutritionTrend(dailyLogs, profile);
  const todayRecommendation = recoveryStatus === 'recover'
    ? 'Recovery is limited today. Keep weights steady, use clean reps, and reduce one set if fatigue persists.'
    : recoveryStatus === 'moderate'
      ? 'Train as planned, keep two or three good reps in reserve, and maintain current weights.'
      : 'Readiness looks good. Follow the planned sets and only increase weight where every rep stays controlled.';

  return {
    bmi: Number(bmi.toFixed(1)),
    maintenanceCalories: maintenance,
    calorieTarget,
    proteinGrams: protein,
    carbsGrams: carbs,
    fatGrams: fat,
    waterLiters: water,
    sleepHours: sleep,
    weeklyGainMinKg: weeklyGainMin,
    weeklyGainMaxKg: weeklyGainMax,
    kilogramsRemaining: remaining,
    estimatedWeeks,
    recoveryStatus,
    todayRecommendation,
    nutritionTrend,
  };
}

export function recommendNextExercise(
  exercise: Exercise,
  difficulty: number,
  sorenessLevel = 3
): ExerciseRecommendation {
  const completed = exercise.sets.filter((set) => set.completed);
  const currentWeight = completed.at(-1)?.weightKg ?? exercise.sets[0]?.weightKg ?? 0;
  const smallestIncrease = currentWeight < 20 ? 1 : 2.5;
  const allAtTop = completed.length >= exercise.targetSets && completed.every((set) => set.reps >= exercise.maxReps);
  const repeatedlyBelowMinimum = completed.length >= 2 && completed.filter((set) => set.reps < exercise.minReps).length >= 2;

  if (sorenessLevel >= 5 || difficulty >= 5) {
    return {
      action: 'reduce_volume',
      suggestedWeightKg: currentWeight,
      explanation: 'Fatigue is unusually high, so keep the weight and remove one set next session if recovery remains poor.',
    };
  }
  if (repeatedlyBelowMinimum) {
    return {
      action: 'reduce_weight',
      suggestedWeightKg: Math.max(0, Number((currentWeight * 0.95).toFixed(1))),
      explanation: 'Minimum reps were missed repeatedly, so a small weight reduction should restore clean technique.',
    };
  }
  if (allAtTop && difficulty <= 4) {
    return {
      action: 'increase',
      suggestedWeightKg: Number((currentWeight + smallestIncrease).toFixed(1)),
      explanation: 'Every set reached the top of the rep range, so use the smallest available increase next time.',
    };
  }
  return {
    action: 'maintain',
    suggestedWeightKg: currentWeight,
    explanation: 'Keep this weight until all planned sets reach the rep range with controlled form.',
  };
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function kgToLbs(kg: number): number {
  return Number((kg * 2.20462).toFixed(1));
}

export function lbsToKg(lbs: number): number {
  return Number((lbs / 2.20462).toFixed(1));
}

export function formatWeight(kg: number | undefined, unit: UnitSystem): string {
  if (kg === undefined || isNaN(kg)) return '--';
  if (unit === 'lbs') {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

// Calculate 7-day moving averages and prepare data for Recharts
export interface WeightTrendPoint {
  date: string;
  displayDate: string;
  programDay: number;
  weight: number | null;
  movingAverage: number | null;
}

export function computeWeightTrends(
  dailyLogs: Record<string, DailyLog>,
  unit: UnitSystem = 'kg'
): WeightTrendPoint[] {
  const sortedDates = Object.keys(dailyLogs).sort();
  const result: WeightTrendPoint[] = [];

  for (let i = 0; i < sortedDates.length; i++) {
    const dateKey = sortedDates[i];
    const log = dailyLogs[dateKey];
    const rawWeight = log.weightKg;

    const displayWeight = rawWeight !== undefined
      ? (unit === 'lbs' ? kgToLbs(rawWeight) : Number(rawWeight.toFixed(1)))
      : null;

    // Look back up to 7 previous days with valid weight
    const last7Weights: number[] = [];
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      const pastLog = dailyLogs[sortedDates[j]];
      if (pastLog && pastLog.weightKg !== undefined && !isNaN(pastLog.weightKg)) {
        last7Weights.push(
          unit === 'lbs' ? kgToLbs(pastLog.weightKg) : pastLog.weightKg
        );
      }
    }

    const movingAverage =
      last7Weights.length > 0
        ? Number(
            (
              last7Weights.reduce((sum, val) => sum + val, 0) /
              last7Weights.length
            ).toFixed(1)
          )
        : displayWeight;

    result.push({
      date: dateKey,
      displayDate: formatDisplayDate(dateKey),
      programDay: log.programDay,
      weight: displayWeight,
      movingAverage,
    });
  }

  return result;
}

// Check for calorie surplus adjustment requirement:
// "Suggest adding approximately 200 daily calories only when the user records no increase in their seven-day average weight for two consecutive weeks."
export interface PlateauAnalysis {
  isPlateauDetected: boolean;
  currentAvgKg: number | null;
  prevWeekAvgKg: number | null;
  twoWeeksAgoAvgKg: number | null;
  suggestedCalorieIncrease: number;
  message: string;
}

export function evaluateWeightPlateau(dailyLogs: Record<string, DailyLog>): PlateauAnalysis {
  const sortedDates = Object.keys(dailyLogs).sort();
  if (sortedDates.length < 14) {
    return {
      isPlateauDetected: false,
      currentAvgKg: null,
      prevWeekAvgKg: null,
      twoWeeksAgoAvgKg: null,
      suggestedCalorieIncrease: 0,
      message: 'Keep logging daily body weight. Plateau monitoring requires at least 14 days of data.',
    };
  }

  const getWeekAvg = (daysSlice: string[]): number | null => {
    const weights = daysSlice
      .map((d) => dailyLogs[d]?.weightKg)
      .filter((w): w is number => w !== undefined && !isNaN(w));
    if (weights.length === 0) return null;
    return weights.reduce((a, b) => a + b, 0) / weights.length;
  };

  const len = sortedDates.length;
  const currentWeek = sortedDates.slice(Math.max(0, len - 7));
  const prevWeek = sortedDates.slice(Math.max(0, len - 14), Math.max(0, len - 7));
  const twoWeeksAgo = sortedDates.slice(Math.max(0, len - 21), Math.max(0, len - 14));

  const currentAvg = getWeekAvg(currentWeek);
  const prevAvg = getWeekAvg(prevWeek);
  const twoWeeksAgoAvg = getWeekAvg(twoWeeksAgo);

  if (currentAvg !== null && prevAvg !== null && twoWeeksAgoAvg !== null) {
    // Check if current average <= prev average AND prev average <= twoWeeksAgo average (no increase in 2 consecutive weeks)
    const isNoIncreaseWeek1 = prevAvg <= twoWeeksAgoAvg + 0.1;
    const isNoIncreaseWeek2 = currentAvg <= prevAvg + 0.1;

    if (isNoIncreaseWeek1 && isNoIncreaseWeek2) {
      return {
        isPlateauDetected: true,
        currentAvgKg: Number(currentAvg.toFixed(2)),
        prevWeekAvgKg: Number(prevAvg.toFixed(2)),
        twoWeeksAgoAvgKg: Number(twoWeeksAgoAvg.toFixed(2)),
        suggestedCalorieIncrease: 200,
        message: 'Your 7-day average weight has remained flat over the past two consecutive weeks. Consider increasing your daily intake by ~200 kcal to maintain a gentle muscle-building surplus.',
      };
    }
  }

  return {
    isPlateauDetected: false,
    currentAvgKg: currentAvg ? Number(currentAvg.toFixed(2)) : null,
    prevWeekAvgKg: prevAvg ? Number(prevAvg.toFixed(2)) : null,
    twoWeeksAgoAvgKg: twoWeeksAgoAvg ? Number(twoWeeksAgoAvg.toFixed(2)) : null,
    suggestedCalorieIncrease: 0,
    message: 'Weight progression is tracking in a healthy surplus.',
  };
}

// Calculate streak of completed days
export function calculateStreak(dailyLogs: Record<string, DailyLog>, currentDateStr: string): number {
  let streak = 0;
  const checkDate = new Date(currentDateStr + 'T00:00:00');

  // Loop backwards day by day
  for (let i = 0; i < 100; i++) {
    const dateKey = formatDateToISO(checkDate);
    const log = dailyLogs[dateKey];

    if (log && (log.workoutCompleted || Object.values(log.tasks).filter(Boolean).length >= 4)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today is incomplete yet, check yesterday to avoid breaking streak prematurely
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}
