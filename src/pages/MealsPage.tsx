import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Droplets,
  Check,
  Plus,
  Edit2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Flame,
  Info,
  ChevronRight,
} from 'lucide-react';
import { DailyLog, UserProfile, MealItem } from '../types';
import { evaluateWeightPlateau } from '../utils/calculations';
import { playClickBeep } from '../utils/sound';

interface MealsPageProps {
  log: DailyLog;
  profile: UserProfile;
  dailyLogs: Record<string, DailyLog>;
  onUpdateLog: (updatedLog: DailyLog) => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

export const MealsPage: React.FC<MealsPageProps> = ({
  log,
  profile,
  dailyLogs,
  onUpdateLog,
  onUpdateProfile,
}) => {
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null);
  const [isAddingCustomMeal, setIsAddingCustomMeal] = useState(false);

  // Calculate consumed totals
  const totalCalories = log.meals.reduce((sum, m) => (m.completed ? sum + m.calories : sum), 0);
  const totalPlannedCalories = log.meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = log.meals.reduce((sum, m) => (m.completed ? sum + m.protein : sum), 0);
  const totalPlannedProtein = log.meals.reduce((sum, m) => sum + m.protein, 0);

  const calorieGoal = profile.calorieGoal || 2600;
  const proteinGoal = profile.proteinGoal || 105;

  const calPercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / proteinGoal) * 100));

  // Plateau surplus analysis
  const plateauAnalysis = evaluateWeightPlateau(dailyLogs);

  // Water tracker math (8 glasses total)
  const totalCups = 8;
  const currentCups = log.waterCups || 0;
  const litersPerCup = profile.waterGoalLiters / totalCups;
  const currentLiters = (currentCups * litersPerCup).toFixed(1);

  const handleToggleCup = (cupIndex: number) => {
    playClickBeep();
    let newCups = cupIndex + 1;
    // If tapping the already filled last cup, decrement
    if (newCups === currentCups) {
      newCups = cupIndex;
    }
    const newLiters = Number((newCups * litersPerCup).toFixed(2));
    onUpdateLog({
      ...log,
      waterCups: newCups,
      waterTotalLiters: newLiters,
      tasks: {
        ...log.tasks,
        water: newCups >= 6,
      },
    });
  };

  const handleToggleMeal = (mealId: string) => {
    playClickBeep();
    const updatedMeals = log.meals.map((m) => {
      if (m.id === mealId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const allMealsCompleted = updatedMeals.every((m) => m.completed);

    onUpdateLog({
      ...log,
      meals: updatedMeals,
      tasks: {
        ...log.tasks,
        meals: allMealsCompleted,
      },
    });
  };

  const handleSaveMeal = (updatedMeal: MealItem) => {
    let updatedList: MealItem[];
    if (isAddingCustomMeal) {
      updatedList = [...log.meals, updatedMeal];
    } else {
      updatedList = log.meals.map((m) => (m.id === updatedMeal.id ? updatedMeal : m));
    }
    onUpdateLog({ ...log, meals: updatedList });
    setEditingMeal(null);
    setIsAddingCustomMeal(false);
  };

  const handleApplySurplusIncrease = () => {
    const newGoal = calorieGoal + 200;
    onUpdateProfile({
      ...profile,
      calorieGoal: newGoal,
    });
    alert(`Success! Updated daily calorie target to ${newGoal} kcal (+200 kcal surplus).`);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Daily Nutrition Summary Card */}
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c3f400]/5 rounded-full blur-2xl pointer-events-none" />

        <h2 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest mb-4">
          Daily Summary
        </h2>

        {/* Calories Bar */}
        <div className="mb-5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-base font-bold text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#c3f400]" /> Calories
            </span>
            <div className="text-right">
              <span className="text-2xl font-black font-display text-[#c3f400] drop-shadow-[0_0_8px_rgba(195,244,0,0.3)]">
                {totalCalories}
              </span>
              <span className="text-xs text-[#8e9379] font-medium ml-1">/ {calorieGoal} kcal</span>
            </div>
          </div>
          <div className="h-2.5 w-full bg-[#1c2b3c] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c3f400] rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_#c3f400]"
              style={{ width: `${calPercent}%` }}
            />
          </div>
        </div>

        {/* Protein Bar */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-base font-bold text-white flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-[#00eefc]" /> Protein
            </span>
            <div className="text-right">
              <span className="text-2xl font-black font-display text-[#00eefc] drop-shadow-[0_0_8px_rgba(0,238,252,0.3)]">
                {totalProtein}
              </span>
              <span className="text-xs text-[#8e9379] font-medium ml-1">/ {proteinGoal} g</span>
            </div>
          </div>
          <div className="h-2.5 w-full bg-[#1c2b3c] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00eefc] rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_#00eefc]"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Water Tracker */}
      <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-[#00dbe9]" /> Water Tracker
          </h2>
          <span className="text-sm font-bold font-display text-[#00eefc]">
            {currentLiters} / {profile.waterGoalLiters} L
          </span>
        </div>

        {/* 8 Tappable Water Drops */}
        <div className="flex justify-between items-center gap-2 pt-1">
          {Array.from({ length: totalCups }).map((_, index) => {
            const isFilled = index < currentCups;
            return (
              <button
                key={index}
                onClick={() => handleToggleCup(index)}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${
                  isFilled
                    ? 'text-[#00eefc] bg-[#00eefc]/15 border border-[#00eefc]/40 shadow-[0_0_10px_rgba(0,238,252,0.3)] scale-105'
                    : 'text-[#273647] bg-[#050810] border border-[#1E293B] hover:text-[#00eefc]/50'
                }`}
                title={`Cup ${index + 1} (~300ml)`}
              >
                <Droplets className={`w-6 h-6 ${isFilled ? 'fill-[#00eefc]' : ''}`} />
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#8e9379] mt-3 text-center">
          Tap cups to log hydration. 8 cups = {profile.waterGoalLiters}L optimal daily intake.
        </p>
      </section>

      {/* Plateau Calorie Adjustment Banner (Conditional) */}
      {plateauAnalysis.isPlateauDetected && (
        <section className="bg-[#c3f400]/10 border-2 border-[#c3f400] rounded-2xl p-4 shadow-[0_0_20px_rgba(195,244,0,0.15)] animate-in fade-in">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#c3f400] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold font-display text-[#c3f400] uppercase tracking-wider">
                💡 Calorie Surplus Adjustment
              </h3>
              <p className="text-xs text-[#d4e4fa] leading-relaxed">
                {plateauAnalysis.message}
              </p>
              <button
                onClick={handleApplySurplusIncrease}
                className="px-4 py-2 bg-[#c3f400] text-[#050810] text-xs font-extrabold uppercase rounded-xl shadow-[0_0_10px_rgba(195,244,0,0.4)] hover:bg-[#ccff00]"
              >
                Apply +200 kcal Daily Goal ({calorieGoal + 200} kcal)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Medical Disclaimer Banner */}
      <div className="bg-[#122131]/60 border border-[#273647] rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#00dbe9] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[#d4e4fa]">Starting Nutritional Estimate:</strong> 2,500–2,700 kcal & 90–110g protein designed for a 175cm / 51kg muscle-gain beginner. These are starting estimates rather than medical prescriptions.
        </span>
      </div>

      {/* Meal Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest">
            Meal Timeline
          </h2>
          <button
            onClick={() => {
              setEditingMeal({
                id: `custom_${Date.now()}`,
                time: '3:00 PM',
                name: 'Custom Snack',
                mealType: 'Custom',
                description: 'Custom healthy snack or shake.',
                portion: '1 serving',
                calories: 300,
                protein: 20,
                carbs: 35,
                fat: 8,
                completed: false,
              });
              setIsAddingCustomMeal(true);
            }}
            className="text-xs font-bold text-[#c3f400] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Meal
          </button>
        </div>

        <div className="relative pl-7 space-y-5">
          {/* Vertical Connecting Timeline Line */}
          <div className="absolute left-[11px] top-3 bottom-5 w-[2px] bg-[#1E293B]" />

          {log.meals.map((meal) => (
            <div key={meal.id} className="relative">
              {/* Timeline Node */}
              <div
                onClick={() => handleToggleMeal(meal.id)}
                className={`absolute -left-[28px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                  meal.completed
                    ? 'border-[#c3f400] bg-[#050810] text-[#c3f400] shadow-[0_0_10px_rgba(195,244,0,0.4)]'
                    : 'border-[#444933] bg-[#050810] text-transparent hover:border-[#00eefc]'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
              </div>

              {/* Time Label */}
              <div className="text-xs font-semibold text-[#8e9379] mb-1 flex items-center justify-between">
                <span>{meal.time} - {meal.mealType}</span>
                {meal.completed && (
                  <span className="text-[10px] text-[#c3f400] font-bold uppercase tracking-wider">
                    Consumed
                  </span>
                )}
              </div>

              {/* Meal Card */}
              <div
                className={`rounded-2xl p-4 border transition-all ${
                  meal.completed
                    ? 'bg-[#122131]/80 border-[#c3f400]/40'
                    : 'bg-[#0E1421] border-[#1E293B] hover:border-[#273647]'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-base font-bold font-display text-white">
                    {meal.name}
                  </h3>
                  <div className="text-right">
                    <span className="text-sm font-bold font-display text-[#c3f400]">
                      {meal.calories} kcal
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] mb-3 leading-relaxed">
                  {meal.description}
                </p>

                {/* Macros & Action Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-[#1c2b3c] rounded text-[10px] font-bold text-[#d4e4fa] uppercase">
                      P: {meal.protein}g
                    </span>
                    <span className="px-2 py-0.5 bg-[#1c2b3c] rounded text-[10px] font-bold text-[#d4e4fa] uppercase">
                      C: {meal.carbs}g
                    </span>
                    <span className="px-2 py-0.5 bg-[#1c2b3c] rounded text-[10px] font-bold text-[#d4e4fa] uppercase">
                      F: {meal.fat}g
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingMeal(meal);
                      setIsAddingCustomMeal(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-[#122131] hover:bg-[#1c2b3c] border border-[#273647] rounded-full text-xs font-semibold text-[#00eefc] transition-colors"
                  >
                    <ArrowUpDown className="w-3 h-3" /> Swap / Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit / Swap Meal Modal */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 bg-[#050810]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#122131] border border-[#273647] rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold font-display text-white">
              {isAddingCustomMeal ? 'Add Custom Meal' : `Edit / Swap: ${editingMeal.name}`}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8e9379] font-bold uppercase mb-1">Meal Title</label>
                <input
                  type="text"
                  value={editingMeal.name}
                  onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
                  className="input-dark w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[#8e9379] font-bold uppercase mb-1">Scheduled Time</label>
                <input
                  type="text"
                  value={editingMeal.time}
                  onChange={(e) => setEditingMeal({ ...editingMeal, time: e.target.value })}
                  className="input-dark w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-[#8e9379] font-bold uppercase mb-1">Description / Portions</label>
                <textarea
                  rows={2}
                  value={editingMeal.description}
                  onChange={(e) => setEditingMeal({ ...editingMeal, description: e.target.value })}
                  className="input-dark w-full rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[#8e9379] font-bold uppercase mb-1">Calories</label>
                  <input
                    type="number"
                    value={editingMeal.calories}
                    onChange={(e) =>
                      setEditingMeal({ ...editingMeal, calories: parseInt(e.target.value) || 0 })
                    }
                    className="input-dark w-full rounded-lg px-2 py-1.5 text-center text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#8e9379] font-bold uppercase mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={editingMeal.protein}
                    onChange={(e) =>
                      setEditingMeal({ ...editingMeal, protein: parseInt(e.target.value) || 0 })
                    }
                    className="input-dark w-full rounded-lg px-2 py-1.5 text-center text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#8e9379] font-bold uppercase mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={editingMeal.carbs}
                    onChange={(e) =>
                      setEditingMeal({ ...editingMeal, carbs: parseInt(e.target.value) || 0 })
                    }
                    className="input-dark w-full rounded-lg px-2 py-1.5 text-center text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#8e9379] font-bold uppercase mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={editingMeal.fat}
                    onChange={(e) =>
                      setEditingMeal({ ...editingMeal, fat: parseInt(e.target.value) || 0 })
                    }
                    className="input-dark w-full rounded-lg px-2 py-1.5 text-center text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setEditingMeal(null);
                  setIsAddingCustomMeal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveMeal(editingMeal)}
                className="px-5 py-2 rounded-xl bg-[#c3f400] text-[#050810] text-xs font-bold uppercase"
              >
                Save Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
