import React, { useEffect, useState } from 'react';
import {
  User,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Scale,
  Calendar,
  Clock,
  Dumbbell,
  ShieldCheck,
  Check,
  Save,
  Moon,
  Sun,
  Flame,
  UtensilsCrossed,
} from 'lucide-react';
import { UserProfile, DailyLog } from '../types';
import { exportAppDataAsJSON, importAppDataFromJSON, clearAllAppData } from '../utils/storage';
import { playClickBeep } from '../utils/sound';

interface ProfilePageProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onResetApp: () => void;
  onReloadAppState: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onUpdateProfile,
  onResetApp,
  onReloadAppState,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>({ ...profile });
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const dayLabels = [
    { label: 'M', day: 1 },
    { label: 'T', day: 2 },
    { label: 'W', day: 3 },
    { label: 'T', day: 4 },
    { label: 'F', day: 5 },
    { label: 'S', day: 6 },
    { label: 'S', day: 0 },
  ];

  useEffect(() => {
    if (!isEditing) {
      setEditForm({ ...profile });
    }
  }, [isEditing, profile]);

  const toggleEditGymDay = (dayIndex: number) => {
    const exists = editForm.gymDays.includes(dayIndex);
    const updated = exists
      ? editForm.gymDays.filter((d) => d !== dayIndex)
      : [...editForm.gymDays, dayIndex].sort();
    setEditForm({ ...editForm, gymDays: updated });
  };

  const handleSaveProfile = () => {
    playClickBeep();
    onUpdateProfile({
      ...profile,
      ...editForm,
      startDate: profile.startDate,
      onboardingCompleted: profile.onboardingCompleted,
    });
    setIsEditing(false);
  };

  const handleExport = () => {
    exportAppDataAsJSON();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const success = await importAppDataFromJSON(file);
      if (success) {
        setImportStatus('Backup successfully restored!');
        onReloadAppState();
      } else {
        setImportStatus('Failed to parse backup file. Please ensure it is a valid JSON file.');
      }
    } catch (err) {
      setImportStatus('Error importing backup.');
    }
  };

  const handleFullReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data? This will clear your daily logs and restore initial settings.'
      )
    ) {
      clearAllAppData();
      onResetApp();
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#c3f400]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#122131] border-2 border-[#c3f400] flex items-center justify-center text-[#c3f400] font-black text-2xl font-display shadow-[0_0_20px_rgba(195,244,0,0.3)]">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-extrabold font-display text-white">{profile.name}</h2>
            <p className="text-xs text-[#00dbe9] font-semibold tracking-wider uppercase">
              100-Day Muscle Gain Athlete
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-[#1c2b3c] text-[#d4e4fa] font-bold">
                {profile.heightCm} cm
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1c2b3c] text-[#c3f400] font-bold">
                {profile.currentWeightKg} kg (Target: {profile.targetWeightKg} kg)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1c2b3c] text-[#00eefc] font-bold capitalize">
                {profile.dietPreference} Diet
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditForm({ ...profile });
              setIsEditing(!isEditing);
            }}
            className="px-4 py-2 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#d4e4fa] hover:text-[#c3f400] hover:border-[#c3f400] transition-all"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </section>

      {/* Edit Profile Form */}
      {isEditing && (
        <section className="bg-[#122131] border border-[#273647] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold font-display text-[#c3f400] uppercase tracking-wider">
            Edit Athlete Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Athlete Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Height (cm)</label>
              <input
                type="number"
                value={editForm.heightCm}
                onChange={(e) => setEditForm({ ...editForm, heightCm: Number(e.target.value) })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={editForm.targetWeightKg}
                onChange={(e) =>
                  setEditForm({ ...editForm, targetWeightKg: Number(e.target.value) })
                }
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Starting Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.startWeightKg}
                onChange={(e) =>
                  setEditForm({ ...editForm, startWeightKg: Number(e.target.value) })
                }
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.currentWeightKg}
                onChange={(e) =>
                  setEditForm({ ...editForm, currentWeightKg: Number(e.target.value) })
                }
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Wake Time</label>
              <input
                type="time"
                value={editForm.wakeTime}
                onChange={(e) => setEditForm({ ...editForm, wakeTime: e.target.value })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Sleep Time</label>
              <input
                type="time"
                value={editForm.sleepTime}
                onChange={(e) => setEditForm({ ...editForm, sleepTime: e.target.value })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Workout Start</label>
              <input
                type="time"
                value={editForm.workoutStartTime}
                onChange={(e) => setEditForm({ ...editForm, workoutStartTime: e.target.value })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Workout End</label>
              <input
                type="time"
                value={editForm.workoutEndTime}
                onChange={(e) => setEditForm({ ...editForm, workoutEndTime: e.target.value })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Dietary Preference</label>
              <select
                value={editForm.dietPreference}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    dietPreference: e.target.value as UserProfile['dietPreference'],
                  })
                }
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              >
                <option value="halal">Halal</option>
                <option value="none">Standard / Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Daily Calorie Target</label>
              <input
                type="number"
                value={editForm.calorieGoal}
                onChange={(e) => setEditForm({ ...editForm, calorieGoal: Number(e.target.value) })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Daily Protein Target (g)</label>
              <input
                type="number"
                value={editForm.proteinGoal}
                onChange={(e) => setEditForm({ ...editForm, proteinGoal: Number(e.target.value) })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Water Goal (L)</label>
              <input
                type="number"
                step="0.1"
                value={editForm.waterGoalLiters}
                onChange={(e) =>
                  setEditForm({ ...editForm, waterGoalLiters: Number(e.target.value) })
                }
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[#8e9379] font-bold uppercase mb-1">Step Goal</label>
              <input
                type="number"
                value={editForm.stepGoal}
                onChange={(e) => setEditForm({ ...editForm, stepGoal: Number(e.target.value) })}
                className="input-dark w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8e9379] font-bold uppercase mb-2 text-xs">
              Gym Days
            </label>
            <div className="flex flex-wrap gap-2">
              {dayLabels.map((d, idx) => {
                const isSelected = editForm.gymDays.includes(d.day);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleEditGymDay(d.day)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[#00eefc] text-[#051424] border-[#00eefc]'
                        : 'border-[#444933] text-[#c4c9ac] hover:border-[#00eefc] hover:text-white bg-[#010f1f]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => {
                setEditForm({ ...profile });
                setIsEditing(false);
              }}
              className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="neon-btn px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </section>
      )}

      {/* Program Preferences */}
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-[#00eefc]" /> Preferences & Rest Timers
        </h3>

        <div className="space-y-3 text-sm">
          {/* Unit System */}
          <div className="flex items-center justify-between py-2 border-b border-[#1E293B]">
            <div>
              <p className="font-semibold text-white">Weight Units</p>
              <p className="text-xs text-[#8e9379]">Kilograms or Pounds</p>
            </div>
            <div className="flex bg-[#010f1f] border border-[#273647] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => onUpdateProfile({ ...profile, unitSystem: 'kg' })}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  profile.unitSystem === 'kg'
                    ? 'bg-[#c3f400] text-[#050810]'
                    : 'text-[#8e9379] hover:text-white'
                }`}
              >
                KG
              </button>
              <button
                onClick={() => onUpdateProfile({ ...profile, unitSystem: 'lbs' })}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  profile.unitSystem === 'lbs'
                    ? 'bg-[#c3f400] text-[#050810]'
                    : 'text-[#8e9379] hover:text-white'
                }`}
              >
                LBS
              </button>
            </div>
          </div>

          {/* Default Rest Timer */}
          <div className="flex items-center justify-between py-2 border-b border-[#1E293B]">
            <div>
              <p className="font-semibold text-white">Default Rest Timer</p>
              <p className="text-xs text-[#8e9379]">Between working sets</p>
            </div>
            <div className="flex bg-[#010f1f] border border-[#273647] rounded-lg p-0.5 text-xs">
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onUpdateProfile({ ...profile, restTimeSeconds: sec })}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    profile.restTimeSeconds === sec
                      ? 'bg-[#00eefc] text-[#050810]'
                      : 'text-[#8e9379] hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Audio Sound Feedback */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-white">Audio Chimes & Cues</p>
              <p className="text-xs text-[#8e9379]">Rest timer alarms & task confirmations</p>
            </div>
            <button
              onClick={() =>
                onUpdateProfile({
                  ...profile,
                  soundEnabled: !profile.soundEnabled,
                })
              }
              className={`p-2 rounded-xl border transition-all ${
                profile.soundEnabled
                  ? 'bg-[#c3f400]/20 border-[#c3f400] text-[#c3f400]'
                  : 'bg-[#122131] border-[#273647] text-[#8e9379]'
              }`}
            >
              {profile.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Data Backup, Export & Import */}
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#c3f400]" /> Data Backup & Privacy
        </h3>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          All your workout logs, photos, and nutrition metrics are stored 100% locally and privately on your device. No cloud sync required.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-[#122131] border border-[#00eefc]/40 text-xs text-[#00eefc]">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            className="w-full py-3 px-4 rounded-xl bg-[#122131] border border-[#273647] hover:border-[#c3f400] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#c3f400]" /> Export Data (JSON)
          </button>

          <label className="w-full py-3 px-4 rounded-xl bg-[#122131] border border-[#273647] hover:border-[#00eefc] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-[#00eefc]" /> Restore from Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </label>
        </div>

        <div className="pt-3 border-t border-[#1E293B] flex justify-between items-center">
          <span className="text-xs text-[#8e9379]">Reset app to initial Day 1 state</span>
          <button
            onClick={handleFullReset}
            className="px-3 py-1.5 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-bold hover:bg-[#ffb4ab]/20 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Data
          </button>
        </div>
      </section>
    </div>
  );
};
