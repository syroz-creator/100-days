import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Dumbbell } from 'lucide-react';
import { UserProfile } from '../../types';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    name: initialProfile.name || 'Alex Mercer',
    age: initialProfile.age || 18,
    heightCm: initialProfile.heightCm || 175,
    startWeightKg: initialProfile.startWeightKg || 51.0,
    currentWeightKg: initialProfile.currentWeightKg || 51.0,
    targetWeightKg: initialProfile.targetWeightKg || 65.0,
    wakeTime: initialProfile.wakeTime || '07:00',
    sleepTime: initialProfile.sleepTime || '23:00',
    workoutStartTime: initialProfile.workoutStartTime || '17:00',
    workoutEndTime: initialProfile.workoutEndTime || '18:15',
    dietPreference: initialProfile.dietPreference || 'halal',
    gymDays: initialProfile.gymDays && initialProfile.gymDays.length ? initialProfile.gymDays : [1, 2, 4, 6],
  });

  const totalSteps = 5;
  const progressPercent = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleGymDay = (dayIndex: number) => {
    const exists = profile.gymDays.includes(dayIndex);
    const updated = exists
      ? profile.gymDays.filter((d) => d !== dayIndex)
      : [...profile.gymDays, dayIndex].sort();
    setProfile({ ...profile, gymDays: updated });
  };

  const handleFinish = () => {
    onComplete({
      ...profile,
      onboardingCompleted: true,
      currentWeightKg: profile.startWeightKg,
      startDate: profile.startDate || new Date().toISOString().split('T')[0],
    });
  };

  const dayLabels = [
    { label: 'M', day: 1, name: 'Mon' },
    { label: 'T', day: 2, name: 'Tue' },
    { label: 'W', day: 3, name: 'Wed' },
    { label: 'T', day: 4, name: 'Thu' },
    { label: 'F', day: 5, name: 'Fri' },
    { label: 'S', day: 6, name: 'Sat' },
    { label: 'S', day: 0, name: 'Sun' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#050810]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#122131] border border-[#273647] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Background decorative glows */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00eefc] rounded-full opacity-10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#c3f400] rounded-full opacity-10 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-extrabold font-display text-[#c3f400] tracking-tighter drop-shadow-[0_0_15px_rgba(195,244,0,0.3)]">
            100 DAYS
          </h1>
          <p className="text-sm text-[#c4c9ac] mt-1 font-medium">Configure your transformation</p>

          {/* Progress Indicator */}
          <div className="w-full bg-[#010f1f] h-2 rounded-full mt-5 overflow-hidden border border-[#1c2b3c]">
            <div
              className="bg-[#00eefc] h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_#00eefc]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Contents */}
        <div className="min-h-[260px] flex flex-col justify-center relative z-10">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display text-white mb-1">Let's start with the basics</h2>
                <p className="text-xs text-[#94A3B8]">Personalize your 100-day journey.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                  className="input-dark w-full rounded-xl px-4 py-3.5 text-base font-medium transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  placeholder="18"
                  className="input-dark w-full rounded-xl px-4 py-3.5 text-base font-medium transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: Body Metrics */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display text-white mb-1">Current & Target Metrics</h2>
                <p className="text-xs text-[#94A3B8]">Starting baseline for 175cm / 51kg muscle gain.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.heightCm}
                    onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                    placeholder="175"
                    className="input-dark w-full rounded-xl px-4 py-3 text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-1.5">
                    Starting Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.startWeightKg}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        startWeightKg: Number(e.target.value),
                        currentWeightKg: Number(e.target.value),
                      })
                    }
                    placeholder="51"
                    className="input-dark w-full rounded-xl px-4 py-3 text-base"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#7df4ff] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Target Weight (kg)</span>
                    <span className="text-[11px] text-[#00eefc] font-normal">+14 kg Hypertrophy Goal</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.targetWeightKg}
                    onChange={(e) => setProfile({ ...profile, targetWeightKg: Number(e.target.value) })}
                    placeholder="65"
                    className="input-dark w-full rounded-xl px-4 py-3 text-base border-[#00eefc]/50 focus:border-[#00eefc]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Daily Schedule */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display text-white mb-1">Daily Rhythm</h2>
                <p className="text-xs text-[#94A3B8]">Align nutrition and recovery around your clock.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-1.5">
                    Wake Up
                  </label>
                  <input
                    type="time"
                    value={profile.wakeTime}
                    onChange={(e) => setProfile({ ...profile, wakeTime: e.target.value })}
                    className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-1.5">
                    Sleep Time
                  </label>
                  <input
                    type="time"
                    value={profile.sleepTime}
                    onChange={(e) => setProfile({ ...profile, sleepTime: e.target.value })}
                    className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-1.5">
                    Workout Start
                  </label>
                  <input
                    type="time"
                    value={profile.workoutStartTime}
                    onChange={(e) => setProfile({ ...profile, workoutStartTime: e.target.value })}
                    className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-1.5">
                    Workout End
                  </label>
                  <input
                    type="time"
                    value={profile.workoutEndTime}
                    onChange={(e) => setProfile({ ...profile, workoutEndTime: e.target.value })}
                    className="input-dark w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-2">
                  Available Gym Days (Upper/Lower Split)
                </label>
                <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
                  {dayLabels.map((d, idx) => {
                    const isSelected = profile.gymDays.includes(d.day);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleGymDay(d.day)}
                        className={`w-11 h-11 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-[#00eefc] text-[#051424] border-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.4)]'
                            : 'border-[#444933] text-[#c4c9ac] hover:border-[#00eefc] hover:text-white bg-[#010f1f]'
                        }`}
                      >
                        <span>{d.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-2">
                  Mon (Upper A), Tue (Lower A), Thu (Upper B), Sat (Lower B). Wed/Fri/Sun are Recovery Days.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Diet */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-display text-white mb-1">Dietary Profile</h2>
                <p className="text-xs text-[#94A3B8]">High protein & surplus meal plan customization.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c4c9ac] uppercase tracking-wider mb-2">
                  Dietary Preferences / Restrictions
                </label>
                <select
                  value={profile.dietPreference}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      dietPreference: e.target.value as UserProfile['dietPreference'],
                    })
                  }
                  className="input-dark w-full rounded-xl px-4 py-3.5 text-base font-medium appearance-none"
                >
                  <option value="halal">Halal (Default - High Protein)</option>
                  <option value="none">Standard / Omnivore</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-[#010f1f] border border-[#273647] text-xs text-[#d4e4fa] space-y-1">
                <div className="flex justify-between font-bold text-[#c3f400]">
                  <span>Daily Calorie Target:</span>
                  <span>2,600 kcal</span>
                </div>
                <div className="flex justify-between font-bold text-[#00eefc]">
                  <span>Daily Protein Target:</span>
                  <span>105 g</span>
                </div>
                <p className="text-[11px] text-[#8e9379] pt-1">
                  Starting estimates tailored for beginner weight gain from 51kg. Fully editable at any time.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Success / Ready */}
          {step === 5 && (
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#c3f400]/20 border-2 border-[#c3f400] mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(195,244,0,0.5)]">
                <CheckCircle2 className="w-10 h-10 text-[#c3f400]" />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold font-display text-white mb-2">Profile Complete</h2>
                <p className="text-base text-[#7df4ff] font-medium">Your 100-day transformation starts now.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#010f1f] border border-[#273647] text-xs text-left space-y-2 text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Athlete:</span> <span className="text-white font-bold">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Starting / Target:</span> <span className="text-[#c3f400] font-bold">{profile.startWeightKg}kg → {profile.targetWeightKg}kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Split:</span> <span className="text-white font-bold">4-Day Upper / Lower Hypertrophy</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="neon-btn w-full py-4 rounded-xl text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(195,244,0,0.4)] flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-5 h-5" /> Start Day 1
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="mt-8 flex justify-between items-center relative z-10 pt-4 border-t border-[#273647]">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                step === 1 ? 'invisible' : 'text-[#c4c9ac] hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNext}
              className="bg-[#2c3a4c] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#273647] hover:text-[#c3f400] transition-all flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
