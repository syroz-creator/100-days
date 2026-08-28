export type UnitSystem = 'kg' | 'lbs';
export type PoseType = 'front' | 'side' | 'back' | 'biceps';
export type Sex = 'male' | 'female' | 'other' | 'prefer_not';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type TrainingExperience = 'beginner' | 'intermediate' | 'advanced';
export type ReminderType =
  | 'morningCheckIn'
  | 'mealReminders'
  | 'preWorkout'
  | 'workoutStart'
  | 'water'
  | 'bedtime'
  | 'progressPhotos'
  | 'weeklyReview';

export interface ReminderSetting {
  enabled: boolean;
  time: string;
}

export type ReminderSettings = Record<ReminderType, ReminderSetting>;

export interface UserProfile {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  dailyActivity: ActivityLevel;
  trainingExperience: TrainingExperience;
  startDate: string;
  wakeTime: string;
  schoolStartTime: string;
  schoolEndTime: string;
  sleepTime: string;
  workoutStartTime: string;
  workoutEndTime: string;
  dietPreference: 'halal' | 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
  dietaryRestrictions: string[];
  likedFoods: string[];
  dislikedFoods: string[];
  allergies: string[];
  preferredMeals: number;
  availableEquipment: string[];
  gymDays: number[];
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoalLiters: number;
  sleepGoalHours: number;
  stepGoal: number;
  restTimeSeconds: number;
  unitSystem: UnitSystem;
  reminders: ReminderSettings;
  notifications: {
    workoutReminders: boolean;
    hydrationAlerts: boolean;
    mealPrepPing: boolean;
  };
  notificationPermission: NotificationPermission | 'unsupported';
  pushConfigured: boolean;
  soundEnabled: boolean;
  onboardingCompleted: boolean;
  planStarted: boolean;
  planPaused: boolean;
  pauseStartedAt?: string;
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

export interface MealIngredient {
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'item' | 'slice' | 'tbsp' | 'tsp';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  id: string;
  time: string;
  name: string;
  mealType: 'Breakfast' | 'Morning Snack' | 'Lunch' | 'Pre-Workout' | 'Dinner' | 'Pre-Sleep' | 'Custom';
  description: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: MealIngredient[];
  preparation?: string;
  replacement?: string;
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

export interface BodyMeasurements {
  heightCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armCm?: number;
  thighCm?: number;
}

export interface ExerciseRecommendation {
  action: 'increase' | 'maintain' | 'reduce_weight' | 'reduce_volume';
  suggestedWeightKg?: number;
  explanation: string;
}

export interface DailyLog {
  date: string;
  programDay: number;
  weightKg?: number;
  waterCups: number;
  waterTotalLiters: number;
  stepCount: number;
  sleepHours: number;
  energyLevel?: number;
  sorenessLevel?: number;
  checkInStatus?: 'completed' | 'skipped';
  measurements?: BodyMeasurements;
  photoCheckpointSkipped?: boolean;
  tasks: DailyTasksChecklist;
  meals: MealItem[];
  workoutCompleted: boolean;
  workoutSplitId?: WorkoutSplitId;
  loggedExercises?: {
    exerciseId: string;
    exerciseName: string;
    difficulty?: number;
    recommendation?: ExerciseRecommendation;
    recommendationAccepted?: boolean;
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
  programDay: number;
  date: string;
  pose: PoseType;
  imageDataUrl?: string;
  thumbnailUrl?: string;
  weightKg?: number;
  notes?: string;
}

export interface AppStateData {
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  activeProgramDay: number;
  lastUpdated: string;
}
