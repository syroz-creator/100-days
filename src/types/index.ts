export type UnitSystem = 'kg' | 'lbs';
export type PoseType = 'front' | 'side' | 'back' | 'biceps';
export type HairPoseType = 'front' | 'left' | 'right' | 'back';
export type Sex = 'male' | 'female' | 'other' | 'prefer_not';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type TrainingExperience = 'beginner' | 'intermediate' | 'advanced';
export type PainType = 'none' | 'normal_soreness' | 'discomfort' | 'sharp_pain' | 'joint_pain';
export type ProofRequirement = 'required' | 'optional' | 'none';
export type ProofType = 'live_photo' | 'upload_photo' | 'note' | 'checklist' | 'timer' | 'location';
export type CompleteWithoutProofReason =
  | 'forgot_photo'
  | 'camera_unavailable'
  | 'permission_denied'
  | 'completed_elsewhere'
  | 'other';
export type ScheduleTaskType =
  | 'school'
  | 'gym'
  | 'homework'
  | 'meal'
  | 'sleep'
  | 'free_time'
  | 'subject14'
  | 'prep';
export type DailyScheduleMode = 'normal' | 'busy_school' | 'low_energy';
export type ReplacementReason =
  | 'machine_occupied'
  | 'equipment_unavailable'
  | 'uncomfortable'
  | 'temporary_soreness'
  | 'preference';
export type ReminderType =
  | 'morningCheckIn'
  | 'mealReminders'
  | 'preWorkout'
  | 'workoutStart'
  | 'water'
  | 'leaveForSchool'
  | 'schoolFinished'
  | 'directGym'
  | 'homework'
  | 'subject14'
  | 'schoolPrep'
  | 'hairGrowthPhotos'
  | 'missedTasks'
  | 'neverMissTwice'
  | 'bedtime'
  | 'progressPhotos'
  | 'weeklyReview';

export interface ReminderSetting {
  enabled: boolean;
  time: string;
}

export type ReminderSettings = Record<ReminderType, ReminderSetting>;

export interface SchoolScheduleSettings {
  schoolDays: number[];
  schoolStartTime: string;
  schoolEndTime: string;
  travelMinutesSchoolHome: number;
  travelMinutesHomeGym: number;
  travelMinutesSchoolGym: number;
  preferredGymDays: number[];
  wakeTime: string;
  bedtime: string;
  scheduleSetupCompleted: boolean;
  scheduleSetupDismissed: boolean;
}

export interface ProofSettings {
  workoutProof: ProofRequirement;
  scheduleTaskProof: ProofRequirement;
  mealProof: ProofRequirement;
  allowPhotoUpload: boolean;
  allowLocationCheckIn: boolean;
}

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
  beginnerModeEnabled: boolean;
  guideAcknowledgements: Record<string, boolean>;
  permanentExerciseReplacements: Record<string, string>;
  schoolSchedule: SchoolScheduleSettings;
  proofSettings: ProofSettings;
  hairReminderFrequency: 'daily' | 'weekly' | 'monthly';
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

export interface ScheduledTask {
  id: string;
  date: string;
  title: string;
  type: ScheduleTaskType;
  startTime: string;
  endTime: string;
  proofRequirement: ProofRequirement;
  proofTypes: ProofType[];
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'rescheduled';
  proofEntryIds?: string[];
  completedWithoutProof?: boolean;
  completedWithoutProofReason?: CompleteWithoutProofReason;
  note?: string;
}

export interface BodyCheck {
  energyLevel: number;
  sorenessLevel: number;
  sleepHours: number;
  soreAreas: string[];
  painType: PainType;
  note?: string;
  recommendation?: string;
  acceptedAdjustment?: boolean;
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
  replacementForExerciseId?: string;
  replacementReason?: ReplacementReason;
  replacementPermanent?: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  difficulty?: number;
  recommendation?: ExerciseRecommendation;
  recommendationAccepted?: boolean;
  replacementForExerciseId?: string;
  replacementReason?: ReplacementReason;
  replacementPermanent?: boolean;
  sets: {
    setNumber: number;
    weightKg: number;
    reps: number;
    completed: boolean;
    prevWeightKg?: number;
    prevReps?: number;
  }[];
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
  bodyCheck?: BodyCheck;
  checkInStatus?: 'completed' | 'skipped';
  measurements?: BodyMeasurements;
  photoCheckpointSkipped?: boolean;
  tasks: DailyTasksChecklist;
  meals: MealItem[];
  workoutCompleted: boolean;
  workoutSplitId?: WorkoutSplitId;
  missedWorkoutDecision?: 'reschedule' | 'skip' | 'complete_today' | 'rejected';
  scheduleAdjustmentNote?: string;
  scheduleMode?: DailyScheduleMode;
  scheduledTasks?: ScheduledTask[];
  loggedExercises?: LoggedExercise[];
  formRecordingIds?: string[];
  proofEntryIds?: string[];
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

export interface HairGrowthPhoto {
  id: string;
  date: string;
  pose: HairPoseType;
  imageDataUrl: string;
  hairLengthCm?: number;
  notes?: string;
  createdAt: string;
}

export interface ProofEntry {
  id: string;
  taskId: string;
  taskName: string;
  taskType: ScheduleTaskType | 'workout' | 'meal';
  date: string;
  createdAt: string;
  proofType: ProofType;
  status: 'completed' | 'completed_without_proof';
  completedWithoutProof: boolean;
  completedWithoutProofReason?: CompleteWithoutProofReason;
  imageDataUrl?: string;
  note?: string;
  checklist?: string[];
  timerSeconds?: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface FormRecording {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  programDay: number;
  videoDataUrl: string;
  mimeType: string;
  createdAt: string;
  autoDeleteAfterReview: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  seen: boolean;
}

export interface AppStateData {
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  achievements: Achievement[];
  activeProgramDay: number;
  lastUpdated: string;
}
