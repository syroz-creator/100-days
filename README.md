# 100 DAYS

Mobile-first 100-day fitness planner with local profile, workout, meal, measurement, and photo tracking. Structured app data stays in `localStorage`; progress photos stay in IndexedDB and are included in exported backups.

## Local development

```bash
npm install
npm run dev
```

Use `npm run lint` for TypeScript checks and `npm run build` for the production bundle.

## Render static site

- Branch: `main`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

The app works without a server, including onboarding, workouts, meals, progress, backups, and local photos.

## Scheduled iPhone push notifications

iPhone notifications outside the app require both the installed Home Screen PWA and the push scheduler in `server/push-server.mjs`. The notification settings screen reports scheduled push as inactive until every part is configured.

1. Generate VAPID keys:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. Deploy the Node service from `render.yaml` with these environment variables:

   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`, such as `mailto:you@example.com`
   - `PUSH_ALLOWED_ORIGIN`, set to the exact static-site URL
   - `PUSH_DATA_FILE=/var/data/push-subscriptions.json`

3. Set `VITE_PUSH_API_URL` on the static site to the full HTTPS URL of the push service, then redeploy the static site.

4. On iPhone, open the site in Safari, choose **Share > Add to Home Screen**, open the installed app, and use **Profile > iPhone Notifications**.

The Render disk in `render.yaml` keeps subscriptions and schedules across server restarts. A Render plan that supports persistent disks is required. No photos, measurements, workout logs, or meal logs are sent to the push server; it receives only the browser push subscription and reminder schedule.
