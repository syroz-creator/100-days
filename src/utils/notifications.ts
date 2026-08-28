import { UserProfile } from '../types';
import { buildDailyMealPlan } from '../data/initialData';

export const PUSH_API_URL = (import.meta.env.VITE_PUSH_API_URL || '').replace(/\/$/, '');

export function getNotificationSupport() {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const standalone = window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return { supported, standalone, backendConfigured: Boolean(PUSH_API_URL) };
}

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export async function registerPushNotifications(profile: UserProfile): Promise<void> {
  if (!PUSH_API_URL) throw new Error('Push notification backend is not configured.');
  const registration = await navigator.serviceWorker.ready;
  const keyResponse = await fetch(`${PUSH_API_URL}/api/push/public-key`);
  if (!keyResponse.ok) throw new Error('Push notification backend is unavailable.');
  const { publicKey } = await keyResponse.json();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }
  const response = await fetch(`${PUSH_API_URL}/api/push/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      reminders: profile.reminders,
      mealTimes: buildDailyMealPlan(profile).map((meal) => ({ time: meal.time, name: meal.name })),
      gymDays: profile.gymDays,
      startDate: profile.startDate,
      planStarted: profile.planStarted,
      planPaused: profile.planPaused,
    }),
  });
  if (!response.ok) throw new Error('The push schedule could not be saved.');
}
