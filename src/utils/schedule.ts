import {
  CompleteWithoutProofReason,
  DailyLog,
  DailyScheduleMode,
  ProofEntry,
  ProofRequirement,
  ProofType,
  ScheduledTask,
  UserProfile,
} from '../types';

function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes: number): string {
  const safe = (minutes + 1440) % 1440;
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function addMinutes(time: string, minutes: number): string {
  return toTime(toMinutes(time) + minutes);
}

export function taskDurationMinutes(task: ScheduledTask): number {
  return Math.max(5, toMinutes(task.endTime) - toMinutes(task.startTime));
}

export function buildDefaultScheduleTasks(date: string, profile: UserProfile, mode: DailyScheduleMode = 'normal'): ScheduledTask[] {
  const day = new Date(`${date}T00:00:00`).getDay();
  const schedule = profile.schoolSchedule;
  const isSchoolDay = schedule.schoolDays.includes(day);
  const isGymDay = schedule.preferredGymDays.includes(day) || profile.gymDays.includes(day);
  const proofRequirement = profile.proofSettings.scheduleTaskProof;
  const shorten = mode === 'busy_school' ? 0.75 : mode === 'low_energy' ? 0.5 : 1;
  const duration = (minutes: number) => Math.max(5, Math.round(minutes * shorten));
  const tasks: ScheduledTask[] = [];

  tasks.push({
    id: `${date}_wake`,
    date,
    title: 'Wake up',
    type: 'prep',
    startTime: schedule.wakeTime,
    endTime: addMinutes(schedule.wakeTime, 20),
    proofRequirement: 'none',
    proofTypes: ['checklist'],
    status: 'pending',
  });

  if (isSchoolDay) {
    tasks.push({
      id: `${date}_school`,
      date,
      title: 'School',
      type: 'school',
      startTime: schedule.schoolStartTime,
      endTime: schedule.schoolEndTime,
      proofRequirement: 'none',
      proofTypes: ['location', 'note'],
      status: 'pending',
    });
  }

  const afterSchool = isSchoolDay ? schedule.schoolEndTime : '10:00';
  if (isGymDay) {
    const gymStart = isSchoolDay ? addMinutes(afterSchool, schedule.travelMinutesSchoolGym) : profile.workoutStartTime;
    tasks.push({
      id: `${date}_gym`,
      date,
      title: 'Gym workout',
      type: 'gym',
      startTime: gymStart,
      endTime: addMinutes(gymStart, duration(75)),
      proofRequirement,
      proofTypes: ['live_photo', 'note', 'checklist', 'timer', 'location'],
      status: 'pending',
    });
  }

  if ([1, 3, 6].includes(day)) {
    const homeworkStart = isSchoolDay ? addMinutes(afterSchool, schedule.travelMinutesSchoolHome + 45) : '12:00';
    tasks.push({
      id: `${date}_homework`,
      date,
      title: day === 6 ? 'Unfinished work' : 'Homework',
      type: 'homework',
      startTime: homeworkStart,
      endTime: addMinutes(homeworkStart, duration(day === 6 ? 90 : 70)),
      proofRequirement,
      proofTypes: ['upload_photo', 'note', 'checklist', 'timer'],
      status: 'pending',
    });
  }

  if (day === 1) {
    tasks.push({
      id: `${date}_subject14`,
      date,
      title: 'Subject 14 development',
      type: 'subject14',
      startTime: '19:00',
      endTime: addMinutes('19:00', duration(60)),
      proofRequirement,
      proofTypes: ['upload_photo', 'note', 'checklist', 'timer'],
      status: 'pending',
    });
  }

  if (day === 3 || day === 5) {
    tasks.push({
      id: `${date}_free`,
      date,
      title: day === 5 ? 'Rest, friends, or project' : 'Free evening',
      type: 'free_time',
      startTime: day === 5 ? '16:00' : '19:00',
      endTime: day === 5 ? '19:00' : '20:30',
      proofRequirement: 'none',
      proofTypes: ['note'],
      status: 'pending',
    });
  }

  tasks.push({
    id: `${date}_school_prep`,
    date,
    title: 'Prepare bag and clothes',
    type: 'prep',
    startTime: '21:15',
    endTime: '21:35',
    proofRequirement,
    proofTypes: ['live_photo', 'upload_photo', 'checklist'],
    status: 'pending',
  });

  tasks.push({
    id: `${date}_sleep`,
    date,
    title: 'Sleep',
    type: 'sleep',
    startTime: schedule.bedtime,
    endTime: '23:59',
    proofRequirement: 'none',
    proofTypes: ['timer'],
    status: 'pending',
  });

  return tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function ensureScheduleTasks(log: DailyLog, profile: UserProfile): ScheduledTask[] {
  return log.scheduledTasks?.length ? log.scheduledTasks : buildDefaultScheduleTasks(log.date, profile, log.scheduleMode || 'normal');
}

export function getNextTask(tasks: ScheduledTask[], now = new Date()): ScheduledTask | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return tasks.find((task) => task.status === 'pending' && toMinutes(task.endTime) >= currentMinutes) ||
    tasks.find((task) => task.status === 'pending') ||
    null;
}

export function countdownToTask(task: ScheduledTask | null, now = new Date()): string {
  if (!task) return 'All tasks handled';
  const current = now.getHours() * 60 + now.getMinutes();
  const target = toMinutes(task.startTime);
  const delta = Math.max(0, target - current);
  const hours = Math.floor(delta / 60);
  const minutes = delta % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function canCompleteTask(task: ScheduledTask, proofEntries: ProofEntry[]): boolean {
  if (task.proofRequirement !== 'required') return true;
  if (task.completedWithoutProof) return true;
  return proofEntries.some((entry) => task.proofEntryIds?.includes(entry.id));
}

export function completeWithoutProof(task: ScheduledTask, reason: CompleteWithoutProofReason): ScheduledTask {
  return {
    ...task,
    status: 'completed',
    completedWithoutProof: true,
    completedWithoutProofReason: reason,
  };
}

export function buildProofEntry(params: {
  task: Pick<ScheduledTask, 'id' | 'title' | 'type'> | { id: string; title: string; type: 'workout' | 'meal' };
  date: string;
  proofType: ProofType;
  imageDataUrl?: string;
  note?: string;
  checklist?: string[];
  timerSeconds?: number;
  location?: ProofEntry['location'];
}): ProofEntry {
  return {
    id: `proof_${params.task.id}_${Date.now()}`,
    taskId: params.task.id,
    taskName: params.task.title,
    taskType: params.task.type,
    date: params.date,
    createdAt: new Date().toISOString(),
    proofType: params.proofType,
    status: 'completed',
    completedWithoutProof: false,
    imageDataUrl: params.imageDataUrl,
    note: params.note,
    checklist: params.checklist,
    timerSeconds: params.timerSeconds,
    location: params.location,
  };
}

export function proofCompletionPercent(logs: Record<string, DailyLog>): number {
  const tasks = Object.values(logs).flatMap((log) => log.scheduledTasks || []);
  const proofTasks = tasks.filter((task) => task.proofRequirement !== 'none');
  if (proofTasks.length === 0) return 0;
  const completed = proofTasks.filter((task) => task.status === 'completed' && ((task.proofEntryIds?.length || 0) > 0 || task.completedWithoutProof)).length;
  return Math.round((completed / proofTasks.length) * 100);
}

export function flexibleStreak(logs: Record<string, DailyLog>, currentDate: string): number {
  let streak = 0;
  let missesAllowed = 1;
  const date = new Date(`${currentDate}T00:00:00`);
  for (let i = 0; i < 100; i += 1) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const log = logs[key];
    const productive = !!log && (log.workoutCompleted || (log.scheduledTasks || []).some((task) => task.status === 'completed') || Object.values(log.tasks).filter(Boolean).length >= 4);
    if (productive) {
      streak += 1;
    } else if (missesAllowed > 0) {
      missesAllowed -= 1;
    } else {
      break;
    }
    date.setDate(date.getDate() - 1);
  }
  return streak;
}
