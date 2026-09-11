#!/bin/sh
set -e

# Render provides DATABASE_URL as postgres://... — normalize for SQLAlchemy.
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    postgres://*)
      export DATABASE_URL="postgresql+asyncpg://${DATABASE_URL#postgres://}"
      ;;
    postgresql://*)
      export DATABASE_URL="postgresql+asyncpg://${DATABASE_URL#postgresql://}"
      ;;
  esac
fi

if [ -z "$DATABASE_URL_SYNC" ] && [ -n "$DATABASE_URL" ]; then
  export DATABASE_URL_SYNC="${DATABASE_URL/postgresql+asyncpg:/postgresql+psycopg2:}"
fi

echo "Running migrations..."
alembic upgrade head

echo "Seeding demo data (safe if already seeded)..."
python -m scripts.seed || true

PORT="${PORT:-8000}"
echo "Starting uvicorn on port $PORT"
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
