# SchoolFlow Admin LITE

Minimal, admin-only SchoolFlow foundation extracted from the hardened SchoolFlow OS app.

## What is included

- Next.js App Router shell
- Firebase Auth login flow with email/password, Google sign-in, and reset links
- Protected `/admin` route that only allows `users/{uid}.role == "admin"`
- Fail-closed Firebase setup with no hardcoded project defaults
- Shared live Firestore collection hook
- Firestore rules that deny by default and allow only signed-in admins to manage admin data

## Local setup

Copy `.env.example` to `.env.local` and fill the Firebase web app values:

```bash
npm install
npm run dev
```

The app intentionally blocks login and live Firestore access until the required `VITE_FIREBASE_*` values exist. The current Next shell also accepts the previous `NEXT_PUBLIC_FIREBASE_*` names for compatibility.

## Firebase admin access

Create the first admin profile from a trusted backend, Firebase console, or an Admin SDK script:

```json
{
  "role": "admin",
  "email": "admin@example.com"
}
```

The document id must match the Firebase Auth user uid: `users/{uid}`.

## Validation

```bash
npm run lint
npm run build
npm test
```

## Auto commit + deploy

Commit and push to GitHub in one step (skips `.env*`):

```bash
npm run sync
# with a message:
npm run sync -- "feat: your change summary"
```

**Automatic deploy:** every push to `main` runs GitHub Actions (`.github/workflows/firebase-deploy.yml`) which builds the static export and deploys Hosting + Firestore rules/indexes to project `schoolflow-admin-lite`.

Flow: `npm run sync` → GitHub → Firebase Hosting.

Required GitHub repo secrets:

- `FIREBASE_TOKEN` (CI / refresh token for Firebase CLI)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Manual deploy from a machine that already has Firebase login:

```bash
npm run deploy
```

Live URL: https://schoolflow-admin-lite.web.app
