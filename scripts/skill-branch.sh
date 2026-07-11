#!/usr/bin/env bash
# autoresearch-style branch helper for the skill-builder cron.
#
# Usage:
#   skill-branch.sh start    # create today's autoresearch branch from master
#   skill-branch.sh keep     # merge the branch into master and push
#   skill-branch.sh discard  # delete the branch, stay on master
#   skill-branch.sh status   # show which branch we're on + last commits
#
# Design: each tick lands on a dated branch (`autoresearch/skills-YYYY-MM-DD`).
# If the skill is "good" (improvement metric), the branch gets merged into master
# and pushed. If not, it's discarded. The branch exists locally only — we never
# push it (avoids branch-spam on origin).

set -euo pipefail

REPO="/data/workspace/ecommerce-ops"
BRANCH_PREFIX="autoresearch/skills-"
DATE_TAG="$(date -u +%Y-%m-%d)"
BRANCH="${BRANCH_PREFIX}${DATE_TAG}"

cd "$REPO"

# Make sure we're on master and up to date
ensure_master_clean() {
  if [ "$(git branch --show-current)" != "master" ]; then
    # If we're on the autoresearch branch, that's fine — start() handles that.
    return 0
  fi
  git fetch origin master --quiet 2>/dev/null || true
  git pull --rebase origin master --quiet 2>/dev/null || true
}

start() {
  ensure_master_clean
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    # Branch already exists — check it out and fast-forward to current master
    git checkout "${BRANCH}" --quiet
    git merge --ff-only master --quiet 2>/dev/null || \
      git rebase master --quiet 2>/dev/null || true
    echo "resumed: ${BRANCH} (fast-forwarded to master)"
  else
    git checkout -b "${BRANCH}" master --quiet
    echo "started: ${BRANCH}"
  fi
}

keep() {
  # We are on ${BRANCH}. Fast-forward master to it, push, return to master.
  if [ "$(git branch --show-current)" != "${BRANCH}" ]; then
    echo "ERROR: keep() called but current branch is $(git branch --show-current), not ${BRANCH}" >&2
    exit 1
  fi
  # Verify there's actually a commit to keep
  if [ -z "$(git log master..${BRANCH} --oneline)" ]; then
    echo "WARN: keep() called but no commits ahead of master — nothing to merge" >&2
    git checkout master --quiet
    return 0
  fi
  git checkout master --quiet
  git merge --ff-only "${BRANCH}" --quiet
  PUSH_OK=0
  # Push best-effort. If GitHub PAT has expired, this fails — but the
  # merge to master already happened locally. The dashboard-improver cron
  # silently tolerates this; we do the same.
  if git push origin master --quiet 2>/dev/null; then
    PUSH_OK=1
  fi
  git branch -D "${BRANCH}" --quiet
  if [ "$PUSH_OK" -eq 1 ]; then
    echo "kept: ${BRANCH} merged into master + pushed"
  else
    echo "kept: ${BRANCH} merged into master (push failed — local only; github PAT may be expired)"
  fi
}

discard() {
  if [ "$(git branch --show-current)" != "${BRANCH}" ]; then
    echo "WARN: discard() called but current branch is $(git branch --show-current), not ${BRANCH}" >&2
    git checkout master --quiet
    return 0
  fi
  git checkout master --quiet
  git branch -D "${BRANCH}" --quiet
  echo "discarded: ${BRANCH} deleted"
}

status() {
  echo "current branch: $(git branch --show-current)"
  echo "branch exists: $(git show-ref --verify --quiet refs/heads/${BRANCH} && echo yes || echo no)"
  echo ""
  echo "last 5 commits on current branch:"
  git log --oneline -5
  echo ""
  echo "commits ahead of master:"
  if [ "$(git branch --show-current)" = "${BRANCH}" ]; then
    git log master..HEAD --oneline || echo "(none)"
  else
    echo "(not on branch)"
  fi
}

case "${1:-status}" in
  start)   start   ;;
  keep)    keep    ;;
  discard) discard ;;
  status)  status  ;;
  *) echo "Usage: $0 {start|keep|discard|status}" >&2; exit 2 ;;
esac