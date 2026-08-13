#!/usr/bin/env bash
# Full-system regression for EnglishApp / Vocab Pet.
# No file filter. Entire suite or fail. Feature work is not done until this exits 0.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() { printf 'regression: %s\n' "$*"; }

find_app_root() {
  local candidate
  for candidate in "$ROOT" "$ROOT/vocab-pet-app"; do
    if [[ -f "$candidate/package.json" ]] && [[ -d "$candidate/src/features" || -d "$candidate/src-tauri" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

has_script() {
  local pkg="$1" name="$2"
  grep -q "\"$name\"" "$pkg" || return 1
}

pkg_runner() {
  if command -v pnpm >/dev/null 2>&1; then
    printf 'pnpm\n'
    return
  fi
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    if command -v pnpm >/dev/null 2>&1; then
      printf 'pnpm\n'
      return
    fi
  fi
  printf 'npx --yes pnpm@9\n'
}

if ! APP="$(find_app_root)"; then
  log "no Vocab Pet app on this ref (need package.json + src/features or src-tauri)."
  log "CI wiring is live. Full suite runs automatically once the app is on the branch."
  exit 0
fi

log "app root = $APP"
cd "$APP"

if [[ -n "${REGRESSION_SKIP_INSTALL:-}" ]]; then
  log "skip install (REGRESSION_SKIP_INSTALL=1)"
else
  if [[ -f pnpm-lock.yaml ]]; then
    # shellcheck disable=SC2086
    $(pkg_runner) install --frozen-lockfile
  else
    $(pkg_runner) install
  fi
fi

if ! has_script package.json test; then
  log "package.json has no test script" >&2
  exit 1
fi

log "running FULL suite (no file filter)"
# Do not pass paths — that would be a partial run, not regression.
$(pkg_runner) test

if has_script package.json build; then
  log "typecheck + production build"
  $(pkg_runner) build
fi

if has_script package.json test:e2e; then
  log "E2E suite"
  $(pkg_runner) test:e2e
fi

log "FULL SUITE GREEN"
