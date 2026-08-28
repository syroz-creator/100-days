import React, { useState } from 'react';
import { Bell, BellOff, CheckCircle2, Smartphone, TriangleAlert } from 'lucide-react';
import { ReminderType, UserProfile } from '../../types';
import { getNotificationSupport, registerPushNotifications } from '../../utils/notifications';

interface NotificationSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const LABELS: Record<ReminderType, string> = {
  morningCheckIn: 'Morning daily check-in',
  mealReminders: 'Each planned meal',
  preWorkout: 'Pre-workout reminder',
  workoutStart: 'Workout start',
  water: 'Water reminder',
  bedtime: 'Bedtime',
  progressPhotos: 'Progress photo checkpoints',
  weeklyReview: 'Sunday weigh-in and review',
};

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ profile, onUpdateProfile }) => {
  const support = getNotificationSupport();
  const [status, setStatus] = useState('');
  const [working, setWorking] = useState(false);

  const enable = async () => {
    if (!support.supported) {
      setStatus('This browser does not support web push notifications.');
      onUpdateProfile({ ...profile, notificationPermission: 'unsupported', pushConfigured: false });
      return;
    }
    if (!support.standalone) {
      setStatus('On iPhone, add this site to the Home Screen first, then open the installed app and return here.');
      return;
    }
    setWorking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'Permission was denied. Enable notifications for this app in iPhone Settings.' : 'Notification permission was not granted.');
        onUpdateProfile({ ...profile, notificationPermission: permission, pushConfigured: false });
        return;
      }
      if (!support.backendConfigured) {
        setStatus('Permission is granted, but scheduled push delivery is not configured on this deployment yet.');
        onUpdateProfile({ ...profile, notificationPermission: permission, pushConfigured: false });
        return;
      }
      await registerPushNotifications(profile);
      onUpdateProfile({ ...profile, notificationPermission: permission, pushConfigured: true });
      setStatus('iPhone push permission and the reminder schedule are configured.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Notification setup failed.');
      onUpdateProfile({ ...profile, notificationPermission: Notification.permission, pushConfigured: false });
    } finally {
      setWorking(false);
    }
  };

  const updateReminder = async (type: ReminderType, field: 'enabled' | 'time', value: boolean | string) => {
    const updated: UserProfile = {
      ...profile,
      reminders: { ...profile.reminders, [type]: { ...profile.reminders[type], [field]: value } },
    };
    onUpdateProfile(updated);
    if (profile.pushConfigured) {
      try {
        await registerPushNotifications(updated);
        setStatus('Reminder schedule updated.');
      } catch {
        onUpdateProfile({ ...updated, pushConfigured: false });
        setStatus('The schedule was saved locally, but the push backend could not be updated.');
      }
    }
  };

  const fullyConfigured = support.supported && support.standalone && support.backendConfigured && profile.notificationPermission === 'granted' && profile.pushConfigured;

  return (
    <section className="bg-[#0E1421] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
      <div><h3 className="text-xs font-bold text-[#8e9379] uppercase tracking-widest flex items-center gap-1.5"><Bell className="w-4 h-4 text-[#00eefc]" /> iPhone Notifications</h3><p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">On iPhone, use Safari’s Share menu to add 100 DAYS to the Home Screen. Open that installed app, then enable notifications here.</p></div>

      <div className={`rounded-xl border p-3 flex items-start gap-2 ${fullyConfigured ? 'bg-[#c3f400]/10 border-[#c3f400]/40' : 'bg-[#010f1f] border-[#273647]'}`}>{fullyConfigured ? <CheckCircle2 className="w-5 h-5 text-[#c3f400] shrink-0" /> : support.supported ? <Smartphone className="w-5 h-5 text-[#00eefc] shrink-0" /> : <BellOff className="w-5 h-5 text-[#ffb4ab] shrink-0" />}<div><p className="text-xs font-bold text-white">{fullyConfigured ? 'Scheduled push is configured' : 'Scheduled push is not active'}</p><p className="text-[11px] text-[#8e9379] mt-0.5">Home Screen: {support.standalone ? 'yes' : 'no'} · Permission: {profile.notificationPermission} · Server: {support.backendConfigured ? 'configured' : 'not configured'}</p></div></div>

      <button onClick={enable} disabled={working || fullyConfigured} className="w-full py-3 rounded-xl bg-[#00eefc] disabled:bg-[#1c2b3c] disabled:text-[#8e9379] text-[#050810] text-xs font-bold">{working ? 'Configuring…' : fullyConfigured ? 'Notifications Enabled' : 'Enable iPhone Notifications'}</button>
      {status && <div className="p-3 rounded-xl bg-[#122131] border border-[#273647] text-xs text-[#d4e4fa] flex gap-2"><TriangleAlert className="w-4 h-4 text-[#00eefc] shrink-0" />{status}</div>}

      <div className="space-y-2">{(Object.keys(LABELS) as ReminderType[]).map((type) => <div key={type} className="bg-[#010f1f] border border-[#273647] rounded-xl p-3 flex items-center gap-3"><button type="button" aria-label={`Toggle ${LABELS[type]}`} onClick={() => updateReminder(type, 'enabled', !profile.reminders[type].enabled)} className={`w-10 h-6 rounded-full p-0.5 transition-colors ${profile.reminders[type].enabled ? 'bg-[#c3f400]' : 'bg-[#273647]'}`}><span className={`block w-5 h-5 rounded-full bg-[#050810] transition-transform ${profile.reminders[type].enabled ? 'translate-x-4' : ''}`} /></button><span className="flex-1 text-xs font-semibold text-white">{LABELS[type]}</span><input aria-label={`${LABELS[type]} time`} type="time" value={profile.reminders[type].time} onChange={(e) => updateReminder(type, 'time', e.target.value)} className="input-dark rounded-lg px-2 py-1.5 text-xs w-[100px]" /></div>)}</div>
    </section>
  );
};
