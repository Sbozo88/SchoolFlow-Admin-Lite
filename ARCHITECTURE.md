# SchoolFlow Admin LITE — Architecture

Multi-tenant school operations SPA on **React 19 + Vite + React Router + Firebase**.

> Not Next.js. Application source and local env use `VITE_FIREBASE_*`.

---

## System overview

```
Internet
   │
Firebase Auth
   │
   ├─ Super Admin (platform) ── /super-admin/*
   ├─ School tenant (client) ── /school/*
   ├─ Demo tenant (read-only writes blocked) ── /demo/*
   └─ Public forms ── /enroll, /parent-form (?tenantId=)
   │
Cloud Firestore (tenantId isolation + rules)
Cloud Functions (bootstrapDemoPlatform, africa-south1)
Firebase Hosting (dist/ SPA rewrite)
```

---

## Source layout (actual)

```
src/
├── App.tsx                 # Lazy routes + workspace shells
├── main.tsx                # Providers: Theme, Auth, Tenant
├── components/
│   ├── auth/               # AuthProvider, LoginForm, ProtectedRoute
│   ├── layout/             # School / Demo / SuperAdmin layouts
│   ├── tenant/             # TenantProvider, impersonation banner
│   ├── theme/
│   └── ui/
├── features/               # Domain pages + services + repos
│   ├── attendance/
│   ├── auth/
│   ├── dashboard/
│   ├── learners/
│   ├── parents/
│   ├── payments/
│   ├── reports/
│   ├── settings/
│   ├── setup/
│   └── support/
├── routes/                 # Thin route entry modules (default exports)
├── hooks/                  # Shared hooks (useFirestoreCollection, useActiveTenantId, …)
├── firebase/               # Auth, config, audit, provision client
├── repositories/           # BaseRepository, TenantRepository
├── services/               # Cross-cutting (AuditService → writeAuditLog)
├── lib/
│   ├── data/               # liveQueryHub, queryLimits, notDeleted
│   ├── forms/              # publicIntake guards
│   ├── tenant/             # stamp, filter, indexes, impersonation
│   ├── permissions/
│   └── observability/
├── types/
└── utils/
functions/src/              # Callable demo bootstrap
firestore.rules
firestore.indexes.json
```

---

## Data access principles

1. **Active tenant** — school queries use `useActiveTenantId()` (`TenantProvider.activeTenantId` first, then profile home tenant).
2. **Bounded reads** — list queries and live listeners default to `DEFAULT_COLLECTION_LIMIT` (500) via `liveQueryHub` / repositories.
3. **Shared listeners** — `liveQueryHub` dedupes `onSnapshot` by collection + tenant + order + limit (dashboard + list pages share one stream).
4. **Soft delete** — operational deletes set `status: "deleted"`; UI filters via `notDeleted`.
5. **Audit** — interactive login only; entity mutations go through `AuditService` → `writeAuditLog`.

---

## Workspaces & routes

| Path | Audience |
|------|----------|
| `/login` | Auth (email/password, Google) |
| `/school/*` | Tenant school ops |
| `/demo/*` | Demo mirror (writes disabled in TenantProvider) |
| `/super-admin/*` | Platform operators |
| `/enroll`, `/parent-form` | Public intake (`?tenantId=`) |

---

## Security

- Firestore rules: platform roles, tenant membership, tenant meta on create, deny-by-default.
- Public `parentSubmissions` create requires tenant meta; client adds honeypot + rate limit + tenantId format checks.
- Hosting: HSTS, frame deny, nosniff, CSP, Referrer-Policy, immutable hashed assets.

---

## Quality & deploy

```bash
npm run typecheck
npm test                 # saas primitives + functions
npm run test:rules       # rules emulator
npm run test:e2e         # Playwright smoke
npm run sync -- "msg"    # commit + push → GitHub Actions deploy
```

CI: lint, typecheck, unit, rules, build, e2e, then Firebase deploy (`schoolflow-admin-lite`).
