import { AppStateData, DailyLog, UserProfile } from '../types';
import {
  DEFAULT_PROFILE,
  DEFAULT_REMINDERS,
  buildDailyMealPlan,
  createDefaultDayLog,
  WORKOUT_TEMPLATES,
} from '../data/initialData';
import { calculateProgramDay, formatDateToISO } from './calculations';
import { getAchievementCandidates } from './beginnerFeatures';
import {
  getPhotosFromIDB,
  clearAllPhotosFromIDB,
  savePhotoToIDB,
  getRecordingsFromIDB,
  saveRecordingToIDB,
  clearAllRecordingsFromIDB,
} from './indexedDB';

const STORAGE_KEY = '100_DAYS_APP_STATE_V1';
const PROFILE_STORAGE_KEY = '100_DAYS_USER_PROFILE_V1';
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

function normalizeProfile(
  profile?: Partial<UserProfile>,
  onboardingCompletedOverride?: boolean
): UserProfile {
  const onboardingCompleted = onboardingCompletedOverride ?? profile?.onboardingCompleted === true;
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    dietaryRestrictions: profile?.dietaryRestrictions || DEFAULT_PROFILE.dietaryRestrictions,
    likedFoods: profile?.likedFoods || DEFAULT_PROFILE.likedFoods,
    dislikedFoods: profile?.dislikedFoods || [],
    allergies: profile?.allergies || [],
    availableEquipment: profile?.availableEquipment || DEFAULT_PROFILE.availableEquipment,
    beginnerModeEnabled: profile?.beginnerModeEnabled ?? (profile?.trainingExperience ? profile.trainingExperience === 'beginner' : true),
    guideAcknowledgements: profile?.guideAcknowledgements || {},
    permanentExerciseReplacements: profile?.permanentExerciseReplacements || {},
    notifications: {
      ...DEFAULT_PROFILE.notifications,
      ...profile?.notifications,
    },
    reminders: Object.fromEntries(
      Object.entries(DEFAULT_REMINDERS).map(([key, value]) => [
        key,
        { ...value, ...profile?.reminders?.[key as keyof typeof DEFAULT_REMINDERS] },
      ])
    ) as UserProfile['reminders'],
    onboardingCompleted,
    planStarted: profile?.planStarted ?? onboardingCompleted,
    planPaused: profile?.planPaused === true,
  };
}

function normalizeDailyLogs(
  logs: Record<string, DailyLog>,
  profile: UserProfile
): Record<string, DailyLog> {
  const defaultMeals = buildDailyMealPlan(profile);
  return Object.fromEntries(
    Object.entries(logs).map(([date, log]) => [
      date,
      {
        ...log,
        meals: (log.meals || defaultMeals).map((meal, index) => ({
          ...defaultMeals[index],
          ...meal,
          ingredients: meal.ingredients || defaultMeals[index]?.ingredients,
          preparation: meal.preparation || defaultMeals[index]?.preparation,
          replacement: meal.replacement || defaultMeals[index]?.replacement,
        })),
      },
    ])
  );
}

export function getInitialAppState(): AppStateData {
  const todayISO = formatDateToISO(new Date());

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppStateData>;
      const profile = normalizeProfile(parsed.profile);
      const dailyLogs = normalizeDailyLogs(parsed.dailyLogs || {}, profile);

      if (profile.startDate) {
        const currentProgramDay = profile.planStarted
          ? calculateProgramDay(profile.startDate, profile.planPaused && profile.pauseStartedAt ? profile.pauseStartedAt : todayISO)
          : 0;
        if (!dailyLogs[todayISO]) {
          dailyLogs[todayISO] = createDefaultDayLog(todayISO, currentProgramDay || 1, profile);
        }
        return {
          profile,
          dailyLogs,
          achievements: parsed.achievements || [],
          activeProgramDay: currentProgramDay,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    }

    const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (rawProfile) {
      const storedProfile = JSON.parse(rawProfile) as Partial<UserProfile>;
      const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
      const profile = normalizeProfile(storedProfile, onboardingCompleted);
      const currentProgramDay = profile.planStarted
        ? calculateProgramDay(profile.startDate, profile.planPaused && profile.pauseStartedAt ? profile.pauseStartedAt : todayISO)
        : 0;

      return {
        profile,
        dailyLogs: {
          [todayISO]: createDefaultDayLog(todayISO, currentProgramDay || 1, profile),
        },
        achievements: [],
        activeProgramDay: currentProgramDay,
        lastUpdated: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
  }

  // Fresh initialization
  const defaultDay = 1;
  const initialLog = createDefaultDayLog(todayISO, defaultDay, DEFAULT_PROFILE);

  const freshState: AppStateData = {
    profile: { ...DEFAULT_PROFILE, startDate: todayISO },
    dailyLogs: {
      [todayISO]: initialLog,
    },
    achievements: [],
    activeProgramDay: 0,
    lastUpdated: new Date().toISOString(),
  };

  return freshState;
}

export function saveAppState(state: AppStateData): void {
  try {
    const existing = new Map((state.achievements || []).map((achievement) => [achievement.id, achievement]));
    for (const candidate of getAchievementCandidates(state.profile, state.dailyLogs)) {
      if (!existing.has(candidate.id)) {
        existing.set(candidate.id, {
          ...candidate,
          earnedAt: new Date().toISOString(),
          seen: false,
        });
      }
    }
    state.achievements = [...existing.values()];
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profile));
    localStorage.setItem(
      ONBOARDING_COMPLETED_KEY,
      state.profile.onboardingCompleted ? 'true' : 'false'
    );
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function loadAppState(): AppStateData {
  return getInitialAppState();
}

export function saveUserProfile(profile: UserProfile): void {
  const state = getInitialAppState();
  state.profile = normalizeProfile(profile);
  saveAppState(state);
}

export function saveDailyLog(log: DailyLog): void {
  const state = getInitialAppState();
  state.dailyLogs[log.date] = log;
  saveAppState(state);
}

export function getOrCreateDailyLog(
  dateOrLogs: string | Record<string, DailyLog>,
  startDateOrDate: string,
  maybeLogsOrProfile?: Record<string, DailyLog> | string,
  maybeProfile?: UserProfile
): DailyLog {
  let dateStr: string;
  let startDateStr: string;
  let logs: Record<string, DailyLog>;

  if (typeof dateOrLogs === 'string') {
    dateStr = dateOrLogs;
    startDateStr = startDateOrDate;
    logs = (typeof maybeLogsOrProfile === 'object' && maybeLogsOrProfile !== null ? maybeLogsOrProfile : {}) as Record<string, DailyLog>;
  } else {
    logs = dateOrLogs;
    dateStr = startDateOrDate;
    startDateStr = typeof maybeLogsOrProfile === 'string' ? maybeLogsOrProfile : '2026-01-01';
  }

  if (logs[dateStr]) {
    return logs[dateStr];
  }
  const effectiveDate = maybeProfile?.planPaused && maybeProfile.pauseStartedAt && dateStr >= maybeProfile.pauseStartedAt
    ? maybeProfile.pauseStartedAt
    : dateStr;
  const programDay = maybeProfile?.planStarted === false ? 1 : calculateProgramDay(startDateStr, effectiveDate);
  return createDefaultDayLog(dateStr, programDay, maybeProfile || DEFAULT_PROFILE);
}

export async function exportAppDataAsJSON(): Promise<void> {
  const jsonStr = await exportAppDataJSON(true);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `100_days_backup_${formatDateToISO(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importAppDataFromJSON(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const result = await importAppDataJSON(text);
        resolve(result);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}

export async function clearAllAppData(): Promise<void> {
  return resetAllAppData();
}

// Generate sample historical progression if user wants to see populated graphs
export function generateSampleHistory(baseProfile: UserProfile): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};
  const today = new Date();
  const currentDayNum = 42; // Day 42 sample

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (currentDayNum - 1));

  let currentWeight = 51.0;

  for (let i = 1; i <= currentDayNum; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + (i - 1));
    const dateKey = formatDateToISO(d);

    // Gradual lean mass gain: ~0.25kg per week with slight fluctuation
    const weightGain = (i / 100) * 8.5; // ~3.5kg gained by day 42
    const dailyFluctuation = (Math.sin(i * 0.8) * 0.2);
    currentWeight = Number((51.0 + weightGain + dailyFluctuation).toFixed(1));

    const dayLog = createDefaultDayLog(dateKey, i);
    dayLog.weightKg = currentWeight;
    dayLog.waterCups = 8;
    dayLog.waterTotalLiters = 2.5;
    dayLog.stepCount = 8500 + Math.floor(Math.sin(i) * 1200);
    dayLog.sleepHours = 7.5 + (i % 3 === 0 ? 0.5 : 0);

    const isCompleted = i < currentDayNum || (i === currentDayNum && Math.random() > 0.4);
    dayLog.workoutCompleted = isCompleted;
    dayLog.tasks = {
      workout: isCompleted,
      meals: true,
      water: true,
      steps: true,
      sleep: true,
      photo: [1, 15, 30].includes(i),
    };

    // Mark meals as completed
    dayLog.meals.forEach((m) => {
      m.completed = true;
    });

    logs[dateKey] = dayLog;
  }

  return logs;
}

// Export all app data as downloadable JSON
export async function exportAppDataJSON(includePhotos = true): Promise<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  const state: AppStateData = raw ? JSON.parse(raw) : getInitialAppState();

  let photos = [];
  let formRecordings = [];
  if (includePhotos) {
    photos = await getPhotosFromIDB();
    formRecordings = await getRecordingsFromIDB();
  }

  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: '100 DAYS',
    state,
    photos,
    formRecordings,
  };

  return JSON.stringify(exportPayload, null, 2);
}

// Import app data from JSON string
export async function importAppDataJSON(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.state || !data.state.profile || !data.state.dailyLogs) {
      throw new Error('Invalid backup file format.');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
    if (data.state.profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data.state.profile));
      localStorage.setItem(
        ONBOARDING_COMPLETED_KEY,
        data.state.profile.onboardingCompleted ? 'true' : 'false'
      );
    }

    if (Array.isArray(data.photos) && data.photos.length > 0) {
      for (const photo of data.photos) {
        await savePhotoToIDB(photo);
      }
    }

    if (Array.isArray(data.formRecordings) && data.formRecordings.length > 0) {
      for (const recording of data.formRecordings) {
        await saveRecordingToIDB(recording);
      }
    }

    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
}

// Reset entire database / fresh start
export async function resetAllAppData(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  await clearAllPhotosFromIDB();
  await clearAllRecordingsFromIDB();
}

export async function restartPlanData(profile: UserProfile): Promise<void> {
  const today = formatDateToISO(new Date());
  const restartedProfile = normalizeProfile({
    ...profile,
    startDate: today,
    currentWeightKg: profile.startWeightKg,
    planStarted: true,
    planPaused: false,
    pauseStartedAt: undefined,
    onboardingCompleted: true,
  });
  const state: AppStateData = {
    profile: restartedProfile,
    dailyLogs: {
      [today]: createDefaultDayLog(today, 1, restartedProfile),
    },
    achievements: [],
    activeProgramDay: 1,
    lastUpdated: new Date().toISOString(),
  };
  saveAppState(state);
  await clearAllPhotosFromIDB();
  await clearAllRecordingsFromIDB();
}
