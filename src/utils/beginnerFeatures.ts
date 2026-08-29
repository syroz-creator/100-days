import {
  Achievement,
  DailyLog,
  Exercise,
  PainType,
  ReplacementReason,
  UserProfile,
  WorkoutSplitId,
} from '../types';
import { CHECKPOINT_DAYS, formatDateToISO } from './calculations';

export interface ExerciseGuide {
  muscles: string[];
  setup: string[];
  positioning: string[];
  start: string;
  movement: string[];
  breathing: string;
  mistakes: string[];
  safety: string;
}

const defaultGuide = (exercise: Pick<Exercise, 'name' | 'targetMuscle' | 'formTips'>): ExerciseGuide => ({
  muscles: exercise.targetMuscle.split('/').map((item) => item.trim()),
  setup: [
    'Choose the lightest controllable setting first and ask gym staff to show unfamiliar adjustments.',
    'Set the machine or bench so the moving joint lines up with the machine pivot or handle path.',
    'Check that pins, collars, pads, and safety stops are secure before the first rep.',
  ],
  positioning: [
    'Keep feet flat and balanced unless the exercise specifically requires another position.',
    'Hold handles with a relaxed but firm grip and keep wrists stacked over the handle or weight.',
    'Brace gently through the torso so the target muscles move the load instead of momentum.',
  ],
  start: 'Begin with the weight still, shoulders controlled, and the first rep feeling easy enough to stop at any time.',
  movement: [
    'Move through the comfortable range of motion with a steady two-second lowering phase.',
    'Pause briefly where the target muscle is working hardest.',
    'Stop the set when form changes or the joint path feels painful.',
  ],
  breathing: 'Breathe in before the lowering phase, then breathe out as you lift or pull the weight.',
  mistakes: [
    'Using body swing to start the rep.',
    'Letting joints collapse out of line with the handle, pad, or foot plate.',
    'Chasing heavier weight before the setup feels repeatable.',
  ],
  safety: 'Sharp pain, joint pain, numbness, or dizziness means stop the set and get help from a parent, trainer, doctor, or physiotherapist.',
});

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  bench_press: {
    muscles: ['Chest', 'Front shoulders', 'Triceps'],
    setup: ['Set the bench under the bar so your eyes start slightly behind it.', 'Use empty bar warm-up reps before adding plates.', 'Set safety pins just below chest level if the rack has them.'],
    positioning: ['Feet flat and slightly behind knees.', 'Shoulder blades squeezed down and back on the bench.', 'Hands even on the bar, wrists stacked above elbows.'],
    start: 'Unrack with straight arms, let the bar settle over mid-chest, and keep feet planted.',
    movement: ['Lower to mid-chest under control.', 'Keep elbows about 45 degrees from the torso.', 'Press up and slightly back until arms are straight.'],
    breathing: 'Breathe in and brace before lowering, breathe out after the hardest part of the press.',
    mistakes: ['Bouncing the bar off the chest.', 'Lifting hips off the bench.', 'Letting wrists bend backward.'],
    safety: 'Use a spotter or safety pins. Do not test a one-rep maximum.',
  },
  lat_pulldown: {
    muscles: ['Lats', 'Upper back', 'Biceps'],
    setup: ['Set the thigh pad snugly so your legs stay down.', 'Pick a wide or neutral handle you can grip evenly.', 'Start with a light pin and test the cable path.'],
    positioning: ['Sit tall with feet flat.', 'Grip the bar just wider than shoulders.', 'Lean back only slightly and keep ribs down.'],
    start: 'Begin with arms long, shoulders down away from ears, and the stack still.',
    movement: ['Pull elbows down toward your ribs.', 'Bring the handle to upper chest height.', 'Return slowly until the arms are long again.'],
    breathing: 'Breathe out while pulling down, breathe in while the handle rises.',
    mistakes: ['Pulling behind the neck.', 'Swinging the torso backward.', 'Shrugging shoulders into the ears.'],
    safety: 'Stop if shoulder or elbow joints feel sharp pain.',
  },
  leg_press: {
    muscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    setup: ['Set the seat so knees are bent comfortably at the bottom.', 'Place feet shoulder-width on the platform.', 'Confirm the safety handles move freely before loading.'],
    positioning: ['Back and hips stay against the pad.', 'Feet stay flat through the whole rep.', 'Knees track in the same direction as toes.'],
    start: 'Unlock the sled with straight but not locked knees and feel the platform evenly under both feet.',
    movement: ['Lower until knees are near 90 degrees or before hips lift.', 'Drive through the whole foot.', 'Stop before locking the knees hard at the top.'],
    breathing: 'Breathe in as the sled lowers, breathe out as you press.',
    mistakes: ['Letting the lower back round off the pad.', 'Knees collapsing inward.', 'Using a range of motion you cannot control.'],
    safety: 'Never place hands near the rails. Stop if knee, hip, or back pain feels sharp.',
  },
};

export function getExerciseGuide(exercise: Exercise): ExerciseGuide {
  return EXERCISE_GUIDES[exercise.replacementForExerciseId || exercise.id] || EXERCISE_GUIDES[exercise.id] || defaultGuide(exercise);
}

export function getBeginnerPhase(programDay: number, enabled: boolean) {
  if (!enabled || programDay >= 15) {
    return { active: false, setMultiplier: 1, label: 'Full routine', explanation: 'Full planned routine is active.' };
  }
  if (programDay <= 7) {
    return {
      active: true,
      setMultiplier: 0.5,
      label: 'Technique week',
      explanation: 'Beginner Mode is using fewer working sets so setup, control, and recovery come first.',
    };
  }
  return {
    active: true,
    setMultiplier: 0.75,
    label: 'Build-up week',
    explanation: 'Beginner Mode is gradually adding volume before the full routine starts on Day 15.',
  };
}

export function applyBeginnerMode(exercises: Exercise[], programDay: number, enabled: boolean): Exercise[] {
  const phase = getBeginnerPhase(programDay, enabled);
  if (!phase.active) return exercises;
  return exercises.map((exercise) => {
    const planned = exercise.sets.length || exercise.targetSets || 1;
    const reducedSets = Math.max(1, Math.min(planned, Math.ceil(planned * phase.setMultiplier)));
    return {
      ...exercise,
      sets: exercise.sets.slice(0, reducedSets).map((set, index) => ({
        ...set,
        setNumber: index + 1,
      })),
    };
  });
}

export interface ExerciseAlternative {
  id: string;
  name: string;
  muscles: string;
  equipment: string;
  why: string;
  setup: string;
}

const replacementPool: Record<string, ExerciseAlternative[]> = {
  chest: [
    { id: 'machine_chest_press', name: 'Machine Chest Press', muscles: 'Chest / Triceps', equipment: 'Chest press machine', why: 'It uses the same pressing pattern with more built-in stability.', setup: 'Set handles at mid-chest height, keep back against the pad, and press without locking elbows hard.' },
    { id: 'push_up', name: 'Incline Push-Up', muscles: 'Chest / Triceps', equipment: 'Bench or rack', why: 'It trains the same push muscles with bodyweight and easy height adjustment.', setup: 'Hands on a stable bench, body straight, lower chest toward the bench with elbows controlled.' },
    { id: 'cable_chest_press', name: 'Cable Chest Press', muscles: 'Chest / Triceps', equipment: 'Cable machine', why: 'It keeps chest focus when benches or barbells are busy.', setup: 'Set pulleys near chest height, stagger stance, press handles forward with ribs down.' },
  ],
  back: [
    { id: 'assisted_row_machine', name: 'Machine Row', muscles: 'Mid-back / Lats', equipment: 'Row machine', why: 'It trains pulling muscles with a guided path and simple setup.', setup: 'Set chest pad so handles are reachable, brace chest, pull elbows back without shrugging.' },
    { id: 'single_arm_db_row', name: 'Single-Arm Dumbbell Row', muscles: 'Lats / Mid-back', equipment: 'Dumbbell and bench', why: 'It replaces cable or machine rows using common equipment.', setup: 'One knee and hand on bench, flat back, pull dumbbell toward hip.' },
    { id: 'band_pulldown', name: 'Band Pulldown', muscles: 'Lats / Upper back', equipment: 'Resistance band', why: 'It keeps the vertical pull pattern when the pulldown station is unavailable.', setup: 'Anchor band high, kneel or sit tall, pull elbows down toward ribs.' },
  ],
  legs: [
    { id: 'goblet_squat', name: 'Goblet Squat', muscles: 'Quads / Glutes', equipment: 'Dumbbell', why: 'It trains the same lower-body muscles with a beginner-friendly load.', setup: 'Hold one dumbbell at chest, feet shoulder-width, squat while knees track over toes.' },
    { id: 'split_squat', name: 'Bodyweight Split Squat', muscles: 'Quads / Glutes', equipment: 'Open floor', why: 'It keeps leg training available without a machine.', setup: 'Long stance, back knee lowers straight down, front foot flat.' },
    { id: 'dumbbell_rdl', name: 'Dumbbell Romanian Deadlift', muscles: 'Hamstrings / Glutes', equipment: 'Dumbbells', why: 'It preserves the hip-hinge pattern with easier loading.', setup: 'Soft knees, dumbbells close to thighs, hinge back until hamstrings stretch.' },
  ],
  shoulders: [
    { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', muscles: 'Shoulders / Triceps', equipment: 'Shoulder press machine', why: 'It keeps overhead pressing with more control than free weights.', setup: 'Set seat so handles start near ear level, press up without leaning back.' },
    { id: 'front_raise', name: 'Dumbbell Front Raise', muscles: 'Front deltoids', equipment: 'Dumbbells', why: 'It trains shoulders when press stations are unavailable.', setup: 'Stand tall, raise light dumbbells to shoulder height, lower slowly.' },
  ],
  arms: [
    { id: 'cable_curl', name: 'Cable Curl', muscles: 'Biceps', equipment: 'Cable machine', why: 'It keeps steady tension with light, adjustable loading.', setup: 'Elbows stay by ribs, curl handle without swinging.' },
    { id: 'bench_dip', name: 'Assisted Bench Dip', muscles: 'Triceps', equipment: 'Bench', why: 'It trains triceps when cable stations are occupied.', setup: 'Hands on bench, feet close enough to keep it easy, bend elbows gently.' },
  ],
};

function replacementKey(exercise: Exercise): keyof typeof replacementPool {
  const text = `${exercise.name} ${exercise.targetMuscle}`.toLowerCase();
  if (/chest|bench|pec|press/.test(text) && !/shoulder/.test(text)) return 'chest';
  if (/back|lat|row|pull/.test(text)) return 'back';
  if (/quad|glute|hamstring|leg|calf|squat|lunge|deadlift|thrust/.test(text)) return 'legs';
  if (/shoulder|deltoid|lateral/.test(text)) return 'shoulders';
  return 'arms';
}

export function getExerciseAlternatives(exercise: Exercise, profile: UserProfile): ExerciseAlternative[] {
  const equipment = profile.availableEquipment.join(' ').toLowerCase();
  return replacementPool[replacementKey(exercise)]
    .filter((alt) => alt.equipment === 'Open floor' || equipment.split(/[,\s]+/).some((token) => alt.equipment.toLowerCase().includes(token)) || true)
    .slice(0, 3);
}

export function createReplacementExercise(
  original: Exercise,
  alternative: ExerciseAlternative,
  reason: ReplacementReason,
  permanent: boolean
): Exercise {
  return {
    ...original,
    id: alternative.id,
    name: alternative.name,
    targetMuscle: alternative.muscles,
    formTips: `${alternative.setup} ${alternative.why}`,
    replacementForExerciseId: original.replacementForExerciseId || original.id,
    replacementReason: reason,
    replacementPermanent: permanent,
    sets: original.sets.map((set) => ({ ...set, completed: false })),
  };
}

export function suggestStartingWeight(testWeightKg: number, cleanReps: number, difficulty: number): { weightKg: number; explanation: string } {
  const safeTest = Math.max(0, testWeightKg);
  if (cleanReps < 6 || difficulty >= 5) {
    return {
      weightKg: Number(Math.max(0, safeTest * 0.8).toFixed(1)),
      explanation: 'The test set was difficult, so start lighter and keep every rep clean.',
    };
  }
  if (cleanReps >= 15 && difficulty <= 2) {
    return {
      weightKg: Number((safeTest + Math.max(1, safeTest * 0.1)).toFixed(1)),
      explanation: 'The light test was easy, so a very small increase is reasonable for working sets.',
    };
  }
  return {
    weightKg: Number(safeTest.toFixed(1)),
    explanation: 'This keeps the first working weight conservative while you learn the setup.',
  };
}

export interface PlateCalculation {
  possible: boolean;
  perSide: number[];
  message: string;
}

export function calculatePlates(totalWeight: number, barWeight: number, availablePlates: number[]): PlateCalculation {
  const sideTarget = Number(((totalWeight - barWeight) / 2).toFixed(3));
  if (sideTarget < 0) {
    return { possible: false, perSide: [], message: 'Requested total is lighter than the selected bar.' };
  }
  const sorted = [...availablePlates].filter((plate) => plate > 0).sort((a, b) => b - a);
  let remaining = sideTarget;
  const perSide: number[] = [];
  for (const plate of sorted) {
    while (remaining + 0.0001 >= plate) {
      perSide.push(plate);
      remaining = Number((remaining - plate).toFixed(3));
    }
  }
  if (remaining > 0.0001) {
    return { possible: false, perSide, message: 'This exact total cannot be built with the selected plates.' };
  }
  return { possible: true, perSide, message: perSide.length ? 'Load these plates on each side.' : 'Use the bar only.' };
}

export interface WeeklyReview {
  startWeight?: number;
  endWeight?: number;
  averageWeight?: number;
  previousWeekChange?: number;
  completedWorkouts: number;
  missedWorkouts: number;
  totalExercises: number;
  totalSets: number;
  bestStrength: string;
  averageCalories: number;
  averageProtein: number;
  mealConsistency: number;
  waterConsistency: number;
  averageSleep: number;
  averageEnergy: number;
  averageSoreness: number;
  photoReminder: boolean;
  wentWell: string;
  improve: string;
  goal: string;
}

export function buildWeeklyReview(dailyLogs: Record<string, DailyLog>, endDate: string): WeeklyReview {
  const end = new Date(`${endDate}T00:00:00`);
  const dates = Array.from({ length: 7 }, (_, offset) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (6 - offset));
    return formatDateToISO(d);
  });
  const logs = dates.map((date) => dailyLogs[date]).filter(Boolean);
  const weights = logs.map((item) => item.weightKg).filter((value): value is number => typeof value === 'number');
  const totals = logs.reduce((acc, item) => {
    const meals = item.meals || [];
    const logged = item.loggedExercises || [];
    acc.calories += meals.filter((meal) => meal.completed).reduce((sum, meal) => sum + meal.calories, 0);
    acc.protein += meals.filter((meal) => meal.completed).reduce((sum, meal) => sum + meal.protein, 0);
    acc.mealDays += meals.length > 0 && meals.every((meal) => meal.completed) ? 1 : 0;
    acc.waterDays += item.tasks.water || item.waterTotalLiters > 0 ? 1 : 0;
    acc.sleep += item.sleepHours || 0;
    acc.energy += item.energyLevel || item.bodyCheck?.energyLevel || 0;
    acc.soreness += item.sorenessLevel || item.bodyCheck?.sorenessLevel || 0;
    acc.exercises += logged.filter((exercise) => exercise.sets.some((set) => set.completed)).length;
    acc.sets += logged.flatMap((exercise) => exercise.sets).filter((set) => set.completed).length;
    return acc;
  }, { calories: 0, protein: 0, mealDays: 0, waterDays: 0, sleep: 0, energy: 0, soreness: 0, exercises: 0, sets: 0 });
  const previousDates = dates.map((date) => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() - 7);
    return formatDateToISO(d);
  });
  const previousWeights = previousDates.map((date) => dailyLogs[date]?.weightKg).filter((value): value is number => typeof value === 'number');
  const averageWeight = weights.length ? weights.reduce((sum, item) => sum + item, 0) / weights.length : undefined;
  const previousAverage = previousWeights.length ? previousWeights.reduce((sum, item) => sum + item, 0) / previousWeights.length : undefined;
  const completedWorkouts = logs.filter((item) => item.workoutCompleted).length;
  const missedWorkouts = logs.filter((item) => item.workoutSplitId !== 'recovery' && !item.workoutCompleted && item.programDay < 100).length;
  const bestSet = logs.flatMap((item) => item.loggedExercises || []).flatMap((exercise) => exercise.sets.map((set) => ({ ...set, name: exercise.exerciseName }))).sort((a, b) => (b.weightKg * b.reps) - (a.weightKg * a.reps))[0];
  return {
    startWeight: weights[0],
    endWeight: weights.at(-1),
    averageWeight: averageWeight ? Number(averageWeight.toFixed(1)) : undefined,
    previousWeekChange: averageWeight !== undefined && previousAverage !== undefined ? Number((averageWeight - previousAverage).toFixed(1)) : undefined,
    completedWorkouts,
    missedWorkouts,
    totalExercises: totals.exercises,
    totalSets: totals.sets,
    bestStrength: bestSet ? `${bestSet.name}: ${bestSet.weightKg} kg x ${bestSet.reps}` : 'No strength sets logged yet',
    averageCalories: Math.round(totals.calories / 7),
    averageProtein: Math.round(totals.protein / 7),
    mealConsistency: Math.round((totals.mealDays / 7) * 100),
    waterConsistency: Math.round((totals.waterDays / 7) * 100),
    averageSleep: Number((totals.sleep / Math.max(1, logs.length)).toFixed(1)),
    averageEnergy: Number((totals.energy / Math.max(1, logs.length)).toFixed(1)),
    averageSoreness: Number((totals.soreness / Math.max(1, logs.length)).toFixed(1)),
    photoReminder: logs.some((item) => CHECKPOINT_DAYS.includes(item.programDay) && !item.tasks.photo),
    wentWell: completedWorkouts >= 3 ? 'Training consistency was strong.' : 'You kept the week moving without guilt.',
    improve: missedWorkouts > 0 ? 'Plan the next workout earlier in the day.' : 'Keep logging meals and water daily.',
    goal: missedWorkouts > 0 ? 'Complete the next scheduled workout, then recover before repeating the same muscles.' : 'Repeat this week with clean reps and steady meals.',
  };
}

export function findMissedStrengthWorkout(dailyLogs: Record<string, DailyLog>, todayDate: string): DailyLog | null {
  const candidates = Object.values(dailyLogs)
    .filter((item) => item.date < todayDate && item.workoutSplitId && item.workoutSplitId !== 'recovery' && !item.workoutCompleted && !item.missedWorkoutDecision)
    .sort((a, b) => b.date.localeCompare(a.date));
  return candidates[0] || null;
}

export function bodyCheckRecommendation(energy: number, soreness: number, sleep: number, painType: PainType): string {
  if (painType === 'sharp_pain' || painType === 'joint_pain') {
    return 'Stop affected movements today and ask a parent, trainer, doctor, or physiotherapist before training through sharp or joint pain.';
  }
  if (sleep < 6 || energy <= 2 || soreness >= 5) {
    return 'Keep weight steady today and consider reducing volume only if you confirm the adjustment.';
  }
  if (soreness >= 4) {
    return 'Train with controlled reps and keep the same weight unless warm-up sets feel unusually easy.';
  }
  return 'Readiness is acceptable for the planned workout.';
}

export function getAchievementCandidates(profile: UserProfile, logs: Record<string, DailyLog>): Omit<Achievement, 'earnedAt' | 'seen'>[] {
  const sorted = Object.values(logs).sort((a, b) => a.date.localeCompare(b.date));
  const completedWorkouts = sorted.filter((log) => log.workoutCompleted).length;
  const completedWorkoutDays = new Set(sorted.filter((log) => log.workoutCompleted).map((log) => log.date));
  const completedPhotos = sorted.filter((log) => CHECKPOINT_DAYS.includes(log.programDay) && log.tasks.photo).length;
  const weightIncrease = sorted.some((log) => typeof log.weightKg === 'number' && log.weightKg >= profile.startWeightKg + 1);
  const loggedSets = sorted.flatMap((log) => log.loggedExercises || []).flatMap((exercise) => exercise.sets.map((set) => ({ ...set, exerciseName: exercise.exerciseName })));
  const hasWeightIncrease = loggedSets.some((set) => set.completed && set.prevWeightKg !== undefined && set.weightKg > set.prevWeightKg);
  const hasRepRecord = loggedSets.some((set) => set.completed && set.prevReps !== undefined && set.reps > set.prevReps);
  const milestones = [5, 10, 25, 50].filter((count) => completedWorkouts >= count);
  const dayMilestones = [15, 30, 60, 75, 100].filter((day) => sorted.some((log) => log.programDay >= day));
  const sevenMealDays = sorted.slice(-7).length === 7 && sorted.slice(-7).every((log) => log.meals.length > 0 && log.meals.every((meal) => meal.completed));
  const completeWeek = (() => {
    for (let i = 0; i <= sorted.length - 7; i += 1) {
      const week = sorted.slice(i, i + 7);
      if (week.filter((log) => log.workoutSplitId !== 'recovery').every((log) => completedWorkoutDays.has(log.date))) return true;
    }
    return false;
  })();
  return [
    completedWorkouts >= 1 && { id: 'first_workout', title: 'First workout', description: 'Completed the first training day.' },
    completeWeek && { id: 'first_training_week', title: 'First complete training week', description: 'Finished every planned workout in a week.' },
    ...milestones.map((count) => ({ id: `${count}_workouts`, title: `${count} workouts`, description: `Completed ${count} workouts.` })),
    hasWeightIncrease && { id: 'first_weight_increase', title: 'First weight increase', description: 'Increased load while keeping logged reps.' },
    hasRepRecord && { id: 'new_repetition_record', title: 'New repetition record', description: 'Beat a previous rep mark.' },
    loggedSets.some((set) => set.completed && set.weightKg > 0) && { id: 'new_exercise_weight_record', title: 'Exercise weight logged', description: 'Saved a loaded exercise record.' },
    weightIncrease && { id: 'first_kg_gained', title: 'First kilogram gained', description: 'Body weight increased by at least 1 kg.' },
    sevenMealDays && { id: 'seven_day_meals', title: 'Seven-day meal consistency', description: 'Completed every planned meal for seven days.' },
    ...dayMilestones.map((day) => ({ id: `day_${day}`, title: `Day ${day}`, description: `Reached Day ${day} of the 100-day plan.` })),
    completedPhotos >= CHECKPOINT_DAYS.length && { id: 'all_checkpoint_photos', title: 'Checkpoint photos complete', description: 'Completed all progress photos for checkpoints.' },
  ].filter(Boolean) as Omit<Achievement, 'earnedAt' | 'seen'>[];
}
