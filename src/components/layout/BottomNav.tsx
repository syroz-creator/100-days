import React from 'react';
import { Calendar, Dumbbell, UtensilsCrossed, TrendingUp, User, Wrench } from 'lucide-react';

export type NavTab = 'today' | 'workout' | 'meals' | 'progress' | 'tools' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'today' as NavTab, label: 'Today', icon: Calendar },
    { id: 'workout' as NavTab, label: 'Workout', icon: Dumbbell },
    { id: 'meals' as NavTab, label: 'Meals', icon: UtensilsCrossed },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'tools' as NavTab, label: 'Tools', icon: Wrench },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Fixed Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#010f1f]/95 backdrop-blur-lg border-t border-[#1E293B] shadow-[0_-10px_25px_rgba(0,0,0,0.5)] rounded-t-2xl pb-safe">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#c3f400] bg-[#c3f400]/10 scale-105 shadow-[0_0_12px_rgba(195,244,0,0.15)] font-bold'
                    : 'text-[#8e9379] hover:text-[#d4e4fa] hover:bg-[#122131]/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.75px]'
                  }`}
                />
                <span className="text-[11px] tracking-wide font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop / Tablet Sidebar Navigation (Responsive) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-[#010f1f] border-r border-[#1E293B] flex-col p-5 z-40">
        <div className="flex items-center gap-3 mb-8 pt-2">
          <div className="w-10 h-10 rounded-xl bg-[#c3f400] text-[#050810] font-black flex items-center justify-center text-sm font-display shadow-[0_0_15px_rgba(195,244,0,0.4)]">
            100
          </div>
          <div>
            <h2 className="font-display font-black text-lg text-white tracking-tight">100 DAYS</h2>
            <p className="text-[10px] text-[#00eefc] uppercase font-bold tracking-widest">Transformation</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c3f400]/15 text-[#c3f400] border border-[#c3f400]/30 shadow-[0_0_15px_rgba(195,244,0,0.15)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1421]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#c3f400]' : 'text-[#8e9379]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3.5 rounded-xl bg-[#0E1421] border border-[#1E293B] text-xs text-[#94A3B8]">
          <p className="font-bold text-[#c3f400] mb-1">Beginner 100-Day Program</p>
          <p className="text-[11px] leading-relaxed">4 Gym Days / Wk • Halal Nutrition • 2,600 kcal Hypertrophy Focus</p>
        </div>
      </aside>
    </>
  );
};
