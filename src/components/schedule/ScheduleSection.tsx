import React, { useEffect, useState } from 'react';
import { CalendarClock, Check, Clock3, FastForward, Play, RotateCcw } from 'lucide-react';
import { DailyLog, DailyScheduleMode, ProofEntry, ScheduledTask, UserProfile } from '../../types';
import { buildDefaultScheduleTasks, completeWithoutProof, countdownToTask, ensureScheduleTasks, getNextTask, taskDurationMinutes } from '../../utils/schedule';
import { getProofEntriesFromIDB } from '../../utils/indexedDB';
import { ProofModal } from '../proof/ProofModal';

interface ScheduleSectionProps {
  log: DailyLog;
  profile: UserProfile;
  onUpdateLog: (log: DailyLog) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigateToWorkout: () => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ log, profile, onUpdateLog, onUpdateProfile, onNavigateToWorkout }) => {
  const tasks = ensureScheduleTasks(log, profile);
  const [now, setNow] = useState(new Date());
  const [proofEntries, setProofEntries] = useState<ProofEntry[]>([]);
  const [proofTask, setProofTask] = useState<ScheduledTask | null>(null);
  const nextTask = getNextTask(tasks, now);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    getProofEntriesFromIDB().then(setProofEntries);
    if (!log.scheduledTasks?.length) onUpdateLog({ ...log, scheduledTasks: tasks });
    return () => window.clearInterval(id);
  }, []);

  const replaceTasks = (updatedTasks: ScheduledTask[], extra?: Partial<DailyLog>) => onUpdateLog({ ...log, ...extra, scheduledTasks: updatedTasks });

  const updateTask = (taskId: string, updater: (task: ScheduledTask) => ScheduledTask) => {
    replaceTasks(tasks.map((task) => task.id === taskId ? updater(task) : task));
  };

  const setMode = (mode: DailyScheduleMode) => {
    replaceTasks(buildDefaultScheduleTasks(log.date, profile, mode), { scheduleMode: mode });
  };

  const completeTask = (task: ScheduledTask) => {
    if (task.type === 'gym') {
      onNavigateToWorkout();
      return;
    }
    if (task.proofRequirement === 'required' || task.proofRequirement === 'optional') {
      setProofTask(task);
      return;
    }
    updateTask(task.id, (item) => ({ ...item, status: 'completed' }));
  };

  const skipTask = (task: ScheduledTask) => updateTask(task.id, (item) => ({ ...item, status: 'skipped' }));

  const rescheduleTask = (task: ScheduledTask) => {
    const start = window.prompt('New start time', task.startTime);
    if (!start) return;
    const duration = taskDurationMinutes(task);
    const [hours = 0, minutes = 0] = start.split(':').map(Number);
    const endDate = new Date(log.date + 'T00:00:00');
    endDate.setHours(hours, minutes + duration, 0, 0);
    const end = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    updateTask(task.id, (item) => ({ ...item, startTime: start, endTime: end, status: 'rescheduled' }));
  };

  const schoolEndedEarly = () => {
    const end = window.prompt('School ended at', new Date().toTimeString().slice(0, 5));
    if (!end) return;
    const updated = tasks.map((task) => {
      if (task.type === 'school') return { ...task, endTime: end, status: 'completed' as const };
      if (task.startTime > profile.schoolSchedule.schoolEndTime) {
        const minutesEarly = Math.max(0, timeDiff(end, profile.schoolSchedule.schoolEndTime));
        return shiftTask(task, -Math.min(45, minutesEarly));
      }
      return task;
    });
    replaceTasks(updated, { scheduleAdjustmentNote: 'Remaining tasks moved earlier after school ended early.' });
  };

  const startFiveMinutes = (task: ScheduledTask) => {
    updateTask(task.id, (item) => ({ ...item, status: 'active', endTime: shiftTime(now.toTimeString().slice(0, 5), 5), startTime: now.toTimeString().slice(0, 5), note: 'Started with 5 minutes.' }));
  };

  return (
    <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-4 space-y-4">
      {!profile.schoolSchedule.scheduleSetupCompleted && !profile.schoolSchedule.scheduleSetupDismissed && (
        <div className="bg-[#c3f400]/10 border border-[#c3f400]/30 rounded-xl p-3 space-y-2">
          <p className="text-sm font-bold text-white">Set Up School Schedule</p>
          <p className="text-xs text-[#94A3B8]">Add travel, school, gym, homework, Subject 14, meals, and sleep timing in Settings.</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onUpdateProfile({ ...profile, schoolSchedule: { ...profile.schoolSchedule, scheduleSetupCompleted: true } })} className="neon-btn py-2 rounded-xl text-xs font-bold">Use Defaults</button>
            <button onClick={() => onUpdateProfile({ ...profile, schoolSchedule: { ...profile.schoolSchedule, scheduleSetupDismissed: true } })} className="py-2 rounded-xl bg-[#010f1f] border border-[#273647] text-xs font-bold text-[#94A3B8]">Later</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-[#00eefc] font-bold uppercase tracking-widest">Schedule</p>
          <h3 className="text-xl font-black font-display text-white">Today’s Timeline</h3>
        </div>
        <button onClick={schoolEndedEarly} className="px-3 py-2 rounded-xl bg-[#122131] border border-[#273647] text-xs font-bold text-[#c3f400]">School Ended Early</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['normal', 'busy_school', 'low_energy'] as DailyScheduleMode[]).map((mode) => (
          <button key={mode} onClick={() => setMode(mode)} className={`py-2 rounded-xl border text-[11px] font-bold ${((log.scheduleMode || 'normal') === mode) ? 'bg-[#00eefc] border-[#00eefc] text-[#050810]' : 'bg-[#010f1f] border-[#273647] text-[#94A3B8]'}`}>
            {mode === 'normal' ? 'Normal' : mode === 'busy_school' ? 'Busy School' : 'Low Energy'}
          </button>
        ))}
      </div>

      <div className="bg-[#122131] border border-[#273647] rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#8e9379] font-bold uppercase">Next task</p>
            <h4 className="text-2xl font-black font-display text-white">{nextTask?.title || 'Done for today'}</h4>
            <p className="text-sm text-[#00eefc]">{nextTask ? `${nextTask.startTime}-${nextTask.endTime} • starts in ${countdownToTask(nextTask, now)}` : 'No pending tasks'}</p>
          </div>
          <CalendarClock className="w-8 h-8 text-[#c3f400]" />
        </div>
        {nextTask && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => completeTask(nextTask)} className="neon-btn py-3 rounded-xl text-xs font-bold"><Check className="w-4 h-4 inline mr-1" /> Complete</button>
            <button onClick={() => startFiveMinutes(nextTask)} className="py-3 rounded-xl bg-[#00eefc] text-[#050810] text-xs font-bold"><Play className="w-4 h-4 inline mr-1" /> Start 5 Min</button>
            <button onClick={() => rescheduleTask(nextTask)} className="py-3 rounded-xl bg-[#010f1f] border border-[#273647] text-xs font-bold text-[#00eefc]"><RotateCcw className="w-4 h-4 inline mr-1" /> Reschedule</button>
            <button onClick={() => skipTask(nextTask)} className="py-3 rounded-xl bg-[#010f1f] border border-[#273647] text-xs font-bold text-[#94A3B8]"><FastForward className="w-4 h-4 inline mr-1" /> Skip</button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 flex items-center gap-3">
            <Clock3 className={`w-4 h-4 shrink-0 ${task.status === 'completed' ? 'text-[#c3f400]' : 'text-[#00eefc]'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{task.title}</p>
              <p className="text-[11px] text-[#8e9379]">{task.startTime}-{task.endTime} • {task.proofRequirement} proof • {task.status}</p>
            </div>
            <button onClick={() => completeTask(task)} className="px-2.5 py-1.5 rounded-lg bg-[#122131] border border-[#273647] text-[11px] font-bold text-[#c3f400]">Start Now</button>
          </div>
        ))}
      </div>

      {proofTask && (
        <ProofModal
          task={proofTask}
          date={log.date}
          requirement={proofTask.proofRequirement}
          allowPhotoUpload={profile.proofSettings.allowPhotoUpload}
          allowLocation={profile.proofSettings.allowLocationCheckIn}
          onProofSaved={(entry) => {
            setProofEntries((current) => [entry, ...current]);
            updateTask(proofTask.id, (task) => ({ ...task, status: 'completed', proofEntryIds: [...(task.proofEntryIds || []), entry.id] }));
            setProofTask(null);
          }}
          onCompleteWithoutProof={(reason, _note, entry) => {
            setProofEntries((current) => [entry, ...current]);
            updateTask(proofTask.id, (task) => ({ ...completeWithoutProof(task, reason), proofEntryIds: [...(task.proofEntryIds || []), entry.id] }));
            setProofTask(null);
          }}
          onSkipOptional={() => {
            updateTask(proofTask.id, (task) => ({ ...task, status: 'completed' }));
            setProofTask(null);
          }}
          onClose={() => setProofTask(null)}
        />
      )}
    </section>
  );
};

function timeDiff(start: string, end: string): number {
  const [sh = 0, sm = 0] = start.split(':').map(Number);
  const [eh = 0, em = 0] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function shiftTime(time: string, delta: number): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes + delta, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function shiftTask(task: ScheduledTask, delta: number): ScheduledTask {
  return { ...task, startTime: shiftTime(task.startTime, delta), endTime: shiftTime(task.endTime, delta) };
}
