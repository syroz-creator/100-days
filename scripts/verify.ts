import assert from 'node:assert/strict';
import { DEFAULT_PROFILE, WORKOUT_TEMPLATES, buildDailyMealPlan, createDefaultDayLog } from '../src/data/initialData';
import {
  analyzeNutritionTrend,
  calculateCoachPlan,
  recommendNextExercise,
} from '../src/utils/calculations';
import { DailyLog, UserProfile } from '../src/types';

class LocalStorageMock {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

Object.defineProperty(globalThis, 'localStorage', { value: new LocalStorageMock() });

const profile: UserProfile = {
  ...DEFAULT_PROFILE,
  name: 'Verification User',
  age: 16,
  startWeightKg: 60,
  currentWeightKg: 60,
  targetWeightKg: 68,
  preferredMeals: 5,
  allergies: ['peanuts', 'lactose'],
};

const meals = buildDailyMealPlan(profile);
assert.equal(meals.length, 5, 'preferred meal count should be respected');
for (const meal of meals) {
  assert.equal(meal.calories, meal.ingredients?.reduce((sum, item) => sum + item.calories, 0));
  assert.equal(meal.protein, meal.ingredients?.reduce((sum, item) => sum + item.protein, 0));
  assert.doesNotMatch(`${meal.name} ${meal.description} ${meal.ingredients?.map((item) => item.name).join(' ')}`, /pork|alcohol|peanut|whole milk/i);
}

const coach = calculateCoachPlan(profile, {});
assert.ok(coach.calorieTarget >= 1600 && coach.calorieTarget <= 4000);
assert.ok(coach.calorieTarget > coach.maintenanceCalories);
assert.equal(coach.sleepHours, 9, 'under-18 target should remain conservative');
assert.ok(coach.weeklyGainMaxKg <= 0.5);

function trendLogs(weeklyWeights: number[]): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};
  const start = new Date('2026-01-01T00:00:00');
  weeklyWeights.forEach((weight, week) => {
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      const dateKey = date.toISOString().slice(0, 10);
      logs[dateKey] = { ...createDefaultDayLog(dateKey, week * 7 + day + 1, profile), weightKg: weight };
    }
  });
  return logs;
}

assert.equal(analyzeNutritionTrend(trendLogs([60, 60, 60]), profile).action, 'increase');
assert.equal(analyzeNutritionTrend(trendLogs([60, 61, 62]), profile).action, 'decrease');
assert.equal(analyzeNutritionTrend(trendLogs([60, 60.2, 60.4]), profile).action, 'maintain');

const successfulExercise = structuredClone(WORKOUT_TEMPLATES.upper_a.exercises[0]);
successfulExercise.sets = successfulExercise.sets.map((set) => ({ ...set, completed: true, reps: successfulExercise.maxReps }));
assert.equal(recommendNextExercise(successfulExercise, 3).action, 'increase');

const missedExercise = structuredClone(WORKOUT_TEMPLATES.upper_a.exercises[0]);
missedExercise.sets = missedExercise.sets.map((set) => ({ ...set, completed: true, reps: missedExercise.minReps - 1 }));
assert.equal(recommendNextExercise(missedExercise, 4).action, 'reduce_weight');
assert.equal(recommendNextExercise(successfulExercise, 5, 5).action, 'reduce_volume');

localStorage.setItem('100_DAYS_APP_STATE_V1', JSON.stringify({
  profile: {
    name: 'Existing User', age: 18, heightCm: 175, startWeightKg: 55,
    currentWeightKg: 57, targetWeightKg: 65, startDate: '2026-07-01',
    onboardingCompleted: true,
  },
  dailyLogs: {},
  activeProgramDay: 20,
  lastUpdated: '2026-07-20T00:00:00.000Z',
}));

const { loadAppState } = await import('../src/utils/storage');
const migrated = loadAppState();
assert.equal(migrated.profile.planStarted, true, 'existing completed users must not be restarted');
assert.equal(migrated.profile.currentWeightKg, 57);
assert.ok(migrated.profile.reminders.morningCheckIn);
assert.ok(Array.isArray(migrated.profile.availableEquipment));

localStorage.clear();
const fresh = loadAppState();
assert.equal(fresh.profile.onboardingCompleted, false);
assert.equal(fresh.profile.planStarted, false);
assert.equal(fresh.activeProgramDay, 0);

console.log('Verification passed: migration, coach, meals, trends, and workout recommendations.');
