#!/usr/bin/env bash
# Auto-stage, commit, and push to GitHub (main).
# Safe: skips empty commits, never prints secrets, refuses detached HEAD.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${AUTO_GIT_BRANCH:-main}"
REMOTE="${AUTO_GIT_REMOTE:-origin}"
MSG="${1:-}"

# Never commit local env / credentials
EXCLUDE=(
  ".env"
  ".env.local"
  ".env.*.local"
  "*.pem"
  "*credentials*.json"
  ".firebase/"
)

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository."
  exit 1
fi

current="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current" == "HEAD" ]]; then
  echo "Detached HEAD — aborting auto-commit."
  exit 1
fi

if [[ "$current" != "$BRANCH" ]]; then
  echo "On branch '$current' (expected '$BRANCH'). Set AUTO_GIT_BRANCH or switch branch."
  exit 1
fi

# Stage everything except excludes
git add -A
for pattern in "${EXCLUDE[@]}"; do
  git reset -q -- "$pattern" 2>/dev/null || true
done

# Unstage if nothing meaningful remains
if git diff --cached --quiet && git diff --quiet; then
  # Still push if we're ahead of remote
  ahead="$(git rev-list --count "${REMOTE}/${BRANCH}..HEAD" 2>/dev/null || echo 0)"
  if [[ "${ahead:-0}" -gt 0 ]]; then
    echo "No new changes; pushing $ahead existing commit(s)..."
    git push -u "$REMOTE" "$BRANCH"
    echo "Pushed to ${REMOTE}/${BRANCH}"
    exit 0
  fi
  echo "Nothing to commit or push."
  exit 0
fi

if git diff --cached --quiet; then
  echo "Nothing staged after excludes."
  exit 0
fi

if [[ -z "$MSG" ]]; then
  summary="$(git diff --cached --name-only | head -8 | tr '\n' ', ' | sed 's/,$//')"
  ts="$(date -u +%Y-%m-%dT%H:%MZ)"
  MSG="chore: auto-sync ${ts}"
  if [[ -n "$summary" ]]; then
    MSG="chore: auto-sync — ${summary}"
  fi
fi

# Truncate very long messages
if [[ ${#MSG} -gt 180 ]]; then
  MSG="${MSG:0:177}..."
fi

git commit -m "$MSG"
git push -u "$REMOTE" "$BRANCH"
echo "Committed and pushed to ${REMOTE}/${BRANCH}"
echo "Auto-deploy (GitHub Actions → Firebase) will run on main."
