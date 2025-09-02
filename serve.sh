#!/usr/bin/env bash
set -e

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Please install Node.js LTS." >&2
  exit 1
fi

echo "Installing dependencies (if needed)..."
if [ -f package-lock.json ] || [ -d node_modules ]; then
  npm ci || npm install
else
  npm install
fi

echo "Loading .env into environment..."
set -a
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi
set +a

echo "Starting Vite dev server on http://localhost:8675 ..."
npm run dev
