import express from 'express';
import webpush from 'web-push';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const app = express();
const port = Number(process.env.PORT || 8787);
const dataFile = process.env.PUSH_DATA_FILE || './data/push-subscriptions.json';
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const allowedOrigin = process.env.PUSH_ALLOWED_ORIGIN || '*';

if (publicKey && privateKey) webpush.setVapidDetails(subject, publicKey, privateKey);

app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

async function loadRecords() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); } catch { return []; }
}

async function saveRecords(records) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(records, null, 2));
}

app.get('/health', (_req, res) => res.json({ ok: true, pushConfigured: Boolean(publicKey && privateKey) }));
app.get('/api/push/public-key', (_req, res) => {
  if (!publicKey || !privateKey) return res.status(503).json({ error: 'VAPID keys are not configured.' });
  res.json({ publicKey });
});

app.post('/api/push/register', async (req, res) => {
  const { subscription, timezone, reminders, mealTimes, gymDays, startDate, planStarted, planPaused } = req.body || {};
  if (!subscription?.endpoint || !timezone || !reminders) return res.status(400).json({ error: 'Invalid push schedule.' });
  const records = await loadRecords();
  const id = createHash('sha256').update(subscription.endpoint).digest('hex');
  const record = { id, subscription, timezone, reminders, mealTimes: mealTimes || [], gymDays: gymDays || [], startDate, planStarted, planPaused, lastSent: {}, updatedAt: new Date().toISOString() };
  const index = records.findIndex((item) => item.id === id);
  if (index >= 0) records[index] = { ...records[index], ...record };
  else records.push(record);
  await saveRecords(records);
  res.json({ configured: true });
});

function localNow(timezone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(new Date()).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`, weekday: parts.weekday };
}

function programDay(startDate, date) {
  if (!startDate) return 0;
  return Math.floor((new Date(`${date}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`)) / 86400000) + 1;
}

function dueNotifications(record, local) {
  if (!record.planStarted || record.planPaused) return [];
  const result = [];
  const day = programDay(record.startDate, local.date);
  const dailyNudge = day > 0 ? `Day ${day}: ` : '';
  const add = (type, tag, title, body, when = record.reminders[type]?.time) => {
    if (record.reminders[type]?.enabled && when === local.time) result.push({ tag, title, body });
  };
  add('morningCheckIn', 'daily-check-in', `${dailyNudge}set the target`, 'Log weight, sleep, energy, and soreness. The plan gets smarter when you give it real data.');
  add('water', 'water', 'Quick water check', 'One minute: open the app, tap your cups, and keep the day from drifting.');
  add('bedtime', 'bedtime', 'Protect tomorrow', 'Wind down now so tomorrow does not start already tired.');
  if ((record.gymDays || []).includes(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(local.weekday))) {
    add('preWorkout', 'pre-workout', 'Fuel then lift', 'Training is coming up. Eat the planned pre-gym meal and show up ready.');
    add('workoutStart', 'workout-start', 'Start the session', 'Open the workout, log the first set, and let momentum do the rest.');
  }
  if (record.reminders.mealReminders?.enabled) {
    (record.mealTimes || []).forEach((meal, index) => {
      if (meal.time === local.time) result.push({ tag: `meal-${index}`, title: meal.name || 'Planned Meal', body: 'This is the boring part that changes your body. Eat the planned portion and mark it done.' });
    });
  }
  if ([1, 15, 30, 45, 60, 75, 100].includes(day)) add('progressPhotos', `photos-${day}`, `Day ${day} Photo Checkpoint`, 'Take or upload the four photos. Same lighting, same angles, no overthinking.');
  if (local.weekday === 'Sun') add('weeklyReview', 'weekly-review', 'Sunday Review', 'Check the seven-day weight average and adjust next week instead of guessing.');
  return result;
}

async function runScheduler() {
  if (!publicKey || !privateKey) return;
  const records = await loadRecords();
  let changed = false;
  for (const record of records) {
    let local;
    try { local = localNow(record.timezone); } catch { continue; }
    for (const notification of dueNotifications(record, local)) {
      const sentKey = `${local.date}:${local.time}:${notification.tag}`;
      if (record.lastSent?.[sentKey]) continue;
      try {
        await webpush.sendNotification(record.subscription, JSON.stringify({ ...notification, url: '/' }));
        record.lastSent = { ...record.lastSent, [sentKey]: new Date().toISOString() };
        changed = true;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          record.disabled = true;
          changed = true;
        }
      }
    }
  }
  if (changed) await saveRecords(records.filter((record) => !record.disabled));
}

setInterval(runScheduler, 30000);
runScheduler();
app.listen(port, () => console.log(`100 DAYS push scheduler listening on ${port}`));
