export type UnitSystem = 'kg' | 'lbs';

export type PoseType = 'front' | 'side' | 'back' | 'biceps';

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  startDate: string; // YYYY-MM-DD
  wakeTime: string; // e.g. "07:00"
  sleepTime: string; // e.g. "23:00"
  workoutStartTime: string; // e.g. "17:00"
  workoutEndTime: string; // e.g. "18:15"
  dietPreference: 'halal' | 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
  gymDays: number[]; // 1 = Mon, 2 = Tue, 4 = Thu, 6 = Sat
  calorieGoal: number; // default 2600
  proteinGoal: number; // default 100
  waterGoalLiters: number; // default 2.5
  stepGoal: number; // default 10000
  restTimeSeconds: number; // default 90
  unitSystem: UnitSystem;
  notifications: {
    workoutReminders: boolean;
    hydrationAlerts: boolean;
    mealPrepPing: boolean;
  };
  onboardingCompleted: boolean;
  avatarUrl?: string;
}

export interface ExerciseSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  prevWeightKg?: number;
  prevReps?: number;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  minReps: number;
  maxReps: number;
  targetSets: number;
  restSeconds: number;
  formTips: string;
  sets: ExerciseSet[];
}

export type WorkoutSplitId = 'upper_a' | 'lower_a' | 'upper_b' | 'lower_b' | 'recovery';

export interface WorkoutTemplate {
  id: WorkoutSplitId;
  name: string;
  subtitle: string;
  estimatedMinutes: number;
  type: 'strength' | 'recovery';
  exercises: Exercise[];
}

export interface MacroNutrients {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  calories: number;
}

export interface MealItem {
  id: string;
  time: string; // e.g. "07:15 AM"
  name: string;
  mealType: 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Pre-Workout' | 'Dinner' | 'Pre-Sleep' | 'Custom';
  description: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
}

export interface DailyTasksChecklist {
  workout: boolean;
  meals: boolean;
  water: boolean;
  steps: boolean;
  sleep: boolean;
  photo: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  programDay: number; // 1 - 100
  weightKg?: number;
  waterCups: number; // each cup = 250ml or 1/8th of goal
  waterTotalLiters: number;
  stepCount: number;
  sleepHours: number;
  tasks: DailyTasksChecklist;
  meals: MealItem[];
  workoutCompleted: boolean;
  workoutSplitId?: WorkoutSplitId;
  loggedExercises?: {
    exerciseId: string;
    exerciseName: string;
    sets: {
      setNumber: number;
      weightKg: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
  notes?: string;
}

export interface CheckpointPhoto {
  id: string;
  programDay: number; // 1, 15, 30, 45, 60, 75, 100
  date: string;
  pose: PoseType;
  imageDataUrl?: string; // Stored in IndexedDB, loaded on demand
  thumbnailUrl?: string;
  weightKg?: number;
  notes?: string;
}

export interface AppStateData {
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>; // key: YYYY-MM-DD
  activeProgramDay: number;
  lastUpdated: string;
}
