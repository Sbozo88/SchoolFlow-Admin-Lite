# Agent / automation notes — SchoolFlow Admin LITE

## Auto GitHub + Firebase

After meaningful code changes in this repo:

1. Run **`npm run sync`** (or `bash scripts/auto-commit-push.sh "your message"`).
2. That stages, commits (skipping `.env*`), and **pushes to `origin/main`**.
3. GitHub Actions **Firebase Deploy** then builds and deploys automatically.

Do **not** commit secrets (`.env`, `.env.local`, service account keys).

Prefer explicit commit messages when the change is intentional:

```bash
npm run sync -- "fix: describe the change"
# or
bash scripts/auto-commit-push.sh "feat: describe the change"
```

## Deploy

- Auto: push to `main` → `.github/workflows/firebase-deploy.yml`
- Manual: `npm run deploy`
