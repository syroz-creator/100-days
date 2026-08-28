import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Dumbbell, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';
import { calculateCoachPlan } from '../../utils/calculations';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

const DAY_LABELS = [
  { label: 'M', day: 1 }, { label: 'T', day: 2 }, { label: 'W', day: 3 },
  { label: 'T', day: 4 }, { label: 'F', day: 5 }, { label: 'S', day: 6 }, { label: 'S', day: 0 },
];

const EQUIPMENT = ['Barbell', 'Dumbbells', 'Bench', 'Cable machine', 'Leg press', 'Smith machine', 'Pull-up bar', 'Resistance bands'];

const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ initialProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile>({ ...initialProfile, planStarted: false });
  const totalSteps = 6;
  const coach = useMemo(() => calculateCoachPlan(profile, {}), [profile]);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const toggleGymDay = (day: number) => {
    const selected = profile.gymDays.includes(day);
    if (!selected && profile.gymDays.length >= 4) {
      setError('Choose exactly four gym days. Remove one before adding another.');
      return;
    }
    update('gymDays', selected ? profile.gymDays.filter((item) => item !== day) : [...profile.gymDays, day].sort());
  };

  const toggleEquipment = (item: string) => {
    const selected = profile.availableEquipment.includes(item);
    update('availableEquipment', selected
      ? profile.availableEquipment.filter((value) => value !== item)
      : [...profile.availableEquipment, item]);
  };

  const next = () => {
    if (step === 1 && (!profile.name.trim() || profile.age < 13 || profile.age > 100)) {
      setError('Enter a name and a valid age.');
      return;
    }
    if (step === 2 && (profile.heightCm < 120 || profile.startWeightKg < 30 || profile.targetWeightKg < 30)) {
      setError('Check the height and weight values before continuing.');
      return;
    }
    if (step === 5 && profile.gymDays.length !== 4) {
      setError('Select exactly four available gym days.');
      return;
    }
    setStep((current) => Math.min(totalSteps, current + 1));
    setError('');
  };

  const finish = () => {
    onComplete({
      ...profile,
      currentWeightKg: profile.startWeightKg,
      calorieGoal: coach.calorieTarget,
      proteinGoal: coach.proteinGrams,
      carbsGoal: coach.carbsGrams,
      fatGoal: coach.fatGrams,
      waterGoalLiters: coach.waterLiters,
      sleepGoalHours: coach.sleepHours,
      startDate: '',
      onboardingCompleted: true,
      planStarted: false,
      planPaused: false,
    });
  };

  const inputClass = 'input-dark w-full rounded-xl px-3 py-2.5 text-sm';
  const labelClass = 'block text-[11px] font-bold text-[#c4c9ac] uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-[100] bg-[#050810]/95 backdrop-blur-md flex items-start sm:items-center justify-center p-4 pt-safe overflow-y-auto">
      <div className="w-full max-w-xl bg-[#122131] border border-[#273647] rounded-2xl p-5 sm:p-8 shadow-2xl my-3">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold font-display text-[#c3f400]">100 DAYS</h1>
          <p className="text-xs text-[#c4c9ac] mt-1">Build your private training plan</p>
          <div className="h-1.5 bg-[#010f1f] rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#00eefc] transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="min-h-[390px]">
          {step === 1 && (
            <div className="space-y-4">
              <div><h2 className="text-xl font-bold text-white">About you</h2><p className="text-xs text-[#94A3B8]">Used for conservative energy and recovery estimates.</p></div>
              <div><label className={labelClass}>Name</label><input className={inputClass} value={profile.name} onChange={(e) => update('name', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Age</label><input type="number" className={inputClass} value={profile.age} onChange={(e) => update('age', Number(e.target.value))} /></div>
                <div><label className={labelClass}>Sex</label><select className={inputClass} value={profile.sex} onChange={(e) => update('sex', e.target.value as UserProfile['sex'])}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not">Prefer not to say</option></select></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div><h2 className="text-xl font-bold text-white">Body and activity</h2><p className="text-xs text-[#94A3B8]">All body and calorie numbers are estimates, not diagnoses.</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Height (cm)</label><input type="number" className={inputClass} value={profile.heightCm} onChange={(e) => update('heightCm', Number(e.target.value))} /></div>
                <div><label className={labelClass}>Current weight (kg)</label><input type="number" step="0.1" className={inputClass} value={profile.startWeightKg} onChange={(e) => update('startWeightKg', Number(e.target.value))} /></div>
                <div><label className={labelClass}>Target weight (kg)</label><input type="number" step="0.1" className={inputClass} value={profile.targetWeightKg} onChange={(e) => update('targetWeightKg', Number(e.target.value))} /></div>
                <div><label className={labelClass}>Daily activity</label><select className={inputClass} value={profile.dailyActivity} onChange={(e) => update('dailyActivity', e.target.value as UserProfile['dailyActivity'])}><option value="sedentary">Mostly seated</option><option value="light">Lightly active</option><option value="moderate">Moderately active</option><option value="very_active">Very active</option></select></div>
              </div>
              <div><label className={labelClass}>Training experience</label><select className={inputClass} value={profile.trainingExperience} onChange={(e) => update('trainingExperience', e.target.value as UserProfile['trainingExperience'])}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div><h2 className="text-xl font-bold text-white">Daily schedule</h2><p className="text-xs text-[#94A3B8]">Meal and training times will fit around your day.</p></div>
              <div className="grid grid-cols-2 gap-3">
                {[['wakeTime', 'Wake'], ['schoolStartTime', 'School starts'], ['schoolEndTime', 'School ends'], ['workoutStartTime', 'Gym starts'], ['workoutEndTime', 'Gym ends'], ['sleepTime', 'Sleep']] .map(([key, label]) => <div key={key}><label className={labelClass}>{label}</label><input type="time" className={inputClass} value={profile[key as keyof UserProfile] as string} onChange={(e) => update(key as keyof UserProfile, e.target.value as never)} /></div>)}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div><h2 className="text-xl font-bold text-white">Food profile</h2><p className="text-xs text-[#94A3B8]">Pork and alcohol remain excluded from every plan.</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Diet</label><select className={inputClass} value={profile.dietPreference} onChange={(e) => update('dietPreference', e.target.value as UserProfile['dietPreference'])}><option value="halal">Halal</option><option value="none">Standard halal-safe</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="keto">Keto</option><option value="paleo">Paleo</option></select></div>
                <div><label className={labelClass}>Meals per day</label><select className={inputClass} value={profile.preferredMeals} onChange={(e) => update('preferredMeals', Number(e.target.value))}>{[3,4,5,6].map((n) => <option key={n}>{n}</option>)}</select></div>
              </div>
              <div><label className={labelClass}>Restrictions</label><input className={inputClass} value={profile.dietaryRestrictions.join(', ')} onChange={(e) => update('dietaryRestrictions', splitList(e.target.value))} placeholder="Halal, lactose-free" /></div>
              <div><label className={labelClass}>Allergies</label><input className={inputClass} value={profile.allergies.join(', ')} onChange={(e) => update('allergies', splitList(e.target.value))} placeholder="Peanuts, milk" /></div>
              <div><label className={labelClass}>Foods you like</label><input className={inputClass} value={profile.likedFoods.join(', ')} onChange={(e) => update('likedFoods', splitList(e.target.value))} /></div>
              <div><label className={labelClass}>Foods you dislike</label><input className={inputClass} value={profile.dislikedFoods.join(', ')} onChange={(e) => update('dislikedFoods', splitList(e.target.value))} /></div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div><h2 className="text-xl font-bold text-white">Training availability</h2><p className="text-xs text-[#94A3B8]">Choose exactly four days and the equipment you can use.</p></div>
              <div><label className={labelClass}>Four gym days</label><div className="flex justify-between gap-2">{DAY_LABELS.map(({ label, day }) => <button key={day} type="button" onClick={() => toggleGymDay(day)} className={`w-10 h-10 rounded-xl border text-sm font-bold ${profile.gymDays.includes(day) ? 'bg-[#00eefc] text-[#051424] border-[#00eefc]' : 'bg-[#010f1f] text-[#c4c9ac] border-[#444933]'}`}>{label}</button>)}</div></div>
              <div><label className={labelClass}>Available equipment</label><div className="grid grid-cols-2 gap-2">{EQUIPMENT.map((item) => <button key={item} type="button" onClick={() => toggleEquipment(item)} className={`p-2 rounded-xl border text-xs font-semibold text-left ${profile.availableEquipment.includes(item) ? 'bg-[#c3f400]/15 border-[#c3f400] text-[#c3f400]' : 'bg-[#010f1f] border-[#273647] text-[#94A3B8]'}`}>{item}</button>)}</div></div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#c3f400]/15 border border-[#c3f400] mx-auto flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-[#c3f400]" /></div>
              <div className="text-center"><h2 className="text-2xl font-bold text-white">Your plan preview is ready</h2><p className="text-xs text-[#94A3B8] mt-1">The countdown will not start yet.</p></div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['BMI context', coach.bmi], ['Maintenance estimate', `${coach.maintenanceCalories} kcal`], ['Muscle-gain target', `${coach.calorieTarget} kcal`], ['Daily protein', `${coach.proteinGrams} g`], ['Carbohydrates', `${coach.carbsGrams} g`], ['Fat', `${coach.fatGrams} g`], ['Water', `${coach.waterLiters} L`], ['Sleep', `${coach.sleepHours} h`]].map(([label, value]) => <div key={label} className="bg-[#010f1f] border border-[#273647] rounded-xl p-3"><span className="block text-[#8e9379]">{label}</span><strong className="text-white">{value}</strong></div>)}
              </div>
              <p className="text-[11px] text-[#8e9379] leading-relaxed">Calories, nutrition, BMI, body composition, and timeline values are estimates. Brands, preparation, and portions vary. If you are under 18, involve a parent or guardian and a qualified trainer, doctor, or dietitian.</p>
              <button onClick={finish} className="neon-btn w-full py-4 rounded-xl text-base flex items-center justify-center gap-2"><Sparkles className="w-5 h-5" /> Explore My Plan</button>
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-xs text-[#ffb4ab]">{error}</p>}
        {step < totalSteps && <div className="mt-6 pt-4 border-t border-[#273647] flex justify-between"><button type="button" disabled={step === 1} onClick={() => setStep((current) => current - 1)} className="px-3 py-2 text-sm text-[#c4c9ac] disabled:invisible flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</button><button type="button" onClick={next} className="bg-[#2c3a4c] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">Next <ArrowRight className="w-4 h-4" /></button></div>}
      </div>
    </div>
  );
};
