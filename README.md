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
```
