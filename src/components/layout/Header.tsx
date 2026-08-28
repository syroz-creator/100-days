import React, { useState } from 'react';
import { Bell, Dumbbell, ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';
import { formatDisplayDate } from '../../utils/calculations';

interface HeaderProps {
  profile: UserProfile;
  selectedDate: string;
  todayDate: string;
  programDay: number;
  onSelectDate: (dateStr: string) => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  selectedDate,
  todayDate,
  programDay,
  onSelectDate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const isToday = selectedDate === todayDate;

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const prevISO = d.toISOString().split('T')[0];
    onSelectDate(prevISO);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const nextISO = d.toISOString().split('T')[0];
    onSelectDate(nextISO);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050810]/95 backdrop-blur-md border-b border-[#1E293B] px-4 pb-3 pt-safe-header">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#c3f400] shadow-[0_0_12px_rgba(195,244,0,0.3)] bg-[#122131] flex items-center justify-center">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#122131] to-[#010f1f] text-[#c3f400] font-black text-xs">
                100D
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl tracking-tighter text-[#c3f400] drop-shadow-[0_0_8px_rgba(195,244,0,0.3)]">
                100 DAYS
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30">
                Day {programDay}
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1">
              <span>{formatDisplayDate(selectedDate)}</span>
              {!isToday && (
                <button
                  onClick={() => onSelectDate(todayDate)}
                  className="text-[#c3f400] hover:underline font-bold ml-1"
                >
                  (Jump to Today)
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Date Selector and Notification */}
        <div className="flex items-center gap-1.5">
          {/* Day stepping buttons */}
          <div className="flex items-center bg-[#0E1421] border border-[#1E293B] rounded-lg p-0.5">
            <button
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-1.5 text-[#94A3B8] hover:text-[#c3f400] hover:bg-[#1c2b3c] rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-2 py-1 text-xs font-semibold text-[#d4e4fa] hover:text-[#00eefc] flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#00eefc]" />
              <span className="hidden sm:inline">{selectedDate}</span>
            </button>

            <button
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-1.5 text-[#94A3B8] hover:text-[#c3f400] hover:bg-[#1c2b3c] rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationToast(!showNotificationToast)}
              aria-label="Notifications"
              className="w-9 h-9 rounded-full bg-[#0E1421] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-[#c3f400] hover:border-[#c3f400]/40 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c3f400] shadow-[0_0_6px_#c3f400]"></span>
            </button>

            {showNotificationToast && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0E1421] border border-[#1E293B] rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] mb-2">
                  <span className="text-xs font-bold text-[#c3f400] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Program Alerts
                  </span>
                  <button
                    onClick={() => setShowNotificationToast(false)}
                    className="text-[11px] text-[#94A3B8] hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded bg-[#122131] border border-[#273647]/50">
                    <p className="font-semibold text-white">Hydration reminder</p>
                    <p className="text-[#94A3B8] text-[11px] mt-0.5">Stay hydrated! Target 2.5L daily for optimal protein synthesis.</p>
                  </div>
                  <div className="p-2 rounded bg-[#122131] border border-[#273647]/50">
                    <p className="font-semibold text-white">Daily Workout Window</p>
                    <p className="text-[#94A3B8] text-[11px] mt-0.5">Target session: {profile.workoutStartTime} – {profile.workoutEndTime}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Picker Drawer Modal */}
      {showDatePicker && (
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-[#94A3B8]">Select calendar date:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDate(e.target.value);
                  setShowDatePicker(false);
                }
              }}
              className="input-dark px-2 py-1 rounded text-xs"
            />
            <button
              onClick={() => {
                onSelectDate(todayDate);
                setShowDatePicker(false);
              }}
              className="px-2.5 py-1 rounded bg-[#c3f400]/20 text-[#c3f400] font-bold hover:bg-[#c3f400]/30"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
