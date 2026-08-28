import { DailyLog, UnitSystem } from '../types';

export function calculateProgramDay(startDateStr: string, targetDateStr?: string): number {
  try {
    const start = new Date(startDateStr + 'T00:00:00');
    const target = targetDateStr ? new Date(targetDateStr + 'T00:00:00') : new Date();
    target.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(100, diffDays));
  } catch {
    return 1;
  }
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
