import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { TodayDashboard } from './pages/TodayDashboard';
import { WorkoutPage } from './pages/WorkoutPage';
import { MealsPage } from './pages/MealsPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { ToolsPage } from './pages/ToolsPage';
import { DailyCheckInModal } from './components/checkin/DailyCheckInModal';
import {
  loadAppState,
  saveUserProfile,
  saveDailyLog,
  saveAppState,
  getOrCreateDailyLog,
} from './utils/storage';
import { calculateProgramDay, calculateStreak, formatDateToISO } from './utils/calculations';
import { DailyLog, UserProfile } from './types';
import { createDefaultDayLog } from './data/initialData';
import { registerPushNotifications } from './utils/notifications';

export default function App() {
  const [appState, setAppState] = useState(() => loadAppState());
  const [selectedDate, setSelectedDate] = useState<string>(
    () => formatDateToISO(new Date())
  );
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const todayDate = formatDateToISO(new Date());
  const selectedProgramDay = appState.profile.planStarted
    ? calculateProgramDay(
        appState.profile.startDate,
        appState.profile.planPaused && appState.profile.pauseStartedAt && selectedDate >= appState.profile.pauseStartedAt
          ? appState.profile.pauseStartedAt
          : selectedDate
      )
    : 1;

  // Load and refresh state whenever selectedDate or storage changes
  const reloadState = () => {
    const fresh = loadAppState();
    setAppState(fresh);
  };

  // Get current active day log
  const currentLog = getOrCreateDailyLog(
    selectedDate,
    appState.profile.startDate,
    appState.dailyLogs,
    appState.profile
  );

  // Compute overall current streak
  const streak = calculateStreak(appState.dailyLogs, selectedDate);
  const unseenAchievement = appState.achievements.find((achievement) => !achievement.seen);

  useEffect(() => {
    if (!unseenAchievement) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.2 },
      colors: ['#c3f400', '#00eefc', '#ffffff'],
    });
  }, [unseenAchievement?.id]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const markAchievementSeen = () => {
    if (!unseenAchievement) return;
    const updatedState = {
      ...appState,
      achievements: appState.achievements.map((achievement) =>
        achievement.id === unseenAchievement.id ? { ...achievement, seen: true } : achievement
      ),
    };
    saveAppState(updatedState);
    setAppState(updatedState);
  };

  // Handle profile updates
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    saveUserProfile(updatedProfile);
    if (updatedProfile.pushConfigured) {
      registerPushNotifications(updatedProfile).catch(() => {
        saveUserProfile({ ...updatedProfile, pushConfigured: false });
        reloadState();
      });
    }
    reloadState();
  };

  const handleCompleteOnboarding = (updatedProfile: UserProfile) => {
    saveUserProfile({
      ...updatedProfile,
      onboardingCompleted: true,
    });
    reloadState();
    setSelectedDate(formatDateToISO(new Date()));
    setActiveTab('today');
  };

  const handleStartPlan = () => {
    const confirmed = window.confirm(
      'Make today Day 1? This permanently sets the starting date for your 100-day plan.'
    );
    if (!confirmed) return;
    const startDate = formatDateToISO(new Date());
    const startedProfile: UserProfile = {
      ...appState.profile,
      startDate,
      planStarted: true,
      planPaused: false,
      pauseStartedAt: undefined,
    };
    saveUserProfile(startedProfile);
    if (startedProfile.pushConfigured) {
      registerPushNotifications(startedProfile).catch(() => {
        saveUserProfile({ ...startedProfile, pushConfigured: false });
      });
    }
    saveDailyLog(createDefaultDayLog(startDate, 1, startedProfile));
    setSelectedDate(startDate);
    setActiveTab('today');
    reloadState();
  };

  const handleSaveCheckIn = (updatedLog: DailyLog, updatedProfile: UserProfile) => {
    saveUserProfile(updatedProfile);
    saveDailyLog(updatedLog);
    reloadState();
  };

  // Handle daily log updates
  const handleUpdateLog = (updatedLog: DailyLog) => {
    saveDailyLog(updatedLog);
    reloadState();
  };

  const handleUpdateLogs = (updatedLogs: DailyLog[]) => {
    updatedLogs.forEach((updatedLog) => saveDailyLog(updatedLog));
    reloadState();
  };

  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'today') {
      setSelectedDate(formatDateToISO(new Date()));
    }
    setActiveTab(tab);
  };

  const handleResetApp = () => {
    reloadState();
    setSelectedDate(formatDateToISO(new Date()));
    setActiveTab('today');
  };

  return (
    <div className="min-h-screen bg-[#010f1f] text-[#d4e4fa] font-sans antialiased selection:bg-[#c3f400] selection:text-[#050810]">
      {/* 9:16 Mobile First Frame Wrapper */}
      <div className="md:pl-64 min-h-screen flex flex-col justify-between">
        <div className="w-full max-w-lg mx-auto min-h-screen px-4 sm:px-6 py-4 flex flex-col justify-between relative">
          
          {/* Header Bar */}
          <Header
            profile={appState.profile}
            selectedDate={selectedDate}
            todayDate={todayDate}
            programDay={selectedProgramDay}
            onSelectDate={setSelectedDate}
          />

          {!isOnline && (
            <div className="sticky top-2 z-40 mx-auto mb-2 w-fit rounded-full bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 px-3 py-1 text-[11px] font-bold text-[#ffb4ab]">
              Offline - changes are saved on this device
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 mt-2">
            {activeTab === 'today' && (
              <TodayDashboard
                log={currentLog}
                profile={appState.profile}
                dailyLogs={appState.dailyLogs}
                streak={streak}
                onUpdateLog={handleUpdateLog}
                onUpdateLogs={handleUpdateLogs}
                onUpdateProfile={handleUpdateProfile}
                onNavigateToWorkout={() => setActiveTab('workout')}
                onNavigateToMeals={() => setActiveTab('meals')}
                onNavigateToProgress={() => setActiveTab('progress')}
                onStartPlan={handleStartPlan}
              />
            )}

            {activeTab === 'workout' && (
              <WorkoutPage
                log={currentLog}
                profile={appState.profile}
                dailyLogs={appState.dailyLogs}
                onUpdateLog={handleUpdateLog}
                onUpdateProfile={handleUpdateProfile}
                onNavigateToDashboard={() => setActiveTab('today')}
              />
            )}

            {activeTab === 'meals' && (
              <MealsPage
                log={currentLog}
                profile={appState.profile}
                dailyLogs={appState.dailyLogs}
                onUpdateLog={handleUpdateLog}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressPage
                log={currentLog}
                profile={appState.profile}
                dailyLogs={appState.dailyLogs}
                onUpdateLog={handleUpdateLog}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setActiveTab('today');
                }}
              />
            )}

            {activeTab === 'tools' && (
              <ToolsPage
                dailyLogs={appState.dailyLogs}
                achievements={appState.achievements}
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePage
                profile={appState.profile}
                onUpdateProfile={handleUpdateProfile}
                onResetApp={handleResetApp}
                onReloadAppState={reloadState}
              />
            )}
          </main>
        </div>

        {/* Navigation */}
        <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />
      </div>

      {/* Onboarding Flow for First-Time Users */}
      {!appState.profile.onboardingCompleted && (
        <OnboardingModal
          initialProfile={appState.profile}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {appState.profile.onboardingCompleted &&
        appState.profile.planStarted &&
        !appState.profile.planPaused &&
        selectedDate === todayDate &&
        !currentLog.checkInStatus && (
          <DailyCheckInModal
            log={currentLog}
            profile={appState.profile}
            onSave={handleSaveCheckIn}
            onSkip={(skippedLog) => {
              saveDailyLog(skippedLog);
              reloadState();
            }}
          />
        )}

      {unseenAchievement && (
        <div className="fixed left-4 right-4 top-4 z-[110] max-w-md mx-auto bg-[#122131] border border-[#c3f400]/40 rounded-2xl p-4 shadow-2xl">
          <p className="text-[11px] text-[#c3f400] font-bold uppercase tracking-widest">Achievement unlocked</p>
          <h3 className="text-lg font-black font-display text-white">{unseenAchievement.title}</h3>
          <p className="text-xs text-[#94A3B8] mt-1">{unseenAchievement.description}</p>
          <button onClick={markAchievementSeen} className="neon-btn w-full mt-3 py-2 rounded-xl text-xs font-bold">Save</button>
        </div>
      )}
    </div>
  );
}
