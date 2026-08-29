import { UserProfile, WorkoutTemplate, MealItem, WorkoutSplitId, ReminderSettings } from '../types';

export const DEFAULT_REMINDERS: ReminderSettings = {
  morningCheckIn: { enabled: true, time: '07:05' },
  mealReminders: { enabled: true, time: '07:15' },
  preWorkout: { enabled: true, time: '16:30' },
  workoutStart: { enabled: true, time: '17:00' },
  water: { enabled: true, time: '12:00' },
  bedtime: { enabled: true, time: '22:30' },
  progressPhotos: { enabled: true, time: '07:10' },
  weeklyReview: { enabled: true, time: '09:00' },
};

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 18,
  sex: 'male',
  heightCm: 175,
  startWeightKg: 51.0,
  currentWeightKg: 51.0,
  targetWeightKg: 65.0,
  dailyActivity: 'moderate',
  trainingExperience: 'beginner',
  startDate: new Date().toISOString().split('T')[0],
  wakeTime: '07:00',
  schoolStartTime: '08:00',
  schoolEndTime: '15:30',
  sleepTime: '23:00',
  workoutStartTime: '17:00',
  workoutEndTime: '18:15',
  dietPreference: 'halal',
  dietaryRestrictions: ['halal'],
  likedFoods: ['chicken', 'rice', 'eggs', 'yogurt'],
  dislikedFoods: [],
  allergies: [],
  preferredMeals: 6,
  availableEquipment: ['barbell', 'dumbbells', 'cable machine', 'leg press', 'bench'],
  gymDays: [1, 2, 4, 6], // Mon, Tue, Thu, Sat
  calorieGoal: 2600,
  proteinGoal: 105,
  carbsGoal: 330,
  fatGoal: 75,
  waterGoalLiters: 2.5,
  sleepGoalHours: 8,
  stepGoal: 10000,
  restTimeSeconds: 90,
  unitSystem: 'kg',
  beginnerModeEnabled: true,
  guideAcknowledgements: {},
  permanentExerciseReplacements: {},
  notifications: {
    workoutReminders: true,
    hydrationAlerts: true,
    mealPrepPing: false,
  },
  reminders: DEFAULT_REMINDERS,
  notificationPermission: 'default',
  pushConfigured: false,
  soundEnabled: true,
  onboardingCompleted: false,
  planStarted: false,
  planPaused: false,
};

export const WORKOUT_TEMPLATES: Record<WorkoutSplitId, WorkoutTemplate> = {
  upper_a: {
    id: 'upper_a',
    name: 'Upper Body A',
    subtitle: 'Chest, Back, Shoulders & Arms',
    estimatedMinutes: 60,
    type: 'strength',
    exercises: [
      {
        id: 'bench_press',
        name: 'Bench Press',
        targetMuscle: 'Chest / Triceps',
        minReps: 6,
        maxReps: 10,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Keep feet planted, slight arch in lower back. Squeeze shoulder blades together and touch bar to mid-chest with control.',
        sets: [
          { setNumber: 1, weightKg: 40, reps: 8, completed: false, prevWeightKg: 37.5, prevReps: 8 },
          { setNumber: 2, weightKg: 40, reps: 8, completed: false, prevWeightKg: 37.5, prevReps: 8 },
          { setNumber: 3, weightKg: 40, reps: 7, completed: false, prevWeightKg: 37.5, prevReps: 7 },
        ],
      },
      {
        id: 'lat_pulldown',
        name: 'Lat Pulldown',
        targetMuscle: 'Upper Back / Lats',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Slight lean back, pull bar to upper chest using elbows. Avoid swinging and pause for a 1-second squeeze at the bottom.',
        sets: [
          { setNumber: 1, weightKg: 35, reps: 10, completed: false, prevWeightKg: 32.5, prevReps: 10 },
          { setNumber: 2, weightKg: 35, reps: 10, completed: false, prevWeightKg: 32.5, prevReps: 9 },
          { setNumber: 3, weightKg: 35, reps: 9, completed: false, prevWeightKg: 32.5, prevReps: 9 },
        ],
      },
      {
        id: 'seated_cable_row',
        name: 'Seated Cable Row',
        targetMuscle: 'Mid-Back / Rhomboids',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Keep torso upright with slight knee bend. Drive elbows back into your ribs and squeeze back before controlling the stretch.',
        sets: [
          { setNumber: 1, weightKg: 35, reps: 10, completed: false, prevWeightKg: 30, prevReps: 11 },
          { setNumber: 2, weightKg: 35, reps: 10, completed: false, prevWeightKg: 30, prevReps: 10 },
          { setNumber: 3, weightKg: 35, reps: 9, completed: false, prevWeightKg: 30, prevReps: 9 },
        ],
      },
      {
        id: 'db_shoulder_press',
        name: 'Dumbbell Shoulder Press',
        targetMuscle: 'Front & Side Deltoids',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Seated with high back support. Press dumbbells slightly inwards at top without clanking. Lower down to ear level.',
        sets: [
          { setNumber: 1, weightKg: 12, reps: 10, completed: false, prevWeightKg: 10, prevReps: 11 },
          { setNumber: 2, weightKg: 12, reps: 9, completed: false, prevWeightKg: 10, prevReps: 10 },
          { setNumber: 3, weightKg: 12, reps: 8, completed: false, prevWeightKg: 10, prevReps: 8 },
        ],
      },
      {
        id: 'cable_lateral_raise',
        name: 'Cable Lateral Raise',
        targetMuscle: 'Lateral Deltoids',
        minReps: 12,
        maxReps: 15,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Lead with elbows, keep thumbs slightly pointed down or neutral. Smooth constant cable tension.',
        sets: [
          { setNumber: 1, weightKg: 5, reps: 14, completed: false, prevWeightKg: 5, prevReps: 12 },
          { setNumber: 2, weightKg: 5, reps: 13, completed: false, prevWeightKg: 5, prevReps: 12 },
          { setNumber: 3, weightKg: 5, reps: 12, completed: false, prevWeightKg: 5, prevReps: 12 },
        ],
      },
      {
        id: 'biceps_curl',
        name: 'Biceps Curl',
        targetMuscle: 'Biceps Brachii',
        minReps: 10,
        maxReps: 15,
        targetSets: 2,
        restSeconds: 60,
        formTips: 'Keep upper arms pinned to sides. Full supination at top and full stretch at the bottom.',
        sets: [
          { setNumber: 1, weightKg: 10, reps: 12, completed: false, prevWeightKg: 9, prevReps: 12 },
          { setNumber: 2, weightKg: 10, reps: 11, completed: false, prevWeightKg: 9, prevReps: 11 },
        ],
      },
      {
        id: 'triceps_pushdown',
        name: 'Triceps Pushdown',
        targetMuscle: 'Triceps Lateral/Medial',
        minReps: 10,
        maxReps: 15,
        targetSets: 2,
        restSeconds: 60,
        formTips: 'Keep elbows tucked by your ribcage. Fully extend arms downwards and flare the rope/bar at the bottom.',
        sets: [
          { setNumber: 1, weightKg: 17.5, reps: 13, completed: false, prevWeightKg: 15, prevReps: 13 },
          { setNumber: 2, weightKg: 17.5, reps: 12, completed: false, prevWeightKg: 15, prevReps: 12 },
        ],
      },
    ],
  },

  lower_a: {
    id: 'lower_a',
    name: 'Lower Body A',
    subtitle: 'Quads, Hamstrings, Calves & Abs',
    estimatedMinutes: 65,
    type: 'strength',
    exercises: [
      {
        id: 'leg_press',
        name: 'Leg Press',
        targetMuscle: 'Quadriceps / Glutes',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Feet shoulder-width on platform. Lower sled until knees reach 90 degrees without lower back rounding off pad.',
        sets: [
          { setNumber: 1, weightKg: 80, reps: 10, completed: false, prevWeightKg: 70, prevReps: 11 },
          { setNumber: 2, weightKg: 80, reps: 10, completed: false, prevWeightKg: 70, prevReps: 10 },
          { setNumber: 3, weightKg: 80, reps: 9, completed: false, prevWeightKg: 70, prevReps: 9 },
        ],
      },
      {
        id: 'romanian_deadlift',
        name: 'Romanian Deadlift (RDL)',
        targetMuscle: 'Hamstrings / Glutes',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Slight bend in knees, hinge backward at hips with flat back. Lower bar along shins until deep hamstring stretch.',
        sets: [
          { setNumber: 1, weightKg: 45, reps: 10, completed: false, prevWeightKg: 40, prevReps: 10 },
          { setNumber: 2, weightKg: 45, reps: 9, completed: false, prevWeightKg: 40, prevReps: 9 },
          { setNumber: 3, weightKg: 45, reps: 8, completed: false, prevWeightKg: 40, prevReps: 8 },
        ],
      },
      {
        id: 'leg_extension',
        name: 'Leg Extension',
        targetMuscle: 'Quadriceps',
        minReps: 10,
        maxReps: 15,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Align knee joints with pivot point. Extend up fully and hold for 1 second before controlled 2-second descent.',
        sets: [
          { setNumber: 1, weightKg: 30, reps: 12, completed: false, prevWeightKg: 25, prevReps: 13 },
          { setNumber: 2, weightKg: 30, reps: 12, completed: false, prevWeightKg: 25, prevReps: 12 },
          { setNumber: 3, weightKg: 30, reps: 11, completed: false, prevWeightKg: 25, prevReps: 11 },
        ],
      },
      {
        id: 'seated_leg_curl',
        name: 'Seated Leg Curl',
        targetMuscle: 'Hamstrings',
        minReps: 10,
        maxReps: 15,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Lock thigh pad securely. Curl heels under seat with power and resist on the way back up.',
        sets: [
          { setNumber: 1, weightKg: 30, reps: 12, completed: false, prevWeightKg: 25, prevReps: 12 },
          { setNumber: 2, weightKg: 30, reps: 11, completed: false, prevWeightKg: 25, prevReps: 11 },
          { setNumber: 3, weightKg: 30, reps: 10, completed: false, prevWeightKg: 25, prevReps: 10 },
        ],
      },
      {
        id: 'calf_raise',
        name: 'Calf Raise',
        targetMuscle: 'Gastrocnemius / Soleus',
        minReps: 12,
        maxReps: 20,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Full stretch at bottom for 2 seconds to eliminate achilles bounce, press high onto big toes.',
        sets: [
          { setNumber: 1, weightKg: 40, reps: 16, completed: false, prevWeightKg: 35, prevReps: 16 },
          { setNumber: 2, weightKg: 40, reps: 15, completed: false, prevWeightKg: 35, prevReps: 15 },
          { setNumber: 3, weightKg: 40, reps: 14, completed: false, prevWeightKg: 35, prevReps: 13 },
        ],
      },
      {
        id: 'cable_crunch',
        name: 'Cable Crunch',
        targetMuscle: 'Rectus Abdominis',
        minReps: 10,
        maxReps: 15,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Kneel with rope at forehead. Curl ribs down towards pelvis by flexing spine, not by hinging hips.',
        sets: [
          { setNumber: 1, weightKg: 25, reps: 14, completed: false, prevWeightKg: 20, prevReps: 15 },
          { setNumber: 2, weightKg: 25, reps: 13, completed: false, prevWeightKg: 20, prevReps: 13 },
          { setNumber: 3, weightKg: 25, reps: 12, completed: false, prevWeightKg: 20, prevReps: 12 },
        ],
      },
    ],
  },

  upper_b: {
    id: 'upper_b',
    name: 'Upper Body B',
    subtitle: 'Upper Chest, Vertical Pull & Arms',
    estimatedMinutes: 60,
    type: 'strength',
    exercises: [
      {
        id: 'incline_db_press',
        name: 'Incline Dumbbell Press',
        targetMuscle: 'Clavicular (Upper) Pectorals',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Set bench at 30-degree incline. Lower dumbbells with elbows tucked at 45 degrees, press straight up.',
        sets: [
          { setNumber: 1, weightKg: 16, reps: 10, completed: false, prevWeightKg: 14, prevReps: 10 },
          { setNumber: 2, weightKg: 16, reps: 9, completed: false, prevWeightKg: 14, prevReps: 9 },
          { setNumber: 3, weightKg: 16, reps: 8, completed: false, prevWeightKg: 14, prevReps: 8 },
        ],
      },
      {
        id: 'assisted_pull_up',
        name: 'Assisted Pull-Up / Lat Focus',
        targetMuscle: 'Lats & Upper Back',
        minReps: 6,
        maxReps: 10,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Use counterweight assistance pad. Pull chest up to bar level, driving elbows downward.',
        sets: [
          { setNumber: 1, weightKg: -20, reps: 8, completed: false, prevWeightKg: -25, prevReps: 8 },
          { setNumber: 2, weightKg: -20, reps: 7, completed: false, prevWeightKg: -25, prevReps: 7 },
          { setNumber: 3, weightKg: -20, reps: 6, completed: false, prevWeightKg: -25, prevReps: 6 },
        ],
      },
      {
        id: 'chest_supported_row',
        name: 'Chest-Supported Row',
        targetMuscle: 'Mid-Back & Rhomboids',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Rest chest on incline bench. Eliminates lower back fatigue so you can isolate upper back musculature.',
        sets: [
          { setNumber: 1, weightKg: 16, reps: 10, completed: false, prevWeightKg: 14, prevReps: 11 },
          { setNumber: 2, weightKg: 16, reps: 10, completed: false, prevWeightKg: 14, prevReps: 10 },
          { setNumber: 3, weightKg: 16, reps: 9, completed: false, prevWeightKg: 14, prevReps: 9 },
        ],
      },
      {
        id: 'pec_deck',
        name: 'Pec Deck Fly',
        targetMuscle: 'Sternal Pectorals',
        minReps: 10,
        maxReps: 15,
        targetSets: 2,
        restSeconds: 60,
        formTips: 'Keep slight bend in elbows. Bring arms together in a wide hugging arc and squeeze chest for 1 full second.',
        sets: [
          { setNumber: 1, weightKg: 30, reps: 12, completed: false, prevWeightKg: 25, prevReps: 13 },
          { setNumber: 2, weightKg: 30, reps: 11, completed: false, prevWeightKg: 25, prevReps: 11 },
        ],
      },
      {
        id: 'db_lateral_raise',
        name: 'Dumbbell Lateral Raise',
        targetMuscle: 'Lateral Deltoids',
        minReps: 12,
        maxReps: 20,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Slight forward torso tilt. Raise dumbbells to shoulder level with pinky slightly higher than thumb.',
        sets: [
          { setNumber: 1, weightKg: 6, reps: 15, completed: false, prevWeightKg: 5, prevReps: 16 },
          { setNumber: 2, weightKg: 6, reps: 14, completed: false, prevWeightKg: 5, prevReps: 15 },
          { setNumber: 3, weightKg: 6, reps: 13, completed: false, prevWeightKg: 5, prevReps: 13 },
        ],
      },
      {
        id: 'hammer_curl',
        name: 'Dumbbell Hammer Curl',
        targetMuscle: 'Brachialis & Forearms',
        minReps: 10,
        maxReps: 15,
        targetSets: 2,
        restSeconds: 60,
        formTips: 'Neutral grip (palms facing each other). Great for developing arm thickness and forearm stability.',
        sets: [
          { setNumber: 1, weightKg: 10, reps: 12, completed: false, prevWeightKg: 9, prevReps: 12 },
          { setNumber: 2, weightKg: 10, reps: 11, completed: false, prevWeightKg: 9, prevReps: 10 },
        ],
      },
      {
        id: 'overhead_triceps_ext',
        name: 'Overhead Triceps Extension',
        targetMuscle: 'Triceps Long Head',
        minReps: 10,
        maxReps: 15,
        targetSets: 2,
        restSeconds: 60,
        formTips: 'Cable or dumbbell overhead. Get a deep stretch behind head without flaring elbows excessively.',
        sets: [
          { setNumber: 1, weightKg: 14, reps: 12, completed: false, prevWeightKg: 12, prevReps: 13 },
          { setNumber: 2, weightKg: 14, reps: 11, completed: false, prevWeightKg: 12, prevReps: 11 },
        ],
      },
    ],
  },

  lower_b: {
    id: 'lower_b',
    name: 'Lower Body B',
    subtitle: 'Glutes, Hamstrings, Quads & Core',
    estimatedMinutes: 65,
    type: 'strength',
    exercises: [
      {
        id: 'hack_squat',
        name: 'Hack Squat',
        targetMuscle: 'Quadriceps / Glutes',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Back flat against machine pad. Descend smoothly until thighs break parallel, drive through whole foot.',
        sets: [
          { setNumber: 1, weightKg: 50, reps: 10, completed: false, prevWeightKg: 40, prevReps: 11 },
          { setNumber: 2, weightKg: 50, reps: 9, completed: false, prevWeightKg: 40, prevReps: 10 },
          { setNumber: 3, weightKg: 50, reps: 8, completed: false, prevWeightKg: 40, prevReps: 9 },
        ],
      },
      {
        id: 'hip_thrust',
        name: 'Barbell Hip Thrust',
        targetMuscle: 'Gluteus Maximus',
        minReps: 8,
        maxReps: 12,
        targetSets: 3,
        restSeconds: 90,
        formTips: 'Upper back across bench, bar padded on hips. Drive through heels, full hip lock at top with chin tucked.',
        sets: [
          { setNumber: 1, weightKg: 60, reps: 10, completed: false, prevWeightKg: 50, prevReps: 10 },
          { setNumber: 2, weightKg: 60, reps: 10, completed: false, prevWeightKg: 50, prevReps: 9 },
          { setNumber: 3, weightKg: 60, reps: 9, completed: false, prevWeightKg: 50, prevReps: 9 },
        ],
      },
      {
        id: 'walking_lunge',
        name: 'Walking Lunge',
        targetMuscle: 'Quads & Glutes',
        minReps: 10,
        maxReps: 10, // per leg
        targetSets: 2,
        restSeconds: 90,
        formTips: 'Take controlled forward steps, lower back knee just above floor. Keep torso upright.',
        sets: [
          { setNumber: 1, weightKg: 10, reps: 10, completed: false, prevWeightKg: 8, prevReps: 10 },
          { setNumber: 2, weightKg: 10, reps: 10, completed: false, prevWeightKg: 8, prevReps: 10 },
        ],
      },
      {
        id: 'lying_leg_curl',
        name: 'Lying Leg Curl',
        targetMuscle: 'Hamstrings',
        minReps: 10,
        maxReps: 15,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Lie flat, keep hips pressed down on the pad. Curl heels up to glutes and avoid lifting lower back.',
        sets: [
          { setNumber: 1, weightKg: 25, reps: 12, completed: false, prevWeightKg: 20, prevReps: 13 },
          { setNumber: 2, weightKg: 25, reps: 11, completed: false, prevWeightKg: 20, prevReps: 12 },
          { setNumber: 3, weightKg: 25, reps: 10, completed: false, prevWeightKg: 20, prevReps: 10 },
        ],
      },
      {
        id: 'standing_calf_raise',
        name: 'Standing Calf Raise',
        targetMuscle: 'Calves',
        minReps: 12,
        maxReps: 20,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Knees straight without hyperextending. Peak contraction squeeze at top and deep bottom stretch.',
        sets: [
          { setNumber: 1, weightKg: 40, reps: 16, completed: false, prevWeightKg: 35, prevReps: 16 },
          { setNumber: 2, weightKg: 40, reps: 15, completed: false, prevWeightKg: 35, prevReps: 15 },
          { setNumber: 3, weightKg: 40, reps: 14, completed: false, prevWeightKg: 35, prevReps: 14 },
        ],
      },
      {
        id: 'hanging_knee_raise',
        name: 'Hanging Knee Raise',
        targetMuscle: 'Lower Abdominals / Hip Flexors',
        minReps: 8,
        maxReps: 15,
        targetSets: 3,
        restSeconds: 60,
        formTips: 'Hang from bar with active shoulders. Pull knees up to chest while tilting pelvis up, minimizing body swing.',
        sets: [
          { setNumber: 1, weightKg: 0, reps: 12, completed: false, prevWeightKg: 0, prevReps: 10 },
          { setNumber: 2, weightKg: 0, reps: 11, completed: false, prevWeightKg: 0, prevReps: 10 },
          { setNumber: 3, weightKg: 0, reps: 10, completed: false, prevWeightKg: 0, prevReps: 9 },
        ],
      },
    ],
  },

  recovery: {
    id: 'recovery',
    name: 'Active Recovery',
    subtitle: 'Steps, Hydration & Tissue Mobility',
    estimatedMinutes: 30,
    type: 'recovery',
    exercises: [
      {
        id: 'daily_walk',
        name: 'Active Steps Walk',
        targetMuscle: 'Cardiovascular & Full Body',
        minReps: 7000,
        maxReps: 10000,
        targetSets: 1,
        restSeconds: 0,
        formTips: 'Aim for 7,000 to 10,000 brisk steps throughout the day to boost blood flow and nutrient delivery to muscles.',
        sets: [
          { setNumber: 1, weightKg: 0, reps: 8500, completed: false },
        ],
      },
      {
        id: 'mobility_routine',
        name: 'Full Body Mobility & Foam Roll',
        targetMuscle: 'Hips, Thoracic Spine & Ankles',
        minReps: 10,
        maxReps: 15,
        targetSets: 1,
        restSeconds: 0,
        formTips: 'Spend 10–15 minutes on dynamic stretching, hip 90/90 openers, thoracic rotations, and foam rolling.',
        sets: [
          { setNumber: 1, weightKg: 0, reps: 15, completed: false },
        ],
      },
    ],
  },
};

const BASE_HALAL_MEALS: MealItem[] = [
  {
    id: 'meal_1',
    time: '7:15 AM',
    name: 'Egg & Bread Power Breakfast',
    mealType: 'Breakfast',
    description: '3 whole eggs (cooked to preference), 2 whole-wheat bread slices, 1 medium banana, and 250ml whole milk.',
    portion: '3 eggs, 2 slices, 1 banana, 250ml milk',
    calories: 580,
    protein: 32,
    carbs: 65,
    fat: 22,
    completed: false,
  },
  {
    id: 'meal_2',
    time: '10:30 AM',
    name: 'Greek Yogurt & Granola Bowl',
    mealType: 'Morning Snack',
    description: 'Creamy Greek yogurt topped with crunchy oat granola and a handful of mixed almonds and walnuts.',
    portion: '150g yogurt, 40g granola, 20g nuts',
    calories: 380,
    protein: 20,
    carbs: 40,
    fat: 16,
    completed: false,
  },
  {
    id: 'meal_3',
    time: '1:45 PM',
    name: 'Halal Chicken Breast & Rice',
    mealType: 'Lunch',
    description: '180g grilled halal chicken breast seasoned with Mediterranean herbs, 2 cups cooked jasmine or basmati rice, mixed garden salad with 1 tbsp extra virgin olive oil.',
    portion: '180g chicken, 2 cups rice, salad + olive oil',
    calories: 680,
    protein: 55,
    carbs: 80,
    fat: 16,
    completed: false,
  },
  {
    id: 'meal_4',
    time: '4:15 PM',
    name: 'PB & Fruit Pre-Workout Snack',
    mealType: 'Pre-Workout',
    description: 'Natural peanut butter spread on whole-wheat bread with sliced fruit (apple/banana) and 500ml water.',
    portion: '2 tbsp peanut butter, 2 bread slices, 1 apple, 500ml water',
    calories: 420,
    protein: 14,
    carbs: 55,
    fat: 16,
    completed: false,
  },
  {
    id: 'meal_5',
    time: '6:30 PM',
    name: 'Halal Beef Steak & Roasted Potatoes',
    mealType: 'Dinner',
    description: '180g halal lean beef steak (or fish fillet) with roasted sweet potatoes or steamed rice, steamed broccoli and carrots.',
    portion: '180g beef/fish, 250g potatoes/rice, steamed veg',
    calories: 720,
    protein: 58,
    carbs: 65,
    fat: 24,
    completed: false,
  },
  {
    id: 'meal_6',
    time: '9:30 PM',
    name: 'Oats & Warm Milk Pre-Sleep',
    mealType: 'Pre-Sleep',
    description: 'Warm whole milk stirred with rolled oats and 1 tsp honey (or Greek yogurt with sliced banana).',
    portion: '250ml milk, 40g oats, 1 tsp honey',
    calories: 320,
    protein: 16,
    carbs: 45,
    fat: 8,
    completed: false,
  },
];

const MEAL_DETAILS: Record<string, Pick<MealItem, 'ingredients' | 'preparation' | 'replacement'>> = {
  meal_1: {
    ingredients: [
      { name: 'Whole eggs', amount: 3, unit: 'item', calories: 210, protein: 18, carbs: 1, fat: 15 },
      { name: 'Whole-wheat bread', amount: 2, unit: 'slice', calories: 160, protein: 7, carbs: 28, fat: 2 },
      { name: 'Banana', amount: 1, unit: 'item', calories: 105, protein: 1, carbs: 27, fat: 0 },
      { name: 'Whole milk', amount: 250, unit: 'ml', calories: 105, protein: 6, carbs: 9, fat: 5 },
    ],
    preparation: 'Cook the eggs without alcohol-based sauces. Serve with toasted bread, banana, and milk.',
    replacement: 'Replace with 250 g Greek yogurt, 70 g oats, one banana, and 15 g almonds.',
  },
  meal_2: {
    ingredients: [
      { name: 'Greek yogurt', amount: 150, unit: 'g', calories: 120, protein: 15, carbs: 8, fat: 3 },
      { name: 'Oat granola', amount: 40, unit: 'g', calories: 170, protein: 4, carbs: 27, fat: 6 },
      { name: 'Mixed almonds and walnuts', amount: 20, unit: 'g', calories: 90, protein: 1, carbs: 5, fat: 7 },
    ],
    preparation: 'Add the yogurt to a bowl and top with granola and nuts immediately before eating.',
    replacement: 'Replace with 250 ml milk, 45 g oats, and 20 g peanut butter.',
  },
  meal_3: {
    ingredients: [
      { name: 'Halal chicken breast, cooked', amount: 180, unit: 'g', calories: 300, protein: 50, carbs: 0, fat: 8 },
      { name: 'Basmati rice, cooked', amount: 300, unit: 'g', calories: 300, protein: 5, carbs: 75, fat: 0 },
      { name: 'Mixed garden salad', amount: 150, unit: 'g', calories: 30, protein: 0, carbs: 5, fat: 0 },
      { name: 'Extra virgin olive oil', amount: 10, unit: 'ml', calories: 50, protein: 0, carbs: 0, fat: 8 },
    ],
    preparation: 'Grill the chicken until fully cooked, serve over rice, and dress the salad with olive oil.',
    replacement: 'Replace chicken and rice with 180 g halal lean beef and 300 g cooked potatoes.',
  },
  meal_4: {
    ingredients: [
      { name: 'Natural peanut butter', amount: 32, unit: 'g', calories: 190, protein: 8, carbs: 7, fat: 16 },
      { name: 'Whole-wheat bread', amount: 2, unit: 'slice', calories: 160, protein: 6, carbs: 30, fat: 0 },
      { name: 'Apple', amount: 1, unit: 'item', calories: 70, protein: 0, carbs: 18, fat: 0 },
    ],
    preparation: 'Spread peanut butter on bread and eat with the apple 45-90 minutes before training.',
    replacement: 'Replace with one banana, 250 ml milk, and 40 g oats blended together.',
  },
  meal_5: {
    ingredients: [
      { name: 'Halal lean beef steak, cooked', amount: 180, unit: 'g', calories: 360, protein: 48, carbs: 0, fat: 20 },
      { name: 'Roasted potatoes', amount: 250, unit: 'g', calories: 260, protein: 6, carbs: 60, fat: 2 },
      { name: 'Steamed broccoli and carrots', amount: 180, unit: 'g', calories: 100, protein: 4, carbs: 5, fat: 2 },
    ],
    preparation: 'Pan-sear or grill the beef until safely cooked. Roast potatoes and steam vegetables.',
    replacement: 'Replace beef with 200 g fish fillet and add 10 ml olive oil for similar energy.',
  },
  meal_6: {
    ingredients: [
      { name: 'Whole milk', amount: 250, unit: 'ml', calories: 150, protein: 10, carbs: 12, fat: 6 },
      { name: 'Rolled oats', amount: 40, unit: 'g', calories: 140, protein: 6, carbs: 28, fat: 2 },
      { name: 'Honey', amount: 1, unit: 'tsp', calories: 30, protein: 0, carbs: 5, fat: 0 },
    ],
    preparation: 'Warm the milk, stir in oats, and finish with honey. Do not boil.',
    replacement: 'Replace with 200 g Greek yogurt, one banana, and 25 g oats.',
  },
};

export const DEFAULT_HALAL_MEALS: MealItem[] = BASE_HALAL_MEALS.map((meal) => ({
  ...meal,
  ...MEAL_DETAILS[meal.id],
}));

function addMinutes(time: string, minutes: number): string {
  const [hours = 0, mins = 0] = time.split(':').map(Number);
  const total = (hours * 60 + mins + minutes + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function buildDailyMealPlan(profile: UserProfile): MealItem[] {
  const mealIndexesByCount: Record<number, number[]> = {
    3: [0, 2, 4],
    4: [0, 2, 3, 4],
    5: [0, 1, 2, 3, 4],
    6: [0, 1, 2, 3, 4, 5],
  };
  const count = Math.max(3, Math.min(6, profile.preferredMeals || 6));
  const avoid = [...profile.allergies, ...profile.dislikedFoods, ...profile.dietaryRestrictions]
    .join(' ')
    .toLowerCase();
  const adaptIngredient = (name: string) => {
    let adapted = name;
    if (/peanut|nut/.test(avoid)) adapted = adapted.replace(/Natural peanut butter|Mixed almonds and walnuts|peanut butter|almonds|walnuts/gi, 'sunflower seed butter');
    if (/milk|dairy|lactose/.test(avoid) || profile.dietPreference === 'vegan') adapted = adapted.replace(/Whole milk|Greek yogurt|\bmilk\b|\byogurt\b/gi, 'fortified soy alternative');
    if (/egg/.test(avoid) || profile.dietPreference === 'vegan') adapted = adapted.replace(/Whole eggs|\beggs?\b/gi, 'firm tofu scramble');
    if (/wheat|gluten/.test(avoid)) adapted = adapted.replace(/Whole-wheat bread/gi, 'Gluten-free bread');
    if (profile.dietPreference === 'vegetarian' || profile.dietPreference === 'vegan') adapted = adapted.replace(/Halal chicken breast, cooked|Halal lean beef steak, cooked|\bchicken\b|\bbeef\b|\bfish\b/gi, profile.dietPreference === 'vegan' ? 'tempeh or firm tofu' : 'paneer or firm tofu');
    if (profile.dietPreference === 'keto') adapted = adapted.replace(/Basmati rice, cooked|Roasted potatoes|Whole-wheat bread|Oat granola|Rolled oats/gi, 'Low-carbohydrate vegetable alternative');
    if (profile.dietPreference === 'paleo') adapted = adapted.replace(/Whole-wheat bread|Oat granola|Rolled oats/gi, 'Paleo seed and fruit alternative');
    return adapted;
  };
  const selected = mealIndexesByCount[count].map((index) => {
    const meal = DEFAULT_HALAL_MEALS[index];
    return {
      ...meal,
      name: `${meal.mealType} Plan`,
      description: 'Personalized halal-safe meal using the measured ingredients below.',
      ingredients: meal.ingredients?.map((ingredient) => ({ ...ingredient, name: adaptIngredient(ingredient.name) })),
      preparation: adaptIngredient(meal.preparation || 'Cook ingredients safely and serve at the planned time.'),
      replacement: adaptIngredient(meal.replacement || 'Use a nutritionally similar halal-safe replacement.'),
    };
  });
  const baseCalories = selected.reduce((sum, meal) => sum + meal.calories, 0);
  const scale = Math.max(0.75, Math.min(1.3, profile.calorieGoal / baseCalories));
  const schedule = [
    addMinutes(profile.wakeTime, 15),
    addMinutes(profile.schoolStartTime, 150),
    addMinutes(profile.schoolEndTime, -60),
    addMinutes(profile.workoutStartTime, -60),
    addMinutes(profile.workoutEndTime, 15),
    addMinutes(profile.sleepTime, -75),
  ];

  return selected.map((meal, index) => {
    const ingredients = meal.ingredients?.map((ingredient) => ({
      ...ingredient,
      amount: Number((ingredient.amount * scale).toFixed(ingredient.unit === 'item' || ingredient.unit === 'slice' ? 1 : 0)),
      calories: Math.round(ingredient.calories * scale),
      protein: Math.round(ingredient.protein * scale),
      carbs: Math.round(ingredient.carbs * scale),
      fat: Math.round(ingredient.fat * scale),
    }));
    return {
      ...meal,
      id: `${meal.id}_${count}`,
      time: schedule[Math.min(index, schedule.length - 1)],
      ingredients,
      calories: ingredients?.reduce((sum, item) => sum + item.calories, 0) ?? Math.round(meal.calories * scale),
      protein: ingredients?.reduce((sum, item) => sum + item.protein, 0) ?? Math.round(meal.protein * scale),
      carbs: ingredients?.reduce((sum, item) => sum + item.carbs, 0) ?? Math.round(meal.carbs * scale),
      fat: ingredients?.reduce((sum, item) => sum + item.fat, 0) ?? Math.round(meal.fat * scale),
      completed: false,
    };
  });
}

// Helper to determine scheduled split by day of week (0 = Sunday, 1 = Monday, etc.)
export function getWorkoutSplitForDayOfWeek(dayOfWeek: number): WorkoutSplitId {
  switch (dayOfWeek) {
    case 1: // Monday
      return 'upper_a';
    case 2: // Tuesday
      return 'lower_a';
    case 4: // Thursday
      return 'upper_b';
    case 6: // Saturday
      return 'lower_b';
    case 0: // Sunday
    case 3: // Wednesday
    case 5: // Friday
    default:
      return 'recovery';
  }
}

// Generate realistic default historical data for initial review if desired
export function createDefaultDayLog(
  dateStr: string,
  programDay: number,
  profile: UserProfile = DEFAULT_PROFILE
): import('../types').DailyLog {
  const dayDate = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dayDate.getDay();
  const splitId = getWorkoutSplitForDayOfWeek(dayOfWeek);

  return {
    date: dateStr,
    programDay: Math.max(1, Math.min(100, programDay)),
    waterCups: 0,
    waterTotalLiters: 0,
    stepCount: splitId === 'recovery' ? 7500 : 8500,
    sleepHours: 8,
    tasks: {
      workout: false,
      meals: false,
      water: false,
      steps: false,
      sleep: false,
      photo: false,
    },
    meals: buildDailyMealPlan(profile),
    workoutCompleted: false,
    workoutSplitId: splitId,
  };
}
