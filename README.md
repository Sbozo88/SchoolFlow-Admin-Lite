# SchoolFlow Admin LITE

SchoolFlow Admin LITE is a multi-tenant school operations application with separate school-client and Super Admin workspaces.

## Stack

- React 19 with Vite and React Router
- Tailwind CSS 4, Lucide React, and Recharts
- Firebase Authentication, Cloud Firestore, and Firebase Storage client SDKs
- Static SPA deployment to Firebase Hosting (`dist/`)

## Workspaces and routes

- `/admin` — tenant-scoped school operations: learners, attendance, payments, parent follow-ups, forms, reports, settings, setup, handover, and support
- `/super-admin` — platform clients, users, billing, support, monitoring, and immutable audit records
- `/login` — Firebase email/password and Google authentication
- `/enroll` and `/parent-form` — public tenant-scoped forms using `?tenantId=`

Business documents carry `tenantId` and audit metadata. Firestore rules enforce tenant and platform-role boundaries.

## Local setup

Copy `.env.example` to `.env.local` and provide the Firebase web application values:

```bash
npm install
npm run dev
```

The app fails closed when required `VITE_FIREBASE_*` values are missing.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Commit and deploy

```bash
npm run sync -- "feat: describe the change"
```

`npm run sync` commits without environment files and pushes `main`. GitHub Actions then runs lint, type checking, unit tests, a Vite production build, and Playwright journeys before deploying Hosting and Firestore configuration to `schoolflow-admin-lite`.

The GitHub repository still uses the existing `NEXT_PUBLIC_FIREBASE_*` secret names for compatibility, but the workflow maps them to the Vite runtime variables. Application source and local environment files use `VITE_FIREBASE_*`.

Manual deployment from an authenticated machine:

```bash
npm run deploy
```

Live: https://schoolflow-admin-lite.web.app
